// i18n.js
const i18n = require('i18next');
const { initReactI18next } = require('react-i18next');

// Translation resources
const resources = {
    en: {
        translation: {
            "LogIn": "Log In",
            "Email": "Email",
            "Password": "Password",
            "ForgotPassword": "Forgot Password?",
            "RegisterPrompt": "Don't have an account? Register",
            "LogInButton": "Log In"
        }
    },
    hi: {
        translation: {
            "LogIn": "लॉग इन",
            "Email": "ईमेल",
            "Password": "पासवर्ड",
            "ForgotPassword": "पासवर्ड भूल गए?",
            "RegisterPrompt": "खाता नहीं है? पंजीकरण करें",
            "LogInButton": "लॉग इन"
        }
    },
    // Add more languages here
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

module.exports = i18n;
