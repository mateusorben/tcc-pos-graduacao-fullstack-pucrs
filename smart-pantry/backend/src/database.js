require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  // Mantém compatibilidade com o código legado que usa query direto
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      // Descomente linha abaixo para debug de queries lentas
      // console.log('Query executada:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  },
  // Expõe o pool para uso avançado (transações)
  getPool() {
    return pool;
  }
};