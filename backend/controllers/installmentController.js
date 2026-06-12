const Installment = require('../models/Installment');
const Loan = require('../models/Loan');

exports.addInstallment = async (req, res) => {
    try {
        const { loanId, date, amount } = req.body;

        if (!loanId || !date || !amount) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const loan = await Loan.findByPk(loanId);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        if (loan.status === 'closed') {
            return res.status(400).json({ message: 'Loan is already closed' });
        }

        // Check if installment date is before the loan date
        if (new Date(date) < new Date(loan.loan_date)) {
            return res.status(400).json({ message: `Installment date cannot be before loan date (${loan.loan_date})` });
        }

        // Get the most recent installment for this loan
        const lastInstallment = await Installment.findOne({
            where: { loanId },
            order: [['id', 'DESC']],
        });

        const initialBalance = (loan.total_loan_amount && parseFloat(loan.total_loan_amount) > 0) 
            ? parseFloat(loan.total_loan_amount) 
            : parseFloat(loan.loan_amount);

        let previousBalance = lastInstallment ? parseFloat(lastInstallment.balance) : initialBalance;
        let lastReceiptNo = lastInstallment ? lastInstallment.receipt_no : 0;

        if (previousBalance <= 0) {
            return res.status(400).json({ message: 'This loan is already fully settled' });
        }

        const currentAmount = parseFloat(amount);
        if (currentAmount > previousBalance) {
            return res.status(400).json({ message: `Payment amount ₹${currentAmount.toLocaleString('en-IN')} exceeds the remaining balance of ₹${previousBalance.toLocaleString('en-IN')}` });
        }

        const newBalance = previousBalance - currentAmount;
        const newReceiptNo = lastReceiptNo + 1;

        const installment = await Installment.create({
            loanId,
            date,
            receipt_no: newReceiptNo,
            amount: currentAmount,
            balance: newBalance < 0 ? 0 : newBalance,
        });

        // If balance reaches zero, mark loan as closed
        if (newBalance <= 0) {
            loan.status = 'closed';
            await loan.save();
        }

        res.status(201).json({ success: true, data: installment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLedger = async (req, res) => {
    try {
        const { loanId } = req.params;

        // Check if loan exists
        const loan = await Loan.findByPk(loanId);
        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const installments = await Installment.findAll({
            where: { loanId },
            order: [['receipt_no', 'ASC']],
        });

        // Calculate summary
        const totalLoanAmount = (loan.total_loan_amount && parseFloat(loan.total_loan_amount) > 0)
            ? parseFloat(loan.total_loan_amount)
            : parseFloat(loan.loan_amount);

        const totalPaid = installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
        const remainingBalance = installments.length > 0 ? installments[installments.length - 1].balance : totalLoanAmount;

        res.json({
            success: true,
            data: {
                loan,
                installments,
                summary: {
                    totalLoanAmount,
                    totalPaid,
                    remainingBalance,
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
