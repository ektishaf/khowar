/**
 * Maps phonetic token strings (e.g. "[cl][ch]") into custom Khowar PUA Unicode glyphs.
 */
function formatKhowarText(text) {
    if (!text) return "";
    if (typeof khowarGlyphs === 'undefined') return text;
    return text.replace(/\[[a-zA-Z0-9_]+\]/g, match => khowarGlyphs[match] || match);
}

/**
 * Single-word lookup across datasets
 */
function translateWord(word, direction = "en-to-kh") {
    const clean = word.trim().toLowerCase();
    if (!clean) return "";

    // Safely check dataset availability
    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];

    if (direction === "en-to-kh") {
        const pMatch = pronouns.find(p => p.english.toLowerCase() === clean);
        if (pMatch) return formatKhowarText(pMatch.khowar_raw);

        const nMatch = nouns.find(n => n.english.toLowerCase() === clean);
        if (nMatch) return formatKhowarText(nMatch.khowar_raw);

        const prMatch = preps.find(pr => pr.english.toLowerCase() === clean);
        if (prMatch) return formatKhowarText(prMatch.khowar_raw);

        const vMatch = verbs.find(v => 
            v.english.first.toLowerCase() === clean || 
            v.english.second.toLowerCase() === clean || 
            v.english.third.toLowerCase() === clean ||
            clean === "goes"
        );
        if (vMatch) {
            return formatKhowarText(vMatch.khowar_present ? vMatch.khowar_present.i : "");
        }
    } else {
        const pMatch = pronouns.find(p => formatKhowarText(p.khowar_raw).toLowerCase() === clean || p.khowar_raw.toLowerCase() === clean);
        if (pMatch) return pMatch.english;

        const nMatch = nouns.find(n => formatKhowarText(n.khowar_raw).toLowerCase() === clean || n.khowar_raw.toLowerCase() === clean);
        if (nMatch) return nMatch.english;
    }

    return word;
}

/**
 * Main Dynamic Sentence Assembly Engine
 */
function buildKhowarSentence(inputText) {
    const cleanText = inputText.toLowerCase().replace(/['"]/g, '');
    const words = cleanText.split(/\s+/);

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];

    // 1. Detect Negation ("not", "dont", "doesnt", "didnt")
    const isNegative = words.some(w => ["not", "dont", "doesnt", "didnt"].includes(w));

    // 2. Identify Subject & Person Key ("i", "you", "he_she_it", "we", "they")
    const pronounObj = pronouns.find(p => words.includes(p.english.toLowerCase()));
    const personKey = pronounObj ? pronounObj.person : "i";
    const khSubject = pronounObj ? formatKhowarText(pronounObj.khowar_raw) : "";

    // 3. Identify Object Noun & attach locative suffix "-ot" if "to" is present
    const nounObj = nouns.find(n => words.includes(n.english.toLowerCase()));
    let khObject = nounObj ? formatKhowarText(nounObj.khowar_raw) : "";
    if (words.includes("to") && khObject) {
        khObject += formatKhowarText("[ot]");
    }

    // 4. Identify Verb & Pick Tense Index (0-4)
    const verbObj = verbs.find(v => words.some(w => [
        v.english.first.toLowerCase(), 
        v.english.second.toLowerCase(), 
        v.english.third ? v.english.third.toLowerCase() : "", 
        "goes", "go"
    ].includes(w)));

    let khVerb = "";
    if (verbObj) {
        // Calculate the tense index (0: Past Perf Cont, 1: Past Perf, 2: Past, 3: Present, 4: Future)
        const tenseIdx = getTenseIndex(words, verbObj);
        
        // Fetch matching conjugated verb array for the subject person
        const personConjugations = verbObj[personKey] || verbObj["i"];
        if (personConjugations && personConjugations[tenseIdx]) {
            khVerb = formatKhowarText(personConjugations[tenseIdx]);
        }
    }

    // 5. Place Negative Token ("no") directly before the verb
    const khNegativeToken = isNegative ? formatKhowarText("[no]") : "";

    // Assemble SOV output: Subject + Object(with suffix) + [no] + Conjugated Verb
    return [khSubject, khObject, khNegativeToken, khVerb].filter(Boolean).join(" ");
}

/**
 * Main Translation Router
 */
function translateQuery(query, direction = "en-to-kh") {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return "";

    // Check sentence database
    if (typeof sentencesData !== 'undefined') {
        const exactSentence = sentencesData.find(s => s.english_text.toLowerCase() === cleanQuery);
        if (exactSentence) {
            return formatKhowarText(exactSentence.khowar_raw);
        }
    }

    // Dynamic Sentence assembly if multiple words
    const words = cleanQuery.split(/\s+/);
    if (direction === "en-to-kh" && words.length > 1) {
        return buildKhowarSentence(cleanQuery);
    }

    // Fallback: Word-by-word
    return words.map(w => translateWord(w, direction)).join(" ");
}
function getTenseIndex(words, verbObj) {
    // Check for past indicators
    if (words.includes("had") && (words.includes("been") || words.some(w => w.endsWith("ing")))) {
        return 0; // Past Perfect Continuous
    }
    if (words.includes("had") || words.includes(verbObj.english.third)) {
        return 1; // Past Perfect
    }
    if (words.includes(verbObj.english.second) || words.includes("did")) {
        return 2; // Past
    }
    if (words.includes("will") || words.includes("shall")) {
        return 4; // Future
    }
    
    return 3; // Default: Present
}

// Inside sentence construction:
const personKey = pronounObj ? pronounObj.person : "i"; // "i", "you", etc.
const tenseIdx = getTenseIndex(words, verbObj);
const khVerb = verbObj[personKey] ? formatKhowarText(verbObj[personKey][tenseIdx]) : "";