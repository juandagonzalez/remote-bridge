const express = require('express');
const { pool } = require('../db');
const { learnerDisplayName } = require('../lib/names');

const router = express.Router();

// Admin-only: full roster for an organization.
router.get('/orgs/:orgId/roster', async (req, res, next) => {
  try {
    const orgId = Number(req.params.orgId);
    if (!Number.isInteger(orgId)) return res.status(400).json({ error: 'invalid_org_id' });

    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email
         FROM learners
        WHERE organization_id = $1
        ORDER BY last_name, first_name`,
      [orgId]
    );

    res.json({
      organization_id: orgId,
      learners: rows.map((l) => ({
        learner_id: l.id,
        display_name: learnerDisplayName(l),
        email: l.email,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
