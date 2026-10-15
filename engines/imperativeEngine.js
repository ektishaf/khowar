function isImperativeSentence(inputText, verbs, pronouns) {
    if (!inputText || !inputText.trim()) return false;

    const rawInput = inputText.toLowerCase().trim();
    const isNegativeCmd = /^(don'?t|do\s+not)\s+/i.test(rawInput);
    
    let cleanText = rawInput;
    if (isNegativeCmd) {
        cleanText = cleanText.replace(/^(don'?t|do\s+not)\s+/i, '');
    }

    const words = cleanText.replace(/['"]/g, '').split(/\s+/);
    const firstWord = words[0] ? words[0].replace(/[-_.,!?]/g, '') : "";
    
    const matchesVerb = verbs.some(v => 
        v.english && (
            (typeof v.english === 'string' && v.english.toLowerCase().replace(/^to\s+/, '') === firstWord) ||
            (v.english.first && v.english.first.toLowerCase() === firstWord) || 
            (v.english.second && v.english.second.toLowerCase() === firstWord)
        )
    );

    const isPronoun = pronouns.some(p => p.english && p.english.toLowerCase() === firstWord);
    
    // Prevent "do not..." from triggering interrogative mode
    const isQuestion = rawInput.endsWith("?") || 
        (!isNegativeCmd && /^(do|does|did|is|am|are|was|were|will|can|could|should|would)\b/i.test(rawInput));

    return matchesVerb && !isQuestion && !isPronoun;
}

function buildImperativeKhowarSentence(inputText) {
    // Detect negative command ("don't" or "do not")
    const isNegativeCmd = /^(don'?t|do\s+not)\s+/i.test(inputText.trim());
    const cleanText = inputText.toLowerCase().replace(/^(don'?t|do\s+not)\s+/i, '').replace(/['"]/g, '').trim();

    const words = cleanText.split(/\s+/);
    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];
    const adverbs = typeof adverbsData !== 'undefined' ? adverbsData : [];

    // 1. Object / Location / Adverb Lookup (Sort longest match first)
    const sortedNouns = [...nouns].sort((a, b) => b.english.length - a.english.length);
    const nounObj = sortedNouns.find(n => new RegExp(`\\b${n.english}\\b`, 'i').test(cleanText));
    
    let rawObject = "";

    if (nounObj) {
        rawObject = nounObj.khowar_raw || nounObj.khowar;
    } else {
        // Fallback to Adverbs dataset (e.g., "here", "there")
        const sortedAdverbs = [...adverbs].sort((a, b) => (b.english || b.word || "").length - (a.english || a.word || "").length);
        const adverbObj = sortedAdverbs.find(a => {
            const engKey = a.english || a.word;
            return engKey && new RegExp(`\\b${engKey}\\b`, 'i').test(cleanText);
        });
        if (adverbObj) {
            rawObject = adverbObj.khowar_raw || adverbObj.khowar;
        }
    }

    // 2. Preposition / Postposition Suffix Lookup
    let rawPrepSuffix = "";
    if (rawObject) {
        const prepObj = preps.find(p => new RegExp(`\\b${p.english}\\b`, 'i').test(cleanText) && (p.suffix || p.khowar_raw || p.khowar));
        if (prepObj) {
            rawPrepSuffix = prepObj.suffix || prepObj.khowar_raw || prepObj.khowar;
        }
    }

    // 3. Verb Lookup (Matches initial action verb)
    const verbObj = verbs.find(v => {
        if (!v.english) return false;
        if (typeof v.english === 'string') {
            return words.includes(v.english.toLowerCase().replace(/^to\s+/, ''));
        }
        const baseFirst = (v.english.first || "").toLowerCase().replace(/^to\s+/, '');
        return words.includes(baseFirst);
    });

    // Extract the explicit imperative command form from verbObj
    let rawVerb = "";
    if (verbObj) {
        if (verbObj.imperative) {
            rawVerb = Array.isArray(verbObj.imperative) ? verbObj.imperative[0] : verbObj.imperative;
        } else {
            rawVerb = verbObj.khowar_base || verbObj.khowar_raw || "";
        }
    }

    // 4. Combine Object and Preposition Suffix
    let objectPrepCombined = rawObject;
    if (rawPrepSuffix) {
        if (rawPrepSuffix.startsWith("-")) {
            objectPrepCombined = `${rawObject}${rawPrepSuffix}`;
        } else {
            objectPrepCombined = `${rawObject} ${rawPrepSuffix}`;
        }
    }

    // 5. Assembly: [Object/Adverb] [no (if negative)] [Verb]
    const negParticle = isNegativeCmd ? "no" : "";
    const rawSentence = [objectPrepCombined, negParticle, rawVerb].filter(Boolean).join(" ");

    console.log(`🔍 [ImperativeEngine] Query: "${inputText}" | IsNegative: ${isNegativeCmd} | Object: "${rawObject}" | Command Verb: "${rawVerb}"`);

    // 6. Apply Glyph Formatting
    if (typeof formatKhowarText === 'function') {
        return formatKhowarText(rawSentence);
    }
    
    return rawSentence;
}