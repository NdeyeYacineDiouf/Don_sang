class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });
    }

    validate() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            field.classList.remove('error');

            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }

            // Email validation
            if (field.type === 'email' && !this.validateEmail(field.value)) {
                field.classList.add('error');
                isValid = false;
            }

            // Password strength
            if (field.name === 'password' && field.value.length < 8) {
                field.classList.add('error');
                isValid = false;
            }
        });

        if (!isValid) {
            this.showError('Veuillez remplir tous les champs obligatoires');
        }

        return isValid;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showError(message) {
        let errorDiv = this.form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            this.form.prepend(errorDiv);
        }
        errorDiv.textContent = message;
    }
}

// Initialize for all forms
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
        if (form.id) {
            new FormValidator(form.id);
        }
    });
});