const express = require('express');
const router = express.Router();
const freemiumController = require('../controllers/freemiumController');
const { authenticate } = require('../middlewares/auth-middleware');

router.post('/create', freemiumController.createFreemiumAccount);
router.get('/:userId', authenticate, freemiumController.getFreemiumAccount);
router.post('/remove-credits', authenticate, freemiumController.removeCredits);
router.post('/add-credits', authenticate, freemiumController.addCredits);
router.delete('/:userId', freemiumController.deleteFreemiumAccount);

module.exports = router;