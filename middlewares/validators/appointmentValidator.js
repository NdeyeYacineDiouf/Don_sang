const { check } = require('express-validator');

module.exports = {
    validateAppointment: [
        check('campaignId')
            .notEmpty().withMessage('Campagne requise')
            .isMongoId().withMessage('ID de campagne invalide'),

        check('slotId')
            .notEmpty().withMessage('Créneau requis')
            .isMongoId().withMessage('ID de créneau invalide'),

        check('donorId')
            .notEmpty().withMessage('Donneur requis')
            .isMongoId().withMessage('ID de donneur invalide')
    ],

    validateCancellation: [
        check('reason')
            .notEmpty().withMessage('Raison requise')
            .isLength({ min: 10 }).withMessage('La raison doit contenir au moins 10 caractères')
    ]
};