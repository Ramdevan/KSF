const Loan = require('../models/Loan');
const Installment = require('../models/Installment');

exports.createLoan = async (req, res) => {
    try {
        const { customer_name, address, guarantor_name, business_name, loan_amount, loan_date, interest, total_loan_amount, installment_type } = req.body;

        if (!customer_name || !loan_amount || !loan_date) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const parsedPrincipal = parseFloat(loan_amount);
        const parsedInterest = parseFloat(interest || 0);
        const computedTotal = total_loan_amount ? parseFloat(total_loan_amount) : (parsedPrincipal + parsedInterest);

        const newLoan = await Loan.create({
            customer_name,
            address,
            guarantor_name,
            business_name,
            loan_amount: parsedPrincipal,
            interest: parsedInterest,
            total_loan_amount: computedTotal,
            loan_date,
            installment_type: installment_type || 'daily',
        });

        res.status(201).json({ success: true, data: newLoan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.listLoans = async (req, res) => {
    try {
        const loans = await Loan.findAll({
            include: [{ model: Installment, as: 'installments' }],
            order: [['loan_date', 'DESC'], ['id', 'DESC']],
        });
        res.json({ success: true, data: loans });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getLoanDetails = async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.id, {
            include: [{ model: Installment, as: 'installments' }],
        });

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        res.json({ success: true, data: loan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
