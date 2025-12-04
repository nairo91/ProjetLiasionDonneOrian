// Contact form functionality for Bella Nails

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFormValidation();
    initDatePicker();
});

/**
 * Contact Form Initialization
 */
function initContactForm() {
    const form = document.getElementById('appointment-form');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmission);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

/**
 * Handle Form Submission
 */
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    if (!validateForm(form)) {
        BellaNails.showErrorMessage('Veuillez corriger les erreurs dans le formulaire.');
        return;
    }
    
    // Show loading state
    BellaNails.showLoading(submitButton);
    
    try {
        // Collect form data
        const formData = collectFormData(form);
        
        // Simulate form submission (replace with actual endpoint)
        const success = await submitAppointmentRequest(formData);
        
        if (success) {
            // Show success modal
            showSuccessModal();
            
            // Reset form
            form.reset();
            clearAllErrors(form);
            
            // Track successful submission
            trackFormSubmission(formData);
            
        } else {
            throw new Error('Échec de l\'envoi du formulaire');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        BellaNails.showErrorMessage('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.');
        
    } finally {
        BellaNails.hideLoading(submitButton);
    }
}

/**
 * Collect Form Data
 */
function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key === 'preferred-time') {
            // Handle multiple checkbox values
            if (!data[key]) data[key] = [];
            data[key].push(value);
        } else {
            data[key] = value;
        }
    }
    
    // Add timestamp
    data.timestamp = new Date().toISOString();
    data.source = 'website';
    
    return data;
}

/**
 * Submit Appointment Request
 */
async function submitAppointmentRequest(data) {
    // In a real application, this would send data to your server
    // For demo purposes, we'll simulate an API call
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate success (90% success rate for demo)
            const success = Math.random() > 0.1;
            resolve(success);
        }, 2000);
    });
    
    // Example of real API call:
    /*
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        return response.ok;
    } catch (error) {
        console.error('API Error:', error);
        return false;
    }
    */
}

/**
 * Form Validation
 */
function validateForm(form) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors(form);
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !BellaNails.validateEmail(emailField.value)) {
        showFieldError(emailField, 'Veuillez saisir une adresse email valide.');
        isValid = false;
    }
    
    // Validate phone format
    const phoneField = form.querySelector('#phone');
    if (phoneField && phoneField.value && !BellaNails.validatePhone(phoneField.value)) {
        showFieldError(phoneField, 'Veuillez saisir un numéro de téléphone valide.');
        isValid = false;
    }
    
    // Validate date (not in the past)
    const dateField = form.querySelector('#preferred-date');
    if (dateField && dateField.value) {
        const selectedDate = new Date(dateField.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError(dateField, 'Veuillez choisir une date future.');
            isValid = false;
        }
        
        // Check if date is a Sunday or Monday (closed days)
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            showFieldError(dateField, 'Nous sommes fermés les dimanche et lundi.');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Validate Individual Field
 */
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Clear previous error
    clearFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Ce champ est obligatoire.');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value && !BellaNails.validateEmail(value)) {
        showFieldError(field, 'Veuillez saisir une adresse email valide.');
        return false;
    }
    
    // Phone validation
    if (field.type === 'tel' && value && !BellaNails.validatePhone(value)) {
        showFieldError(field, 'Veuillez saisir un numéro de téléphone valide.');
        return false;
    }
    
    // Name validation (minimum 2 characters)
    if ((field.id === 'firstname' || field.id === 'lastname') && value && value.length < 2) {
        showFieldError(field, 'Veuillez saisir au moins 2 caractères.');
        return false;
    }
    
    return true;
}

/**
 * Show Field Error
 */
function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error styling
    field.classList.add('border-red-500', 'ring-red-500');
    field.classList.remove('border-gray-300');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-600 text-sm mt-1';
    errorElement.textContent = message;
    
    // Insert error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

/**
 * Clear Field Error
 */
function clearFieldError(field) {
    if (typeof field === 'object' && field.target) {
        field = field.target;
    }
    
    // Remove error styling
    field.classList.remove('border-red-500', 'ring-red-500');
    field.classList.add('border-gray-300');
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Clear All Errors
 */
function clearAllErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const errorFields = form.querySelectorAll('.border-red-500');
    errorFields.forEach(field => {
        field.classList.remove('border-red-500', 'ring-red-500');
        field.classList.add('border-gray-300');
    });
}

/**
 * Show Success Modal
 */
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const closeButton = document.getElementById('close-success-modal');
    
    if (!modal) return;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Add fade-in animation
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }, 10);
    
    // Focus management
    if (closeButton) closeButton.focus();
    
    // Close modal handlers
    function closeSuccessModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', closeSuccessModal);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeSuccessModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeSuccessModal();
        }
    });
}

/**
 * Date Picker Initialization
 */
function initDatePicker() {
    const dateField = document.getElementById('preferred-date');
    if (!dateField) return;
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateField.min = tomorrow.toISOString().split('T')[0];
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateField.max = maxDate.toISOString().split('T')[0];
    
    // Disable Sundays and Mondays
    dateField.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        const dayOfWeek = selectedDate.getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            showFieldError(this, 'Nous sommes fermés les dimanche et lundi. Veuillez choisir un autre jour.');
            this.value = '';
        }
    });
}

/**
 * Auto-complete Functionality
 */
function initAutoComplete() {
    const serviceField = document.getElementById('service');
    if (!serviceField) return;
    
    // Common services for auto-suggestion
    const services = [
        'Manucure Classique',
        'Manucure Semi-Permanente',
        'Manucure French',
        'Nail Art Simple',
        'Nail Art Complexe',
        'Extensions d\'Ongles',
        'Pédicure Classique',
        'Pédicure Spa',
        'Pédicure Médicale'
    ];
    
    // You can implement autocomplete functionality here
}

/**
 * Form Auto-save (Local Storage)
 */
function initFormAutoSave() {
    const form = document.getElementById('appointment-form');
    if (!form) return;
    
    const STORAGE_KEY = 'bella-nails-form-draft';
    
    // Load saved data
    function loadSavedData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field && field.type !== 'checkbox') {
                        field.value = data[key];
                    }
                });
            } catch (error) {
                console.error('Error loading saved form data:', error);
            }
        }
    }
    
    // Save form data
    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key !== 'preferred-time') { // Don't save checkboxes
                data[key] = value;
            }
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    
    // Clear saved data
    function clearSavedData() {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    // Load data on page load
    loadSavedData();
    
    // Save data on input
    form.addEventListener('input', BellaNails.debounce(saveFormData, 500));
    
    // Clear data on successful submission
    form.addEventListener('submit', function(e) {
        setTimeout(clearSavedData, 3000); // Clear after success
    });
}

/**
 * Track Form Submission
 */
function trackFormSubmission(data) {
    // Track with Google Analytics or similar
    if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
            'event_category': 'Contact',
            'event_label': 'Appointment Request',
            'value': 1
        });
    }
    
    console.log('Appointment request submitted:', data);
}

/**
 * Phone Number Formatting
 */
function initPhoneFormatting() {
    const phoneField = document.getElementById('phone');
    if (!phoneField) return;
    
    phoneField.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, ''); // Remove non-digits
        
        // Format French phone number
        if (value.startsWith('33')) {
            value = '+' + value;
        } else if (value.length === 10 && value.startsWith('0')) {
            value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        
        this.value = value;
    });
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    initFormAutoSave();
    initPhoneFormatting();
    initAutoComplete();
});