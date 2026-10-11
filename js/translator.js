/**
 * js/translator.js
 * Rule-based translator supporting English ➔ Khowar (SOV) and Khowar ➔ English (SVO).
 */

// Detects tense index (0: Past Perf Cont, 1: Past Perf, 2: Past, 3: Present, 4: Future)
/**
 * Dynamic 12-Tense Classifier Engine
 * Maps English word auxiliary patterns to tense index (0 - 11)
 */
function getTenseIndex(words, verbObj) {
    if (!verbObj) return 0; // Default Present Indefinite

    const pastForm = verbObj.english.second ? verbObj.english.second.toLowerCase() : "";
    const pastParticiple = verbObj.english.third ? verbObj.english.third.toLowerCase() : "";

    const hasWill = words.includes("will") || words.includes("shall");
    const hasHad = words.includes("had");
    const hasHaveHas = words.includes("have") || words.includes("has");
    const hasBeen = words.includes("been");
    const hasWasWere = words.includes("was") || words.includes("were");
    const hasAmIsAre = words.includes("am") || words.includes("is") || words.includes("are");
    const hasIng = words.some(w => w.endsWith("ing"));
    const hasV2 = pastForm && words.includes(pastForm);
    const hasV3 = pastParticiple && words.includes(pastParticiple);

    // --- FUTURE TENSES ---
    if (hasWill) {
        if (hasHaveHas && hasBeen && hasIng) return 11; // Future Perfect Continuous
        if (hasHaveHas && (hasV3 || words.includes("done"))) return 10; // Future Perfect
        if (words.includes("be") && hasIng) return 9;   // Future Continuous
        return 8;                                       // Future Indefinite
    }

    // --- PAST TENSES ---
    if (hasHad && hasBeen && hasIng) return 7;         // Past Perfect Continuous
    if (hasHad) return 6;                              // Past Perfect
    if (hasWasWere && hasIng) return 5;                // Past Continuous
    if (hasV2 || words.includes("did")) return 4;     // Past Indefinite

    // --- PRESENT TENSES ---
    if (hasHaveHas && hasBeen && hasIng) return 3;     // Present Perfect Continuous
    if (hasHaveHas) return 2;                          // Present Perfect
    if ((hasAmIsAre && hasIng) || hasIng) return 1;    // Present Continuous
    
    // Default Present Indefinite (Index 0)
    return 0; 
}

// Single word lookup fallback
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
            (v.english.third && v.english.third.toLowerCase() === clean)
        );
        if (vMatch) {
            const personConjugations = vMatch["i"] || [];
            return formatKhowarText(personConjugations[3] || vMatch.english.first);
        }
    } else {
        const unformattedClean = unformatKhowarText(clean);
        const pMatch = pronouns.find(p => p.khowar_raw.toLowerCase() === unformattedClean);
        if (pMatch) return pMatch.english;

        const nMatch = nouns.find(n => n.khowar_raw.toLowerCase() === unformattedClean);
        if (nMatch) return nMatch.english;
    }

    return word;
}

// Builds Khowar SOV Sentences
function buildKhowarSentence(inputText) {
    const cleanText = inputText.toLowerCase().replace(/['"]/g, '');
    const words = cleanText.split(/\s+/);

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];

    const isNegative = words.some(w => ["not", "dont", "doesnt", "didnt"].includes(w));

    // Subject
    const sortedPronouns = [...pronouns].sort((a, b) => b.english.length - a.english.length);
    const pronounObj = sortedPronouns.find(p => cleanText.includes(p.english.toLowerCase()));
    const personKey = pronounObj ? pronounObj.person : "i";
    const rawSubject = pronounObj ? pronounObj.khowar_raw : "";

    // Object Noun + Preposition Suffix
    const nounObj = nouns.find(n => cleanText.includes(n.english.toLowerCase()));
    let rawObject = nounObj ? nounObj.khowar_raw : "";
    if (rawObject) {
        const prepObj = preps.find(p => cleanText.includes(p.english.toLowerCase()) && (p.suffix || p.khowar_raw));
        if (prepObj) {
            rawObject += (prepObj.suffix || prepObj.khowar_raw);
        }
    }

    // Verb
    const verbObj = verbs.find(v => {
        const base = v.english.first ? v.english.first.toLowerCase() : "";
        const past = v.english.second ? v.english.second.toLowerCase() : "";
        const pastParticiple = v.english.third ? v.english.third.toLowerCase() : "";

        return words.some(w => 
            w === base || w === past || w === pastParticiple || 
            w === base + "s" || w === base + "es" || w === base + "ing" ||
            (base.endsWith('e') && w === base.slice(0, -1) + "ing")
        );
    });

    let rawVerb = "";
    if (verbObj) {
        const tenseIdx = getTenseIndex(words, verbObj);
        const personConjugations = verbObj[personKey] || verbObj["i"];
        if (personConjugations && personConjugations[tenseIdx]) {
            rawVerb = personConjugations[tenseIdx];
        }
    }

    // Negative
    let rawNegativeToken = "";
    if (isNegative) {
        const notObj = preps.find(p => p.english.toLowerCase() === "not" || p.english.toLowerCase() === "no");
        rawNegativeToken = notObj ? notObj.khowar_raw : "no";
    }

    const rawSentence = [rawSubject, rawObject, rawNegativeToken, rawVerb].filter(Boolean).join(" ");
    return formatKhowarText(rawSentence);
}

// Builds English SVO Sentences
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

    const pronounObj = pronouns.find(p => rawText.includes(p.khowar_raw));
    if (pronounObj) enSubject = pronounObj.english;

    for (const noun of nouns) {
        if (rawText.includes(noun.khowar_raw)) {
            enObject = noun.english;
            const prepMatch = preps.find(p => p.suffix && rawText.includes(noun.khowar_raw + p.suffix));
            if (prepMatch) prepPrefix = prepMatch.english;
            break;
        }
    }

    for (const verb of verbs) {
        for (const personKey of ["i", "you", "he_she_it", "we", "they"]) {
            const conjugations = verb[personKey];
            if (conjugations) {
                const tenseIdx = conjugations.findIndex(c => c && rawText.includes(c));
                if (tenseIdx !== -1) {
                    if (tenseIdx === 2) enVerb = verb.english.second;
                    else if (tenseIdx === 4) enVerb = "will " + verb.english.first;
                    else enVerb = verb.english.first;

                    if (!enSubject) enSubject = personKey === "i" ? "I" : personKey;
                    break;
                }
            }
        }
        if (enVerb) break;
    }

    return [enSubject, enVerb, prepPrefix, enObject].filter(Boolean).join(" ");
}

// Router
function translateQuery(query, direction = "en-to-kh") {
    const cleanQuery = query.trim();
    if (!cleanQuery) return "";

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
            return direction === "en-to-kh" ? formatKhowarText(exactSentence.khowar_raw) : exactSentence.english_text;
        }
    }

    const words = cleanQuery.split(/\s+/);
    if (words.length > 1 || direction === "kh-to-en") {
        return direction === "en-to-kh" ? buildKhowarSentence(cleanQuery) : buildEnglishSentence(cleanQuery);
    }

    return translateWord(cleanQuery, direction);
}