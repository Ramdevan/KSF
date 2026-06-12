const Investment = require('../models/Investment');

exports.createInvestment = async (req, res) => {
    try {
        const { date, name, amount } = req.body;

        if (!date || !name || !amount) {
            return res.status(400).json({ message: 'Please provide date, name and amount' });
        }

        const newInvestment = await Investment.create({
            date,
            name,
            amount: parseFloat(amount),
        });

        res.status(201).json({ success: true, data: newInvestment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.listInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll({
            order: [['date', 'DESC'], ['id', 'DESC']],
        });
        res.json({ success: true, data: investments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteInvestment = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await Investment.findByPk(id);

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        await investment.destroy();
        res.json({ success: true, message: 'Investment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
