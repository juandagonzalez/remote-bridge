const request = require('supertest');
const app = require('../src/app');
const { resetDb, pool } = require('./helpers');

beforeAll(resetDb);
afterAll(() => pool.end());

describe('GET /api/orgs/:orgId/roster', () => {
  it('returns full names for admins, sorted by last name', async () => {
    const res = await request(app).get('/api/orgs/1/roster');
    expect(res.status).toBe(200);
    expect(res.body.learners.map((l) => l.display_name)).toEqual([
      'David Chen',
      'Maria Gonzalez',
      'James Okafor',
      'Priya Patel',
      'Sofia Rossi',
      'Liam Walsh',
    ]);
  });

  it('only returns learners from the requested organization', async () => {
    const res = await request(app).get('/api/orgs/2/roster');
    expect(res.body.learners).toHaveLength(1);
    expect(res.body.learners[0].display_name).toBe('Ava Thompson');
  });

  it('rejects a non-numeric org id', async () => {
    const res = await request(app).get('/api/orgs/abc/roster');
    expect(res.status).toBe(400);
  });
});
