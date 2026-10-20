/**
 * js/app.js
 */

// 1. Render Khowar Standard Alphabet Cards
window.renderAlphabetScript = function() {
    if (typeof khowarScript === 'undefined') return;

    const createCards = (list) => {
        if (!list || !list.length) return '';
        return list.map(letter => {
            const displayChar = window.getFormattedText(letter);
            return `
                <div class="glyph-card" onclick="window.insertIntoSearch('${displayChar}', '${letter}')" title="${letter}">
                    <span class="voice-icon">🔊</span>
                    <div class="glyph-char khowar-font">${displayChar}</div>
                </div>
            `;
        }).join("");
    };

    const lowerContainer = document.getElementById("khowarLowercaseContainer");
    const upperContainer = document.getElementById("khowarUppercaseContainer");

    const lowerList = Array.isArray(khowarScript) ? khowarScript : (khowarScript.lowercase || []);
    const upperList = khowarScript.uppercase || [];

    if (lowerContainer) lowerContainer.innerHTML = createCards(lowerList);
    if (upperContainer) upperContainer.innerHTML = createCards(upperList);
};

// 2. Render Special Khowar Glyph Cards
window.renderSpecialLetters = function() {
    if (typeof khowarGlyphs === 'undefined') {
        console.error("❌ [Glyph Rendering] `khowarGlyphs` object is undefined! Check if js/glyphs.js is loaded.");
        console.groupEnd();
        return;
    }

    const createGlyphCards = (glyphMap, sectionName = "Group") => {
        if (!glyphMap || typeof glyphMap !== 'object') {
            console.warn(`⚠️ [Glyph Rendering] ${sectionName} glyph map is empty or invalid.`);
            return '';
        }

        const entries = Object.entries(glyphMap);
        
        return entries.map(([token, rawChar]) => {
            if (!rawChar) return '';

            // Apply formatKhowarText to ensure standard PUA character compilation
            const glyphChar = typeof formatKhowarText === 'function' ? formatKhowarText(token) : rawChar;

            const codePoint = 'U+' + glyphChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
            
            // Safely encode string arguments for inline JS onclick handlers
            const safeChar = encodeURIComponent(glyphChar);
            const safeToken = encodeURIComponent(token);

            return `
                <div class="glyph-card" onclick="window.insertIntoSearch(decodeURIComponent('${safeChar}'), decodeURIComponent('${safeToken}'))" title="${token}">
                    <span class="voice-icon">🔊</span>
                    <div class="glyph-char khowar-font">${glyphChar}</div>
                    <div class="glyph-code">${codePoint}</div>
                    <div class="token-label">${token}</div>
                </div>
            `;
        }).join("");
    };

    const lowerContainer = document.getElementById('specialLowercaseContainer');
    const upperContainer = document.getElementById('specialUppercaseContainer');

    if (khowarGlyphs.lowercase || khowarGlyphs.uppercase) {
        if (lowerContainer) {
            const html = createGlyphCards(khowarGlyphs.lowercase || {}, "Lowercase");
            lowerContainer.innerHTML = html;
        } else {
            console.warn("⚠️ [Glyph Rendering] `#specialLowercaseContainer` not found in DOM.");
        }

        if (upperContainer) {
            const html = createGlyphCards(khowarGlyphs.uppercase || {}, "Uppercase");
            upperContainer.innerHTML = html;
        } else {
            console.warn("⚠️ [Glyph Rendering] `#specialUppercaseContainer` not found in DOM.");
        }
    } else {
        if (lowerContainer) {
            lowerContainer.innerHTML = createGlyphCards(khowarGlyphs, "Flat Map");
            console.log("✅ [Glyph Rendering] Flat map rendered into lowercase container.");
        }
        if (upperContainer) {
            upperContainer.innerHTML = '';
        }
    }

    console.groupEnd();
};

// 4. Click Handler for Glyph Cards
window.insertIntoSearch = function(glyphChar, soundToken) {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value += glyphChar;
        input.focus();
    }
    window.playLetterSound(soundToken || glyphChar);
    window.triggerTranslation();
};

// 5. Text Formatter Helper
window.getFormattedText = function(token) {
    if (typeof formatKhowarText === 'function') {
        return formatKhowarText(token);
    }
    return token;
};

// 6. Translation Input & Selection Handler
// 6. Translation Input & Selection Handler (Debug Version)
window.triggerTranslation = function() {
    const inputEl = document.getElementById('searchInput');
    const dirEl = document.getElementById('directionSelect');
    const outputEl = document.getElementById('translationOutput');

    if (!inputEl || !dirEl || !outputEl) {
        console.error("❌ [Trigger] Missing DOM elements!");
        return;
    }

    const query = inputEl.value;
    const direction = dirEl.value;

    console.log(`🔍 [Trigger] Query: "${query}" | Direction: "${direction}"`);

    if (!query.trim()) {
        outputEl.innerHTML = '<span style="color: var(--text-muted); font-size: 1rem;">Translation output will appear here...</span>';
        return;
    }

    let result = "";

    try {
        if (direction === "en-to-kh" || direction === "kh-to-en") {
            if (typeof translateEnglishToKhowar === 'function') {
                console.log("✅ [Trigger] Calling modular `translateEnglishToKhowar`");
                result = translateEnglishToKhowar(query);
            } else if (typeof translateQuery === 'function') {
                console.warn("⚠️ [Trigger] `translateEnglishToKhowar` not found. Falling back to `translateQuery`.");
                result = translateQuery(query, direction);
            } else {
                console.error("❌ [Trigger] No translation function available for English to Khowar!");
            }
        } else {
            if (typeof translateQuery === 'function') {
                console.log("✅ [Trigger] Calling `translateQuery` for Khowar to English");
                result = translateQuery(query, direction);
            }
        }

        console.log(`✨ [Trigger] Result: "${result}"`);
        outputEl.textContent = result || inputEl.value;//"⚠️ Translation returned empty string.";
    } catch (err) {
        console.error("💥 [Trigger] Runtime error during translation:", err);
        outputEl.textContent = "Error: Check console for details.";
    }
};

// 7. Translation Audio Playback Handler
window.playTranslationOutput = function() {
    const outputEl = document.getElementById('translationOutput');
    if (outputEl && outputEl.textContent && typeof speakSentence === 'function') {
        speakSentence(outputEl.textContent);
    }
};

// 8. Query String Handler
window.handleUrlParameters = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const direction = urlParams.get('dir');

    if (query) {
        const inputEl = document.getElementById('searchInput');
        const dirEl = document.getElementById('directionSelect');

        if (inputEl) inputEl.value = query;
        if (dirEl && direction) dirEl.value = direction;

        window.triggerTranslation();
    }
};

// 9. DOM Initialization & Event Binds
window.addEventListener('DOMContentLoaded', () => {
    window.renderAlphabetScript();
    window.renderSpecialLetters();
    window.handleUrlParameters();

    const searchInput = document.getElementById('searchInput');
    const dirSelect = document.getElementById('directionSelect');
    const langSelect = document.getElementById('langSelect');

    if (searchInput) searchInput.addEventListener('input', window.triggerTranslation);
    if (dirSelect) dirSelect.addEventListener('change', window.triggerTranslation);

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const isKhowar = e.target.value === 'kh';
            const transTitle = document.getElementById('transTitle');
            const lowerTitle = document.getElementById('specialLowerTitle');
            const upperTitle = document.getElementById('specialUpperTitle');

            if (transTitle) transTitle.textContent = "Khowar Translator";
            if (lowerTitle) lowerTitle.textContent = isKhowar ? "Special Khowar Small Letters" : "Special Khowar Letters (Lowercase)";
            if (upperTitle) upperTitle.textContent = isKhowar ? "Special Khowar Capital Letters" : "Special Khowar Letters (Uppercase)";
        });
    }
});

/**
 * Resolves any English token to its Khowar equivalent or falls back to Proper Noun.
 * @param {string} token - The raw English word (e.g. "chair", "Samina", "fast")
 * @param {string} [postposition=""] - Optional suffix (e.g. "-ote" for "to")
 * @returns {string} The raw Khowar translation or passed-through name
 */
function resolveToken(token, postposition = "") {
    if (!token) return "";
    
    const cleanToken = token.trim().toLowerCase();

    // 1. Check Pronouns
    const pronoun = pronounsData.find(p => p.english.toLowerCase() === cleanToken);
    if (pronoun) return pronoun.khowar_raw + postposition;

    // 2. Check Nouns
    const noun = nounsData.find(n => n.english.toLowerCase() === cleanToken);
    if (noun) return noun.khowar_raw + postposition;

    // 3. Check Adjectives
    const adj = adjectivesData.find(a => a.english.toLowerCase() === cleanToken);
    if (adj) return adj.khowar_raw;

    // 4. Check Adverbs (if adverbsData array exists)
    if (typeof adverbsData !== 'undefined') {
        const adv = adverbsData.find(a => a.english.toLowerCase() === cleanToken);
        if (adv) return adv.khowar_raw;
    }

    // 5. Fallback: Proper Noun / Unrecognized Word
    // Preserves original casing or capitalizes the first letter
    const isCapitalized = token[0] === token[0].toUpperCase();
    const formattedName = isCapitalized 
        ? token 
        : token.charAt(0).toUpperCase() + token.slice(1);

    return formattedName + postposition;
}