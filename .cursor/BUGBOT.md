# Team rules

- Require auth on every HTTP handler. New handlers must use the same authentication checks as the rest of the package.
- Do not build SQL by concatenating or formatting request input. Use placeholders and bound parameters.
- Do not hardcode secrets, API keys, tokens, or passwords. Load them from the secret store or the environment.
- Nil-check pointers and missing map entries before dereferencing them.
- Keep slice indexes in range. Do not read an element without checking the length.
