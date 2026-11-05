const request = require('supertest');
const app = require('../src/app');
const { setNow } = require('../src/lib/clock');
const { resetDb, pool } = require('./helpers');

beforeAll(resetDb);

beforeEach(() => {
  setNow('2026-11-12T12:00:00Z');
});

afterEach(() => {
  setNow(null);
});

afterAll(() => pool.end());

describe('GET /api/orgs/:orgId/leaderboard', () => {
  it('returns qualifying learners ranked by average score', async () => {
    const res = await request(app).get('/api/orgs/1/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      organization_id: 1,
      window: {
        start: '2026-10-13T12:00:00.000Z',
        end: '2026-11-12T12:00:00.000Z',
      },
      entries: [
        {
          rank: 1,
          learner_id: 5,
          display_name: 'Sofia R.',
          score_pct: 88.3,
          session_count: 3,
        },
        {
          rank: 2,
          learner_id: 2,
          display_name: 'David C.',
          score_pct: 88,
          session_count: 3,
        },
        {
          rank: 3,
          learner_id: 6,
          display_name: 'Liam W.',
          score_pct: 86.5,
          session_count: 4,
        },
        {
          rank: 4,
          learner_id: 1,
          display_name: 'Maria G.',
          score_pct: 85,
          session_count: 3,
        },
        {
          rank: 5,
          learner_id: 3,
          display_name: 'Priya P.',
          score_pct: 81.3,
          session_count: 3,
        },
      ],
    });
  });

  it('does not expose full last names or email addresses', async () => {
    const res = await request(app).get('/api/orgs/1/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.entries).toHaveLength(5);

    for (const entry of res.body.entries) {
      expect(Object.keys(entry).sort()).toEqual([
        'display_name',
        'learner_id',
        'rank',
        'score_pct',
        'session_count',
      ]);
    }

    for (const lastName of [
      'Gonzalez',
      'Chen',
      'Patel',
      'Okafor',
      'Rossi',
      'Walsh',
    ]) {
      expect(res.text).not.toContain(lastName);
    }

    expect(res.text).not.toContain('@');
  });

  it('returns an empty array when no learners qualify', async () => {
    const res = await request(app).get('/api/orgs/999/leaderboard');

    expect(res.status).toBe(200);
    expect(res.body.organization_id).toBe(999);
    expect(res.body.entries).toEqual([]);
  });

  it.each(['abc', '1.5'])('rejects invalid organization ID %s', async (orgId) => {
    const res = await request(app).get(`/api/orgs/${orgId}/leaderboard`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'invalid_org_id' });
  });
});