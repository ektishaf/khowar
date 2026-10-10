/**
 * Formats text containing shorthand phonetic tokens (e.g., "[kh][ch]") into actual Khowar PUA glyphs.
 * Uses the `khowarGlyphs` dictionary defined in glyphs.js.
 * @param {string} text 
 * @returns {string} Formatted Unicode string
 */
function formatKhowarText(text) {
    if (!text) return "";
    // Matches bracketed letters like [cl], [ch], [Gh], [Kh]
    return text.replace(/\[[a-zA-Z]+\]/g, match => khowarGlyphs[match] || match);
}

/**
 * Searches word and sentence datasets for translations.
 * @param {string} query - The search query
 * @param {string} direction - 'en-to-kh' or 'kh-to-en'
 * @param {Array} vocabulary - Array of word objects from vocabulary.js
 * @param {Array} sentences - Array of sentence objects from sentences.js
 * @returns {string} Translation result
 */
function translateQuery(query, direction = "en-to-kh", vocabulary = [], sentences = []) {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return "";

    const combinedDataset = [...vocabulary, ...sentences];

    if (direction === "en-to-kh") {
        const match = combinedDataset.find(item => item.english.toLowerCase() === cleanQuery);
        if (match) {
            return formatKhowarText(match.khowar_raw);
        }
    } else {
        const formattedInput = formatKhowarText(cleanQuery);
        
        const match = combinedDataset.find(item => {
            const formattedKhowar = formatKhowarText(item.khowar_raw).toLowerCase();
            return formattedKhowar === formattedInput || item.khowar_raw.toLowerCase() === cleanQuery;
        });

        if (match) {
            return match.english;
        }
    }

    return "No translation found in dataset.";
}