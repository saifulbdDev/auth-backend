const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { JWT_SECRET } = require('../config');

// Validation middleware
const validate = (method) => {
  switch (method) {
    case 'register':
      return [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      ];
    case 'login':
      return [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
      ];
  }
};

// Register route
router.post('/register', validate('register'), authController.register);

// Login route
router.post('/login', validate('login'), authController.login);
router.post('/google/callback', validate('login'), authController.callback);

// Google login route
router.post('/google-login', authController.googleLogin);

module.exports = router;