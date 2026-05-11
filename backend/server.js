const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, pool } = require('./config/database');
const stockRoutes     = require('./routes/stocks');
const authRoutes      = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  process.env.FRONTEND_URL,
].filter(Boolean);

const originFn = (origin, callback) => {
  if (!origin) return callback(null, true);
  const allowed = allowedOrigins.some((o) =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );
  callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
};

app.use(cors({ origin: originFn, credentials: true }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: originFn, methods: ['GET', 'POST'], credentials: true },
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/favorites', apiLimiter,  favoritesRoutes);
app.use('/api/stocks',    apiLimiter,  stockRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Stock price broadcaster
function simulatePriceChange(price) {
  const fluctuation = (Math.random() - 0.5) * 0.004;
  return parseFloat((price * (1 + fluctuation)).toFixed(2));
}

async function broadcastStocks() {
  try {
    const [rows] = await pool.query(
      'SELECT id, symbol, name, price, prev_close, day_high, day_low, volume, market_cap, sector FROM stocks'
    );
    const stocks = rows.map((s) => {
      const prevClose = parseFloat(s.prev_close);
      const livePrice = simulatePriceChange(parseFloat(s.price));
      const change    = parseFloat((livePrice - prevClose).toFixed(2));
      const changePct = parseFloat(((change / prevClose) * 100).toFixed(2));
      return {
        ...s,
        price: livePrice,
        change,
        changePct,
        dayHigh: parseFloat(s.day_high),
        dayLow:  parseFloat(s.day_low),
      };
    });
    io.emit('stocks:update', stocks);
  } catch (err) {
    console.error('Broadcast error:', err.message);
  }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  broadcastStocks();
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

testConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    setInterval(broadcastStocks, 3000);
  });
});
