const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Loan = require('./Loan');

const Installment = sequelize.define('Installment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    loanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Loan,
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    receipt_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    timestamps: true,
});

Loan.hasMany(Installment, { foreignKey: 'loanId', as: 'installments' });
Installment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

module.exports = Installment;
