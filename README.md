# StockPulse — Investment Portfolio Dashboard

A full-stack real-time stock market dashboard built with:
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **Database**: MySQL

---

## Project Structure

```
OracleTask2/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   └── stockController.js   # All API logic
│   ├── routes/
│   │   └── stocks.js            # Express routes
│   ├── server.js                # Entry point
│   ├── seed.js                  # DB setup + seed data
│   ├── .env                     # Environment variables
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Top nav with dark mode toggle
    │   │   ├── MetricCards.jsx   # Portfolio summary cards
    │   │   ├── SearchBar.jsx     # Live search/filter
    │   │   ├── StockCard.jsx     # Individual stock card
    │   │   ├── StockDetail.jsx   # Detail panel with sparkline
    │   │   ├── TopMovers.jsx     # Gainers & losers
    │   │   ├── HoldingsTable.jsx # Sortable portfolio table
    │   │   ├── PortfolioChart.jsx# 6-month area chart
    │   │   ├── SectorChart.jsx   # Donut sector distribution
    │   │   ├── ErrorBanner.jsx   # API error display
    │   │   └── LoadingSkeleton.jsx # Shimmer skeletons
    │   ├── context/
    │   │   └── StockContext.jsx  # Global state + auto-refresh
    │   ├── services/
    │   │   └── api.js            # Axios API client
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Configure MySQL credentials

Edit `backend/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=stock_dashboard
```

### 2. Install Backend dependencies & seed DB

```bash
cd backend
npm install
npm run seed       # Creates DB, tables, and seeds 15 stocks + portfolio
```

### 3. Start Backend

```bash
npm run dev        # uses nodemon (hot reload)
# OR
npm start          # production
```

Backend runs on: http://localhost:5000

### 4. Install Frontend dependencies

```bash
cd ../frontend
npm install
```

### 5. Start Frontend

```bash
npm run dev
```

Frontend runs on: http://localhost:5173

---

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/stocks`             | All stocks (live prices) |
| GET    | `/api/stocks/:symbol`     | Single stock + sparkline |
| GET    | `/api/stocks/top/gainers` | Top 5 gainers            |
| GET    | `/api/stocks/top/losers`  | Top 5 losers             |
| GET    | `/api/stocks/portfolio`   | Holdings with P&L        |
| GET    | `/api/stocks/sectors`     | Sector distribution      |
| GET    | `/api/health`             | Health check             |

---

## Features

| Feature | Details |
|---------|---------|
| 15 stocks | AAPL, TSLA, GOOGL, MSFT, AMZN, META, NVDA, JPM, XOM, ITC, WMT, BAC, NFLX, AMD, DIS |
| Auto-refresh | Every 15 seconds with simulated price fluctuations |
| Search | Filter by symbol, name, or sector |
| Dark mode | Persisted in localStorage |
| Watchlist | Star any stock, saved to localStorage |
| Sortable table | Click any column header to sort holdings |
| Charts | Portfolio area chart + sector donut + intraday sparklines |
| Loading states | Shimmer skeletons for all components |
| Error handling | Banner with retry button |
| Price flash | Green/red flash on price tick update |

---

## Color Logic

- **Green** (`#10b981`) = Gain / Positive change
- **Red** (`#ef4444`) = Loss / Negative change
- **Blue** (`#3b82f6`) = Brand / Neutral accent
