/**
 * Canonical learner display name.
 * Full names remain the default for existing admin-facing callers.
 * Learner-facing leaderboards must explicitly request abbreviation.
 */
function learnerDisplayName(
  learner,
  { abbreviateLastName = false } = {}
) {
  const lastName = abbreviateLastName
    ? `${learner.last_name.slice(0, 1)}.`
    : learner.last_name;

  return `${learner.first_name} ${lastName}`;
}

module.exports = { learnerDisplayName };