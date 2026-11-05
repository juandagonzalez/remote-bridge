const { learnerDisplayName } = require('../src/lib/names');

describe('learnerDisplayName', () => {
  const learner = {
    first_name: 'Maria',
    last_name: 'Gonzalez',
  };

  it('preserves full names by default for existing callers', () => {
    expect(learnerDisplayName(learner)).toBe('Maria Gonzalez');
  });

  it('abbreviates the last name when explicitly requested', () => {
    expect(
      learnerDisplayName(learner, { abbreviateLastName: true })
    ).toBe('Maria G.');
  });

  it('does not modify the learner object', () => {
    const original = { ...learner };

    learnerDisplayName(learner, { abbreviateLastName: true });

    expect(learner).toEqual(original);
  });
});