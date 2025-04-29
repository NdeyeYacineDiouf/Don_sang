const Appointment = require('../models/Appointment');
const emailService = require('../services/emailService');

module.exports = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
        date: {
            $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
            $lte: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: 'confirmed'
    }).populate('user campaign');

    for (const appointment of appointments) {
        await emailService.sendReminderEmail(appointment.user.email, {
            date: appointment.date.toLocaleDateString('fr-FR'),
            time: appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            location: appointment.campaign.location,
            id: appointment._id
        });
    }
};