const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec, execFile } = require('child_process');

const PORT = Number(process.env.PORT || 9000);
const HUB_DIR = __dirname;
const BRAIN_DIR = path.resolve(HUB_DIR, '..');
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const POTPIE = process.env.POTPIE_BIN || '/home/grok/.local/bin/potpie';
const POTPIE_TIMEOUT_MS = 20000;

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const tools = {
  paperclip: { name: 'Paperclip', type: 'service', url: 'http://127.0.0.1:3100', port: 3100 },
  ollama: { name: 'Ollama', type: 'service', url: OLLAMA_URL, port: new URL(OLLAMA_URL).port || 11434 },
  'ollama-cli': { name: 'Ollama terminal', type: 'terminal', command: 'ollama list; echo; echo "Manage models with: ollama pull <model>"' },
  newelle: { name: 'Newelle', type: 'desktop', command: 'flatpak', args: ['run', 'io.github.qwersyk.Newelle'] },
  alpaca: { name: 'Alpaca', type: 'desktop', command: 'snap', args: ['run', 'alpaca-kenvandine'] },
  claude: { name: 'Claude Code', type: 'terminal', command: 'claude' },
  codex: { name: 'Codex CLI', type: 'terminal', command: 'codex' },
  grok: { name: 'Grok Build', type: 'terminal', command: '/home/grok/.grok/bin/grok', cwd: '/home/grok' },
  potpie: { name: 'Potpie', type: 'terminal', command: 'potpie ui' },
  deepsec: { name: 'Deepsec', type: 'terminal', command: 'echo "Deepsec Security Scanner - https://github.com/Awaiswilll/deepsec"' },
  squad: { name: 'Squad', type: 'terminal', command: 'echo "Squad - AI Agent Teams"; echo "Usage: squad init | squad triage | squad doctor"' },
};

// -- Allowlisted Potpie invocations. Args are validated: no shell metacharacters.
const POTPIE_ALLOW = {
  status: { args: ['status'], needRepo: true },
  'graph status': { args: ['graph', 'status'], needRepo: true },
  'source list': { args: ['source', 'list'], needRepo: true },
  'pot list': { args: ['pot', 'list'], needRepo: true },
  resolve: { args: ['resolve'], needsQuery: true, needRepo: true },
  search: { args: ['search'], needsQuery: true, needRepo: true },
  whoami: { args: ['whoami'], needRepo: false },
  doctor: { args: ['doctor'], needRepo: false },
};

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

function probe(url, timeout = 1500) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout }, (response) => {
      response.resume();
      resolve({ online: response.statusCode < 500, statusCode: response.statusCode });
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve({ online: false }));
  });
}

function commandAvailable(command) {
  return new Promise((resolve) => {
    const child = spawn('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('exit', (code) => resolve(code === 0));
  });
}

function walk(dir, depth = 0) {
  if (depth > 3) return [];
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return []; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'hub') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full, depth + 1));
    else if (e.name.endsWith('.md')) out.push(path.relative(BRAIN_DIR, full));
  }
  return out;
}

function brainFiles() {
  const result = { notes: [], people: [], projects: [], root: [] };
  for (const dir of ['notes', 'people', 'projects']) {
    const full = path.join(BRAIN_DIR, dir);
    try {
      result[dir] = fs.readdirSync(full).filter((f) => f.endsWith('.md')).sort();
    } catch (_) { result[dir] = []; }
  }
  result.root = ['CLAUDE.md', 'MEMORY.md', 'LEARNINGS.md', 'decisions.md', 'README.md']
    .filter((f) => fs.existsSync(path.join(BRAIN_DIR, f)));
  return result;
}

function getBrainStats() {
  return new Promise((resolve) => {
    exec("git log -1 --format='%h|%ad' --date=short; git status --porcelain | wc -l", { cwd: BRAIN_DIR }, (error, stdout) => {
      const lines = String(stdout || '').trim().split('\n');
      const commit = lines[0] && lines[0].includes('|') ? lines[0] : null;
      const dirty = Number(lines[1] || 0) || 0;
      const files = brainFiles();
      const counts = { notes: files.notes.length, people: files.people.length, projects: files.projects.length };
      resolve({ root: BRAIN_DIR, commit: commit || null, dirty, counts, files });
    });
  });
}

function getActivity() {
  return new Promise((resolve) => {
    exec("git log -10 --format='%h|%ad|%s' --date=short", { cwd: BRAIN_DIR }, (error, stdout) => {
      const commits = String(stdout || '').trim().split('\n').filter(Boolean).map((line) => {
        const [hash, date, ...rest] = line.split('|');
        return { hash: hash || '', date: date || '', subject: rest.join('|') || '' };
      });
      resolve({ commits });
    });
  });
}

function searchBrain(q) {
  const query = String(q || '').toLowerCase().trim();
  if (!query) return Promise.resolve({ query: q || '', total: 0, results: [] });
  const files = walk(BRAIN_DIR);
  const results = [];
  const maxPerFile = 3;
  for (const rel of files) {
    const full = path.join(BRAIN_DIR, rel);
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    for (let i = 0; i < lines.length && matches.length < maxPerFile; i++) {
      if (lines[i].toLowerCase().includes(query)) {
        matches.push({ line: i + 1, text: lines[i].slice(0, 160) });
      }
    }
    if (matches.length) results.push({ file: rel, title: rel.replace(/\.md$/, ''), matches });
  }
  return Promise.resolve({ query, total: results.length, results: results.slice(0, 40) });
}

function readBrainFile(rel) {
  const safe = path.normalize(String(rel || '')).replace(/^([/\\])+/, '');
  const full = path.resolve(BRAIN_DIR, safe);
  if (!full.startsWith(`${BRAIN_DIR}${path.sep}`)) return Promise.resolve({ error: 'Forbidden.' });
  return new Promise((resolve) => {
    fs.readFile(full, 'utf8', (err, data) => {
      if (err) return resolve({ error: 'Not found.' });
      resolve({ path: safe, size: data.length, lines: data.split('\n').length, content: data });
    });
  });
}

function runPotpie(command, args = []) {
  return new Promise((resolve) => {
    execFile(POTPIE, args, { cwd: BRAIN_DIR, timeout: POTPIE_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024, env: { ...process.env, PATH: `${path.dirname(POTPIE)}:${process.env.PATH || ''}` } }, (error, stdout, stderr) => {
      resolve({
        command,
        args,
        code: error ? (error.code || 1) : 0,
        timedOut: !!(error && error.killed),
        stdout: String(stdout || '').trim(),
        stderr: String(stderr || '').trim(),
      });
    });
  });
}

async function getStatus() {
  const [paperclip, ollama, ollamaCli, newelle, alpaca, claude, codex, grok, potpie, deepsec, squad, brain] = await Promise.all([
    probe(tools.paperclip.url), probe(`${OLLAMA_URL}/api/tags`), commandAvailable('ollama'), commandAvailable('flatpak'), commandAvailable('snap'), commandAvailable('claude'), commandAvailable('codex'), commandAvailable('/home/grok/.grok/bin/grok'), commandAvailable('potpie'), commandAvailable('npx'), commandAvailable('squad'), getBrainStats(),
  ]);
  let models = [];
  let gpuInfo = '';
  if (ollama.online) {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
      const body = await response.json();
      models = (body.models || []).map((model) => ({ name: model.name, size: model.size }));
    } catch (_) { /* Health is enough; model data is optional. */ }
  }
  try {
    const child = spawn('nvidia-smi', ['--query-gpu=name,memory.used,memory.total,temperature.gpu,utilization.gpu', '--format=csv,noheader,nounits'], { timeout: 2000 });
    child.stdout.on('data', (d) => { gpuInfo = String(d).trim(); });
    child.on('error', () => {});
  } catch (_) {}
  return {
    generatedAt: new Date().toISOString(),
    brain,
    gpu: gpuInfo,
    tools: {
      paperclip: { ...paperclip, url: tools.paperclip.url },
      ollama: { ...ollama, url: OLLAMA_URL, models },
      ollamaCli: { available: ollamaCli },
      newelle: { available: newelle }, alpaca: { available: alpaca }, claude: { available: claude }, codex: { available: codex }, grok: { available: grok }, potpie: { available: potpie }, deepsec: { available: deepsec }, squad: { available: squad },
      manus: { online: true, url: 'https://manus.im' },
    },
  };
}

function isLocalRequest(req) {
  const address = req.socket.remoteAddress || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function launch(tool, res) {
  const config = tools[tool];
  if (!config || config.type === 'service') return json(res, 404, { error: 'Unknown launchable tool.' });
  let command = config.command;
  let args = config.args || [];
  if (config.type === 'terminal') {
    command = 'gnome-terminal';
    args = ['--', 'bash', '-lc', `${config.command}; exec bash`];
  }
  const child = spawn(command, args, { cwd: config.cwd || HUB_DIR, detached: true, stdio: 'ignore' });
  child.on('error', (error) => json(res, 500, { error: `Could not launch ${config.name}: ${error.message}` }));
  child.unref();
  child.on('spawn', () => json(res, 202, { status: 'launched', tool }));
}

function serveFile(filePath, res, req) {
  fs.readFile(filePath, (error, data) => {
    if (error) return json(res, 404, { error: 'Not found.' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/status') return json(res, 200, await getStatus());
  if (req.method === 'GET' && url.pathname === '/api/brain') return json(res, 200, await getBrainStats());
  if (req.method === 'GET' && url.pathname === '/api/activity') return json(res, 200, await getActivity());
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'ok', tools: Object.keys(tools) });

  if (req.method === 'GET' && url.pathname === '/api/search') {
    return json(res, 200, await searchBrain(url.searchParams.get('q')));
  }
  if (req.method === 'GET' && url.pathname === '/api/file') {
    return json(res, 200, await readBrainFile(url.searchParams.get('path')));
  }
  if (req.method === 'POST' && url.pathname === '/api/potpie') {
    if (!isLocalRequest(req)) return json(res, 403, { error: 'Potpie actions are only permitted from the host machine.' });
    const body = await readBody(req);
    const cmd = String(body.command || '').trim();
    const query = String(body.query || '').trim();
    const spec = POTPIE_ALLOW[cmd];
    if (!spec) return json(res, 400, { error: `Unknown potpie action: '${cmd}'. Available: ${Object.keys(POTPIE_ALLOW).join(', ')}` });
    if (spec.needsQuery && !query) return json(res, 400, { error: `'${cmd}' requires a query.` });
    const args = spec.needsQuery ? [...spec.args, query] : spec.args;
    if (args.some((a) => /[;&|`$<>"'\\\n]/.test(a))) return json(res, 400, { error: 'Invalid characters in arguments.' });
    return json(res, 200, await runPotpie(cmd, args));
  }

  if (req.method === 'POST' && url.pathname.startsWith('/api/launch/')) {
    if (!isLocalRequest(req)) return json(res, 403, { error: 'Launching desktop tools is only permitted from the host machine.' });
    return launch(url.pathname.slice('/api/launch/'.length), res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });

  if (url.pathname.startsWith('/brain/')) {
    const rel = decodeURIComponent(url.pathname.slice('/brain/'.length)).replace(/^\/+/, '');
    const filePath = path.resolve(BRAIN_DIR, rel);
    if (!filePath.startsWith(`${BRAIN_DIR}${path.sep}`)) return json(res, 403, { error: 'Forbidden.' });
    return serveFile(filePath, res, req);
  }
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const filePath = path.resolve(HUB_DIR, requested);
  if (!filePath.startsWith(`${HUB_DIR}${path.sep}`)) return json(res, 403, { error: 'Forbidden.' });
  serveFile(filePath, res, req);
});

server.listen(PORT, '0.0.0.0', () => console.log(`Second Brain hub: http://localhost:${PORT}`));