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

const recalculateBalances = async (loanId) => {
    const loan = await Loan.findByPk(loanId);
    if (!loan) return;

    const installments = await Installment.findAll({
        where: { loanId },
        order: [['receipt_no', 'ASC'], ['id', 'ASC']]
    });

    const initialBalance = (loan.total_loan_amount && parseFloat(loan.total_loan_amount) > 0)
        ? parseFloat(loan.total_loan_amount)
        : parseFloat(loan.loan_amount);

    let runningBalance = initialBalance;

    for (let i = 0; i < installments.length; i++) {
        const inst = installments[i];
        runningBalance = runningBalance - parseFloat(inst.amount);
        inst.balance = runningBalance < 0 ? 0 : runningBalance;
        await inst.save();
    }

    // Update loan status if remaining balance reaches zero or is above zero
    if (runningBalance <= 0) {
        loan.status = 'closed';
    } else {
        loan.status = 'active';
    }
    await loan.save();
};

exports.updateInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, amount } = req.body;

        const installment = await Installment.findByPk(id);
        if (!installment) {
            return res.status(404).json({ message: 'Installment not found' });
        }

        if (date) {
            const loan = await Loan.findByPk(installment.loanId);
            if (new Date(date) < new Date(loan.loan_date)) {
                return res.status(400).json({ message: `Installment date cannot be before loan date (${loan.loan_date})` });
            }
            installment.date = date;
        }

        if (amount !== undefined) {
            installment.amount = parseFloat(amount);
        }

        await installment.save();

        // Recalculate all balances for this loan
        await recalculateBalances(installment.loanId);

        // Fetch the updated installment to send back
        const updatedInstallment = await Installment.findByPk(id);

        res.json({ success: true, data: updatedInstallment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const installment = await Installment.findByPk(id);
        if (!installment) {
            return res.status(404).json({ message: 'Installment not found' });
        }

        const loanId = installment.loanId;

        await installment.destroy();

        // Adjust all receipt numbers for installments that were after this one
        const subsequentInstallments = await Installment.findAll({
            where: { loanId },
            order: [['receipt_no', 'ASC'], ['id', 'ASC']]
        });

        for (let i = 0; i < subsequentInstallments.length; i++) {
            subsequentInstallments[i].receipt_no = i + 1;
            await subsequentInstallments[i].save();
        }

        // Recalculate balances
        await recalculateBalances(loanId);

        res.json({ success: true, message: 'Installment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

