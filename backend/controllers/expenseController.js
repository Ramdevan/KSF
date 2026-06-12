const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
    try {
        const { date, expense_name, amount } = req.body;

        if (!date || !expense_name || !amount) {
            return res.status(400).json({ message: 'Please provide date, expense name and amount' });
        }

        const newExpense = await Expense.create({
            date,
            expense_name,
            amount: parseFloat(amount),
        });

        res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.listExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            order: [['date', 'DESC'], ['id', 'DESC']],
        });
        res.json({ success: true, data: expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByPk(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await expense.destroy();
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
