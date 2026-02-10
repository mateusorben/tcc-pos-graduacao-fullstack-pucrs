const express = require('express');
const cors = require('cors');
const db = require('./database');
const routes = require('./routes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('./scheduler');

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
  origin: (origin, callback) => {

    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);


    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }


    const isLocalNetwork = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);

    if (isLocalNetwork) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

const hpp = require('hpp');

app.use(cors(corsOptions));
app.use(helmet());
app.use(hpp());
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
    console.error('Database Status Error:', err);
    res.status(500).json({
      error: 'Erro ao conectar ao banco de dados'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});