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
/**
 * Builds Khowar SOV sentences with subject-verb-tense agreement 
 * and direct suffix concatenation (e.g., noun + "o[tl]").
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

    // 2. Identify Subject (Matches multi-word pronouns safely)
    const sortedPronouns = [...pronouns].sort((a, b) => b.english.length - a.english.length);
    const pronounObj = sortedPronouns.find(p => cleanText.includes(p.english.toLowerCase()));
    
    const personKey = pronounObj ? pronounObj.person : "i";
    const rawSubject = pronounObj ? pronounObj.khowar_raw : "";

    // 3. Identify Object Noun & attach phonetic suffix string directly (e.g., "o[tl]")
    const nounObj = nouns.find(n => cleanText.includes(n.english.toLowerCase()));
    let rawObject = nounObj ? nounObj.khowar_raw : "";
    
    if (rawObject) {
        // Look up directional preposition ("to") and append its raw suffix string
        const prepObj = preps.find(p => cleanText.includes(p.english.toLowerCase()) && (p.suffix || p.khowar_raw));
        if (prepObj) {
            rawObject += (prepObj.suffix || prepObj.khowar_raw); // e.g., appends literal "o[tl]"
        }
    }

    // 4. Identify Verb & Pick Tense Index (0: Past Perf Cont, 1: Past Perf, 2: Past, 3: Present, 4: Future)
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
        rawNegativeToken = notObj ? notObj.khowar_raw : "no";
    }

    // Combine raw sentence components in SOV order
    const rawSentence = [rawSubject, rawObject, rawNegativeToken, rawVerb].filter(Boolean).join(" ");

    // Perform final PUA character lookup on the assembled string
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

/**
 * Reverse mapping pass: converts PUA glyph characters back to raw bracketed tokens
 * for dictionary lookup when translating Khowar -> English.
 */
function unformatKhowarText(text) {
    if (!text || typeof khowarGlyphs === 'undefined') return text;
    let rawText = text;
    Object.keys(khowarGlyphs).forEach(token => {
        const glyphChar = khowarGlyphs[token];
        if (glyphChar) {
            rawText = rawText.replaceAll(glyphChar, token);
        }
    });
    return rawText;
}

/**
 * Khowar ➔ English Reverse Engine (SOV ➔ SVO)
 * Leaves buildKhowarSentence untouched.
 */
function buildEnglishSentence(inputText) {
    const rawText = unformatKhowarText(inputText.trim());

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];

    let enSubject = "";
    let enVerb = "";
    let enObject = "";
    let prepPrefix = "";

    // 1. Identify Subject Pronoun
    const pronounObj = pronouns.find(p => rawText.includes(p.khowar_raw));
    if (pronounObj) {
        enSubject = pronounObj.english;
    }

    // 2. Identify Noun & Preposition Suffix (e.g. "o[tl]")
    for (const noun of nouns) {
        if (rawText.includes(noun.khowar_raw)) {
            enObject = noun.english;
            
            const prepMatch = preps.find(p => p.suffix && rawText.includes(noun.khowar_raw + p.suffix));
            if (prepMatch) {
                prepPrefix = prepMatch.english; // e.g. "to"
            }
            break;
        }
    }

    // 3. Reverse Verb Lookup across 5 Tenses
    for (const verb of verbs) {
        for (const personKey of ["i", "you", "he_she_it", "we", "they"]) {
            const conjugations = verb[personKey];
            if (conjugations) {
                const tenseIdx = conjugations.findIndex(c => c && rawText.includes(c));
                if (tenseIdx !== -1) {
                    if (tenseIdx === 2) enVerb = verb.english.second;
                    else if (tenseIdx === 4) enVerb = "will " + verb.english.first;
                    else enVerb = verb.english.first;
                    
                    if (!enSubject) {
                        enSubject = personKey === "i" ? "I" : personKey;
                    }
                    break;
                }
            }
        }
        if (enVerb) break;
    }

    // Assemble English SVO order: Subject + Verb + Preposition + Object
    return [enSubject, enVerb, prepPrefix, enObject].filter(Boolean).join(" ");
}

/**
 * Updated Router: delegates to your working buildKhowarSentence for en-to-kh
 * and buildEnglishSentence for kh-to-en.
 */
function translateQuery(query, direction = "en-to-kh") {
    const cleanQuery = query.trim();
    if (!cleanQuery) return "";

    // 1. Sentence Database Match
    if (typeof sentencesData !== 'undefined') {
        const exactSentence = sentencesData.find(s => {
            if (direction === "en-to-kh") {
                return s.english_text.toLowerCase() === cleanQuery.toLowerCase();
            } else {
                return s.khowar_raw === unformatKhowarText(cleanQuery) || 
                       formatKhowarText(s.khowar_raw) === cleanQuery;
            }
        });

        if (exactSentence) {
            return direction === "en-to-kh" 
                ? formatKhowarText(exactSentence.khowar_raw) 
                : exactSentence.english_text;
        }
    }

    // 2. Multi-word or Directional Routing
    const words = cleanQuery.split(/\s+/);
    if (words.length > 1 || direction === "kh-to-en") {
        if (direction === "en-to-kh") {
            return buildKhowarSentence(cleanQuery); // Uses your working function exactly as-is
        } else {
            return buildEnglishSentence(cleanQuery);
        }
    }

    // 3. Single Word Fallback
    return translateWord(cleanQuery, direction);
}