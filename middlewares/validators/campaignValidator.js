const { check, body } = require('express-validator');
const Campaign = require('../../models/Campaign');

module.exports = {
    validateCampaign: [
        check('title')
            .notEmpty().withMessage('Titre requis')
            .isLength({ min: 5 }).withMessage('Le titre doit contenir au moins 5 caractères'),

        check('description')
            .notEmpty().withMessage('Description requise')
            .isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),

        check('startDate')
            .notEmpty().withMessage('Date de début requise')
            .isDate().withMessage('Format de date invalide'),

        check('endDate')
            .notEmpty().withMessage('Date de fin requise')
            .isDate().withMessage('Format de date invalide')
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error('La date de fin doit être après la date de début');
                }
                return true;
            }),

        check('bloodBank')
            .notEmpty().withMessage('Centre de don requis')
            .isMongoId().withMessage('ID de centre invalide')
    ],

    validateTimeSlots: body('timeSlots').custom(slots => {
        if (!slots || slots.length === 0) {
            throw new Error('Au moins un créneau horaire est requis');
        }
        return true;
    })
};