const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize, connectDB } = require('./config/db');

// Import routes
const loanRoutes = require('./routes/loanRoutes');
const installmentRoutes = require('./routes/installmentRoutes');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const investmentRoutes = require('./routes/investmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/loans', loanRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/investments', investmentRoutes);

// Database Sync & Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Sync models to database
        // Use { force: false } in production to avoid data loss, alter: true to update schema
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
