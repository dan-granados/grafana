---
name: kill-and-restart
description: Stop the local Grafana backend and frontend dev servers and start them again. Use when the user asks to kill and restart, reset the dirty local env, or port 3000 is already in use.
---

# Kill and restart

## Instructions
When asked to kill and restart the local Grafana env, do this yourself with the Shell tool. Do not ask the user to run it.

### Stop existing servers
From the repo root, stop whatever is bound to port 3000 and any matching `make run` / `yarn start` / webpack watchers for this repo. Prefer a clean kill of this project's processes over killing unrelated apps.

Example approach:

```sh
lsof -ti tcp:3000 | xargs -r kill
```

If make run or yarn start are still running in terminals, stop those too.

### Start again

Then follow /start-dev-server:

Backend from repo root: `make run`

Frontend from repo root in a separate terminal: `yarn start`

### Verify

Wait for backend HTTP Server Listen and frontend Compiled successfully.

`curl -I http://localhost:3000/` should 302 to /login.

Login is admin / admin. Skip the password change.

### Notes

This is a local reset. Do not delete git branches, close PRs, or change remotes.

If node_modules is missing, run the frontend install from /initial-setup before yarn start.
