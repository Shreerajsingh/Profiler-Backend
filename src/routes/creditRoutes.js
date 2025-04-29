const express = require('express');
const { getCredits, removeCredits } = require('../controllers/creditsController');

const router = express.Router();

router.post('/credits', removeCredits);
router.get('/credits', getCredits);

module.exports = router;