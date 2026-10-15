// engines/interrogativeEngine.js

const WH_MAP = {
    "what": "kia",
    "where": "kora",
    "when": "kiana",
    "why": "kiaas",
    "who": "kaa",
    "how": "kylar"
};

const AUXILIARY_VERBS = new Set([
    "do", "does", "did", "is", "are", "am", "was", "were", "will", "can", "should", "would", "could"
]);

function isInterrogative(text) {
    if (!text || !text.trim()) return false;
    const trimmed = text.trim();
    if (trimmed.endsWith("?")) return true;

    const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
    return WH_MAP.hasOwnProperty(firstWord) || AUXILIARY_VERBS.has(firstWord);
}

/**
 * Resolves possessive noun phrases token by token (e.g., "your name" -> "[tl]a nam")
 */
function resolvePhrase(phrase) {
    if (!phrase || !phrase.trim()) return "";

    const possessives = typeof possessivesData !== 'undefined' ? possessivesData : [];
    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];

    const tokens = phrase.toLowerCase().trim().split(/\s+/);

    const resolved = tokens.map(token => {
        // 1. Check Possessives Dataset ("your" -> "[tl]a")
        const posMatch = possessives.find(p => (p.english || p.word || "").toLowerCase() === token);
        if (posMatch) {
            return posMatch.khowar_raw || posMatch.khowar;
        }

        // 2. Check Nouns Dataset ("name" -> "nam")
        const nounMatch = nouns.find(n => (n.english || n.word || "").toLowerCase() === token);
        if (nounMatch) {
            return nounMatch.khowar_raw || nounMatch.khowar;
        }

        // 3. Check Pronouns Dataset
        const proMatch = pronouns.find(pr => (pr.english || pr.word || "").toLowerCase() === token);
        if (proMatch) {
            return proMatch.khowar_raw || proMatch.khowar;
        }

        return token;
    });

    return resolved.join(" ");
}

function translateInterrogative(text, fallbackTranslateTense) {
    const cleanText = text.replace(/\?/g, "").trim();
    if (!cleanText) return "";

    const words = cleanText.split(/\s+/);
    const firstWord = words[0].toLowerCase();

    let finalResult = "";

    // -------------------------------------------------------------
    // CASE 1: Wh- Questions (e.g., "What is your name?")
    // -------------------------------------------------------------
    if (WH_MAP.hasOwnProperty(firstWord)) {
        const whKhowar = WH_MAP[firstWord];

        if (words.length === 1) {
            return formatKhowarText(whKhowar);
        }

        let restWords = words.slice(1);
        let wasCopulaIs = false;

        if (restWords.length > 0 && AUXILIARY_VERBS.has(restWords[0].toLowerCase())) {
            if (restWords[0].toLowerCase() === "is" || restWords[0].toLowerCase() === "are") {
                wasCopulaIs = true;
            }
            restWords = restWords.slice(1);
        }

        const baseDeclarative = restWords.join(" ").trim();
        
        if (!baseDeclarative) {
            return formatKhowarText(`${whKhowar} sher?`);
        }

        // Direct resolution for possessive/noun base phrases ("your name" -> "[tl]a nam")
        let khowarBase = resolvePhrase(baseDeclarative);
        
        // If resolvePhrase didn't match all tokens, fallback to tensesEngine
        if (!khowarBase || khowarBase === baseDeclarative) {
            const tenseResult = fallbackTranslateTense(baseDeclarative);
            if (tenseResult && tenseResult.trim()) {
                khowarBase = tenseResult;
            }
        }

        // Branch 1: State/Copula Query ("is / are") -> [Base] [Wh-Word] sher?
        if (wasCopulaIs) {
            finalResult = `${khowarBase} ${whKhowar} sher?`.replace(/\s+/g, " ").trim();
        } 
        // Branch 2: Action sentence with multiple tokens -> Insert Wh-word before terminal verb
        else {
            const baseTokens = khowarBase.trim().split(/\s+/);
            if (baseTokens.length > 1) {
                const terminalVerb = baseTokens.pop();
                finalResult = `${baseTokens.join(" ")} ${whKhowar} ${terminalVerb}?`.replace(/\s+/g, " ").trim();
            } else {
                finalResult = `${khowarBase} ${whKhowar}?`.replace(/\s+/g, " ").trim();
            }
        }

        return formatKhowarText(finalResult);
    }

    // -------------------------------------------------------------
    // CASE 2: Polar Yes/No Questions (e.g., "Does Samina go?")
    // -------------------------------------------------------------
    if (AUXILIARY_VERBS.has(firstWord)) {
        const baseDeclarative = words.slice(1).join(" ").trim();
        if (!baseDeclarative) return "";
        let khowarBase = fallbackTranslateTense(baseDeclarative) || resolvePhrase(baseDeclarative);
        return formatKhowarText(`${attachPolarQuestionSuffix(khowarBase)}?`);
    }

    // -------------------------------------------------------------
    // CASE 3: Fallback (Query ending with '?')
    // -------------------------------------------------------------
    let khowarBase = fallbackTranslateTense(cleanText) || resolvePhrase(cleanText);
    finalResult = `${attachPolarQuestionSuffix(khowarBase)}?`;
    
    return formatKhowarText(finalResult);
}

function attachPolarQuestionSuffix(khowarSentence) {
    if (!khowarSentence) return "";
    
    const tokens = khowarSentence.trim().split(/\s+/);
    let lastToken = tokens[tokens.length - 1];

    if (!lastToken.endsWith("a")) {
        lastToken += "a";
    }

    tokens[tokens.length - 1] = lastToken;
    return tokens.join(" ");
}