# Screenshot Assets

Generated local screenshots for the AI Interview Training Platform demo.

## Refresh command

Start the app:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3107
```

Then capture from another terminal:

```bash
SCREENSHOT_URL=http://127.0.0.1:3107 npm run screenshots
```

If using `npm run dev` or `next start` on a different port:

```bash
SCREENSHOT_URL=http://127.0.0.1:3107 npm run screenshots
```

## Current generated files

| File | Purpose |
|---|---|
| `00-full-page.png` | Full-page portfolio demo screenshot |
| `01-dashboard-hero.png` | Landing/dashboard hero with active practice loop |
| `02-candidate-workspace-session-builder.png` | Candidate workspace, session builder, and coach/admin roles |
| `03-transcript-follow-up.png` | Transcript and deterministic mock AI follow-up |
| `04-feedback-rubric-report.png` | Rubric scoring and feedback report |
| `05-admin-analytics.png` | Admin progress dashboard and candidate progress timeline |

These screenshots are generated from fictional/public-safe demo data and are safe for later GitHub/Tensor Garden portfolio review.
