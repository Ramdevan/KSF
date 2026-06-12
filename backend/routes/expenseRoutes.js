const express = require('express');
const router = express.Router();
const { createExpense, listExpenses, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createExpense);
router.get('/', listExpenses);
router.delete('/:id', deleteExpense);

module.exports = router;
