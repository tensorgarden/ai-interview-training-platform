# Public Safety and Privacy

This repo is designed to be safe for eventual public GitHub review after the publication gate is approved.

## Data rules

- All people, emails, transcripts, companies, and metrics are fictional.
- Demo emails use `example.test`.
- No Upwork posts, customer names, auth cookies, tokens, provider keys, or private project text are copied into the repo.

## Provider rules

- `AI_PROVIDER=mock` is the default.
- OpenAI and Anthropic adapters are optional boundaries and fail closed without keys.
- `ENABLE_REAL_OUTBOUND_ACTIONS=false` is present even though this demo has no outbound sends.

## Local checklist before publication review

```bash
git status --short
find . -maxdepth 3 -type f \( -name '.env*' -o -name '*cookie*' -o -name '*token*' -o -name '*secret*' \) -print
npm run lint
npm test
npm run build
```

Expected repo-tracked findings are `.env.example` only. If this command is run after `npm install`, ignored `node_modules/` type definitions may include words like cookie or token; those are dependency files, not committed demo data. If any real `.env`, cookie, token, browser state, or key file appears outside ignored dependencies, remove it before publication review.
