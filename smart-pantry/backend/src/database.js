require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {

  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;

      return res;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  },

  getPool() {
    return pool;
  }
};