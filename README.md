# StockPulse — Real-Time Investment Portfolio Dashboard

A full-stack real-time stock market dashboard with live WebSocket price feeds, JWT authentication, and a watchlist — built entirely on MySQL.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, Socket.io |
| Database | MySQL 8.0 (stocks, portfolio, users, favorites) |
| Auth | JWT (access + refresh token rotation) |
| Real-time | Socket.io WebSocket push — prices update every 3 seconds |

---

## Project Structure

```
OracleTask2/
├── backend/
│   ├── config/
│   │   └── database.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── stockController.js       # Stock price logic + sparkline
│   │   ├── authController.js        # Signup, login, refresh, logout
│   │   └── favoritesController.js   # Watchlist CRUD
│   ├── middleware/
│   │   ├── auth.js                  # JWT bearer token verification
│   │   └── validate.js              # Joi request validation
│   ├── routes/
│   │   ├── stocks.js
│   │   ├── auth.js
│   │   └── favorites.js
│   ├── server.js                    # Express + Socket.io + broadcaster
│   ├── seed.js                      # Creates all tables + seeds data
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx            # Portfolio stats + LIVE indicator
    │   │   ├── SearchBar.jsx         # Search with / keyboard shortcut
    │   │   ├── StockCard.jsx         # Card with price flash animation
    │   │   ├── StockDetail.jsx       # Detail panel + intraday sparkline
    │   │   ├── FavoritesSection.jsx  # Real-time watchlist
    │   │   ├── TopMovers.jsx         # Live gainers & losers
    │   │   ├── HoldingsTable.jsx     # Portfolio table with sparklines
    │   │   ├── PortfolioChart.jsx    # 12-month area chart (Recharts)
    │   │   ├── SectorChart.jsx       # Sector distribution pie chart
    │   │   ├── Toast.jsx             # Slide-in toast notifications
    │   │   ├── AuthPage.jsx          # Login / Signup form
    │   │   ├── ErrorBanner.jsx       # API error with retry
    │   │   └── LoadingSkeleton.jsx   # Shimmer loading states
    │   ├── context/
    │   │   ├── StockContext.jsx      # Global state, socket, toasts
    │   │   └── AuthContext.jsx       # Auth state + token management
    │   ├── services/
    │   │   ├── api.js                # Axios client + auto token refresh
    │   │   └── socket.js             # Socket.io singleton connection
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Configure environment

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stock_dashboard

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

FRONTEND_URL=http://localhost:5173
```

### 2. Install & seed the database

```bash
cd backend
npm install
node seed.js
```

`seed.js` creates four tables (`stocks`, `portfolio`, `users`, `favorites`) and seeds 15 stocks + 6 portfolio holdings.

### 3. Start the backend

```bash
npm start          # node server.js
# or
npm run dev        # nodemon (hot reload)
```

Runs on: **http://localhost:5000**

### 4. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

Runs on: **http://localhost:5173**

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns token pair |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | Bearer | Invalidate refresh token |
| GET | `/api/auth/profile` | Bearer | Get logged-in user |

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | All 15 stocks with simulated live prices |
| GET | `/api/stocks/:symbol` | Single stock + 30-point sparkline |
| GET | `/api/stocks/top/gainers` | Top 5 by % gain |
| GET | `/api/stocks/top/losers` | Top 5 by % loss |
| GET | `/api/stocks/portfolio` | Holdings with current P&L |
| GET | `/api/stocks/sectors` | Sector distribution |

### Favorites (Watchlist)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | Bearer | Get user's watchlist |
| POST | `/api/favorites` | Bearer | Add stock to watchlist |
| DELETE | `/api/favorites/:id` | Bearer | Remove from watchlist |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `stocks:update` | Server → Client | Array of all 15 stocks with live prices, pushed every **3 seconds** |

---

## Features

### Real-Time
- **Socket.io WebSocket push** — backend broadcasts price updates every 3 seconds to all connected clients
- **Price flash animations** — cards flash green (↑) or red (↓) on each price tick
- **LIVE / OFFLINE badge** in navbar reflects socket connection state with a pulsing dot
- Gainers/losers table updates live as socket prices change (derived via `useMemo`)

### Authentication
- JWT access tokens (15 min) + refresh tokens (7 days)
- Refresh token rotation — reuse detection built in
- Auto-refresh on 401 via Axios interceptor, transparent to the user
- All user data stored in MySQL `users` table

### Watchlist
- Per-user favorites stored in MySQL `favorites` table
- Optimistic UI updates — add/remove feels instant
- Live prices shown in watchlist (enriched from socket feed)
- Toast notifications on add / remove
- Loading spinner on remove button while API call is in flight

### UX & Performance
- **Keyboard shortcut** — press `/` anywhere to focus the search bar
- **Toast notifications** — slide in from bottom-right, auto-dismiss after 3s
- **Disabled states** — star button shows spinner and is disabled while toggling
- `useMemo` for filtered stocks, gainers/losers, portfolio totals
- `useCallback` on all handlers to prevent unnecessary re-renders
- Shimmer skeleton loading for all components
- Dismissible error banner with retry button

### Charts (Recharts)
- 12-month portfolio value area chart
- Sector distribution pie chart
- Per-stock 30-point intraday sparkline

---

## Database Schema

```sql
-- Stock market data
CREATE TABLE stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  prev_close DECIMAL(12,2) NOT NULL,
  day_high DECIMAL(12,2),
  day_low DECIMAL(12,2),
  volume BIGINT,
  market_cap VARCHAR(20),
  sector VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User portfolio holdings
CREATE TABLE portfolio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  buy_price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (symbol) REFERENCES stocks(symbol)
);

-- Registered users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,       -- bcrypt hash
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Per-user watchlist
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_symbol (user_id, symbol)
);
```

---

## Stocks Included

| Symbol | Company | Sector |
|--------|---------|--------|
| AAPL | Apple Inc. | Technology |
| MSFT | Microsoft Corp. | Technology |
| GOOGL | Alphabet Inc. | Technology |
| META | Meta Platforms | Technology |
| NVDA | NVIDIA Corp. | Semiconductors |
| AMD | Advanced Micro Devices | Semiconductors |
| TSLA | Tesla Inc. | Automotive |
| AMZN | Amazon.com Inc. | E-Commerce |
| JPM | JPMorgan Chase | Finance |
| BAC | Bank of America | Finance |
| XOM | Exxon Mobil | Energy |
| WMT | Walmart Inc. | Retail |
| NFLX | Netflix Inc. | Entertainment |
| DIS | The Walt Disney Co. | Entertainment |
| ITC | ITC Ltd. | Consumer Goods |
