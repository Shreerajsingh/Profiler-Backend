const express = require('express');
const { signup, signin, googleSignIn, googleSignOut } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);

router.post('/signin/google', googleSignIn);
router.post('/signout/google', googleSignOut);

module.exports = router;