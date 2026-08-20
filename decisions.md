# Decisions — Audit Log

> Every significant decision gets a dated entry: what was decided, the alternatives considered, and why.

## Template

```
## YYYY-MM-DD — <Title>

**Decision:** <what was chosen>
**Alternatives:** <what else was considered>
**Why:** <the reasoning>
```

---

## 2026-08-20 — Storage format: flat markdown

**Decision:** Store the second brain as a flat folder of markdown files with a CLAUDE.md map.
**Alternatives:** Obsidian vault, Notion, database (e.g. SQLite), vector store.
**Why:** Zero tooling, human-readable, and any AI agent can navigate it just by reading the map. No vendor lock-in, trivially backed up with git.

## 2026-08-20 — Retire standalone AI Hub, merge into second-brain

**Decision:** Replaced the standalone `/home/grok/ai-hub` dashboard with a `hub/` component inside this repo, managed by the same `ai-hub` systemd user service on port 9000.
**Alternatives:** Keep AI Hub separate; keep it in the repo as a sibling.
**Why:** AI Hub was a launchpad with no memory of its own — it duplicated the launcher role while knowing nothing about the user. Merging it here makes one repo the single source of truth: memory (markdown), plus a dashboard that both launches tools and shows the memory. One port, one service, one backup unit.

## 2026-08-20 — Wire second-brain into Newelle via MCP

**Decision:** Registered a `Second Brain` MCP server (filesystem, rooted at `/home/grok/second-brain`) in Newelle's `mcp-servers` setting, alongside the existing `Project Files` server (`/home/grok/Documents/Backup`).
**Alternatives:** Point Newelle's RAG embeddings at the folder; keep Newelle's memory app-bound.
**Why:** Newelle's own memory is an app-bound embedding index. Giving it direct filesystem access to this repo makes the same flat-markdown memory readable/writable by Newelle, Claude Code, Codex, and opencode identically — one memory, all agents.