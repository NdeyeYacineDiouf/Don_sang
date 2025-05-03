const Slot = require('../models/slot');
const Appointment = require('../models/appointment');

// Lister les rendez-vous d’un utilisateur
// Lister les rendez-vous d’un utilisateur
exports.listAppointments = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send("Utilisateur non authentifié");
        }

        const appointments = await Appointment.find({ user_id: req.session.userId }).populate('campaign_id');
        res.render("appointment/index", { appointments, pageTitle: "Mes Rendez-vous" });
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

        const slot = await Slot.findById(slotId).populate('campaign'); // Utilisation de 'campaign' au lieu de 'campaign_id'
        if (!slot) return res.status(404).send("Créneau introuvable");
        if (slot.reserved >= slot.maxPeople) return res.status(400).send("Plus de places");

        if (!slot.campaign) {
            return res.status(400).send("Ce créneau n'est pas associé à une campagne");
        }

        // Créer le rendez-vous
        const appointment = new Appointment({
            campaign_id: slot.campaign._id,  // Utilisation de l'ID de la campagne
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
        res.redirect("/appointments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
};

// Formulaire d’édition
exports.editForm = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate("campaign_id");
        if (!appointment || appointment.user_id.toString() !== req.user.id) {
            return res.status(403).send("Non autorisé");
        }

        // Utiliser l'agrégation pour récupérer les créneaux disponibles
        const slots = await Slot.aggregate([
            {
                $match: {
                    campaign_id: appointment.campaign_id._id
                }
            },
            {
                $match: {
                    $expr: { $lt: ["$reserved", "$maxPeople"] }
                }
            }
        ]);

        console.log("Campagne ID:", appointment.campaign_id._id);
        console.log("Slots disponibles:", slots); // Ajoute ça pour le debug
        console.log("Créneau du rendez-vous:", appointment.slot_id); // Ajoute ça pour le debug
        console.log("Créneau du rendez-vous:", appointment.date_time); // Ajoute ça pour le debug
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
            return res.redirect("/appointments"); // pas de changement
        }

        const oldSlot = await Slot.findById(appointment.slot_id);
        const newSlot = await Slot.findById(newSlotId);
        if (!newSlot) return res.status(404).send("Nouveau créneau introuvable");
        if (newSlot.reserved >= newSlot.maxPeople) return res.status(400).send("Ce créneau est complet");

        // Libérer l’ancien créneau
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

        res.redirect("/appointments");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la modification du rendez-vous");
    }
};
