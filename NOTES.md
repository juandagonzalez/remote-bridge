# Leaderboard Exercise Notes

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

## Before production

- Bind organization access to the authenticated user's permissions.
- Confirm the missing-score policy and correct the contradictory example.

## AI collaboration

- Used an AI assistant for planning, implementation guidance, and review.
- Session export or key prompts will be included before submission.
