const jwt = require('jsonwebtoken');

module.exports = {
    generateToken: (user, role = 'user') => {
        const payload = {
            userId: user._id,
            role: user.role || role
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
    },

    verifyToken: (token) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
};