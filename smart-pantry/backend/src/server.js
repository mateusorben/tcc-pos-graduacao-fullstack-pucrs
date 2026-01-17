const express = require('express');
const cors = require('cors');
const db = require('./database');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/api/status', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'online', 
      db_time: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});