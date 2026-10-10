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
            (v.english.third && v.english.third.toLowerCase() === clean) ||
            clean === "goes"
        );
        if (vMatch) {
            // Default to Present (index 3) for single word lookup
            const personConjugations = vMatch["i"] || [];
            return formatKhowarText(personConjugations[3] || vMatch.english.first);
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
 * Detects tense index (0 to 4) for the 5-tense verb array:
 * 0: Past Perfect Continuous
 * 1: Past Perfect
 * 2: Past
 * 3: Present
 * 4: Future
 */
function getTenseIndex(words, verbObj) {
    if (!verbObj) return 3; // Default Present

    // 0: Past Perfect Continuous ("had been ...ing")
    if (words.includes("had") && (words.includes("been") || words.some(w => w.endsWith("ing")))) {
        return 0;
    }
    // 1: Past Perfect ("had ...")
    if (words.includes("had") || (verbObj.english.third && words.includes(verbObj.english.third.toLowerCase()))) {
        return 1;
    }
    // 2: Past Tense ("went", "ate", "did")
    if ((verbObj.english.second && words.includes(verbObj.english.second.toLowerCase())) || words.includes("did")) {
        return 2;
    }
    // 4: Future Tense ("will", "shall")
    if (words.includes("will") || words.includes("shall")) {
        return 4;
    }

    // 3: Default Present
    return 3;
}

/**
 * Builds Khowar SOV sentences with subject agreement, -ot locative suffix, and tense mapping.
 */
function buildKhowarSentence(inputText) {
    const cleanText = inputText.toLowerCase().replace(/['"]/g, '');
    const words = cleanText.split(/\s+/);

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];

    // 1. Detect Negation
    const isNegative = words.some(w => ["not", "dont", "doesnt", "didnt"].includes(w));

    // 2. Identify Subject (Keep raw token strings)
    const pronounObj = pronouns.find(p => words.includes(p.english.toLowerCase()));
    const personKey = pronounObj ? pronounObj.person : "i";
    const rawSubject = pronounObj ? pronounObj.khowar_raw : "";

    // 3. Identify Object Noun & attach raw suffix (keep as raw tokens)
    const nounObj = nouns.find(n => words.includes(n.english.toLowerCase()));
    let rawObject = nounObj ? nounObj.khowar_raw : "";
    
    if (rawObject) {
        const prepObj = preps.find(p => words.includes(p.english.toLowerCase()) && p.suffix);
        if (prepObj) {
            rawObject += prepObj.suffix; // Appends raw suffix like "o[tl]"
        }
    }

    // 4. Identify Verb & Pick Tense Index (0-4)
    const verbObj = verbs.find(v => words.some(w => [
        v.english.first.toLowerCase(), 
        v.english.second.toLowerCase(), 
        v.english.third ? v.english.third.toLowerCase() : "", 
        "goes", "go"
    ].includes(w)));

    let rawVerb = "";
    if (verbObj) {
        const tenseIdx = getTenseIndex(words, verbObj);
        const personConjugations = verbObj[personKey] || verbObj["i"];
        if (personConjugations && personConjugations[tenseIdx]) {
            rawVerb = personConjugations[tenseIdx];
        }
    }

    // 5. Look up raw negative token
    let rawNegativeToken = "";
    if (isNegative) {
        const notObj = preps.find(p => p.english.toLowerCase() === "not" || p.english.toLowerCase() === "no");
        rawNegativeToken = notObj ? notObj.khowar_raw : "[no]";
    }

    // Assemble all raw tokens together FIRST, then format into PUA Unicode glyphs ONCE at the end
    const rawSentence = [rawSubject, rawObject, rawNegativeToken, rawVerb].filter(Boolean).join(" ");
    
    return formatKhowarText(rawSentence);
}

/**
 * Main Translation Router
 */
function translateQuery(query, direction = "en-to-kh") {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return "";

    // Check pre-built sentences/idioms database first
    if (typeof sentencesData !== 'undefined') {
        const exactSentence = sentencesData.find(s => s.english_text.toLowerCase() === cleanQuery);
        if (exactSentence) {
            return formatKhowarText(exactSentence.khowar_raw);
        }
    }

    // Multi-word rule-based SOV translation engine
    const words = cleanQuery.split(/\s+/);
    if (direction === "en-to-kh" && words.length > 1) {
        return buildKhowarSentence(cleanQuery);
    }

    // Single-word lookup fallback
    return words.map(w => translateWord(w, direction)).join(" ");
}