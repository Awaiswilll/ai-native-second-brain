# LEARNINGS.md — Lessons Learned

> Append-only log. Every entry is dated. Newest first. When you learn something that changes how you work, record it here.

## Template

```
## YYYY-MM-DD — <Short title>

**Context:** <what happened>
**Lesson:** <what you learned>
**Action:** <what you'll do differently>
```

---

## 2026-08-20 — Second brain setup

**Context:** Rebuilt this second-brain repo locally from an X post describing an AI-native second brain.
**Lesson:** A flat markdown folder with a CLAUDE.md map is all an agent needs to act as memory.
**Action:** Keep every file referenced from CLAUDE.md; append learnings here as they happen.

## 2026-08-20 — Merge launchers into the memory

**Context:** The standalone AI Hub dashboard launched tools but had no memory. Merged it into this repo as `hub/` and made it show the memory files.
**Lesson:** A launcher with no data is a placeholder; coupling it to the knowledge store makes the same service useful on both axes.
**Action:** Keep the hub's tool list in sync with the `tools` object in `hub/server.js` when adding launchable CLIs.

## 2026-08-20 — Shell metacharacters in git --format break child_process.exec

**Context:** `exec("git log --format=%h|%ad ...")` failed because the shell treated `|` as a pipeline operator even inside the word. Quoting the format (`'%h|%ad'`) fixed it.
**Lesson:** Any string passed to `child_process.exec` is interpreted by `/bin/sh` — quote format strings that contain shell metacharacters.
**Action:** Use `execFile` with arg arrays, or single-quote formats inside `exec` strings.