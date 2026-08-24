# OpenCode Session Resume on Reboot

## Goal
Automatically resume all AI-agent (opencode) shells that were running before a system reboot, so active work sessions survive restarts.

## Status
Working (2026-08-24). Installed at `~/.local/bin/resume-opencode-sessions.sh`, triggered by a user `@reboot` crontab entry.

## How it works
1. `@reboot` cron (user grok) runs the script ~1s after boot — before any GUI exists.
2. Script queries `~/.local/share/opencode/opencode.db` (SQLite) for non-archived sessions with ≥5 messages and `time_updated` within the last `OPENCODE_RECENT_DAYS` (default 7).
3. Creates **detached tmux sessions** named `oc-<id>` running `opencode -s <session>`. Headless — no terminal emulator, DISPLAY, or DBus required.
4. After login: `ocls` lists resumed sessions, `ocattach` attaches (`ocattach <name>` for a specific one). Both defined in `~/.bashrc`.
5. Log of every boot run: `~/.local/share/opencode/resume-sessions.log`.
6. Optional `--open-windows` flag opens terminator windows attached to each tmux session — only valid AFTER login, never from @reboot.

## Decisions
- **Detached tmux instead of launching terminal windows at boot.** The original version launched terminator from @reboot and failed silently every time: cron fires before the graphical session/DBus is up, terminator crashes, and cron discards output ("No MTA installed"). See [decisions.md](../decisions.md) 2026-08-24.
- **Recency window (default 7 days) instead of boot-period detection.** The first design matched sessions between previous/current boot timestamps via journalctl; that window was empty in practice because `time_updated` lands just before shutdown or after next boot, yielding 0 resumes.

## Links / Files
- Live script: `~/.local/bin/resume-opencode-sessions.sh`
- Tracked copy: [`scripts/resume-opencode-sessions.sh`](../scripts/resume-opencode-sessions.sh)
- Crontab entry: `@reboot DISPLAY=:0 ... /home/grok/.local/bin/resume-opencode-sessions.sh`
- DB schema note: `session.time_updated` / `time_archived` columns drive selection.
