const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// For simplicity, we use a single admin account from env or default
const ADMIN_USERNAME = 'deva26';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('deva5726', 10); // Default password: admin123

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        const token = jwt.sign({ username: ADMIN_USERNAME }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({
            success: true,
            token,
            admin: { username: ADMIN_USERNAME }
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};
