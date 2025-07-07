document.addEventListener('DOMContentLoaded', () => {
    console.log('Plateforme de dons de sang chargée!');

    // Mettre en évidence le lien de navigation actif
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Gestion des formulaires
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ici vous pourriez ajouter la logique pour envoyer les données au serveur
            console.log('Formulaire soumis', form);

            // Simulation de succès
            alert('Opération réussie!');
        });
    });
});