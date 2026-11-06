# Leaderboard Exercise Notes

## Running locally

Prerequisites: Node 20+ and Docker with Compose.
Use an active Node LTS release where possible.

From the repository root:

```bash
npm ci
npm run db:up
docker compose exec db pg_isready -U postgres -d remotebridge
```

Wait for Postgres to report that it is accepting connections before
continuing:

```bash
npm run db:reset
npm start
```

Keep the API running. In another terminal:

```bash
cd client
npm ci
npm run dev
```

Open the URL printed by Vite. Both the API and frontend must remain
running.

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

The UI displays the window returned by the API. Results under the real
clock are not expected to match the fixed-date demo.

## Verification commands

From the repository root:

```bash
npm test
npm --prefix client run build
git diff --check
```

Tests modify the disposable local database. Once they finish, restore
the seed data if needed:

```bash
npm run db:reset
```

## Decisions and assumptions

- Ranking follows the written average-score rules. The example response
  appears to use maximum scores instead.
- Leaderboard names use first name plus last initial. The shared name
  helper supports this explicitly while preserving full names for
  existing roster callers.
- Only completed sessions with non-null scores count toward eligibility
  and averages. Zero is a valid score.
- The 30-day window includes both boundaries and excludes future completions.
- Ranking uses unrounded averages. Rounding happens only for the response.
- The response contains at most ten learners, even if a tie crosses the cutoff.
- The frontend preserves the ordering and ranks returned by the API
  rather than implementing a second ranking algorithm.
- The organization ID is configured in App for the exercise. Production
  organization access must come from the authenticated user's permissions.

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

These results record the checks completed at those stages. They do not
automatically establish that the same checks were rerun after subsequent
styling or file-organization changes.

## Design research and styling

The styling pass used research into RemoteBridge's public website,
product pages, and published imagery to guide the interface.

## With more time

- Add automated frontend tests for request states and organization changes.
- Verify keyboard and screen-reader behavior more thoroughly.
- Measure query performance against realistic data volumes before
  deciding whether additional indexes are necessary.

## AI collaboration

Used an AI assistant for implementation planning, code suggestions,
test design, public-site design research, styling, component organization,
and verification guidance.

Key prompts included:

- Read the exercise requirements and propose a minimal implementation
  and Git-flow commit plan.
- Help configure and run the project locally.
- Implement privacy-safe learner names without changing roster behavior.
- Implement and test average-score leaderboard ranking.
- Add tests for ties, rounding, time boundaries, and tenant isolation.
- Build the React leaderboard and verify its request states.
- Research RemoteBridge's public website before proposing interface changes.
- Document the observed style and distinguish verified findings from
  proposed fonts, colors, and component specifications.
- Apply a brand-inspired presentation without changing leaderboard
  rules or adding dependencies.
  - Organize the leaderboard component and its stylesheet in a dedicated
  component folder, updating imports without changing behavior.
- Refactor the simplified interface into focused components: SiteHeader,
  LeaderboardHeader, LeaderboardSummary, LeaderboardTable, and
  LeaderboardFeedback.
- Colocate each component with its stylesheet while keeping global design
  tokens, accessibility utilities, and application layout in App.css.