# Leaderboard Exercise Notes

## Running locally

Prerequisites: Node 20+ and Docker with Compose.
Use an active Node LTS release where possible.

From the repository root:

```bash
npm ci
npm run db:up
docker compose exec db pg_isready -U postgres -d remotebridge
npm run db:reset
npm start
```

Wait for Postgres to report that it is accepting connections before
resetting the database.

In another terminal:

```bash
cd client
npm ci
npm run dev
```

Open the URL printed by Vite.

Database resets and tests are destructive; use only the disposable
local exercise database.

## Deterministic demo

The dated seed data may not qualify under the current real-world clock.
To reproduce the specification's demo window, stop the normal API and
run this from the repository root:

```bash
node -e "require('./src/lib/clock').setNow('2026-11-12T12:00:00Z'); require('./src/server')"
```

This overrides the clock only for that process. Normal `npm start`
uses the real clock.

## Verification commands

```bash
npm test
npm --prefix client run build
git diff --check
```

## Decisions and assumptions

- Ranking follows the written average-score rules. The example response
  appears to use maximum scores instead.
- Leaderboard names use first name plus last initial. The shared name
  helper will support this explicitly while preserving full names for
  existing roster callers.
- Only completed sessions with non-null scores count toward eligibility
  and averages. Zero is a valid score.
- The 30-day window includes both boundaries and excludes future completions.
- Ranking uses unrounded averages. Rounding happens only for the response.
- The response contains at most ten learners, even if a tie crosses the cutoff.

## Verification performed

- Starter test suite passed before feature implementation.
- Name-helper tests and existing roster tests passed after adding
  opt-in last-name abbreviation.
- Leaderboard core tests and the full test suite passed.
- Verified the seeded leaderboard endpoint using the fixed demo clock.
- Edge-case tests passed for competition ranking, alphabetical ties,
  unrounded averages, inclusive time boundaries, session eligibility,
  score units, zero scores, tenant isolation, and the ten-entry limit.
- Full test suite passed after adding edge-case coverage.
- Client production build passed.
- Full backend test suite passed after frontend integration.
- Manually verified populated, loading, empty, and error states.
- Checked the leaderboard at a narrow mobile viewport.

## Final verification

- Full backend test suite passed.
- Client production build passed.
- Populated, loading, empty, and error states checked manually.
- Narrow-screen layout checked manually.
- Fixed-clock demo matched the expected average-score ordering.

## Before production

- Bind organization access to the authenticated user's permissions.
- Confirm the missing-score policy and correct the contradictory example.

## With more time

- Add automated frontend tests for request states and organization changes.
- Verify keyboard and screen-reader behavior more thoroughly.
- Measure query performance against realistic data volumes before
  deciding whether additional indexes are necessary.

## AI collaboration

- Used an AI assistant for planning, implementation guidance, and review.
- Session export or key prompts will be included before submission.
