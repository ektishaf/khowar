// data/conjunctions.js
const conjunctionsData = [
    // -------------------------------------------------------------
    // 1. COORDINATING CONJUNCTIONS (FANBOYS - Compound Sentences)
    // -------------------------------------------------------------
    { "id": "c001", "english": "and", "type": "coordinating", "khowar_raw": "wa" },
    { "id": "c002", "english": "but", "type": "coordinating", "khowar_raw": "magam" },
    { "id": "c003", "english": "or", "type": "coordinating", "khowar_raw": "ya" },
    { "id": "c004", "english": "nor", "type": "coordinating", "khowar_raw": "na" },
    { "id": "c005", "english": "for", "type": "coordinating", "khowar_raw": "bachen" },
    { "id": "c006", "english": "yet", "type": "coordinating", "khowar_raw": "hanisen" },
    { "id": "c007", "english": "so", "type": "coordinating", "khowar_raw": "biko" },

    // -------------------------------------------------------------
    // 2. SUBORDINATING CONJUNCTIONS (Complex Sentences)
    // -------------------------------------------------------------
    // Cause & Reason
    { "id": "c008", "english": "because", "type": "subordinating", "khowar_raw": "koreko" },
    { "id": "c009", "english": "since", "type": "subordinating", "khowar_raw": "" },
    { "id": "c010", "english": "as", "type": "subordinating", "khowar_raw": "" },
    { "id": "c011", "english": "so that", "type": "subordinating", "khowar_raw": "koreko" },

    // Time & Temporal
    { "id": "c012", "english": "when", "type": "subordinating", "khowar_raw": "kia wa[kh][tl]" },
    { "id": "c013", "english": "whenever", "type": "subordinating", "khowar_raw": "" },
    { "id": "c014", "english": "while", "type": "subordinating", "khowar_raw": "" },
    { "id": "c015", "english": "before", "type": "subordinating", "khowar_raw": "prushti" },
    { "id": "c016", "english": "after", "type": "subordinating", "khowar_raw": "acha" },
    { "id": "c017", "english": "until", "type": "subordinating", "khowar_raw": "" },
    { "id": "c018", "english": "till", "type": "subordinating", "khowar_raw": "" },
    { "id": "c019", "english": "as soon as", "type": "subordinating", "khowar_raw": "[sh]awar [sh]ao" },
    { "id": "c020", "english": "as long as", "type": "subordinating", "khowar_raw": "" },
    { "id": "c021", "english": "once", "type": "subordinating", "khowar_raw": "e" },

    // Condition
    { "id": "c022", "english": "if", "type": "subordinating", "khowar_raw": "ki" },
    { "id": "c023", "english": "unless", "type": "subordinating", "khowar_raw": "" },
    { "id": "c024", "english": "provided that", "type": "subordinating", "khowar_raw": "" },
    { "id": "c025", "english": "even if", "type": "subordinating", "khowar_raw": "" },
    { "id": "c026", "english": "in case", "type": "subordinating", "khowar_raw": "" },

    // Contrast & Concession
    { "id": "c027", "english": "although", "type": "subordinating", "khowar_raw": "" },
    { "id": "c028", "english": "though", "type": "subordinating", "khowar_raw": "" },
    { "id": "c029", "english": "even though", "type": "subordinating", "khowar_raw": "" },
    { "id": "c030", "english": "whereas", "type": "subordinating", "khowar_raw": "" },
    { "id": "c031", "english": "while", "type": "subordinating", "khowar_raw": "" },

    // Relative & Complementizers
    { "id": "c032", "english": "that", "type": "subordinating", "khowar_raw": "" },
    { "id": "c033", "english": "whether", "type": "subordinating", "khowar_raw": "" },
    { "id": "c034", "english": "as if", "type": "subordinating", "khowar_raw": "" },
    { "id": "c035", "english": "as though", "type": "subordinating", "khowar_raw": "" },

    // -------------------------------------------------------------
    // 3. CORRELATIVE CONJUNCTIONS (Paired Conjunctions)
    // -------------------------------------------------------------
    { "id": "c036", "english": "either ... or", "type": "correlative", "part1": "either", "part2": "or", "khowar_raw_part1": "", "khowar_raw_part2": "" },
    { "id": "c037", "english": "neither ... nor", "type": "correlative", "part1": "neither", "part2": "nor", "khowar_raw_part1": "", "khowar_raw_part2": "" },
    { "id": "c038", "english": "both ... and", "type": "correlative", "part1": "both", "part2": "and", "khowar_raw_part1": "", "khowar_raw_part2": "" },
    { "id": "c039", "english": "not only ... but also", "type": "correlative", "part1": "not only", "part2": "but also", "khowar_raw_part1": "", "khowar_raw_part2": "" },
    { "id": "c040", "english": "whether ... or", "type": "correlative", "part1": "whether", "part2": "or", "khowar_raw_part1": "", "khowar_raw_part2": "" },

    // -------------------------------------------------------------
    // 4. CONJUNCTIVE ADVERBS (Sentence Connectors)
    // -------------------------------------------------------------
    { "id": "c041", "english": "however", "type": "conjunctive_adverb", "khowar_raw": "kia [qh]esma" },
    { "id": "c042", "english": "therefore", "type": "conjunctive_adverb", "khowar_raw": "hey bachen" },
    { "id": "c043", "english": "moreover", "type": "conjunctive_adverb", "khowar_raw": "he[gh]ar achi" },
    { "id": "c044", "english": "furthermore", "type": "conjunctive_adverb", "khowar_raw": "he[gh]ar achi" },
    { "id": "c045", "english": "otherwise", "type": "conjunctive_adverb", "khowar_raw": "kino" },
    { "id": "c046", "english": "nevertheless", "type": "conjunctive_adverb", "khowar_raw": "" },
    { "id": "c047", "english": "meanwhile", "type": "conjunctive_adverb", "khowar_raw": "hania pat" },
    { "id": "c048", "english": "consequently", "type": "conjunctive_adverb", "khowar_raw": "e[gh]aria" },
    { "id": "c049", "english": "instead", "type": "conjunctive_adverb", "khowar_raw": "horosar" },
    { "id": "c050", "english": "besides", "type": "conjunctive_adverb", "khowar_raw": "jus[tl]a" }
];