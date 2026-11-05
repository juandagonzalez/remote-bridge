const express = require('express');
const rosterRoutes = require('./routes/roster');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
app.use(express.json());

app.use('/api', rosterRoutes);
app.use('/api', leaderboardRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
});

module.exports = app;
