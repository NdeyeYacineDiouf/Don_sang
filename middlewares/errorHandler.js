// middlewares/errorHandler.js
module.exports = {
    // Middleware 404
    notFound: (req, res, next) => {  // Ajout du paramètre next
        res.status(404).render('error', {
            message: 'Page non trouvée',
            pageTitle: 'Page non trouvée'
        });
    },

    // Middleware d'erreur serveur
    serverError: (err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error', {
            pageTitle: 'Erreur',
            message: 'Erreur interne du serveur',
            user: req.user || null // Sécurité supplémentaire
        });
    },

    // Middleware de validation
    validationError: (err, req, res, next) => {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(err.errors).map(e => e.message)
            });
        }
        next(err);  // Passe à l'erreur suivante si ce n'est pas une ValidationError
    }
};