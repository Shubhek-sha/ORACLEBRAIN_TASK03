const router = require('express').Router();
const Joi = require('joi');
const { addFavorite, getFavorites, removeFavorite } = require('../controllers/favoritesController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const addSchema = Joi.object({
  symbol: Joi.string().min(1).max(10).required(),
  name:   Joi.string().min(1).max(100).required(),
});

// All favorites routes require authentication
router.use(authenticate);
router.post('/',     validate(addSchema), addFavorite);
router.get('/',      getFavorites);
router.delete('/:id', removeFavorite);

module.exports = router;
