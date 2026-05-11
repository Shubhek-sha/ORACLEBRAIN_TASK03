const router = require('express').Router();
const Joi = require('joi');
const { signup, login, refresh, logout, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const signupSchema = Joi.object({
  name:     Joi.string().min(2).max(50).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/signup',  validate(signupSchema), signup);
router.post('/login',   validate(loginSchema),  login);
router.post('/refresh', refresh);
router.post('/logout',  authenticate, logout);
router.get('/profile',  authenticate, getProfile);

module.exports = router;
