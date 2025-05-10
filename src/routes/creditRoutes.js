const express = require('express');
const { getCredits, removeCredits, addCredits } = require('../controllers/creditsController');
const { authenticate } = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/remove/', removeCredits);
router.post('/add/',  addCredits);
router.get('/:id', getCredits);

module.exports = router;