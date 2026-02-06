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


const cookieParser = require('cookie-parser');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Must set exact origin for credentials
  credentials: true,
};

const hpp = require('hpp');

app.use(cors(corsOptions));
app.use(helmet());
app.use(hpp()); // Protect against HTTP Parameter Pollution
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

// Global Error Handler (Must be after routes)
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});