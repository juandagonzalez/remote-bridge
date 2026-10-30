const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

async function resetDb() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(seed);
}

module.exports = { resetDb, pool };
