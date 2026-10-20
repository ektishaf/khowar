// =============================================================
// ENGINES & ROUTER (engines/router.js)
// =============================================================

/**
 * Master Entry Point for English to Khowar translation
 */
function translateEnglishToKhowar(inputText) {
    const cleanInput = inputText.trim().toLowerCase();

    const directionSelect = document.getElementById('directionSelect');
    const direction = directionSelect ? directionSelect.value : 'en-to-kh';
   
    // If Khowar to English is selected, handle it via the reverse engine
    if (direction === 'kh-to-en') {
       
        if (typeof translateKhowarToNumber === 'function') {
           
                const numResult = translateKhowarToNumber(cleanInput);
                console.log("numResuolt: " + numResult);
                if (numResult != null) {
                    return numResult.toString();
                }
        }
    }

    // Counting Engine (Numbers & Digits)
    if (typeof parseEnglishNumberWord === 'function' && typeof translateNumberToKhowar === 'function') {
        const parsedNumber = parseEnglishNumberWord(cleanInput);
        if (parsedNumber !== null) {
            const khowarNum = translateNumberToKhowar(parsedNumber);
            if (khowarNum) {
                return formatKhowarText(khowarNum);
            }
        }
    }

    // Check for Compound Sentences first (split by coordinating conjunctions)
    return translateCompoundEnglishToKhowar(inputText);
}

/**
 * Traffic Controller: Decides if a single clause is Interrogative, Command, or Tense sentence
 */
function translateImperativeOrSimple(inputText) {
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];

    // Check if sentence starts with negative command ("don't" or "do not")
    const isNegativeCmd = /^(don'?t|do\s+not)\s+/i.test(inputText.trim());

    // Check Imperative Engine FIRST if it's a negative command or direct action
    if (typeof isImperativeSentence === 'function' && isImperativeSentence(inputText, verbs, pronouns)) {
        return buildImperativeKhowarSentence(inputText);
    }

    // Check for Interrogative Questions (Wh- words or Yes/No auxiliaries / '?'), 
    // strictly skipping negative imperative commands ("do not" / "don't")
    if (!isNegativeCmd && typeof isInterrogative === 'function' && isInterrogative(inputText)) {
        return translateInterrogative(inputText, buildKhowarSentence);
    }
    
    // Default fallback to core Tenses Engine
    return buildKhowarSentence(inputText);
}