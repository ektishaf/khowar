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
    if (!inputText || !inputText.trim()) {
        return "";
    }
    
    const originalWords = inputText.trim().split(/\s+/); // Preserves original casing for Proper Name detection
    const cleanText = inputText.toLowerCase().replace(/['"]/g, '');
    const words = cleanText.split(/\s+/);

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];
    const adjectives = typeof adjectivesData !== 'undefined' ? adjectivesData : [];
    const adverbs = typeof adverbsData !== 'undefined' ? adverbsData : [];

    // Auxiliary lead-ins for question detection and subject filter
    const auxLeadIns = ["do", "does", "did", "is", "am", "are", "was", "were", "has", "have", "had", "will", "shall", "can", "could", "should", "would"];

    // -------------------------------------------------------------
    // INTERROGATIVE DETECTION (Yes/No Question Detection)
    // -------------------------------------------------------------
    const isQuestion = inputText.trim().endsWith("?") || 
        new RegExp(`^(${auxLeadIns.join("|")})\\b`, 'i').test(inputText.trim());

    // -------------------------------------------------------------
    // COMPREHENSIVE NEGATIVE DETECTION (All 12 Tenses + Modals & Shortforms)
    // Supports standard forms + apostrophe forms + apostrophe-less contractions
    // -------------------------------------------------------------
    const negativeTokens = [
        "not", "no",
        // Present Simple / Past Simple / Continuous / Perfect Auxiliaries
        "dont", "don't", "doesnt", "doesn't", "didnt", "didn't",
        "isnt", "isn't", "arent", "aren't", "amnot", "am not",
        "wasnt", "wasn't", "werent", "weren't",
        "hasnt", "hasn't", "havent", "haven't", "hadnt", "hadn't",
        // Future / Modals / Conditional Auxiliaries
        "wont", "won't", "willnot", "will not", "shant", "shan't", "shallnot", "shall not",
        "cant", "can't", "cannot", "couldnt", "couldn't",
        "shouldnt", "shouldn't", "wouldnt", "wouldn't", "mightnot", "mustnot"
    ];

    const isNegative = words.some(w => negativeTokens.includes(w)) || 
                       inputText.toLowerCase().split(/\s+/).some(w => negativeTokens.includes(w));

    // -------------------------------------------------------------
    // ADDITIONAL: Helper for Degree Modifiers (Comparative/Superlative)
    // -------------------------------------------------------------
    function resolveAdjective(word) {
        if (!word) return "";
        let isGraded = false;
        let baseWord = word.toLowerCase();

        if (baseWord.endsWith("er") || baseWord.endsWith("est") || baseWord.startsWith("more ") || baseWord.startsWith("most ")) {
            isGraded = true;
            baseWord = baseWord.replace(/^(more|most)\s+/, '').replace(/(er|est)$/, '');
        }

        const adjObj = adjectives.find(a => a.english.toLowerCase() === baseWord);
        if (!adjObj) return "";
        return isGraded ? `bo ${adjObj.khowar_raw}` : adjObj.khowar_raw;
    }

    // Helper to check if a verb base/past/participle matches a token
    function isVerbToken(token) {
        return verbs.some(v => {
            const base = v.english && v.english.first ? v.english.first.toLowerCase() : "";
            const past = v.english && v.english.second ? v.english.second.toLowerCase() : "";
            const third = v.english && v.english.third ? v.english.third.toLowerCase() : "";
            return token === base || token === past || token === third || 
                   token === base + "s" || token === base + "es" || token === base + "ing" ||
                   (base.endsWith('e') && token === base.slice(0, -1) + "ing") ||
                   (base === "go" && (token === "goes" || token === "went" || token === "going"));
        });
    }

    // -------------------------------------------------------------
    // ANCHOR: Find the FIRST verb token (auxiliary or main verb)
    // -------------------------------------------------------------
    let rawAdjective = "";
    let rawAdverb = "";

    // Find the index of the VERY FIRST verb token in the sentence
    const firstVerbIndex = words.findIndex(w => isVerbToken(w));

    if (firstVerbIndex !== -1) {
        // -------------------------------------------------------------
        // PASS 1: BACKWARD SCAN FROM FIRST VERB TOKEN (For Adjective)
        // -------------------------------------------------------------
        // Position relative to first verb:
        // [firstVerbIndex - 1] = Subject (e.g., "Samina")
        // [firstVerbIndex - 2] = Potential Adjective (e.g., "fast")
        if (firstVerbIndex >= 2) {
            const candidateAdjWord = words[firstVerbIndex - 2];
            const matchedAdj = adjectives.find(a => a.english.toLowerCase() === candidateAdjWord);
            
            if (matchedAdj) {
                rawAdjective = resolveAdjective(matchedAdj.english);
            }
        }

        // -------------------------------------------------------------
        // PASS 2: FORWARD SCAN FROM VERB COMPLEX (For Adverb)
        // -------------------------------------------------------------
        // Find the end of the verb group so we scan rightward after all verbs
        let lastVerbIndex = firstVerbIndex;
        for (let i = firstVerbIndex + 1; i < words.length; i++) {
            if (isVerbToken(words[i])) {
                lastVerbIndex = i;
            } else {
                break;
            }
        }

        // Scan strictly for adverbs from the end of the verb group to the end of the sentence
        for (let i = lastVerbIndex + 1; i < words.length; i++) {
            const currentWord = words[i];
            const advMatch = adverbs.find(a => a.english.toLowerCase() === currentWord);

            if (advMatch) {
                rawAdverb = advMatch.khowar_raw;
                break; // Stop at first matching adverb
            }
        }
    }

    // -------------------------------------------------------------
    // EXTENDED: Subject Lookup (Proper Names First, then Pronouns)
    // EXCLUDES Auxiliary verbs like "Does", "Do", "Did", "Is", "Will"
    // -------------------------------------------------------------
    let rawSubject = "";
    let personKey = "3s"; // Default for proper names

    // 1. Check for Proper Names / Capitalized words first
    const potentialName = originalWords.find(w => {
        const clean = w.toLowerCase().replace(/['"]/g, '');
        // Make sure it's capitalized and not a stray single-letter pronoun like "I" or an auxiliary lead-in
        const isCapitalized = w[0] === w[0].toUpperCase();

        const isNoun = nouns.some(n => n.english && n.english.toLowerCase() === clean);
        const isPronoun = pronouns.some(p => p.english.toLowerCase() === clean);
        const isVerb = verbs.some(v => v.english && (v.english.first === clean || v.english.second === clean));
        const isPrep = preps.some(p => p.english.toLowerCase() === clean);
        const isAuxiliary = auxLeadIns.includes(clean);
        
        return isCapitalized && clean !== "i" && !isNoun && !isPronoun && !isVerb && !isPrep && !isAuxiliary;
    });

    if (potentialName) {
        // Found a proper name (e.g. "Samina")
        rawSubject = potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
        personKey = "3s"; // Proper name uses 3rd person singular conjugation
    } else {
        // 2. Fall back to Pronoun lookup if no proper name exists
        const sortedPronouns = [...pronouns].sort((a, b) => b.english.length - a.english.length);
        const pronounObj = sortedPronouns.find(p => {
            // Match whole word to avoid partial substring collisions
            const regex = new RegExp(`\\b${p.english}\\b`, 'i');
            return regex.test(cleanText);
        });

        if (pronounObj) {
            rawSubject = pronounObj.khowar_raw;
            personKey = pronounObj.person || (["he", "she", "it"].includes(pronounObj.english) ? "3s" : (pronounObj.english === "we" ? "we" : "1s"));
        } else {
            personKey = "1s"; // Ultimate fallback
        }
    }

    // Bind Adjective to Subject if Subject exists and no separate Object Adjective is set
    if (rawAdjective && rawSubject) {
        rawSubject = `${rawAdjective} ${rawSubject}`;
    }

    // -------------------------------------------------------------
    // EXTENDED: Object Noun Lookup + Separate Preposition Token
    // -------------------------------------------------------------
    // Sort nouns by length descending (Greedy / Longest-Match First)
    const sortedNouns = [...nouns].sort((a, b) => b.english.length - a.english.length);
    const nounObj = sortedNouns.find(n => {
        const regex = new RegExp(`\\b${n.english}\\b`, 'i');
        return regex.test(cleanText);
    });
    
    let rawObject = nounObj ? nounObj.khowar_raw : "";

    // ADDITIONAL FALLBACK: If no subject/pronoun or noun matched, check for Proper Names
    if (!rawSubject && !rawObject) {
        const fallbackName = originalWords.find(w => {
            const clean = w.toLowerCase().replace(/['"]/g, '');

            const isPronoun = pronouns.some(p => p.english.toLowerCase() === clean);
            const isVerb = verbs.some(v => v.english && (v.english.first === clean || v.english.second === clean));
            const isPrep = preps.some(p => p.english.toLowerCase() === clean);
            const isAdv = adverbs.some(a => a.english.toLowerCase() === clean);
            const isAuxiliary = auxLeadIns.includes(clean);
            return w[0] === w[0].toUpperCase() && !isPronoun && !isVerb && !isPrep && !isAdv && !isAuxiliary;
        });

        if (fallbackName) {
            rawSubject = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
        }
    }

    // Keep Preposition/Postposition Suffix as a SEPARATE TOKEN
    let rawPrepSuffix = "";
    if (rawObject) {
        const prepObj = preps.find(p => {
            const regex = new RegExp(`\\b${p.english}\\b`, 'i');
            return regex.test(cleanText) && (p.suffix || p.khowar_raw);
        });
        if (prepObj) {
            rawPrepSuffix = prepObj.suffix || prepObj.khowar_raw; // Standalone token (e.g., "ot")
        }
    }

    // -------------------------------------------------------------
    // EXISTING: Verb Lookup & Conjugation
    // -------------------------------------------------------------
    const verbObj = verbs.find(v => {
        const base = v.english && v.english.first ? v.english.first.toLowerCase() : "";
        const past = v.english && v.english.second ? v.english.second.toLowerCase() : "";
        const pastParticiple = v.english && v.english.third ? v.english.third.toLowerCase() : "";

        return words.some(w => 
            w === base || w === past || w === pastParticiple || 
            w === base + "s" || w === base + "es" || w === base + "ing" ||
            (base.endsWith('e') && w === base.slice(0, -1) + "ing") ||
            (base === "go" && (w === "goes" || w === "went" || w === "going"))
        );
    });

    let rawVerb = "";
    if (verbObj) {
        const tenseIdx = typeof getTenseIndex === 'function' ? getTenseIndex(words, verbObj) : 0;
        const personConjugations = verbObj[personKey] || 
            (personKey === "3s" ? (verbObj["3s"] || verbObj.he || verbObj.she || verbObj.it) : null) || 
            (personKey === "2s" ? (verbObj["2s"] || verbObj.you) : null) ||
            verbObj["1s"] || verbObj["i"];

        if (personConjugations && personConjugations[tenseIdx]) {
            rawVerb = personConjugations[tenseIdx];
        }
    }

    // Appending "a" to verb for interrogatives (e.g. "biran" -> "birana")
    if (isQuestion && rawVerb) {
        rawVerb = rawVerb + "a";
    }

    // -------------------------------------------------------------
    // EXTENDED: Negative Token Lookup
    // -------------------------------------------------------------
    let rawNegativeToken = "";
    if (isNegative) {
        const notObj = preps.find(p => p.english.toLowerCase() === "not" || p.english.toLowerCase() === "no");
        rawNegativeToken = notObj ? notObj.khowar_raw : "no";
    }

    // -------------------------------------------------------------
    // EXTENDED: Sentence Assembly (Khowar SOV Order)
    // [Subject] [Object] [Preposition] [Adverb] [Negative] [Verb]
    // -------------------------------------------------------------
    const rawSentence = [
        rawSubject, 
        rawObject, 
        rawPrepSuffix, 
        rawAdverb, 
        rawNegativeToken, 
        rawVerb
    ].filter(Boolean).join(" ");

    return formatKhowarText(rawSentence);
}

// Builds English SVO Sentences
function buildEnglishSentence(inputText) {
    const rawText = unformatKhowarText(inputText.trim());
    const words = rawText.split(/\s+/).map(w => w.replace(/['"]/g, ''));

    const nouns = typeof nounsData !== 'undefined' ? nounsData : [];
    const pronouns = typeof pronounsData !== 'undefined' ? pronounsData : [];
    const preps = typeof prepositionsData !== 'undefined' ? prepositionsData : [];
    const verbs = typeof verbsData !== 'undefined' ? verbsData : [];
    const adjectives = typeof adjectivesData !== 'undefined' ? adjectivesData : [];
    const adverbs = typeof adverbsData !== 'undefined' ? adverbsData : [];

    let enSubject = "";
    let enSubjectAdj = "";
    let enVerb = "";
    let enObject = "";
    let enAdverb = "";
    let prepPrefix = "";
    let isQuestion = inputText.trim().endsWith("?");

    // Detect Khowar negative token ("no" or "be")
    const isNegative = words.some(w => w.toLowerCase() === "no" || w.toLowerCase() === "be");

    // -------------------------------------------------------------
    // Adjective & Adverb Lookups
    // -------------------------------------------------------------
    for (const adv of adverbs) {
        if (adv.khowar_raw && words.some(w => w.toLowerCase() === adv.khowar_raw.toLowerCase())) {
            enAdverb = adv.english;
            break;
        }
    }

    for (const adj of adjectives) {
        if (!adj.khowar_raw) continue;
        if (rawText.toLowerCase().includes(`bo ${adj.khowar_raw.toLowerCase()}`)) {
            enSubjectAdj = `more ${adj.english}`;
            break;
        } else if (words.some(w => w.toLowerCase() === adj.khowar_raw.toLowerCase())) {
            enSubjectAdj = adj.english;
            break;
        }
    }

    // -------------------------------------------------------------
    // Pronoun Lookup based on your exact pronounsData structure
    // -------------------------------------------------------------
    const pronounObj = pronouns.find(p => p.khowar_raw && words.some(w => w.toLowerCase() === p.khowar_raw.toLowerCase()));
    if (pronounObj) {
        enSubject = pronounObj.english;
    }

    // -------------------------------------------------------------
    // Object Noun & Standalone Preposition Lookup
    // -------------------------------------------------------------
    for (const noun of nouns) {
        if (noun.khowar_raw && words.some(w => w.toLowerCase() === noun.khowar_raw.toLowerCase())) {
            enObject = noun.english;
            break;
        }
    }

    // Standalone preposition match (matches "o[tl]", "ar", "i", "sora", etc.)
    // Exclude "no" / "be" so negative tokens don't match as locative prepositions
    const prepMatch = preps.find(p => {
        const token = (p.suffix || p.khowar_raw || "").toLowerCase();
        if (token === "no" || token === "be") return false;
        return token && (words.some(w => w.toLowerCase() === token) || rawText.toLowerCase().includes(token));
    });
    
    if (prepMatch) {
        prepPrefix = prepMatch.english;
    }

    // Proper Name Fallback for Subject
    if (!enSubject) {
        const potentialName = words.find(w => {
            const clean = w.replace(/[-_.,!?]/g, '');
            const isCapitalized = clean && clean[0] === clean[0].toUpperCase();
            const lowerClean = clean.toLowerCase();

            const isKnownNoun = nouns.some(n => n.khowar_raw.toLowerCase() === lowerClean);
            const isKnownAdv = adverbs.some(a => a.khowar_raw.toLowerCase() === lowerClean);
            const isKnownAdj = adjectives.some(a => a.khowar_raw.toLowerCase() === lowerClean);
            const isKnownPrep = preps.some(p => (p.suffix || p.khowar_raw || "").toLowerCase() === lowerClean);
            
            return isCapitalized && !isKnownNoun && !isKnownAdv && !isKnownAdj && !isKnownPrep;
        });

        if (potentialName) {
            enSubject = potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
        }
    }

    // -------------------------------------------------------------
    // Verb Lookup & Tense Rules (0-11) + Negation & Interrogative Stripping
    // -------------------------------------------------------------
    const personKeys = ["he", "she", "it", "i", "we", "you", "they"];

    for (const verb of verbs) {
        for (const personKey of personKeys) {
            const conjugations = verb[personKey];

            if (conjugations) {
                // Check direct conjugation OR conjugation + interrogative suffix "a" (e.g. "bimana" -> "biman")
                const tenseIdx = conjugations.findIndex(c => {
                    if (!c) return false;
                    const cLower = c.toLowerCase();
                    return words.some(w => {
                        const wLower = w.toLowerCase();
                        if (wLower === cLower) return true;
                        if (wLower === cLower + "a") {
                            isQuestion = true;
                            return true;
                        }
                        return false;
                    });
                });

                if (tenseIdx !== -1) {
                    const base = verb.english.first; // e.g. "go"
                    const past = verb.english.second || base + "ed"; // "went"
                    const participle = verb.english.third || past; // "gone"
                    
                    // If subject is a Proper Name (e.g., "Samina") OR personKey is he/she/it, treat as 3rd person singular
                    const isThirdPersonSingular = ["he", "she", "it"].includes(personKey) || (enSubject && !["I", "you", "we", "they"].includes(enSubject.toLowerCase()));

                    const subject = (enSubject || "").toLowerCase();
                    const usesHave = isThirdPersonSingular && subject !== "they";
                    const bePresent = isThirdPersonSingular ? "is" : (personKey === "i" ? "am" : "are");
                    const bePast = (personKey === "i" || isThirdPersonSingular) ? "was" : "were";
                    
                    // Standard gerund formatting ("go" -> "going", "make" -> "making")
                    const gerund = base.endsWith("e") && !base.endsWith("ee") && base !== "go" ? base.slice(0, -1) + "ing" : base + "ing";

                    // Present Simple Helper for 3rd Person Singular ("go" -> "goes", "run" -> "runs", "pass" -> "passes")
                    const getThirdPersonPresent = (verbBase) => {
                        if (verbBase === "go") return "goes";
                        if (verbBase === "do") return "does";
                        if (verbBase === "have") return "has";
                        if (/[s|x|z|ch|sh]$/.test(verbBase) || verbBase.endsWith("o")) {
                            return verbBase + "es";
                        }
                        return verbBase + "s";
                    };

                    if (isNegative) {
                        const doAux = isThirdPersonSingular ? "does not" : "do not";
                        const haveAux = usesHave ? "has not" : "have not";

                        switch (tenseIdx) {
                            case 0: enVerb = `${doAux} ${base}`; break;                 // e.g. "does not go"
                            case 1: enVerb = `${bePresent} not ${gerund}`; break;         // e.g. "is not going"
                            case 2: enVerb = `${haveAux} ${participle}`; break;           // e.g. "has not gone"
                            case 3: enVerb = `${haveAux} been ${gerund}`; break;          // e.g. "has not been going"
                            case 4: enVerb = `did not ${base}`; break;                   // e.g. "did not go"
                            case 5: enVerb = `${bePast} not ${gerund}`; break;            // e.g. "was not going"
                            case 6: enVerb = `had not ${participle}`; break;              // e.g. "had not gone"
                            case 7: enVerb = `had not been ${gerund}`; break;             // e.g. "had not been going"
                            case 8: enVerb = `will not ${base}`; break;                  // e.g. "will not go"
                            case 9: enVerb = `will not be ${gerund}`; break;             // e.g. "will not be going"
                            case 10: enVerb = `will not have ${participle}`; break;       // e.g. "will not have gone"
                            case 11: enVerb = `will not have been ${gerund}`; break;      // e.g. "will not have been going"
                            default: enVerb = `${doAux} ${base}`;
                        }
                    } else {
                        switch (tenseIdx) {
                            case 0: 
                                enVerb = isThirdPersonSingular ? getThirdPersonPresent(base) : base; 
                                break;
                            case 1: enVerb = bePresent + " " + gerund; break;
                            case 2: enVerb = (usesHave ? "has" : "have") + " " + participle; break;
                            case 3: enVerb = (usesHave ? "has" : "have") + " been " + gerund; break;
                            case 4: enVerb = past; break;
                            case 5: enVerb = bePast + " " + gerund; break;
                            case 6: enVerb = "had " + participle; break;
                            case 7: enVerb = "had been " + gerund; break;
                            case 8: enVerb = "will " + base; break;
                            case 9: enVerb = "will be " + gerund; break;
                            case 10: enVerb = "will have " + participle; break;
                            case 11: enVerb = "will have been " + gerund; break;
                            default: enVerb = base;
                        }
                    }

                    if (!enSubject) {
                        const subjectLabels = { i: "I", we: "we", you: "you", they: "they", he: "he", she: "she", it: "it" };
                        enSubject = subjectLabels[personKey] || personKey;
                    }
                    break;
                }
            }
        }
        if (enVerb) break;
    }

    // -------------------------------------------------------------
    // INTERROGATIVE FORMATTING (English Aux Inversion for Questions)
    // -------------------------------------------------------------
    if (isQuestion && enVerb) {
        const subjNorm = enSubject.toLowerCase();
        const isThirdPerson = subjNorm !== "i" && subjNorm !== "you" && subjNorm !== "we" && subjNorm !== "they";

        if (!isNegative) {
            if (enVerb === "go" || enVerb === "goes") {
                const aux = isThirdPerson ? "Does" : "Do";
                enVerb = "go";
                enSubject = `${aux} ${enSubject}`;
            } else if (enVerb.startsWith("is ") || enVerb.startsWith("am ") || enVerb.startsWith("are ")) {
                const parts = enVerb.split(" ");
                enSubject = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${enSubject}`;
                enVerb = parts.slice(1).join(" ");
            } else if (enVerb === "went") {
                enSubject = `Did ${enSubject}`;
                enVerb = "go";
            } else if (enVerb.startsWith("will ")) {
                enSubject = `Will ${enSubject}`;
                enVerb = enVerb.slice(5);
            }
        }
    }

    const fullSubject = [enSubjectAdj, enSubject].filter(Boolean).join(" ");
    let finalSentence = [fullSubject, enVerb, enAdverb, prepPrefix, enObject].filter(Boolean).join(" ");

    if (isQuestion && !finalSentence.endsWith("?")) {
        finalSentence += "?";
    }

    return finalSentence;
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
            const inputWords = cleanQuery.toLowerCase().split(/\s+/);
            const availableVerbs = typeof verbsData !== "undefined" ? verbsData : [];
            const hasRecognizedVerb = direction === "en-to-kh" && availableVerbs.some(v => {
                const base = v.english.first ? v.english.first.toLowerCase() : "";
                const past = v.english.second ? v.english.second.toLowerCase() : "";
                const participle = v.english.third ? v.english.third.toLowerCase() : "";
                return inputWords.some(word =>
                    word === base || word === past || word === participle ||
                    word === base + "s" || word === base + "es" || word === base + "ing" ||
                    (base.endsWith("e") && word === base.slice(0, -1) + "ing")
                );
            });

            if (!hasRecognizedVerb) {
                return direction === "en-to-kh" ? formatKhowarText(exactSentence.khowar_raw) : exactSentence.english_text;
            }
        }
    }    const words = cleanQuery.split(/\s+/);
    if (words.length > 1 || direction === "kh-to-en") {
        return direction === "en-to-kh" ? buildKhowarSentence(cleanQuery) : buildEnglishSentence(cleanQuery);
    }

    return translateWord(cleanQuery, direction);
}

// Inside your tensesEngine.js / sentence parsing logic:

function parseAndTranslateSentence(sentenceText) {
    const tokens = sentenceText.trim().split(/\s+/);
    
    let subject = "";
    let verb = "";
    let object = "";
    let adjective = "";
    let adverb = "";

    // Let's analyze token positions
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i].toLowerCase();

        // 1. Check if this token is an Adjective (Position check: usually appears before a noun/subject)
        // If "fast" is at index 0 and followed by a noun, it's modifying the noun.
        if (i < tokens.length - 1 && isNoun(tokens[i + 1])) {
            const adjMatch = adjectivesData.find(a => a.english.toLowerCase() === token);
            if (adjMatch) {
                adjective = adjMatch.khowar_raw;
                continue; // Skip further checks for this token since it's claimed as an adjective
            }
        }

        // 2. Check if this token is an Adverb (Position check: usually appears right before or after the verb)
        if (isNearVerb(tokens, i)) {
            const advMatch = adverbsData.find(a => a.english.toLowerCase() === token);
            if (advMatch) {
                adverb = advMatch.khowar_raw;
                continue;
            }
        }

        // 3. Standard checks for Nouns, Verbs, Pronouns...
        // ... your existing logic for Samina, goes, school, etc.
    }

    // Assemble final Khowar structure using your grammar rules
    return assembleKhowarSentence({ adjective, subject, object, verb, adverb });
}

// Helper to check if a word is positioned near the verb
function isNearVerb(tokens, index) {
    // If it's right before the verb (e.g., "fast goes") or after
    // You can expand this based on your verb lookup array
    const verbs = typeof verbsData !== 'undefined' ? verbsData.map(v => v.english.toLowerCase()) : [];
    
    const nextWord = tokens[index + 1] ? tokens[index + 1].toLowerCase() : "";
    const prevWord = tokens[index - 1] ? tokens[index - 1].toLowerCase() : "";

    return verbs.includes(nextWord) || verbs.includes(prevWord);
}

function isNoun(word) {
    const nouns = typeof nounsData !== 'undefined' ? nounsData.map(n => n.english.toLowerCase()) : [];
    // Also include proper nouns / known subjects if tracked
    return nouns.includes(word) || word === "samina" || word === "ali";
}