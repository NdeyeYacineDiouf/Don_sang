module.exports = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatTime: (time) => {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    isFutureDate: (date) => {
        return new Date(date) > new Date();
    }
};