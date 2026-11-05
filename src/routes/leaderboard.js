const express = require('express');
const { pool } = require('../db');
const { now } = require('../lib/clock');
const { learnerDisplayName } = require('../lib/names');

const router = express.Router();

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

router.get('/orgs/:orgId/leaderboard', async (req, res, next) => {
  try {
    const orgId = Number(req.params.orgId);

    if (!Number.isInteger(orgId)) {
      return res.status(400).json({ error: 'invalid_org_id' });
    }

    // PostgreSQL INTEGER bounds; avoid sending out-of-range IDs to the DB.
    if (orgId < -2147483648 || orgId > 2147483647) {
      return res.status(400).json({ error: 'invalid_org_id' });
    }

    // Read the shared clock once so the query and response agree.
    const boundary = now();
    const windowEnd = boundary.toISOString();

    boundary.setTime(boundary.getTime() - WINDOW_MS);
    const windowStart = boundary.toISOString();

    const { rows } = await pool.query(
      `
        WITH qualifying_learners AS (
          SELECT
            l.id AS learner_id,
            l.first_name,
            l.last_name,
            AVG(s.score) AS average_score,
            COUNT(*)::integer AS session_count
          FROM learners AS l
          JOIN practice_sessions AS s
            ON s.learner_id = l.id
           AND s.organization_id = l.organization_id
          WHERE l.organization_id = $1
            AND s.organization_id = $1
            AND s.status = 'completed'
            AND s.score IS NOT NULL
            AND s.completed_at >= $2::timestamptz
            AND s.completed_at <= $3::timestamptz
          GROUP BY l.id, l.first_name, l.last_name
          HAVING COUNT(*) >= 3
        ),
        ranked_learners AS (
          SELECT
            learner_id,
            first_name,
            last_name,
            session_count,
            average_score,
            RANK() OVER (
              ORDER BY average_score DESC
            ) AS rank
          FROM qualifying_learners
        )
        SELECT
          learner_id,
          first_name,
          last_name,
          session_count,
          rank,
          ROUND(average_score / 10, 1) AS score_pct
        FROM ranked_learners
        ORDER BY average_score DESC, first_name ASC, learner_id ASC
        LIMIT 10
      `,
      [orgId, windowStart, windowEnd]
    );

    return res.json({
      organization_id: orgId,
      window: {
        start: windowStart,
        end: windowEnd,
      },
      entries: rows.map((learner) => ({
        rank: Number(learner.rank),
        learner_id: learner.learner_id,
        display_name: learnerDisplayName(learner, {
          abbreviateLastName: true,
        }),
        score_pct: Number(learner.score_pct),
        session_count: learner.session_count,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;