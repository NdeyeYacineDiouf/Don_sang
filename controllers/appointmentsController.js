const Appointment = require('../models/appointment');

exports.createAppointment = async (req, res) => {
    try {
        const { campaign_id, center_id, date_time } = req.body;
        const userId = req.user.id; // récupéré du token JWT

        const appointment = new Appointment({
            campaign_id,
            center_id,
            date_time,
            user_id: userId
        });

        await appointment.save();

        res.status(201).json({ message: 'Inscription réussie', appointment });
    } catch (error) {
        console.error('Erreur création rendez-vous:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
