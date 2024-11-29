const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mukormos_webapp',
  password: 'postgres',
  port: 5432,
});

module.exports = pool;

