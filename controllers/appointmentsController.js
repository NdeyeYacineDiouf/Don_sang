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
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Récupérer tous les rendez-vous de l'utilisateur avec les détails de la campagne et du créneau
        const appointments = await Appointment.find({ user_id: userId })
            .populate('campaign_id')
            .populate('slot_id')
            .sort({ date_time: 1 }); // Trier par date
        
        res.render('appointment/index', { 
            pageTitle: 'Mes Rendez-vous',
            appointments,
            success: req.flash('success'),
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Erreur récupération rendez-vous:', error);
        req.flash('error', 'Erreur lors de la récupération de vos rendez-vous');
        res.status(500).render('appointment/index', { 
            pageTitle: 'Mes Rendez-vous',
            appointments: [],
            success: null,
            error: 'Une erreur est survenue lors de la récupération de vos rendez-vous'
        });
    }
};
