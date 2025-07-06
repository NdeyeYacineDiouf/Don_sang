// slotsController.js
const Slot = require('../models/slot');
const Appointment = require('../models/appointment');

exports.reserveSlot = async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const userId = req.user.id; // récupéré du token JWT
        
        // Récupérer le créneau
        const slot = await Slot.findById(slotId);
        
        if (!slot) {
            req.flash('error', 'Créneau non trouvé');
            return res.redirect('/api/appointments');
        }
        
        // Vérifier s'il reste des places
        if (slot.reserved >= slot.maxPeople) {
            req.flash('error', 'Ce créneau est complet');
            return res.redirect(`/api/campaigns/${slot.campaign}`);
        }
        
        // Vérifier si l'utilisateur a déjà réservé ce créneau
        const existingAppointment = await Appointment.findOne({
            user_id: userId,
            slot_id: slotId
        });
        
        if (existingAppointment) {
            req.flash('error', 'Vous avez déjà réservé ce créneau');
            return res.redirect('/api/appointments');
        }
        
        // Créer le rendez-vous
        const appointment = new Appointment({
            campaign_id: slot.campaign,
            slot_id: slotId,
            user_id: userId,
            date_time: slot.day
        });
        
        await appointment.save();
        
        // Incrémenter le nombre de réservations pour ce créneau
        slot.reserved += 1;
        await slot.save();
        
        // Ajouter un message de succès
        req.flash('success', 'Votre réservation a été confirmée avec succès');
        
        // Rediriger vers la page des rendez-vous
        res.redirect('/api/appointments');
        
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        req.flash('error', 'Une erreur est survenue lors de la réservation');
        res.redirect('/api/campaigns');
    }
};