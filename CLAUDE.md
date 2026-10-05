# Second Brain — The Map

This is a flat, markdown-only second brain. No Obsidian, no databases, no sync tools. Everything is plain `.md` files that any AI agent or human can read directly.

## Rules (read these every session)

1. **One topic = one file.** Never stuff multiple topics into a single file.
2. **Flat Markdown only.** No proprietary formats, no front-matter required, no tooling.
3. **Lowercase-with-hyphens.md** for all file names. No spaces, no capitals, no underscores.
4. **CLAUDE.md is the map.** If a file isn't referenced here, it doesn't exist from the agent's perspective.
5. **Append, never rewrite.** Keep history. If a fact changes, add a dated note rather than deleting the old one.
6. **Reference other files with relative links** `[name](./notes/example-topic.md)` instead of duplicating content.

## Directory layout

```
second-brain/
├── CLAUDE.md       <- This file. The map. Agents read this first.
├── MEMORY.md       <- Long-term core facts about you (unchangeable context)
├── LEARNINGS.md    <- Lessons learned log (what you now know)
├── decisions.md    <- Decision audit log (what you chose and why)
├── README.md       <- How to use the system
├── notes/          <- Topical knowledge, one file per topic
├── people/         <- One file per person you interact with
├── projects/       <- One file per project you work on
└── hub/            <- The dashboard (formerly AI Hub): launchpad + memory viewer
```

## The hub (`hub/`)

`hub/server.js` is a zero-dependency Node.js HTTP server (port 9000, `0.0.0.0`). It replaces the old standalone AI Hub and adds a memory layer:

- `GET /api/status` — probes Paperclip (:3100) and Ollama (:11434), detects installed CLIs (ollama, flatpak/newelle, claude, codex, grok, potpie), and returns the Ollama model list + GPU info.
- `GET /api/brain` — returns git commit, uncommitted-change count, and the file lists for `notes/`, `people/`, `projects/`, and root docs.
- `GET /api/search?q=…` — full-text search across every markdown file in the brain (filename + content, with line matches).
- `GET /api/file?path=…` — raw markdown content of any brain file for inline preview.
- `GET /api/activity` — last 10 git commits (hash, date, subject).
- `POST /api/potpie` — runs an allow-listed Potpie CLI action (status, doctor, whoami, graph status, source list, pot list, resolve, search) and returns stdout/stderr. Loopback-only; args are validated against shell metacharacters.
- `POST /api/launch/:tool` — spawns an allow-listed local tool (loopback clients only).
- `GET /brain/<path>` — read-only view of any file in this repo (markdown rendered as text).
- `index.html` — a dynamic single-page dashboard with tabs (Memory / Tools / Potpie / Activity), live search + inline markdown preview, tool status cards, a Potpie console, and a recent-commits log.

Run it: `node hub/server.js` (managed as the `ai-hub` systemd user service).

## Potpie (`notes/potpie.md`)

Potpie indexes this repo into a context graph for agents (daemon, default pot, source registered; 8 claude skills). CLI: `potpie resolve/search/record/graph/ui`. Launched from the hub card (`potpie ui`). Note: the lite backend is in-memory — repopulate with `potpie graph propose` + `commit` after a daemon restart.

## Where things go

| Kind of thing                        | File                                       |
|--------------------------------------|--------------------------------------------|
| Permanent facts about you            | `MEMORY.md`                                |
| A lesson you learned                 | `LEARNINGS.md`                             |
| A decision + rationale               | `decisions.md`                             |
| A topic you keep notes on            | `notes/<topic>.md`                         |
| A person you work with               | `people/<person>.md`                       |
| A project you work on                | `projects/<project>.md`                    |

## File conventions

Each note file follows this shape:

```markdown
# <Title>

## Summary
One or two sentences.

## Details
Free-form notes, code, links, whatever is useful.

## Related
- [Related note](./notes/related-topic.md)
```

Person files:

```markdown
# <Name>

## Context
Who they are, what they care about, how we work together.

## Interactions
- YYYY-MM-DD: what happened

## Notes
Anything else worth remembering.
```

Project files:

```markdown
# <Project Name>

## Goal
What this project is trying to achieve.

## Status
Current state.

## Decisions
Notable decisions and why.

## Links / Files
Relevant references.
```

## Session protocol

1. On session start: read `CLAUDE.md`, `MEMORY.md`, `LEARNINGS.md`, `decisions.md`.
2. Before answering a question: check the relevant `notes/`, `people/`, `projects/` files.
3. When you learn something new: write it to the right file.
4. When you make a decision: log it in `decisions.md` with the date.
5. Never create files outside this structure without adding them to the map here.

## Recent additions

- [notes/fbr-iris-tax-agent.md](./notes/fbr-iris-tax-agent.md) — the published FBR IRIS automation agent/skill: session-auth model for `api.fbr.gov.pk`, versioned Finance Act slab engine with a `--solve` reconciler, pre-flight submission gate, and the PII/e-Pin/draft-duplication safety rules. Repo (private): `github.com/Awaiswilll/fbr-iris-tax-agent`.
- [projects/fbr-iris-tax-agent.md](./projects/fbr-iris-tax-agent.md) — that repo's status, privacy decisions, and the open TY2025 tax discrepancy (portal 70,847 vs local 213,228; gap implies ~678,006 undocumented reduction — return deliberately left as DRAFT).
- [notes/fbr-iris-income-tax-return.md](./notes/fbr-iris-income-tax-return.md) — reusable playbook: filing a Pakistani FBR IRIS 2.0 income tax return (114(1)) via automation (login + captcha OCR, payment verification, e-Pin submit, post-submit verification). Identifiers masked; full credentials in `/home/grok/fbr-tooling/` (chmod 600).
- [projects/fbr-iris-income-tax-2026.md](./projects/fbr-iris-income-tax-2026.md) — status of the TY2026 filing (SUBMITTED 2026-09-26), decisions, session resume id `ses_f2e0ae5adffeMK8D7K5kkRvlHF`.
- Potpie graph updated for these (decision/preference/fix claims; `falkordb_lite` is in-memory — re-propose/commit after daemon restart, see [notes/potpie.md](./notes/potpie.md)).

## Maintainers

- You (the human)
- Any AI agent pointed at this directory (Claude Code, Codex, opencode, Gemini, etc.)