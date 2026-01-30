const express = require('express');
const cors = require('cors');
const db = require('./database');
const routes = require('./routes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('./scheduler'); // Init Scheduler

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


app.use(helmet()); // Security Headers
app.use(limiter);
app.use(cors({
  origin: 'http://localhost:5173' // Restrict to frontend only
}));
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
    console.error('Database Status Error:', err); // Log internally
    res.status(500).json({
      error: 'Erro ao conectar ao banco de dados' // Generic message for user
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});