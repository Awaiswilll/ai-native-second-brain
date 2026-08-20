# Second Brain

An AI-native, flat-markdown second brain. One topic per file, no databases, no proprietary tools. Any AI agent (Claude Code, Codex, opencode, Gemini) or human can read this folder and act as your memory.

## Quick start

1. Point any agent at this folder. Agents auto-load `CLAUDE.md` (the map).
2. Read `MEMORY.md` and fill in your core facts.
3. Replace the example files in `notes/`, `people/`, `projects/` with real content.
4. Keep the discipline: **one topic = one file**, `lowercase-with-hyphens.md`.

## Structure

```
second-brain/
├── CLAUDE.md       <- The map — agents read this first
├── MEMORY.md       <- Long-term core facts
├── LEARNINGS.md    <- Lessons learned log
├── decisions.md    <- Decision audit log
├── README.md       <- This file
├── notes/          <- One file per topic
├── people/         <- One file per person
├── projects/       <- One file per project
└── hub/            <- Dashboard (replaces AI Hub): http://localhost:9000
```

## Rules

- Flat markdown only — no Obsidian, no databases
- One topic = one file
- `CLAUDE.md` is the map; if it's not referenced there, agents won't find it
- File names: `lowercase-with-hyphens.md`
- Append, never rewrite (keep history)

## Hub

Run the dashboard with `node hub/server.js` (or the `ai-hub` systemd user service). It serves on port 9000 and shows memory stats + file links alongside live tool status and launcher buttons. View any memory file in the browser at `http://localhost:9000/brain/<path>`.

## License

Personal use. Free to adapt.