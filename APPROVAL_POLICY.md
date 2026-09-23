# Approval policy

## Auto-approve

Auto-approve a pull request when every changed file is documentation (`docs/**` or `*.md`) and the diff does not touch auth, SQL, or secrets.

## Never auto-approve

Never auto-approve a pull request that changes any of the following:

- authentication or authorization
- SQL query construction
- secrets, credentials, tokens, or API keys

Treat `examples/code-review/` as in scope when the diff adds query construction or credentials.

## Human review

Require human review when Bugbot or Security Reviewer reported findings. Do not auto-approve that pull request.
