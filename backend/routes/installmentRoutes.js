const express = require('express');
const router = express.Router();
const { addInstallment, getLedger } = require('../controllers/installmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addInstallment);
router.get('/:loanId', getLedger);

module.exports = router;
