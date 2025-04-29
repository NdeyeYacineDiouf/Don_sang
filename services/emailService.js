const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
    },
});

module.exports = {
    sendConfirmationEmail: async (to, appointmentDetails) => {
        try {
            await transporter.sendMail({
                from: `"Plateforme Don de Sang" <${process.env.EMAIL_SERVICE_USER}>`,
                to,
                subject: "Confirmation de rendez-vous",
                headers: {
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high'
                },
                html: `
                    <h1>Merci pour votre inscription !</h1>
                    <p>Votre rendez-vous est confirmé :</p>
                    <ul>
                        <li>Date: ${appointmentDetails.date}</li>
                        <li>Lieu: ${appointmentDetails.location}</li>
                        <li>Centre: ${appointmentDetails.center || 'Non spécifié'}</li>
                    </ul>
                    <p><strong>Important :</strong> Apportez une pièce d'identité et votre carte de donneur si vous en avez une.</p>
                    <p><a href="${process.env.APP_URL}/appointments" style="color: #d32f2f; font-weight: bold;">Voir mes rendez-vous</a></p>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                        Si vous ne pouvez pas venir, merci d'annuler votre rendez-vous <a href="${process.env.APP_URL}/appointments/${appointmentDetails.id}/cancel" style="color: #d32f2f;">ici</a>.
                    </p>
                `
            });
            console.log(`Email de confirmation envoyé à ${to}`);
        } catch (error) {
            console.error("Erreur d'envoi d'email :", error);
            throw new Error("Échec de l'envoi de l'email de confirmation");
        }
    },

    sendCancellationEmail: async (to, details) => {
        await transporter.sendMail({
            from: `"Annulation - Don de Sang" <${process.env.EMAIL_SERVICE_USER}>`,
            to,
            subject: `Annulation de votre rendez-vous du ${details.date}`,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            },
            html: `
                <h1>Annulation confirmée</h1>
                <p>Bonjour ${details.donorName},</p>
                
                <p>Votre rendez-vous a bien été annulé :</p>
                <ul>
                    <li>Date: ${details.date}</li>
                    <li>Heure: ${details.time}</li>
                    <li>Lieu: ${details.location}</li>
                    ${details.reason ? `<li>Raison: ${details.reason}</li>` : ''}
                </ul>
                
                <p>Nous serions ravis de vous accueillir à nouveau :</p>
                <a href="${process.env.APP_URL}/campaigns" 
                    style="background-color: #d32f2f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
                    Prendre un nouveau rendez-vous
                </a>
                
                <p style="margin-top: 20px;">L'équipe de Don de Sang</p>
            `
        });
    },

    sendReminderEmail: async (to, appointmentDetails) => {
        try {
            await transporter.sendMail({
                from: `"Rappel - Don de Sang" <${process.env.EMAIL_SERVICE_USER}>`,
                to,
                subject: `Rappel: Rendez-vous demain à ${appointmentDetails.time}`,
                headers: {
                    'X-Priority': '1',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'high'
                },
                html: `
                    <h1>Rappel de votre rendez-vous</h1>
                    <p>Vous avez un don de sang prévu :</p>
                    <ul>
                        <li>Date: ${appointmentDetails.date}</li>
                        <li>Heure: ${appointmentDetails.time}</li>
                        <li>Lieu: ${appointmentDetails.location}</li>
                    </ul>
                    <p><strong>Conseils :</strong></p>
                    <ul>
                        <li>Bien vous hydrater avant le don</li>
                        <li>Éviter les activités physiques intenses après le don</li>
                        <li>Apporter une pièce d'identité</li>
                    </ul>
                    <p><a href="${process.env.APP_URL}/appointments/${appointmentDetails.id}/cancel" style="color: #d32f2f;">Annuler le rendez-vous</a></p>
                `
            });
            console.log(`Email de rappel envoyé à ${to}`);
        } catch (error) {
            console.error("Erreur d'envoi de rappel :", error);
        }
    }
};