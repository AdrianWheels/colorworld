// Google Search Console Verification
// This module adds the verification meta tag dynamically

const GOOGLE_SITE_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

/**
 * Add Google Search Console verification meta tag
 */
export const addSearchConsoleVerification = () => {
    if (!GOOGLE_SITE_VERIFICATION) {
        console.warn('Google Site Verification token not found in environment variables');
        return;
    }

    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = GOOGLE_SITE_VERIFICATION;
    document.head.appendChild(meta);
};
