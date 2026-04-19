const mysql = require("mysql2/promise");
require("dotenv").config();

const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.3,
    prev_close: 186.4,
    day_high: 191.2,
    day_low: 185.1,
    volume: 58320000,
    market_cap: "2.95T",
    sector: "Technology",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 177.8,
    prev_close: 182.5,
    day_high: 183.4,
    day_low: 174.6,
    volume: 112400000,
    market_cap: "565B",
    sector: "Automotive",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 165.2,
    prev_close: 163.1,
    day_high: 166.9,
    day_low: 162.3,
    volume: 23100000,
    market_cap: "2.03T",
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 415.5,
    prev_close: 409.7,
    day_high: 417.3,
    day_low: 408.8,
    volume: 19800000,
    market_cap: "3.08T",
    sector: "Technology",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 192.7,
    prev_close: 195.4,
    day_high: 196.2,
    day_low: 190.1,
    volume: 37500000,
    market_cap: "2.01T",
    sector: "E-Commerce",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 524.1,
    prev_close: 515.6,
    day_high: 527.8,
    day_low: 514.2,
    volume: 14200000,
    market_cap: "1.33T",
    sector: "Technology",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.4,
    prev_close: 850.2,
    day_high: 882.1,
    day_low: 848.3,
    volume: 42100000,
    market_cap: "2.15T",
    sector: "Semiconductors",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 198.6,
    prev_close: 201.3,
    day_high: 202.5,
    day_low: 197.2,
    volume: 9800000,
    market_cap: "575B",
    sector: "Finance",
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    price: 103.4,
    prev_close: 104.8,
    day_high: 105.6,
    day_low: 102.1,
    volume: 16700000,
    market_cap: "414B",
    sector: "Energy",
  },
  {
    symbol: "ITC",
    name: "ITC Ltd.",
    price: 420.3,
    prev_close: 425.5,
    day_high: 428.0,
    day_low: 418.1,
    volume: 7400000,
    market_cap: "524B",
    sector: "Consumer Goods",
  },
  {
    symbol: "WMT",
    name: "Walmart Inc.",
    price: 67.5,
    prev_close: 65.9,
    day_high: 68.3,
    day_low: 65.4,
    volume: 22100000,
    market_cap: "545B",
    sector: "Retail",
  },
  {
    symbol: "BAC",
    name: "Bank of America Corp.",
    price: 38.2,
    prev_close: 39.1,
    day_high: 39.5,
    day_low: 37.8,
    volume: 48300000,
    market_cap: "299B",
    sector: "Finance",
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 628.9,
    prev_close: 614.3,
    day_high: 633.1,
    day_low: 612.5,
    volume: 6200000,
    market_cap: "274B",
    sector: "Entertainment",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    price: 165.7,
    prev_close: 158.4,
    day_high: 167.2,
    day_low: 157.9,
    volume: 58900000,
    market_cap: "268B",
    sector: "Semiconductors",
  },
  {
    symbol: "DIS",
    name: "The Walt Disney Co.",
    price: 111.2,
    prev_close: 113.8,
    day_high: 114.3,
    day_low: 110.1,
    volume: 14500000,
    market_cap: "201B",
    sector: "Entertainment",
  },
];

const portfolio = [
  { symbol: "AAPL", quantity: 50, buy_price: 170.5 },
  { symbol: "GOOGL", quantity: 30, buy_price: 155.0 },
  { symbol: "NVDA", quantity: 10, buy_price: 680.0 },
  { symbol: "MSFT", quantity: 25, buy_price: 390.0 },
  { symbol: "AMZN", quantity: 20, buy_price: 185.0 },
  { symbol: "TSLA", quantity: 15, buy_price: 200.0 },
];

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log("🔧 Setting up database...");

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await conn.query(`USE \`${process.env.DB_NAME}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS stocks (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      symbol      VARCHAR(10) UNIQUE NOT NULL,
      name        VARCHAR(100) NOT NULL,
      price       DECIMAL(12,2) NOT NULL,
      prev_close  DECIMAL(12,2) NOT NULL,
      day_high    DECIMAL(12,2),
      day_low     DECIMAL(12,2),
      volume      BIGINT,
      market_cap  VARCHAR(20),
      sector      VARCHAR(50),
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      symbol     VARCHAR(10) NOT NULL,
      quantity   INT NOT NULL,
      buy_price  DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (symbol) REFERENCES stocks(symbol)
    )
  `);

  // Clear and re-seed
  await conn.query("DELETE FROM portfolio");
  await conn.query("DELETE FROM stocks");
  await conn.query("ALTER TABLE portfolio AUTO_INCREMENT = 1");
  await conn.query("ALTER TABLE stocks AUTO_INCREMENT = 1");

  for (const s of stocks) {
    await conn.query(
      `INSERT INTO stocks (symbol, name, price, prev_close, day_high, day_low, volume, market_cap, sector)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.symbol,
        s.name,
        s.price,
        s.prev_close,
        s.day_high,
        s.day_low,
        s.volume,
        s.market_cap,
        s.sector,
      ],
    );
  }
  console.log(` Seeded ${stocks.length} stocks`);

  for (const p of portfolio) {
    await conn.query(
      `INSERT INTO portfolio (symbol, quantity, buy_price) VALUES (?, ?, ?)`,
      [p.symbol, p.quantity, p.buy_price],
    );
  }
  console.log(`Seeded ${portfolio.length} portfolio holdings`);

  await conn.end();
  console.log("Database ready!");
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
