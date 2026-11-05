const request = require('supertest');
const app = require('../src/app');
const { setNow } = require('../src/lib/clock');
const { resetDb, pool } = require('./helpers');

const ORG_ID = 101;
const OTHER_ORG_ID = 102;

const WINDOW_START = '2026-10-13T12:00:00.000Z';
const WINDOW_END = '2026-11-12T12:00:00.000Z';
const IN_WINDOW = '2026-11-01T12:00:00.000Z';

let nextLearnerId;

beforeEach(async () => {
  setNow(WINDOW_END);
  await resetDb();

  await pool.query(
    `
      INSERT INTO organizations (id, name)
      VALUES ($1, $2), ($3, $4)
    `,
    [ORG_ID, 'Edge Test Team', OTHER_ORG_ID, 'Other Test Team']
  );

  // Explicit IDs avoid relying on the seed file's sequence state.
  nextLearnerId = 1000;
});

afterEach(() => {
  setNow(null);
});

afterAll(() => pool.end());

async function addLearner(firstName, organizationId = ORG_ID) {
  const id = nextLearnerId;
  nextLearnerId += 1;

  await pool.query(
    `
      INSERT INTO learners (
        id, organization_id, first_name, last_name, email
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      id,
      organizationId,
      firstName,
      'Example',
      `learner-${id}@example.test`,
    ]
  );

  return id;
}

async function addSession(learnerId, overrides = {}) {
  const session = {
    organizationId: ORG_ID,
    status: 'completed',
    score: 800,
    startedAt: IN_WINDOW,
    completedAt: IN_WINDOW,
    ...overrides,
  };

  await pool.query(
    `
      INSERT INTO practice_sessions (
        organization_id,
        learner_id,
        scenario,
        status,
        score,
        started_at,
        completed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      session.organizationId,
      learnerId,
      'Edge-case practice',
      session.status,
      session.score,
      session.startedAt,
      session.completedAt,
    ]
  );
}

async function addScores(learnerId, scores, overrides = {}) {
  for (const score of scores) {
    await addSession(learnerId, { ...overrides, score });
  }
}

async function getEntries() {
  const res = await request(app).get(
    `/api/orgs/${ORG_ID}/leaderboard`
  );

  expect(res.status).toBe(200);

  return res.body.entries;
}

describe('leaderboard edge cases', () => {
  it('uses competition ranks and alphabetically orders tied learners', async () => {
    // Insert Zoe before Amy to ensure insertion order does not decide ties.
    const zoe = await addLearner('Zoe');
    const amy = await addLearner('Amy');
    const ben = await addLearner('Ben');

    await addScores(zoe, [900, 900, 900]);
    await addScores(amy, [900, 900, 900]);
    await addScores(ben, [800, 800, 800]);

    const entries = await getEntries();

    expect(entries.map((entry) => ({
      rank: entry.rank,
      learner_id: entry.learner_id,
    }))).toEqual([
      { rank: 1, learner_id: amy },
      { rank: 1, learner_id: zoe },
      { rank: 3, learner_id: ben },
    ]);
  });

  it('ranks by raw averages even when displayed scores are equal', async () => {
    const amy = await addLearner('Amy');
    const zoe = await addLearner('Zoe');

    await addScores(amy, [874, 874, 874]);
    await addScores(zoe, [875, 874, 874]);

    const entries = await getEntries();

    expect(entries.map((entry) => ({
      learner_id: entry.learner_id,
      rank: entry.rank,
      score_pct: entry.score_pct,
    }))).toEqual([
      { learner_id: zoe, rank: 1, score_pct: 87.4 },
      { learner_id: amy, rank: 2, score_pct: 87.4 },
    ]);
  });

  it('includes both window boundaries and uses completion time', async () => {
    const learner = await addLearner('Boundary');

    await addSession(learner, {
      startedAt: '2026-10-01T00:00:00.000Z',
      completedAt: WINDOW_START,
    });
    await addSession(learner, { completedAt: WINDOW_END });
    await addSession(learner);

    const entries = await getEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      learner_id: learner,
      session_count: 3,
      score_pct: 80,
    });
  });

  it.each([
    [
      'before the window',
      { completedAt: '2026-10-13T11:59:59.999Z' },
    ],
    [
      'after the window',
      { completedAt: '2026-11-12T12:00:00.001Z' },
    ],
    ['in progress', { status: 'in_progress' }],
    ['abandoned', { status: 'abandoned' }],
    ['missing a score', { score: null }],
    ['missing a completion time', { completedAt: null }],
  ])('does not count a session %s toward eligibility', async (_, invalidSession) => {
    const learner = await addLearner('Ineligible');

    await addScores(learner, [800, 800]);
    await addSession(learner, invalidSession);

    expect(await getEntries()).toEqual([]);
  });

  it('counts zero scores and converts stored scores to percentages', async () => {
    const zero = await addLearner('Zero');
    const decimal = await addLearner('Decimal');

    await addScores(zero, [0, 0, 0]);
    await addScores(decimal, [875, 875, 875]);

    const entries = await getEntries();

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      learner_id: decimal,
      score_pct: 87.5,
      session_count: 3,
    });
    expect(entries[1]).toMatchObject({
      learner_id: zero,
      score_pct: 0,
      session_count: 3,
    });
  });

  it('isolates organizations even when session ownership is inconsistent', async () => {
    const local = await addLearner('Local');
    const foreign = await addLearner('Foreign', OTHER_ORG_ID);
    const mismatchedLocal = await addLearner('Mismatched');

    await addScores(local, [800, 800, 800]);

    // Valid sessions belonging entirely to the other organization.
    await addScores(foreign, [1000, 1000, 1000], {
      organizationId: OTHER_ORG_ID,
    });

    // Session says "our organization", learner belongs elsewhere.
    await addScores(foreign, [1000, 1000, 1000]);

    // Learner says "our organization", sessions belong elsewhere.
    await addScores(mismatchedLocal, [1000, 1000, 1000], {
      organizationId: OTHER_ORG_ID,
    });

    const entries = await getEntries();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      learner_id: local,
      score_pct: 80,
      session_count: 3,
    });
  });

  it('returns at most ten entries even when a tie crosses the cutoff', async () => {
    const learnerIds = [];

    for (let index = 0; index < 11; index += 1) {
      const name = `Learner${String(index).padStart(2, '0')}`;
      const learner = await addLearner(name);

      learnerIds.push(learner);
      await addScores(learner, [800, 800, 800]);
    }

    const entries = await getEntries();

    expect(entries).toHaveLength(10);
    expect(entries.map((entry) => entry.learner_id)).toEqual(
      learnerIds.slice(0, 10)
    );
    expect(entries.every((entry) => entry.rank === 1)).toBe(true);
  });
});