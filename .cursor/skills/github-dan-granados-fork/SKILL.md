---
name: github-dan-granados-fork
description: Ensure GitHub context, issues, and pull request work targets the dan-granados/grafana fork. Use for any GitHub-related task, including issues, PRs, commits, searches, or repository context.
---

# GitHub fork targeting: dan-granados/grafana

## Instructions

- Always use `dan-granados/grafana` for GitHub queries and operations (issues, PRs, commits, code search, and repo context).
- For mutating `gh` CLI commands (for example `pr create`, `pr edit`, `pr merge`, issue/release writes), always pass `--repo dan-granados/grafana`.
- For read-only/sync operations, upstream `grafana/grafana` may be used when explicitly needed, but never as the target for write actions.
- For GitHub MCP tools, set owner to `dan-granados` and repo to `grafana`.
- Never create, edit, or merge PRs/issues/releases against `grafana/grafana`, `fieldsphere/grafana`, or `internalsphere/grafana` unless the user explicitly requests that repo.
- If the target repo is ambiguous, check `git remote -v` and still prefer `dan-granados/grafana`.
