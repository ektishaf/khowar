/**
 * Maps phonetic token strings (e.g. "[cl][ch]") into custom Khowar PUA Unicode glyphs.
 */
function formatKhowarText(text) {
    if (!text) return "";
    return text.replace(/\[[a-zA-Z0-9_]+\]/g, match => khowarGlyphs[match] || match);
}

/**
 * Searches across all part-of-speech datasets for individual word translations.
 */
function translateWord(word, direction = "en-to-kh") {
    const clean = word.trim().toLowerCase();
    if (!clean) return "";

    if (direction === "en-to-kh") {
        // 1. Check Pronouns
        const pronounMatch = pronounsData.find(p => p.english.toLowerCase() === clean);
        if (pronounMatch) return formatKhowarText(pronounMatch.khowar_raw);

        // 2. Check Nouns
        const nounMatch = nounsData.find(n => n.english.toLowerCase() === clean);
        if (nounMatch) return formatKhowarText(nounMatch.khowar_raw);

        // 3. Check Prepositions
        const prepMatch = prepositionsData.find(pr => pr.english.toLowerCase() === clean);
        if (prepMatch) return formatKhowarText(prepMatch.khowar_raw);

        // 4. Check Verbs (First, Second, Third forms)
        const verbMatch = verbsData.find(v => 
            v.english.first.toLowerCase() === clean || 
            v.english.second.toLowerCase() === clean || 
            v.english.third.toLowerCase() === clean ||
            (clean === "goes" && v.english.first.toLowerCase() === "go")
        );
        if (verbMatch) {
            // Default to base / 1st person form for single word lookup
            return formatKhowarText(verbMatch.khowar_present ? verbMatch.khowar_present.i : verbMatch.khowar.first);
        }
    } else {
        // Khowar to English reverse lookup
        const pronounMatch = pronounsData.find(p => formatKhowarText(p.khowar_raw).toLowerCase() === clean || p.khowar_raw.toLowerCase() === clean);
        if (pronounMatch) return pronounMatch.english;

        const nounMatch = nounsData.find(n => formatKhowarText(n.khowar_raw).toLowerCase() === clean || n.khowar_raw.toLowerCase() === clean);
        if (nounMatch) return nounMatch.english;

        const prepMatch = prepositionsData.find(p => formatKhowarText(p.khowar_raw).toLowerCase() === clean || p.khowar_raw.toLowerCase() === clean);
        if (prepMatch) return prepMatch.english;
    }

    return word; // Fallback: return as-is if unmapped
}

/**
 * Builds Khowar SOV sentences with subject agreement, -ot locative suffix, and negative placement.
 */
function buildKhowarSentence(inputText) {
    const cleanText = inputText.toLowerCase().replace(/['"]/g, '');
    const words = cleanText.split(/\s+/);

    // 1. Detect Negation ("not", "dont", "doesnt")
    const isNegative = words.some(w => ["not", "dont", "doesnt"].includes(w));

    // 2. Identify Subject & Person Key
    const pronounObj = pronounsData.find(p => words.includes(p.english.toLowerCase()));
    const personKey = pronounObj ? pronounObj.person : "i";
    const khSubject = pronounObj ? formatKhowarText(pronounObj.khowar_raw) : "";

    // 3. Identify Object Noun & Attach "-ot" suffix if "to" is present
    const nounObj = nounsData.find(n => words.includes(n.english.toLowerCase()));
    let khObject = nounObj ? formatKhowarText(nounObj.khowar_raw) : "";
    if (words.includes("to") && khObject) {
        khObject += formatKhowarText("[ot]"); // e.g. school -> schoolot
    }

    // 4. Identify Verb & Subject-Verb Agreement Form
    const verbObj = verbsData.find(v => words.some(w => [v.english.first, v.english.second, "goes", "go"].includes(w)));
    let khVerb = "";
    if (verbObj && verbObj.khowar_present) {
        khVerb = formatKhowarText(verbObj.khowar_present[personKey]);
    }

    // 5. Place Negative Token ("no") directly before the verb
    const khNegativeToken = isNegative ? formatKhowarText("[no]") : "";

    // Assemble SOV: Subject + Object(with suffix) + [no] + Verb
    return [khSubject, khObject, khNegativeToken, khVerb].filter(Boolean).join(" ");
}

/**
 * Main Translation Router
 */
function translateQuery(query, direction = "en-to-kh") {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return "";

    // Step A: Check pre-constructed idioms/sentences first
    if (typeof sentencesData !== 'undefined') {
        const exactSentence = sentencesData.find(s => s.english_text.toLowerCase() === cleanQuery);
        if (exactSentence) {
            return formatKhowarText(exactSentence.khowar_raw);
        }
    }

    // Step B: If multi-word English sentence, use full grammar reordering engine
    const words = cleanQuery.split(/\s+/);
    if (direction === "en-to-kh" && words.length > 1) {
        return buildKhowarSentence(cleanQuery);
    }

    // Step C: Single-word or fallback token lookup
    return words.map(w => translateWord(w, direction)).join(" ");
}

/**
 * Triggers UI update
 */
function triggerTranslation() {
    const inputField = document.getElementById('searchInput');
    const outputField = document.getElementById('outputText');
    const directionField = document.getElementById('directionSelect');

    if (!inputField || !outputField) return;

    const query = inputField.value;
    const direction = directionField ? directionField.value : "en-to-kh";

    const result = translateQuery(query, direction);
    outputField.textContent = result || "Translation output will appear here...";
}

/**
 * Handles incoming URL query parameters (?q=...&dir=...)
 */
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const direction = urlParams.get('dir');

    if (query) {
        const searchInput = document.getElementById('searchInput');
        const directionSelect = document.getElementById('directionSelect');

        if (searchInput) searchInput.value = query;
        if (directionSelect && direction) directionSelect.value = direction;

        triggerTranslation();
    }
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
    if (typeof renderGlyphs === 'function') {
        renderGlyphs();
    }
    handleUrlParameters();
});