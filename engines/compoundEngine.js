// engines/compoundEngine.js

function translateCompoundEnglishToKhowar(inputText) {
    const conjunctions = typeof conjunctionsData !== 'undefined' ? conjunctionsData : [];
    const coordinatingConj = conjunctions.filter(c => c.type === "coordinating");
    
    console.log("🔍 [CompoundEngine] Loaded Coordinating Conjunctions Count:", coordinatingConj.length);

    if (coordinatingConj.length === 0) {
        return translateImperativeOrSimple(inputText);
    }

    // Extract English words for conjunctions (e.g., ["and", "but", "or", ...])
    const conjTokens = coordinatingConj.map(c => c.english.toLowerCase());

    // Create a safe case-insensitive regex without the global flag for testing
    const testRegex = new RegExp(`\\b(${conjTokens.join("|")})\\b`, 'i');

    console.log("🔍 [CompoundEngine] Input Text:", inputText);
    console.log("🔍 [CompoundEngine] Has Conjunction Match?", testRegex.test(inputText));

    if (!testRegex.test(inputText)) {
        return translateImperativeOrSimple(inputText);
    }

    // Split the text using a capturing split so the conjunction is kept in the array
    const splitRegex = new RegExp(`\\s+(${conjTokens.join("|")})\\s+`, 'i');
    const parts = inputText.split(splitRegex);

    console.log("🔍 [CompoundEngine] Split Parts:", parts);

    if (parts.length < 3) {
        return translateImperativeOrSimple(inputText);
    }

    let clauseA = parts[0].trim();
    let matchedConjWord = parts[1].trim().toLowerCase();
    let clauseB = parts[2].trim();

    // Find the Khowar translation for the conjunction
    const conjObj = coordinatingConj.find(c => c.english.toLowerCase() === matchedConjWord);
    const khowarConj = conjObj && conjObj.khowar_raw ? conjObj.khowar_raw : matchedConjWord;

    console.log(`🔗 [CompoundEngine] Clause A: "${clauseA}" | Conjunction: "${matchedConjWord}" -> "${khowarConj}" | Clause B: "${clauseB}"`);

    // Translate both independent clauses independently
    const translatedA = translateImperativeOrSimple(clauseA);
    const translatedB = translateImperativeOrSimple(clauseB);

    const finalResult = `${translatedA} ${khowarConj} ${translatedB}`;
    console.log("✨ [CompoundEngine] Final Combined Result:", finalResult);

    return finalResult;
}