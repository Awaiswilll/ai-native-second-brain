const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const PORT = Number(process.env.PORT || 9000);
const HUB_DIR = __dirname;
const BRAIN_DIR = path.resolve(HUB_DIR, '..');
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const tools = {
  paperclip: { name: 'Paperclip', type: 'service', url: 'http://127.0.0.1:3100', port: 3100 },
  ollama: { name: 'Ollama', type: 'service', url: OLLAMA_URL, port: new URL(OLLAMA_URL).port || 11434 },
  'ollama-cli': { name: 'Ollama terminal', type: 'terminal', command: 'ollama list; echo; echo "Manage models with: ollama pull <model>"' },
  newelle: { name: 'Newelle', type: 'desktop', command: 'flatpak', args: ['run', 'io.github.qwersyk.Newelle'] },
  claude: { name: 'Claude Code', type: 'terminal', command: 'claude' },
  codex: { name: 'Codex CLI', type: 'terminal', command: 'codex' },
  grok: { name: 'Grok Build', type: 'terminal', command: '/home/grok/.grok/bin/grok', cwd: '/home/grok' },
};

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
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

function brainFiles() {
  const result = {};
  for (const dir of ['notes', 'people', 'projects']) {
    const full = path.join(BRAIN_DIR, dir);
    try {
      result[dir] = fs.readdirSync(full).filter((f) => f.endsWith('.md')).sort();
    } catch (_) {
      result[dir] = [];
    }
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
      resolve({
        root: BRAIN_DIR,
        commit: commit || null,
        dirty,
        counts,
        files,
      });
    });
  });
}

async function getStatus() {
  const [paperclip, ollama, ollamaCli, newelle, claude, codex, grok, brain] = await Promise.all([
    probe(tools.paperclip.url), probe(`${OLLAMA_URL}/api/tags`), commandAvailable('ollama'), commandAvailable('flatpak'), commandAvailable('claude'), commandAvailable('codex'), commandAvailable('/home/grok/.grok/bin/grok'), getBrainStats(),
  ]);
  let models = [];
  if (ollama.online) {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
      const body = await response.json();
      models = (body.models || []).map((model) => ({ name: model.name, size: model.size }));
    } catch (_) { /* Health is enough; model data is optional. */ }
  }
  return {
    generatedAt: new Date().toISOString(),
    brain,
    tools: {
      paperclip: { ...paperclip, url: tools.paperclip.url },
      ollama: { ...ollama, url: OLLAMA_URL, models },
      ollamaCli: { available: ollamaCli },
      newelle: { available: newelle }, claude: { available: claude }, codex: { available: codex }, grok: { available: grok },
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
  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'ok', tools: Object.keys(tools) });
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