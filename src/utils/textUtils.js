/**
 * Formats a raw filename or string into a human-readable title.
 * Examples: 
 * "GatoTaza" -> "Gato Taza"
 * "perrito_dormilon" -> "Perrito Dormilon"
 * "picnic-invierno" -> "Picnic Invierno"
 * 
 * @param {string} text - The raw text to format
 * @returns {string} - The formatted text
 */
export const formatImageTitle = (text) => {
    if (!text) return '';

    // 1. Remove file extensions if present
    let formatted = text.replace(/\.[^/.]+$/, "");

    // 2. Replace underscores and hyphens with spaces
    formatted = formatted.replace(/[_-]/g, ' ');

    // 3. Insert space before capital letters (CamelCase -> Camel Case)
    // But strictly avoided inside acronyms or if already spaced
    formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

    // 4. Capitalize first letter of each word
    formatted = formatted.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return formatted.trim();
};
