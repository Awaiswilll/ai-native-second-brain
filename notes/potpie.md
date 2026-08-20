# Potpie — Context Graph for AI-Native SDLC

## Summary
Potpie (potpie-ai/potpie, Apache-2.0, ~5.7k stars) turns a codebase and its SDLC into a living context graph for AI agents: it indexes code, structure, decisions, history, team knowledge, and workflows so agents can answer questions, plan changes, debug, and write code with project-specific context.

## Why it's here
Embedded in the second brain (2026-08-20) so agents working in this repo get project-specific context on top of the flat-markdown memory. The memory files are the durable store; Potpie is the derived graph + search layer.

## Install & setup (this machine)
- Installed via pip into `~/.local/bin` (`potpie-context-engine 0.1.0`). CPU-only torch used (PyPI default pulls CUDA deps — avoided; machine has no practical local LLM).
- `potpie setup --repo . --agent claude --yes --embeddings none`:
  - config `~/.potpie/config.json`, daemon on `127.0.0.1:60881`, default pot `pot_203c4e1f0051`
  - backend `falkordb_lite`, source registered: `github.com/Awaiswilll/ai-native-second-brain`
  - 8 claude skills installed: potpie-change-timeline, potpie-cli, potpie-debug-memory, potpie-graph, potpie-infra-architecture, potpie-project-preferences, potpie-repo-baseline, potpie-source-ingestion

## CLI cheatsheet
- `potpie status` — pot, daemon, backend, source readiness
- `potpie resolve "<task>"` — pull context an agent should read before a task
- `potpie search "<query>"` — find a file, workflow, bug, decision, convention
- `potpie record --type <type> --summary "<learning>"` — write a durable learning
- `potpie source add repo .` — register the current repo
- `potpie graph propose --file plan.json` + `potpie graph commit <plan_id> --verify` — harness-led ingestion (no auto-scanner)
- `potpie ui` — open the graph explorer (served by the daemon)

Full command surface (v0.1.0): `resolve`, `search`, `record`, `setup`, `status`, `doctor`, `whoami`, `use`, `login/logout`, `ui`, `config`, `github`, `linear`, `jira`, `confluence`, `auth`, `pot`, `source`, `daemon`, `service`, `ledger`, `graph`, `timeline`, `backend`, `skills`, `cloud`, `telemetry`.

## Using Potpie in any repo
Potpie is not tied to this brain — point it at any codebase with the same workflow:

```sh
# 1. From the target repo root (or pass --repo):
potpie setup --repo /path/to/your/project --agent claude --yes
#    agents: claude | codex | cursor | opencode   (installs matching skills)

# 2. Confirm it's live
potpie status            # daemon, pot, backend
potpie pot list          # named pots (default + any you create)

# 3. Ask questions — graph-backed, semantic
potpie resolve "where is the checkout flow implemented?"
potpie search "payment webhook error handling"
potpie record "the S3 bucket now lives in the new provider" --authority user_statement

# 4. Inspect or rebuild the graph
potpie graph status      # claims / entities / predicates
potpie graph ui          # visual browser

# 5. In an agent session, skills installed by setup pull context automatically.
```

Setup is idempotent, so switching repos later is just `potpie setup --repo <path> --agent <agent> --yes` again. The hub dashboard has a Potpie panel (loopback-only) that runs these commands from the browser and shows the output inline.

## Caveats (v0.1.0)
- `falkordb_lite` is in-memory: committed claims do not survive a daemon restart in this build. Re-run propose/commit after restart if the graph looks empty.
- Ingestion is harness-led by design — the agent inspects the repo and writes evidence-backed mutations; there is no tree-walking auto-scanner.

## Related
- [Hub dashboard](../projects/example-project.md) — launch `potpie ui` from the hub card
- This note feeds the baseline graph claims (repo, CLAUDE.md map, memory store, hub).