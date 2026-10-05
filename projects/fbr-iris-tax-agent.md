# FBR IRIS Tax Agent (repo)

## Goal
Turn the hard-won, hardcoded TY2025 IRIS automation into a reusable, safe,
published agent/skill that another agent can run cold — with no real taxpayer
data in version control.

## Status
**SHIPPED ✅ 2026-10-05.** Private repo, commit `44bc3c9`, 15 files, ~2,100 lines.

- Local: `~/projects/fbr-iris-tax-agent/`
- Remote: `github.com/Awaiswilll/fbr-iris-tax-agent` (private)
- Created and pushed with a PAT passed on the command line only; the permanent
  remote URL is credential-free and `.git/config` was verified to contain no token
- Pre-commit scan clean: no real CNIC/NTN/email/DOB/bank refs, no secrets, no
  credential-shaped files, no binaries

Scripts all execute: `tax_compute.py` (engine + solver), `preflight_check.py`
(blocked the known-bad case correctly), `captcha_ocr.py` self-test (tesseract
5.5.0 + Pillow present).

## Decisions
- **Made the repo private.** It documents a specific government's private API.
  Publishing an unauthenticated endpoint map plus working bypass automation to a
  public repo is a misuse surface, not just a legal one.
- **Rewrote from scratch rather than copying `~/fbr-tooling/`.** Those 215 files
  have PII in ~20 of them plus `iris_pass.txt`. Extracting the *logic* and
  re-parameterising it was safer than sanitising in place.
- **Repo-local git identity only.** Global git config left untouched.
- **Made the tax engine's uncertainty explicit** rather than tuning it to match
  a target number. See below.
- **Did not "fix" the 70,847 gap.** Recorded as an open item with the solver
  output instead. Fabricating a ~678k deduction to reconcile would have been the
  single worst thing to do here.
- **No PII in the repo, but the brain keeps masked identifiers** — consistent
  with the existing TY2026 decision that this brain syncs to GitHub.

## Open item
TY2025 portal tax of 70,847 vs locally computed 213,228.25. Gap implies
~678,006 of undocumented reduction. Unresolved; the return remains a DRAFT and
was not submitted. Next step is to identify the deduction or the wrong
tax-year/rebate assumption — see
[notes/fbr-iris-tax-agent.md](../notes/fbr-iris-tax-agent.md).

## Supersedes
- `~/.config/opencode/skills/fbr-iris-income-tax/SKILL.md` (single file, TY2026-shaped)
- the ad-hoc probe scripts in `~/fbr-tooling/` (215 files, PII-laden, no docs)

## Links / Files
- Note: [notes/fbr-iris-tax-agent.md](../notes/fbr-iris-tax-agent.md)
- Playbook: [notes/fbr-iris-income-tax-return.md](../notes/fbr-iris-income-tax-return.md)
- TY2026 filed: [projects/fbr-iris-income-tax-2026.md](./fbr-iris-income-tax-2026.md)
- Backups: `~/backups/fbr-iris-tax-agent/`, `~/backups/second-brain/`