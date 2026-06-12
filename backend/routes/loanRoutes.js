const express = require('express');
const router = express.Router();
const { createLoan, listLoans, getLoanDetails } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createLoan);
router.get('/', listLoans);
router.get('/:id', getLoanDetails);

module.exports = router;
