const express = require('express');
const cors = require('cors');
const db = require('./database');
const routes = require('./routes');
const rateLimit = require('express-rate-limit');

const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas requisições vindas deste IP, tente novamente após 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false, 
});


app.use(limiter);
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