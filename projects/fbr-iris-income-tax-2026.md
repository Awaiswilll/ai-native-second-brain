# FBR IRIS — TY2026 Income Tax Return Filing (114(1))

## Goal
File the TY2026 (01-Jul-2025 – 30-Jun-2026) individual 114(1) income tax return for taxpayer CNIC `4200••••••5475` / NTN `74••••••-0` on FBR IRIS 2.0, including the wealth statement and admitted-income-tax payment, before the 30-Sep-2026 deadline.

## Status
**DONE — SUBMITTED ✅ 2026-09-26 13:29 PKT.**
- FBR submit API returned `{"message":"success","status":"success"}`.
- Return listed in Completed Tasks → DECLARATION: *114(1) (Return of Income filed voluntarily for complete year)*, TY2026, FBR record date `2026-09-26T13:29:19+05:00` (task 2107, NITR).
- Filed return opens in view mode with matching figures (Total Salary 5,480,202; Taxed 4,939,938; Exempt 540,264; Wealth statement 116 attached).
- Payment PSID `107••••••` → CPR `IT2026092401011••••••` → Confirmed, 21,931, claimed to workflow (`amountCode:9203, taxYear:2026`), claimed via `fetch-claimed`.
- No email/SMS ack exists by design; portal record is the receipt.

## Decisions
- **Use the taxpayer's own PSID** (never generate one via our tooling) — user supplied it; paid via Askari 1Bill ref `267•••••525`.
- **e-Pin must come from the user** — it's a static 4-digit code in a password dialog (no OTP/forgot); inventing it was explicitly off-limits. User provided it at submit time; submit accepted.
- **Portal Completed Tasks is the authoritative filing record** — FBR sends no email/SMS on filing.
- **Credentials stored only locally** (fbr-tooling/iris_pass.txt, chmod 600); identifiers masked in this brain because the repo syncs to GitHub.
- **CPR CORRECTION draft left untouched** (not the return, contents empty, raised by FBR officer "Aasim Idrees" 24-Sep) — pending taxpayer confirmation of whether they initiated it. (Its listed due date 27-Sep-2026 has now passed.)

## Session / resume
- opencode session id: `ses_f2e0ae5adffeMK8D7K5kkRvlHF` (title "Filling tax returns", recorded live in `~/.local/share/opencode/live-sessions.txt`).
- Resume: `opencode -s ses_f2e0ae5adffeMK8D7K5kkRvlHF` (or after reboot: `ocls` / `ocattach oc-<id>` — see [opencode-session-resume.md](./opencode-session-resume.md)).
- Working dir `/home/grok/fbr-tooling/` holds venv, `iris_pass.txt`, `final_submit.py`, `pin_dialog_probe.py`, verify/probe scripts, logs, screenshots.

## Links / Files
- Playbook: [notes/fbr-iris-income-tax-return.md](../notes/fbr-iris-income-tax-return.md)
- Tooling: `/home/grok/fbr-tooling/`
- Backups: `~/backups/fbr-iris-income-tax-2026/`, `~/backups/second-brain/`
- Skill: `~/.config/opencode/skills/fbr-iris-income-tax/SKILL.md`