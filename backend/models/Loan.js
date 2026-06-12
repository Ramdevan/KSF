const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    guarantor_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    loan_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    interest: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    total_loan_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    loan_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('active', 'closed'),
        defaultValue: 'active',
    },
}, {
    timestamps: true,
});

module.exports = Loan;
