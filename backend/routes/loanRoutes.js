const express = require('express');
const router = express.Router();
const { createLoan, listLoans, getLoanDetails, updateLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createLoan);
router.get('/', listLoans);
router.get('/:id', getLoanDetails);
router.put('/:id', updateLoan);

module.exports = router;
