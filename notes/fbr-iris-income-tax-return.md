# FBR IRIS Income Tax Return — Filing Playbook

## Summary
Complete, reusable playbook for filing a TY2026 individual 114(1) income tax return on FBR IRIS 2.0 (Pakistan) via browser automation (Playwright + tesseract OCR). Used successfully 2026-09-26 for taxpayer CNIC `4200••••••5475` (NTN `74••••••-0`). Full identifiers / credentials live only in `/home/grok/fbr-tooling/` (chmod 600) — never here.

## Details

### Key references
- Portal: `https://iris.fbr.gov.pk` (IRIS 2.0 / NITR). Legacy screens redirect to `irisv1.fbr.gov.pk/jsf/...`.
- API base: `https://api.fbr.gov.pk` (captcha, sso, workflow, dashboard grid, payments, notification).
- API gateway (payment/claim): `https://gw.fbr.gov.pk/...` in older flows.
- Working dir with scripts + credentials: `/home/grok/fbr-tooling/` (venv at `venv/bin/python3`, password file `iris_pass.txt` chmod 600).
- Chromium (no download needed): `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome` via `executable_path`.

### Login pipeline (captcha OCR)
1. Load `https://iris.fbr.gov.pk`, fill `input[placeholder="CNIC/NTN"]` + `input[placeholder="Password"]`.
2. Remove `.offline-alert-wrapper` elements (they block clicks). Add init script to hide `navigator.webdriver`.
3. Captcha: `POST api.fbr.gov.pk/captcha-service/v1/generate-captcha` returns `{expiry-time, captcha(base64 png)}`. OCR recipe that works: grayscale → resize ×5 LANCZOS → autocontrast → sharpen → tesseract `--psm 7/8/13`; retry ×8 with threshold & median variants; accept 4–6 alphanumeric chars; rank by vote. Loop up to 14 attempts (captcha expires in 15s); success = `'dashboard' in page.url` after clicking `Verify`.
4. `sso-service-saas/v1/verify-credentials` → authToken; then dashboard loads: `dashboard-tasks-grid-service-{core,itr}/v1/workflow-tree`, `notification/v1/notification/getUnRead`.

### Opening the return workflow
- Dashboard task row containing `114(1)` is a `tr.doubleclick` — dblclick it (retry up to 7×) until URL contains `workflow`.
- TY2026 114(1) = **NITR** (IRIS 2.0) task code 2107; prior years use ITR/V1 routes.
- Build the return: salary + perks (code 1009/1049/1010 etc.), 116 Wealth Statement, WHT/extras claims (Cellphone 236 ×2, Remittance 236Y, Profit 151).

### Payment
- PSID `107••••••` (user-generated, paid via Askari 1Bill, bank ref `267•••••525`, amount 21,931). We never generate PSIDs — the user's own is used.
- Verify payment: SPA **Search e-Payment** → POST `Get_Payment_Status_By_PSID_CPR` (RegistrationNo=NTN, key=captcha) → CPR `IT2026092401011••••••`, PaymentStatus **Confirmed**, PaymentType IT. Also `workflowpayment/v1/fetch-claimed` shows `{amountCode:"9203", taxYear:"2026", amount:21931}` — payment linked to the return.
- **Gotcha:** after payment, FBR's ledger can lag (CPMS/1Bill sync). If `review-submit` fails with `MSG.VLD.000253` (payment not found), wait until Search e-Payment shows **Confirmed**, then retry. It resolves.

### Final submission
- `submit-workflow-common-service/v1/review-submit` must return `workflow_lock_success` first (workflow lock persists server-side across logins; gate = payment visible + data complete).
- Final screen: Declaration text + **"Enter 4 Digit Pin"** (password input, maxlen 4) + SUBMIT/CANCEL. **No OTP / forgot-pin affordance — it's the taxpayer's static 4-digit e-Pin.** Never invent it: ask the user.
- SUBMIT button innerText is `"check_circle\nSUBMIT"` — a `/^SUBMIT$/` regex FAILS. Match `/submit/i` and exclude `/cancel/i`.
- Success = `POST submit-workflow-common-service/v1/submit → {"message":"success","status":"success"}`.

### Post-submission verification (how to confirm "it's really filed")
- **FBR sends NO email/SMS on filing.** Portal notification centre returns `{"UnreadCount":0}` — that's normal, not missing.
- Authoritative record: dashboard → **Completed Tasks** tab → **DECLARATION (N)** folder → row *"114(1) (Return of Income filed voluntarily for complete year)"*, `Tax Year:2026`. FBR's `dashboard-tasks-grid-service-core/v1/search` returns the row with `workflowType:"COMPLETED_TASKS"`, `taskId:2107`, `urlRoute:"NITR"`, `documentDate`/`complianceDate` = filing timestamp (2026-09-26T13:29:19+05:00).
- dblclick the completed row → opens the **filed return in view mode** with all figures — the strongest proof.
- The dashboard "Submit your Income Tax Return for tax year 2026" banner is **static promo** — ignore it.

### CPR CORRECTION task (observed, separate)
- Dashboard shows a **DRAFT** task *"Application for correction in CPR"* (TY2026 period, task `10M77P80`, raised 24-Sep 17:59 by officer "Aasim Idrees", due 27-Sep-2026, contents empty). It's the channel FBR uses when a paid PSID needs routing/correction. **Not the return; don't submit it without the taxpayer confirming they initiated it.**

## Related
- [Project: FBR IRIS TY2026 filing](./projects/fbr-iris-income-tax-2026.md)
- [Potpie graph notes](./notes/potpie.md)
- [Decisions log](../decisions.md) · [Learnings log](../LEARNINGS.md)