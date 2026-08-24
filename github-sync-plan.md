# GitHub Sync Plan — Multi-Agent Awareness

> All AI agents (Claude, opencode, Gemini, Grok, etc.) read this file to understand how to detect updates across repositories and projects.

## Goal
Create a lightweight, automatic mechanism so every agent knows:
- Which GitHub repos belong to the user
- The current status of each repo (last commit, open issues, PRs)
- Which local projects map to which repos
- When the second-brain itself was last synced

## Structure

```
second-brain/
├── github-sync-plan.md   ← This file (the protocol)
├── projects/             ← Each project file can contain a "Repo" link
└── decisions.md          ← Log repo additions / permission changes
```

## Protocol (every agent follows)

1. **On session start** read:
   - `github-sync-plan.md`
   - `projects/*.md` (look for any `Repo:` or `GitHub:` field)
   - `decisions.md` (last 30 days of repo-related entries)

2. **Detection methods** (choose any that work on the current machine):
   - Run `gh repo list --json nameWithOwner,updatedAt,description` (GitHub CLI)
   - Parse `.git/config` in every local project folder
   - Query GitHub GraphQL for the user’s public + private repos (requires token)

3. **Update rule**:
   - If a repo is new or its last commit changed → append a dated entry to `decisions.md`
   - If a local project folder has no matching repo → suggest creation in `decisions.md`

4. **Shared state file** (optional but recommended):
   - Create `second-brain/status/repos.json` (machine-readable) updated by a cron job or `gh` script
   - Agents read this file first for fast status checks

## Recommended minimal script (run daily or on demand)

```bash
#!/usr/bin/env bash
# second-brain/scripts/update-repos.sh
gh repo list --json nameWithOwner,updatedAt,description,pushedAt \
  | jq '.[] | {repo: .nameWithOwner, updated: .updatedAt, pushed: .pushedAt}' \
  > second-brain/status/repos.json
```

Add this to crontab or a systemd timer.

## Agent action when a repo changes

- Log the change in `decisions.md`
- If the repo has a matching project file in `projects/`, update its `Status` section
- If new skills, agents, or features appear in the repo, create or update the corresponding `notes/<topic>.md`

## Permissions & tokens

Store GitHub token in `~/.config/github/token` (never commit it). All agents must use the same token for consistent visibility.

## Current known repos (fill as you create them)

- `Awaiswilll/ai-native-second-brain` — the second brain itself
- (Add others here as they are created)

Last updated: 2026-08-20
