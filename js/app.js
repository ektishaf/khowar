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
    console.group("🔤 [Glyph Rendering] Initializing Special Letters...");

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
        console.log(`ℹ️ [Glyph Rendering] Processing ${entries.length} items for ${sectionName}...`);

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

    console.log("🔍 [Glyph Rendering] DOM Containers Check:", {
        specialLowercaseContainer: !!lowerContainer,
        specialUppercaseContainer: !!upperContainer
    });

    if (khowarGlyphs.lowercase || khowarGlyphs.uppercase) {
        if (lowerContainer) {
            const html = createGlyphCards(khowarGlyphs.lowercase || {}, "Lowercase");
            lowerContainer.innerHTML = html;
            console.log("✅ [Glyph Rendering] Lowercase container populated.");
        } else {
            console.warn("⚠️ [Glyph Rendering] `#specialLowercaseContainer` not found in DOM.");
        }

        if (upperContainer) {
            const html = createGlyphCards(khowarGlyphs.uppercase || {}, "Uppercase");
            upperContainer.innerHTML = html;
            console.log("✅ [Glyph Rendering] Uppercase container populated.");
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
window.triggerTranslation = function() {
    const inputEl = document.getElementById('searchInput');
    const dirEl = document.getElementById('directionSelect');
    const outputEl = document.getElementById('translationOutput');

    if (!inputEl || !dirEl || !outputEl) return;

    const query = inputEl.value;
    const direction = dirEl.value;

    if (!query.trim()) {
        outputEl.innerHTML = '<span style="color: var(--text-muted); font-size: 1rem;">Translation output will appear here...</span>';
        return;
    }

    if (typeof translateQuery === 'function') {
        const result = translateQuery(query, direction);
        outputEl.textContent = result;
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