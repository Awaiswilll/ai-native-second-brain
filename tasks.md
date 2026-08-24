# Tasks

Central task tracking for all projects and agent work. One task per line when possible. Update status with dates.

## Remote Access Setup
- 2026-08-20: Done — Tailscale + SSH, RustDesk, GNOME RDP, VS Code Desktop, phone peer on tailnet, boot autostart all configured.

## AI Agent Hub
- 2026-08-20: In Progress — Newelle, Paperclip, Manus installed. Unified ai_hub script built. Agents added: claude, opencode, gemini, ollama. Skill selection and systemd --user services enabled.
- 2026-08-20: Fixed duplicate litellm.service on port 4000. Now using litellm-proxy.service.
- 2026-08-20: Remaining: Test all agents end-to-end with real prompts via `ai_hub all "ping"`.

## Claude Desktop
- 2026-08-20: Pending — Install via apt repo, sign in, test GUI.

## Dashboard & Workflow
- 2026-08-20: Pending — Build project-dashboard (HTML/JS), connect to ai_hub, assign first real project.

## GitHub Repository Sync
- 2026-08-20: Created `github-sync-plan.md` so all agents can detect repo status changes automatically.
- 2026-08-20: Repo `Awaiswilll/ai-native-second-brain` exists but needs write permissions granted for push.

## 2026-08-24 — Git commit & push for ollama distillation docs

- 2026-08-24: Done — Executed by opencode after credential fix. `notes/ollama-knowledge-distillation.md` pushed; `decisions.md` (with the 2026-08-24 distillation entry) had already shipped in commit `62068bf`. Both verified on `origin/main` of `Awaiswilll/ai-native-second-brain`.
- Note: original instructions said `cd /home/grok`, but the repo lives at `/home/grok/second-brain` — paths corrected during execution.

Last updated: 2026-08-24