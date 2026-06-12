const express = require('express');
const router = express.Router();
const { createInvestment, listInvestments, deleteInvestment } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createInvestment);
router.get('/', listInvestments);
router.delete('/:id', deleteInvestment);

module.exports = router;
