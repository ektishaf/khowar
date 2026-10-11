/**
 * Shorthand character map for Khowar Private Use Area (PUA) glyphs.
 */
const khowarGlyphs = {
    // First batch (U+E000 to U+E008, U+E00A, U+E00B, U+E00F)
    lowercase: {
        "[ah]": "\uE009",
        "[cl]": "\uE000",
        "[ch]": "\uE001",
        "[dl]": "\uE002",
        "[gh]": "\uE003",
        "[jl]": "\uE004",
        "[jh]": "\uE005",
        "[kh]": "\uE006",
        "[lh]": "\uE007",
        "[qh]": "\uE008",
        "[sh]": "\uE00A",
        "[tl]": "\uE00B",
        "[zh]": "\uE00F",
    },

    uppercase: {
    // Second batch (U+E010 to U+E018, U+E01A, U+E01B, U+E01F)
        "[Ah]": "\uE019",
        "[Cl]": "\uE010",
        "[Ch]": "\uE011",
        "[Dl]": "\uE012",
        "[Gh]": "\uE013",
        "[Jl]": "\uE014",
        "[Jh]": "\uE015",
        "[Kh]": "\uE016",
        "[Lh]": "\uE017",
        "[Qh]": "\uE018",
        "[Sh]": "\uE01A",
        "[Tl]": "\uE01B",
        "[Zh]": "\uE01F"
    }
};

// Helper flat mapping for reverse lookups across all glyphs
const khowarGlyphsFlat = {
    ...khowarGlyphs.lowercase,
    ...khowarGlyphs.uppercase
};

const khowarGlyphsReverse = Object.fromEntries(
    Object.entries(khowarGlyphsFlat).map(([token, char]) => [char, token])
);