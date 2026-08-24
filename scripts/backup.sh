#!/usr/bin/env bash
# second-brain/scripts/backup.sh
# Creates a timestamped tar.gz backup of the entire second-brain directory.
# Run manually or via cron/systemd timer.

set -euo pipefail

BACKUP_DIR="$HOME/backups/second-brain"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE="second-brain-$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $ARCHIVE"
tar -czf "$BACKUP_DIR/$ARCHIVE" -C "$HOME" second-brain

echo "Backup complete: $BACKUP_DIR/$ARCHIVE"
echo "Size: $(du -h "$BACKUP_DIR/$ARCHIVE" | cut -f1)"