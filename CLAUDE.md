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
└── projects/       <- One file per project you work on
```

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

## Maintainers

- You (the human)
- Any AI agent pointed at this directory (Claude Code, Codex, opencode, Gemini, etc.)