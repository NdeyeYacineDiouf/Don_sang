const Slot = require('../models/slot');
const Appointment = require('../models/Appointment');

// Lister les rendez-vous d'un utilisateur
exports.listAppointments = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send("Utilisateur non authentifié");
        }

        const appointments = await Appointment.find({ user_id: req.user.id }).populate('campaign_id');
        
        // ⭐ NETTOYER LES RENDEZ-VOUS ORPHELINS ⭐
        const validAppointments = [];
        const orphanedAppointments = [];
        
        appointments.forEach(app => {
            if (app.campaign_id) {
                validAppointments.push(app);
            } else {
                orphanedAppointments.push(app);
            }
        });
        
        // Optionnel : Supprimer automatiquement les rendez-vous orphelins
        if (orphanedAppointments.length > 0) {
            console.log(`Suppression de ${orphanedAppointments.length} rendez-vous orphelins`);
            await Appointment.deleteMany({ 
                _id: { $in: orphanedAppointments.map(app => app._id) }
            });
        }
        
        // Grouper les rendez-vous par campagne
        const groupedAppointments = {};
        validAppointments.forEach(app => {
            const campaignId = app.campaign_id._id.toString();
            if (!groupedAppointments[campaignId]) {
                groupedAppointments[campaignId] = {
                    campaign: app.campaign_id,
                    appointments: []
                };
            }
            groupedAppointments[campaignId].appointments.push(app);
        });
        
        // Convertir en tableau et trier par date
        const groupedAppointmentsList = Object.values(groupedAppointments);
        groupedAppointmentsList.forEach(group => {
            group.appointments.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
        });
        
        res.render("appointment/index", { 
            groupedAppointments: groupedAppointmentsList,
            pageTitle: "Mes Rendez-vous" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération des rendez-vous");
    }
};

// Réserver un créneau
exports.reserveSlot = async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const userId = req.user.id;

        const slot = await Slot.findById(slotId).populate('campaign');
        if (!slot) return res.status(404).send("Créneau introuvable");
        if (slot.reserved >= slot.maxPeople) return res.status(400).send("Plus de places");

        if (!slot.campaign) {
            return res.status(400).send("Ce créneau n'est pas associé à une campagne");
        }

        // Vérifier l'écart minimum de 2 mois entre les dons
        const lastAppointment = await Appointment.findOne({ 
            user_id: userId 
        }).sort({ date_time: -1 });
        
        if (lastAppointment) {
            const newAppointmentDate = new Date(slot.day.toDateString() + " " + slot.startTime);
            const lastAppointmentDate = new Date(lastAppointment.date_time);
            const diffInMs = newAppointmentDate.getTime() - lastAppointmentDate.getTime();
            const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30.44); // Approximation de 30.44 jours par mois
            
            if (diffInMonths < 2) {
                return res.status(400).send("Vous devez attendre au moins 2 mois entre deux dons de sang. Votre dernier don date du " + lastAppointmentDate.toLocaleDateString('fr-FR'));
            }
        }

        // Créer le rendez-vous
        const appointment = new Appointment({
            campaign_id: slot.campaign._id,
            center_id: "default-center",
            date_time: new Date(slot.day.toDateString() + " " + slot.startTime),
            user_id: userId,
            slot_id: slot._id
        });

        await appointment.save();

        slot.reserved += 1;
        await slot.save();

        res.redirect("/api/appointments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
};

// Annuler un rendez-vous
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment || appointment.user_id.toString() !== req.user.id) {
            return res.status(403).send("Non autorisé");
        }

        // Libérer le slot
        if (appointment.slot_id) {
            const slot = await Slot.findById(appointment.slot_id);
            if (slot) {
                slot.reserved = Math.max(0, slot.reserved - 1);
                await slot.save();
            }
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.redirect("/api/appointments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
};

// Formulaire d'édition
exports.editForm = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).send("Utilisateur non authentifié");
        }

        const appointment = await Appointment.findById(req.params.id)
            .populate("campaign_id");

        if (!appointment || appointment.user_id.toString() !== req.user.id) {
            return res.status(403).send("Non autorisé");
        }

        // On récupère TOUS les slots de la campagne
        const allSlots = await Slot.find({ campaign: appointment.campaign_id._id });

        // Filtrage côté JS : garder les slots disponibles ou le slot déjà sélectionné
        const slots = allSlots.filter(slot =>
            slot.reserved < slot.maxPeople || (appointment.slot_id && appointment.slot_id.equals(slot._id))
        );

        console.log("Campagne ID:", appointment.campaign_id._id);
        console.log("Slots disponibles (ou sélectionné) :", slots.map(s => s._id.toString()));

        res.render("appointment/edit", {
            appointment,
            slots,
            pageTitle: 'Modifier mon rendez-vous'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors du chargement du formulaire");
    }
};

// Mettre à jour le rendez-vous avec un nouveau créneau
exports.updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment || appointment.user_id.toString() !== req.user.id) {
            return res.status(403).send("Non autorisé");
        }

        const newSlotId = req.body.slot_id;
        if (appointment.slot_id.toString() === newSlotId) {
            return res.redirect("/api/appointments"); // pas de changement
        }

        const oldSlot = await Slot.findById(appointment.slot_id);
        const newSlot = await Slot.findById(newSlotId);
        if (!newSlot) return res.status(404).send("Nouveau créneau introuvable");
        if (newSlot.reserved >= newSlot.maxPeople) return res.status(400).send("Ce créneau est complet");

        // Libérer l'ancien créneau
        if (oldSlot) {
            oldSlot.reserved = Math.max(0, oldSlot.reserved - 1);
            await oldSlot.save();
        }

        // Réserver le nouveau
        newSlot.reserved += 1;
        await newSlot.save();

        // Mettre à jour le rendez-vous
        appointment.slot_id = newSlot._id;
        appointment.date_time = new Date(newSlot.day.toDateString() + " " + newSlot.startTime);
        await appointment.save();

        res.redirect("/api/appointments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la modification du rendez-vous");
    }
};
