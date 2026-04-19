const express = require('express');
const router = express.Router();
const {
  getAllStocks,
  getStockBySymbol,
  getTopGainers,
  getTopLosers,
  getPortfolio,
  getSectorDistribution,
} = require('../controllers/stockController');

router.get('/', getAllStocks);
router.get('/top/gainers', getTopGainers);
router.get('/top/losers', getTopLosers);
router.get('/portfolio', getPortfolio);
router.get('/sectors', getSectorDistribution);
router.get('/:symbol', getStockBySymbol);

module.exports = router;
