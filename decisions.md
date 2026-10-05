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

## 2026-09-26 — File TY2026 114(1) return via IRIS 2.0 automation with the taxpayer's own PSID

**Decision:** Completed the TY2026 income tax return (NITR, task 2107) end-to-end through browser automation (Playwright + tesseract captcha OCR) against api.fbr.gov.pk/gw.fbr.gov.pk, using the taxpayer's own PSID (paid via Askari 1Bill, ref 267•••••525) and user-supplied 4-digit e-Pin (value in skill/tooling, not recorded here). Submission accepted 2026-09-26T13:29:19+05:00.
**Alternatives:** File manually from a browser UI; generate a fresh PSID through tooling; continue guessing the e-Pin.
**Why:** The return needed the same payment the taxpayer already made (21,931) allocated to the workflow; generating a new PSID risked an unmatched duplicate, and the e-Pin is user-owned — it must come from the user, never from us.
**Result:** Submit API `{"message":"success","status":"success"}`; return visible in Completed Tasks → DECLARATION with FBR record date 2026-09-26. Workflow, evidence, and lessons in [notes/fbr-iris-income-tax-return.md](./notes/fbr-iris-income-tax-return.md).

## 2026-09-26 — Treat the FBR portal record, not email/SMS, as the filing receipt

**Decision:** Consider a return filed when its row exists in Completed Tasks with an FBR `documentDate` and opens in view mode — not upon any email/SMS (IRIS sends none on filing; notification centre reads `UnreadCount:0`).
**Alternatives:** Waiting for an FBR confirmation email/SMS before considering the filing done.
**Why:** IRIS's filing acknowledgment is portal-side; indicating otherwise to the taxpayer causes false alarm. The dashboard "Submit your return" banner is static promo.
**Caveat:** Keep the bank/1Bill payment receipt (ref 267•••••525) as the payment-side evidence.

## 2026-09-26 — Store IRIS credentials only locally; mask identifiers in the synced brain

**Decision:** IRIS login password lives only in `/home/grok/fbr-tooling/iris_pass.txt` (chmod 600); CNIC/NTN/PSID masked in second-brain files because this repo syncs to GitHub (github.com/Awaiswilll/ai-native-second-brain).
**Alternatives:** Store credentials inside the second brain for easy reuse; keep full identifiers in notes.
**Why:** A public-synced markdown repo is not a secret store. Local tooling (fbr-tooling, potpie graph on 127.0.0.1, backups on this machine) keeps full values for automation reuse.
**Action:** Any future session: read full credentials from fbr-tooling, never from the brain.

## 2026-08-20 — Retire standalone AI Hub, merge into second-brain

**Decision:** Replaced the standalone `/home/grok/ai-hub` dashboard with a `hub/` component inside this repo, managed by the same `ai-hub` systemd user service on port 9000.
**Alternatives:** Keep AI Hub separate; keep it in the repo as a sibling.
**Why:** AI Hub was a launchpad with no memory of its own — it duplicated the launcher role while knowing nothing about the user. Merging it here makes one repo the single source of truth: memory (markdown), plus a dashboard that both launches tools and shows the memory. One port, one service, one backup unit.

## 2026-08-20 — Wire second-brain into Newelle via MCP

**Decision:** Registered a `Second Brain` MCP server (filesystem, rooted at `/home/grok/second-brain`) in Newelle's `mcp-servers` setting, alongside the existing `Project Files` server (`/home/grok/Documents/Backup`).
**Alternatives:** Point Newelle's RAG embeddings at the folder; keep Newelle's memory app-bound.
**Why:** Newelle's own memory is an app-bound embedding index. Giving it direct filesystem access to this repo makes the same flat-markdown memory readable/writable by Newelle, Claude Code, Codex, and opencode identically — one memory, all agents.

## 2026-08-24 — Resume opencode sessions after reboot via headless tmux

**Decision:** Run `~/.local/bin/resume-opencode-sessions.sh` from a user `@reboot` crontab entry; it creates **detached tmux sessions** (`oc-<id>`, `opencode -s <id>`) for every non-archived session active in the last `OPENCODE_RECENT_DAYS` (default 7), with no GUI dependency. Attach after login via `ocls` / `ocattach`.
**Alternatives:** (1) Launching terminator windows from @reboot — failed silently: cron fires before the graphical session/DBus exists, terminator crashes, and cron discards output (no MTA). (2) Boot-period detection (sessions between previous/current boot timestamps) — window was empty in practice since activity lands just before shutdown or after next boot.
**Why:** Detached tmux needs no display or DBus, so it works at the earliest boot stage; logging to `~/.local/share/opencode/resume-sessions.log` makes boot runs auditable. See [projects/opencode-session-resume.md](./projects/opencode-session-resume.md).

## 2026-08-24 — Ollama knowledge distillation via second-brain

**Decision:** Store deeper knowledge distilled from cloud agents as structured markdown notes in `second-brain/notes/`, using the reusable prompt template defined in `notes/ollama-knowledge-distillation.md`. Local qwen3.5 remains the default; cloud models require explicit user approval and output only in the second-brain format.
**Alternatives:** Direct fine-tuning of the 4B model on raw cloud traces; keeping all knowledge inside model weights; using a separate vector database without markdown.
**Why:** Flat markdown is portable, human-readable, survives OS/model changes, and requires zero tooling. It serves as both immediate RAG source and future synthetic-training corpus. This matches the existing second-brain philosophy and avoids unnecessary cloud spend.

## 2026-08-20 — Embed Potpie as the context-graph layer

**Decision:** Installed Potpie (potpie-context-engine 0.1.0, CPU-only torch) into `~/.local`, set it up against this repo (daemon, default pot, source registration, 8 claude skills), added a `notes/potpie.md` knowledge note, and added a Potpie card to the hub dashboard.
**Alternatives:** Rely on the flat markdown alone; add a heavier RAG/vector store.
**Why:** The markdown files are the durable, portable memory; Potpie adds a derived graph + semantic search over the repo for agents. CPU-only torch avoids the multi-GB CUDA download (no practical local LLM on this GPU).
**Caveat:** `falkordb_lite` is in-memory in this build — committed graph claims don't survive a daemon restart; re-run propose/commit to repopulate.
## 2026-10-05 — Ship the FBR agent as a private repo, rebuilt from scratch

**Decision:** Published the IRIS automation as a **private** repo at `github.com/Awaiswilll/fbr-iris-tax-agent`, written fresh from the TY2025 learnings rather than copied out of `~/fbr-tooling/`.
**Alternatives:** (1) Public repo — rejected: it publishes a working map of a government private API plus its auth bypass, which is a misuse surface regardless of legality. (2) Sanitise the 215 existing `fbr-tooling/` files in place — rejected: PII is spread across ~20 files plus `iris_pass.txt`, so "sanitise" means auditing every file anyway; rewriting from extracted logic is safer and produces docs the originals never had.
**Why:** The value is in the *reasoning* (session auth, no idempotency guard, reconciliation discipline), not the code. Re-deriving it cleanly enforces the safety rules instead of inheriting the ad-hoc scripts that lack them.

## 2026-10-05 — Make tax-engine uncertainty explicit instead of calibrating it

**Decision:** Ship `tax_compute.py` with Finance Act slab tables and rebate mechanics as **selectable, labelled assumptions**, plus a `--solve` mode that inverts the portal's figure — rather than tuning any parameter until it reproduces the 70,847 figure from a prior session.
**Alternatives:** (1) Hard-code one profile and one rebate formula as settled law — rejected: the rebate has been revised across Acts, and the top band changed between 2024 and 2025, so a wrong hard-code is a silent failure for high earners only. (2) Calibrate against the observed portal figure — rejected: that is fitting the model to an unexplained number and would have hidden a ~678k discrepancy behind a false success.
**Why:** The honest output here is "these are my assumptions and here is exactly what the portal's number implies". Shipping a confidently wrong tax engine is worse than shipping one that visibly declines to guess.

## 2026-10-05 — Refuse to reconcile a tax gap with an unevidenced deduction

**Decision:** Left the TY2025 return (task 2113) as a DRAFT rather than entering a ~678,006 deduction that would have made local and portal figures agree. Unevidenced deductions are a hard BLOCK in `preflight_check.py`.
**Alternatives:** (1) Enter the implied deduction to close the gap — rejected outright: it fabricates a tax claim, shifts all risk to the taxpayer, and converts a routine refund into a reassessment. (2) File anyway on the portal's authority — rejected: the portal's figure is authoritative for *what to file*, but an unexplained 678k gap is precisely the kind of thing that gets challenged.
**Why:** A tax filing is a legal attestation. The gap is more likely a missing deduction, a wrong tax year, or a wrong gross figure than anything the engine got wrong — and all three are checkable facts, which is what `--solve` exists to surface.
