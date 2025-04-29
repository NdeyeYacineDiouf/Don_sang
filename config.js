// config.js
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'L1m@D0n$@nG_2025!',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/donsang',
    SESSION_SECRET: process.env.SESSION_SECRET || 'S3ss10n$3cr3t_D0nS@ng',
    EMAIL_SERVICE_USER: process.env.EMAIL_SERVICE_USER,
    EMAIL_SERVICE_PASS: process.env.EMAIL_SERVICE_PASS,
    APP_URL: process.env.APP_URL || 'http://localhost:3000'
};