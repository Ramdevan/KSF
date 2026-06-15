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

exports.updateLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findByPk(id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const {
            customer_name,
            address,
            guarantor_name,
            business_name,
            loan_amount,
            interest,
            total_loan_amount,
            loan_date,
            installment_type,
            status
        } = req.body;

        const parsedPrincipal = loan_amount !== undefined ? parseFloat(loan_amount) : parseFloat(loan.loan_amount);
        const parsedInterest = interest !== undefined ? parseFloat(interest) : parseFloat(loan.interest);
        const computedTotal = total_loan_amount !== undefined ? parseFloat(total_loan_amount) : (parsedPrincipal + parsedInterest);

        await loan.update({
            customer_name: customer_name !== undefined ? customer_name : loan.customer_name,
            address: address !== undefined ? address : loan.address,
            guarantor_name: guarantor_name !== undefined ? guarantor_name : loan.guarantor_name,
            business_name: business_name !== undefined ? business_name : loan.business_name,
            loan_amount: parsedPrincipal,
            interest: parsedInterest,
            total_loan_amount: computedTotal,
            loan_date: loan_date !== undefined ? loan_date : loan.loan_date,
            installment_type: installment_type !== undefined ? installment_type : loan.installment_type,
            status: status !== undefined ? status : loan.status,
        });

        res.json({ success: true, data: loan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
