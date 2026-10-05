# FBR IRIS Tax Agent — the tooling

## Summary
Published agent/skill that automates FBR IRIS 2.0 income-tax returns, extracted from the TY2025 filing work. Private repo: `github.com/Awaiswilll/fbr-iris-tax-agent`, local at `~/projects/fbr-iris-tax-agent`. Supersedes the ad-hoc scripts in `~/fbr-tooling/` and the older single-file skill at `~/.config/opencode/skills/fbr-iris-income-tax/`.

## Details

### What it is
Four scripts plus reference docs, all parameterised and env-driven:
- `SKILL.md` — agent definition with hard safety rules
- `scripts/fbr_client.py` — Playwright login + authenticated backend client
- `scripts/captcha_ocr.py` — tesseract OCR, confidence-gated, human fallback
- `scripts/tax_compute.py` — versioned Finance Act slabs + a `--solve` reconciler
- `scripts/preflight_check.py` — BLOCK/WARN/INFO gate before submission
- `reference/` — endpoints, workflow, known bugs, figures reconciliation

### The session-auth model (the thing that makes it work at all)
IRIS's API has **no bearer token**. It trusts the browser session, so requests
must be replayed with headers harvested from the logged-in page. Raw HTTP
against `api.fbr.gov.pk` does not work. Every "IRIS is broken" report is
usually one of: headers not sent, not in the authenticated context, or the task
is a genuinely unprimed DRAFT.

### Safety decisions
- **No credential in any tracked file.** CNIC/NT#/password are environment-only.
  The CNIC shape is validated at 13 digits because a typo files under the wrong
  person.
- **The e-Pin is never collected or stored.** It is the taxpayer's static 4-digit
  authorisation, not an OTP and not the account password. Conflating those is a
  serious failure mode. Submission stops for the human.
- **Draft creation is guarded client-side.** IRIS's create endpoint has **no
  idempotency guard** — it accepts malformed and repeated payloads and issues a
  new task each time. Any agent that retries on failure will spam a taxpayer's
  account with duplicate DRAFTs. `ensure_draft()` reuses before creating.
- **Unevidenced deductions are a hard block.** So a tax mismatch can never be
  "fixed" by inventing a deduction.

### The open discrepancy (2026-10-05)
For the TY2025 draft (gross 3,596,325 / WHT 548,898), the portal returned tax
payable **70,847** and refund **478,051**. Internally consistent
(`70,847 + 478,051 = 548,898`), so the portal is self-coherent — the dispute is
the tax computation itself.

No selectable rebate policy reproduces 70,847 from that gross. Inverting the
calculation implies a taxable income of ~2,918,319, i.e. **~678,006 of
undocumented reduction before tax**. Ranked causes: undocumented allowable
deductions (most likely) · wrong tax-year profile · wrong rebate policy · wrong
gross figure · brought-forward credit.

Unresolved. **Not filed, deliberately.** Documented in
`reference/figures-reconciliation.md` with the solver output so the next session
starts from the gap rather than re-deriving it.

### Tax-year caution
The top band changed between the 2024 and 2025 Finance Acts (30% → 20%). A wrong
profile is therefore a **silent failure for high earners only** — it looks
correct for everyone else. Profiles are explicit, never inferred from the
current date.

## Related
- Filing playbook: [fbr-iris-income-tax-return.md](./fbr-iris-income-tax-return.md)
- Project: [fbr-iris-tax-agent.md](../projects/fbr-iris-tax-agent.md)
- TY2026 (filed): [fbr-iris-income-tax-2026.md](../projects/fbr-iris-income-tax-2026.md)
- [LEARNINGS.md](../LEARNINGS.md) · [decisions.md](../decisions.md)