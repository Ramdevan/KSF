const express = require('express');
const router = express.Router();
const { addInstallment, getLedger, updateInstallment, deleteInstallment } = require('../controllers/installmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addInstallment);
router.get('/:loanId', getLedger);
router.put('/:id', updateInstallment);
router.delete('/:id', deleteInstallment);

module.exports = router;
