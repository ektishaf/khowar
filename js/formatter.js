/**
 * js/formatter.js
 * Handles bidirection token conversion between bracketed strings and PUA glyphs.
 */

// Formats bracketed tokens (e.g. [sh], [Cl]) into PUA glyph characters
function formatKhowarText(text) {
    if (!text) return "";

    const glyphMap = typeof khowarGlyphsFlat !== 'undefined' 
        ? khowarGlyphsFlat 
        : (typeof khowarGlyphs !== 'undefined' 
            ? { ...(khowarGlyphs.lowercase || {}), ...(khowarGlyphs.uppercase || {}), ...khowarGlyphs } 
            : {});

    return text.replace(/\[[a-zA-Z]+\]/g, match => glyphMap[match] || match);
}

// Formats PUA glyph characters into bracketed tokens (e.g. [sh], [Cl])
function unformatKhowarText(text) {
    if (!text) return "";
    if (typeof khowarGlyphsReverse === 'undefined') return text;

    // Matches any Private Use Area (PUA) character in range U+E000 to U+E01F
    return text.replace(/[\uE000-\uE01F]/g, char => khowarGlyphsReverse[char] || char);
}