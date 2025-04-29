const Appointment = require('../models/Appointment');
const Campaign = require('../models/Campaign');
const Donor = require('../models/Donor');
const emailService = require('../services/emailService');

module.exports = {
    bookAppointment: async (req, res) => {
        try {
            const { campaignId, slotId } = req.body;
            const donor = await Donor.findOne({ user: req.user._id }).populate('user');
            const campaign = await Campaign.findById(campaignId).populate('bloodBank');
            const slot = await Slot.findById(slotId);

            if (!donor || !campaign || !slot) {
                throw new Error('Données invalides');
            }

            const appointment = new Appointment({
                campaign: campaignId,
                slot: slotId,
                donor: donor._id,
                status: 'scheduled',
                date: slot.date
            });

            await appointment.save();

            // Mise à jour du créneau
            await Slot.findByIdAndUpdate(slotId, { $inc: { availableSlots: -1 } });

            // Envoi de confirmation amélioré
            await emailService.sendConfirmationEmail(donor.user.email, {
                date: slot.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                time: `${slot.startTime} - ${slot.endTime}`,
                location: campaign.bloodBank.location.address,
                center: campaign.bloodBank.name,
                id: appointment._id,
                donorName: `${donor.firstName} ${donor.lastName}`
            });

            req.flash('success', 'Rendez-vous confirmé avec succès');
            res.redirect('/appointments/confirmation');
        } catch (error) {
            console.error('Erreur création rendez-vous:', error);
            req.flash('error', error.message || 'Erreur lors de la prise de rendez-vous');
            res.redirect(`/campaigns/${req.body.campaignId}`);
        }
    },

    cancelAppointment: async (req, res) => {
        try {
            const appointment = await Appointment.findById(req.params.id)
                .populate('slot donor')
                .populate({
                    path: 'campaign',
                    populate: { path: 'bloodBank' }
                });

            if (!appointment) {
                throw new Error('Rendez-vous non trouvé');
            }

            // Libérer le créneau
            await Slot.findByIdAndUpdate(appointment.slot._id, { $inc: { availableSlots: 1 } });

            // Mettre à jour le statut
            await Appointment.findByIdAndUpdate(req.params.id, {
                status: 'cancelled',
                cancellationReason: req.body.reason
            });

            // Email d'annulation détaillé
            await emailService.sendCancellationEmail(
                req.user.email,
                {
                    date: appointment.slot.date.toLocaleDateString('fr-FR'),
                    time: `${appointment.slot.startTime} - ${appointment.slot.endTime}`,
                    location: appointment.campaign.bloodBank.location.address,
                    reason: req.body.reason,
                    donorName: `${appointment.donor.firstName} ${appointment.donor.lastName}`
                }
            );

            req.flash('success', 'Rendez-vous annulé avec succès');
            res.redirect('/appointments');
        } catch (error) {
            console.error('Erreur annulation:', error);
            req.flash('error', error.message || 'Erreur lors de l\'annulation');
            res.status(500).render('error');
        }
    },

    listUserAppointments: async (req, res) => {
        try {
            const donor = await Donor.findOne({ user: req.user._id });
            if (!donor) {
                throw new Error('Profil donneur non trouvé');
            }

            const appointments = await Appointment.find({ donor: donor._id })
                .populate({
                    path: 'campaign',
                    populate: { path: 'bloodBank' }
                })
                .populate('slot')
                .sort('-slot.date');

            res.render('appointment/index', {
                appointments,
                currentDate: new Date(),
                pageTitle: 'Mes Rendez-vous'
            });
        } catch (error) {
            console.error('Erreur liste rendez-vous:', error);
            req.flash('error', 'Erreur lors du chargement des rendez-vous');
            res.status(500).render('error');
        }
    },

    showConfirmation: (req, res) => {
        res.render('appointment/confirmation', {
            pageTitle: 'Confirmation de rendez-vous'
        });
    },

    showCancelForm: async (req, res) => {
        const appointment = await Appointment.findById(req.params.id);
        res.render('appointment/cancel', { appointment });
    },
};