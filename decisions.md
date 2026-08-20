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