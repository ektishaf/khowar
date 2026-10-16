// =============================================================
// ENGINES & ROUTER (engines/router.js)
// =============================================================

/**
 * Master Entry Point for English to Khowar translation
 */
function translateEnglishToKhowar(inputText) {

    const cleanInput = inputText.trim().toLowerCase();

    // --- ADDITIVE HOOK: Counting Engine (Numbers & Digits) ---
    if (typeof parseEnglishNumberWord === 'function' && typeof translateNumberToKhowar === 'function') {
        const parsedNumber = parseEnglishNumberWord(cleanInput);
        if (parsedNumber !== null) {
            const khowarNum = translateNumberToKhowar(parsedNumber);
            if (khowarNum) {
                console.log("🔍 [Router] Number translated via Counting Engine.");
                return formatKhowarText(khowarNum);
            }
        }
    }

    // Step 1: Check for Compound Sentences first (split by coordinating conjunctions)
    return translateCompoundEnglishToKhowar(inputText);
}

/**
 * Traffic Controller: Decides if a single clause is Interrogative, Command, or Tense sentence
 */
function translateImperativeOrSimple(inputText) {
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];

    // Step 2: Complex Router (Placeholder for dependent clauses)

    // Check if sentence starts with negative command ("don't" or "do not")
    const isNegativeCmd = /^(don'?t|do\s+not)\s+/i.test(inputText.trim());

    // Step 3: Check Imperative Engine FIRST if it's a negative command or direct action
    if (typeof isImperativeSentence === 'function' && isImperativeSentence(inputText, verbs, pronouns)) {
        console.log("🔍 [Router] Routing to Imperative Engine...");
        return buildImperativeKhowarSentence(inputText);
    }

    // Step 4: Check for Interrogative Questions (Wh- words or Yes/No auxiliaries / '?'), 
    // strictly skipping negative imperative commands ("do not" / "don't")
    if (!isNegativeCmd && typeof isInterrogative === 'function' && isInterrogative(inputText)) {
        console.log("🔍 [Router] Routing to Interrogative Engine...");
        return translateInterrogative(inputText, buildKhowarSentence);
    }
    
    // Step 5: Default fallback to core Tenses Engine
    return buildKhowarSentence(inputText);
}