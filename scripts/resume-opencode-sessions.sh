#!/usr/bin/env bash
# Resumes opencode sessions that were active before the last reboot.
# Creates DETACHED tmux sessions (named oc-<id>) running "opencode -s <id>".
# Works headless at boot time (no terminal emulator / DBus / display needed).
#
# After login, attach with:  tmux attach -t oc-<id>     (see also: ocls / ocattach)
# Window count is controlled by OPENCODE_RECENT_DAYS (default 7).

DB="${OPENCODE_DB:-$HOME/.local/share/opencode/opencode.db}"
RECENT_DAYS="${OPENCODE_RECENT_DAYS:-7}"
LOG="$HOME/.local/share/opencode/resume-sessions.log"
TERMINAL="${TERMINAL:-x-terminal-emulator}"   # only used in --open-windows mode

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

CUTOFF_MS=$(( $(date +%s) * 1000 - RECENT_DAYS * 86400000 ))

mapfile -t SESSIONS < <(python3 -c "
import sqlite3, sys
con = sqlite3.connect('${DB}')
cur = con.cursor()
cur.execute('''
    SELECT s.id
    FROM session s
    WHERE (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) >= 5
      AND s.time_archived IS NULL
      AND s.time_updated >= ?
    ORDER BY s.time_updated DESC
''', (int(sys.argv[1]),))
for r in cur.fetchall():
    print(r[0])
con.close()
" "$CUTOFF_MS")

if [ ${#SESSIONS[@]} -eq 0 ]; then
  log "No sessions newer than ${RECENT_DAYS} day(s). Nothing to resume."
  exit 0
fi

log "Found ${#SESSIONS[@]} session(s) newer than ${RECENT_DAYS} day(s); creating detached tmux sessions..."

started=0
for session in "${SESSIONS[@]}"; do
  tmux_name="oc-${session#ses_}"
  if tmux has-session -t "$tmux_name" 2>/dev/null; then
    log "SKIP $session (tmux '$tmux_name' already exists)"
    continue
  fi
  if tmux new-session -d -s "$tmux_name" -c "$HOME" "opencode -s $session" 2>>"$LOG"; then
    log "OK   $session -> tmux:$tmux_name"
    started=$((started+1))
  else
    log "FAIL $session (tmux new-session failed)"
  fi
done

log "Done. Started $started of ${#SESSIONS[@]} session(s). Attach: tmux ls"

# Optional: pass --open-windows AFTER LOGIN to also open terminator windows attached
# to each resumed tmux session. Never use this mode from @reboot (no GUI yet).
if [ "$1" = "--open-windows" ]; then
  export DISPLAY="${DISPLAY:-:0}"
  for session in "${SESSIONS[@]}"; do
    tmux_name="oc-${session#ses_}"
    tmux has-session -t "$tmux_name" 2>/dev/null || continue
    $TERMINAL -e "tmux attach -t '$tmux_name'" &
    sleep 0.3
  done
fi

exit 0