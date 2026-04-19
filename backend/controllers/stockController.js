const { pool } = require('../config/database');

// Simulate small price fluctuations for real-time effect
function simulatePriceChange(price) {
  const fluctuation = (Math.random() - 0.5) * 0.004; // ±0.2%
  return parseFloat((price * (1 + fluctuation)).toFixed(2));
}

// GET /api/stocks — all stocks with live-simulated prices
async function getAllStocks(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, symbol, name, price, prev_close,
             day_high, day_low, volume, market_cap, sector, last_updated
      FROM stocks
      ORDER BY symbol ASC
    `);

    const stocks = rows.map((s) => {
      const livePrice = simulatePriceChange(parseFloat(s.price));
      const change = parseFloat((livePrice - s.prev_close).toFixed(2));
      const changePct = parseFloat(((change / s.prev_close) * 100).toFixed(2));
      return {
        ...s,
        price: livePrice,
        change,
        changePct,
        dayHigh: parseFloat(s.day_high),
        dayLow: parseFloat(s.day_low),
      };
    });

    res.json({ success: true, data: stocks });
  } catch (err) {
    console.error('getAllStocks error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stocks' });
  }
}

// GET /api/stocks/:symbol — single stock detail
async function getStockBySymbol(req, res) {
  const { symbol } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, symbol, name, price, prev_close,
              day_high, day_low, volume, market_cap, sector, last_updated
       FROM stocks WHERE symbol = ?`,
      [symbol.toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const s = rows[0];
    const livePrice = simulatePriceChange(parseFloat(s.price));
    const change = parseFloat((livePrice - s.prev_close).toFixed(2));
    const changePct = parseFloat(((change / s.prev_close) * 100).toFixed(2));

    // Generate 30-point intraday sparkline
    const sparkline = generateSparkline(s.prev_close, livePrice, 30);

    res.json({
      success: true,
      data: {
        ...s,
        price: livePrice,
        change,
        changePct,
        dayHigh: parseFloat(s.day_high),
        dayLow: parseFloat(s.day_low),
        sparkline,
      },
    });
  } catch (err) {
    console.error('getStockBySymbol error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stock' });
  }
}

// GET /api/stocks/top/gainers — top 5 gainers
async function getTopGainers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT symbol, name, price, prev_close, sector
      FROM stocks
      ORDER BY ((price - prev_close) / prev_close) DESC
      LIMIT 5
    `);
    const gainers = rows.map((s) => {
      const change = parseFloat((s.price - s.prev_close).toFixed(2));
      const changePct = parseFloat(((change / s.prev_close) * 100).toFixed(2));
      return { ...s, change, changePct };
    });
    res.json({ success: true, data: gainers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch gainers' });
  }
}

// GET /api/stocks/top/losers — top 5 losers
async function getTopLosers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT symbol, name, price, prev_close, sector
      FROM stocks
      ORDER BY ((price - prev_close) / prev_close) ASC
      LIMIT 5
    `);
    const losers = rows.map((s) => {
      const change = parseFloat((s.price - s.prev_close).toFixed(2));
      const changePct = parseFloat(((change / s.prev_close) * 100).toFixed(2));
      return { ...s, change, changePct };
    });
    res.json({ success: true, data: losers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch losers' });
  }
}

// GET /api/portfolio — portfolio holdings
async function getPortfolio(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.symbol, p.quantity, p.buy_price,
             s.name, s.price AS current_price, s.sector
      FROM portfolio p
      JOIN stocks s ON p.symbol = s.symbol
    `);
    const holdings = rows.map((h) => {
      const livePrice = simulatePriceChange(parseFloat(h.current_price));
      const invested = parseFloat((h.buy_price * h.quantity).toFixed(2));
      const currentVal = parseFloat((livePrice * h.quantity).toFixed(2));
      const gainLoss = parseFloat((currentVal - invested).toFixed(2));
      const gainLossPct = parseFloat(((gainLoss / invested) * 100).toFixed(2));
      return {
        ...h,
        current_price: livePrice,
        invested,
        currentVal,
        gainLoss,
        gainLossPct,
      };
    });
    res.json({ success: true, data: holdings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio' });
  }
}

// GET /api/sectors — sector distribution
async function getSectorDistribution(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT sector, COUNT(*) AS count, AVG((price - prev_close) / prev_close * 100) AS avg_change
      FROM stocks
      GROUP BY sector
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch sectors' });
  }
}

// Helper: generate a smooth sparkline
function generateSparkline(start, end, points) {
  const data = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const noise = (Math.random() - 0.5) * (end - start) * 0.3;
    const val = start + (end - start) * t + noise;
    data.push(parseFloat(val.toFixed(2)));
  }
  data[data.length - 1] = end;
  return data;
}

module.exports = {
  getAllStocks,
  getStockBySymbol,
  getTopGainers,
  getTopLosers,
  getPortfolio,
  getSectorDistribution,
};
