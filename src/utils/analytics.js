// Google Analytics 4 Initialization
// This module initializes GA4 using environment variables

const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

/**
 * Initialize Google Analytics 4
 * Only initializes if the measurement ID is available
 */
export const initializeGA4 = () => {
    if (!GA4_MEASUREMENT_ID) {
        console.warn('GA4 Measurement ID not found in environment variables');
        return;
    }

    // Create and append gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID);
};

/**
 * Track custom events
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 */
export const trackEvent = (eventName, eventParams = {}) => {
    if (window.gtag) {
        window.gtag('event', eventName, eventParams);
    }
};
