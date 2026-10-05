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

## 2026-09-26 — FBR IRIS: no email/SMS on return filing; the portal record is the receipt

**Context:** After successfully submitting a TY2026 114(1) return on iris.fbr.gov.pk, worried the filing didn't land because no email/SMS arrived.
**Lesson:** FBR IRIS sends no email/SMS for return submission. The authoritative record is the portal: Completed Tasks → DECLARATION → the 114(1) row with `documentDate` = filing timestamp (`dashboard-tasks-grid-service-core/v1/search`, `workflowType:COMPLETED_TASKS`). Notification API returns `UnreadCount:0` — normal.
**Action:** For filing confirmations, verify against the portal task-grid service (row exists in COMPLETED_TASKS + opens in view mode), not email.

## 2026-09-26 — FBR IRIS "Enter 4 Digit Pin" is a static taxpayer e-Pin, not an OTP

**Context:** Final return submission gate is a password input (maxlen 4) with SUBMIT/CANCEL — no OTP, no forgot/resend affordance anywhere in the dialog.
**Lesson:** IRIS 2.0's 4-digit e-Pin is the taxpayer's own static code. Never invent or brute-force it; ask the user. The only way to progress is the user's own pin.
**Action:** Treat the e-Pin like a password: user-provided only. Also note the SUBMIT button's innerText is `"check_circle\nSUBMIT"` — match `/submit/i` minus `/cancel/i`, never anchored `/^SUBMIT$/`.

## 2026-09-26 — MSG.VLD.000253 at review-submit means the payment isn't visible server-side yet

**Context:** review-submit failed with MSG.VLD.000253 while the paid PSID didn't show in Search e-Payment; once it appeared as PaymentStatus **Confirmed**, the same call returned `workflow_lock_success`.
**Lesson:** CPMS/1Bill payment state syncs into FBR's workflow ledger with lag. "Payment not found" at the workflow gate is usually sync lag, not a wrong payment.
**Action:** Verify payment via Search e-Payment (`Get_Payment_Status_By_PSID_CPR`, RegistrationNo=NTN, status=Confirmed) and `workflowpayment/v1/fetch-claimed` before retrying the workflow gate.

## 2026-09-26 — /tmp is wiped between sessions; keep automation + credentials in a persistent dir

**Context:** The whole working dir `/tmp/opencode` (venv, scripts, password file) vanished mid-project (only the 2 newest files survived); recovered the password from the opencode session DB and rebuilt in `/home/grok/fbr-tooling/`.
**Lesson:** Never store active tooling/secrets in /tmp. Use a persistent workspace dir; keep secrets chmod 600; component caches (Playwright browsers) survive in ~/.cache.
**Action:** For long-running automation: build in `/home/grok/fbr-tooling/`-style dirs, keep `iris_pass.txt` chmod 600, recover secrets from `~/.local/share/opencode/opencode.db` event logs if lost.

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

## 2026-08-20 — pip on Ubuntu 26.04 needs PEP 668 handling

**Context:** `pip install potpie` failed on an externally-managed Python 3.14 (PEP 668); `venv`/`pipx` both need `ensurepip` (missing, no sudo). Default PyPI torch wheel pulls the full CUDA toolchain (multi-GB at 1.2 MB/s).
**Lesson:** On this box use `pip install --user --break-system-packages` (contained in `~/.local`), and pre-install CPU-only torch from the PyTorch CPU index to skip CUDA deps.
**Action:** For future Python CLI tools: `pip install --user --break-system-packages <pkg>`; for torch-based tools, install torch from `https://download.pytorch.org/whl/cpu` first.

## 2026-08-20 — Potpie v0.1.0 falkordb_lite is in-memory only

**Context:** `potpie graph propose/commit` validated and reported "committed" with a mutation id, but reads (`graph status`, `search`, `resolve`) stayed at 0 and a daemon restart wiped everything.
**Lesson:** The lite backend doesn't persist graph claims across daemon restarts in this version. Don't rely on it as durable storage — the flat-markdown memory is the source of truth.
**Action:** If the graph looks empty, re-run `potpie graph propose` + `commit`; keep important facts in the markdown files.
## 2026-10-05 — IRIS's API has no auth token; it trusts the browser session

**Context:** Trying to drive `api.fbr.gov.pk` with plain HTTP fails in ways that look like server bugs: HTTP 500s, `{"message":null,"status":"error"}`, and a NullPointerException on `workflow.getTaxPeriod()`. The endpoints accept requests from anywhere.
**Lesson:** IRIS has no bearer-token auth — it inherits the authenticated browser session. You must log in through the real Playwright UI and replay that page's own request headers, with the task's `encId` as the `trid` header. Before filing a bug against IRIS, confirm the headers were sent.
**Action:** Encapsulate this in one client (`scripts/fbr_client.py`) so nobody re-derives it. Documented in `reference/api-endpoints.md`.

## 2026-10-05 — IRIS's task-create endpoint has no idempotency guard

**Context:** Probing the task grid created duplicate DRAFT tasks on the taxpayer's account. The endpoint accepted malformed and repeated payloads and issued a new task id every time.
**Lesson:** "Retry on failure" against this API silently spams a taxpayer's account with drafts. Server-side there is no protection at all.
**Action:** Make draft reuse a client-side invariant — `ensure_draft()` lists and reuses before it will consider creating. Treat any create call as one-shot.

## 2026-10-05 — Reconcile by inverting the target figure, not by tweaking the model

**Context:** A portal tax of 70,847 on a gross of 3,596,325 was not reproducible under any rebate policy. Instead of tuning slabs until it matched, `tax_compute.py --solve` bisects the calculation to report what the portal's number implies: taxable income ~2,918,319, i.e. ~678,006 of undocumented reduction.
**Lesson:** When a model disagrees with an authoritative system, the useful output is not "my model is right" but "here is the specific claim the authority's number makes". That turns a vague disagreement into a checkable fact.
**Action:** Never adjust inputs to force agreement. Deductions in particular: fabricating one to reconcile is worse than leaving the return as a DRAFT. Unvidenced deductions are now a hard block in `preflight_check.py`.

## 2026-10-05 — Withhold a credential pasted in chat, use it transiently, advise rotation

**Context:** A GitHub PAT was pasted in plaintext to push a repo.
**Lesson:** Chat transcripts persist. The right handling is to use the token only as a transient env/command-line value — never write it to a config file, remote URL, or `.git/config` — and to verify afterwards that no copy landed on disk.
**Action:** Pushed with `https://x-access-token:<tok>@...` on the command line (git does not persist a command-line URL), then set a credential-free remote and grepped `.git/config`. Told the user to rotate. Also recommended narrowing scopes: the token carried `repo`, `workflow`, `delete:packages` and `admin:org`.

## 2026-10-05 — A tax-year mismatch fails silently for high earners only

**Context:** FBR's top slab band changed from 30% to 20% between the Finance Act 2024 and 2025. Using the wrong profile produces a plausible wrong number.
**Lesson:** When a rate boundary moved, a wrong-version lookup is invisible below the boundary and wrong above it. That is the worst possible shape for a silent error — it passes every test you run with ordinary fixtures.
**Action:** Tax profiles must be explicit (never defaulted from the current date), versioned by tax year, and the period printed alongside every result.

## 2026-10-05 — A live bank reference was sitting uncommitted in a public repo

**Context:** While committing the FBR agent work, a pre-commit PII scan caught a full 1Bill bank transaction reference (`267•••••525`) in plaintext across four files of this second brain. This repo's GitHub remote is **public**. The value was uncommitted at the time, so it was never in history.
**Lesson:** The per-note convention of masking CNIC/NT# was followed, but the *payment* identifiers were not on anyone's checklist — a transaction reference is just as linkable to a taxpayer as an identity number. "It's not PII" is a category error for a payment id.
**Action:** Redacted to `267•••••525` before commit. Re-run the scan in `notes/fbr-iris-tax-agent.md` (Payment identifiers) whenever taxpayer figures are written here.
