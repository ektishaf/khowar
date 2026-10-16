// data/prepositions.js
const prepositionsData = [
  // --- Direction & Place ---
  { "id": "p001", "english": "to", "khowar_raw": "o[tl]" }, // suffix
  { "id": "p002", "english": "toward", "khowar_raw": "weti" },
  { "id": "p003", "english": "towards", "khowar_raw": "weti" },
  { "id": "p004", "english": "from", "khowar_raw": "ar" }, // suffix
  { "id": "p005", "english": "in", "khowar_raw": "a" }, // suffix
  { "id": "p006", "english": "inside", "khowar_raw": "an[dl]reni" },
  { "id": "p007", "english": "into", "khowar_raw": "o" }, // suffix
  { "id": "p008", "english": "on", "khowar_raw": "a" }, // suffix
  { "id": "p009", "english": "onto", "khowar_raw": "a" }, // suffix
  { "id": "p010", "english": "upon", "khowar_raw": "sora" },
  { "id": "p011", "english": "at", "khowar_raw": "a" }, // suffix

  // --- Negation ---
  { "id": "p012", "english": "not", "khowar_raw": "no" },
  { "id": "p013", "english": "no", "khowar_raw": "no" },
  { "id": "p014", "english": "without", "khowar_raw": "sar [gh]air" }, // suffix

  // --- Association & Manner ---
  { "id": "p015", "english": "with", "khowar_raw": "sum" }, // suffix
  { "id": "p016", "english": "by", "khowar_raw": "en" }, // suffix
  { "id": "p017", "english": "like", "khowar_raw": "[gh]on" },
  { "id": "p018", "english": "as", "khowar_raw": "[gh]on" },
  { "id": "p019", "english": "about", "khowar_raw": "bara" },
  { "id": "p020", "english": "regarding", "khowar_raw": "bara" },
  { "id": "p021", "english": "of", "khowar_raw": "o" }, // suffix

  // --- Position & Spatial ---
  { "id": "p022", "english": "above", "khowar_raw": "sora" },
  { "id": "p023", "english": "over", "khowar_raw": "teka" },
  { "id": "p024", "english": "under", "khowar_raw": "mu[lh]a" },
  { "id": "p025", "english": "underneath", "khowar_raw": "mu[lh]i" },
  { "id": "p026", "english": "below", "khowar_raw": "mu[lh]a" },
  { "id": "p027", "english": "beneath", "khowar_raw": "mu[lh]i" },
  { "id": "p028", "english": "behind", "khowar_raw": "acha" },
  { "id": "p029", "english": "in front of", "khowar_raw": "prushta" },
  { "id": "p030", "english": "ahead of", "khowar_raw": "prushti" },
  { "id": "p031", "english": "near", "khowar_raw": "[sh]oi" },
  { "id": "p032", "english": "nearby", "khowar_raw": "[sh]oi ro" },
  { "id": "p033", "english": "beside", "khowar_raw": "jus[tl]a" },
  { "id": "p034", "english": "next to", "khowar_raw": "nasa" },
  { "id": "p035", "english": "between", "khowar_raw": "muzha" },
  { "id": "p036", "english": "among", "khowar_raw": "muzhi" },
  { "id": "p037", "english": "amongst", "khowar_raw": "muzhi" },
  { "id": "p038", "english": "across", "khowar_raw": "phar" },
  { "id": "p039", "english": "beyond", "khowar_raw": "ni[sh]i" },
  { "id": "p040", "english": "opposite", "khowar_raw": "niro[gh]i" },

  // --- Movement ---
  { "id": "p041", "english": "through", "khowar_raw": "muzhen" },
  { "id": "p042", "english": "throughout", "khowar_raw": "mezhi" },
  { "id": "p043", "english": "along", "khowar_raw": "jus[tl]a" },
  { "id": "p044", "english": "around", "khowar_raw": "nasen" },
  { "id": "p045", "english": "round", "khowar_raw": "pindoru" },
  { "id": "p046", "english": "out", "khowar_raw": "beri" },
  { "id": "p047", "english": "outside", "khowar_raw": "beri" },
  { "id": "p048", "english": "out of", "khowar_raw": "beri" },
  { "id": "p049", "english": "off", "khowar_raw": "ban[dl]" },
  { "id": "p050", "english": "up", "khowar_raw": "ayh" },
  { "id": "p051", "english": "down", "khowar_raw": "af" },

  // --- Temporal / Time ---
  { "id": "p052", "english": "before", "khowar_raw": "prushti" },
  { "id": "p053", "english": "prior to", "khowar_raw": "prushti" },
  { "id": "p054", "english": "after", "khowar_raw": "achi" },
  { "id": "p055", "english": "during", "khowar_raw": "muzhi" },
  { "id": "p056", "english": "since", "khowar_raw": "ar" },
  { "id": "p057", "english": "until", "khowar_raw": "pa[tl]" },
  { "id": "p058", "english": "till", "khowar_raw": "pa[tl]" },
  { "id": "p059", "english": "for", "khowar_raw": "bach" },
  { "id": "p060", "english": "past", "khowar_raw": "bo[gh][dl]u" },
  { "id": "p061", "english": "within", "khowar_raw": "muzho" },

  // --- Cause, Manner & Logical ---
  { "id": "p062", "english": "because of", "khowar_raw": "punika" },
  { "id": "p063", "english": "due to", "khowar_raw": "punika" },
  { "id": "p064", "english": "besides", "khowar_raw": "jus[tl]a" },
  { "id": "p065", "english": "apart from", "khowar_raw": "he[gh]ar achi" },
  { "id": "p066", "english": "despite", "khowar_raw": "he[gh]ar achi" },
  { "id": "p067", "english": "in spite of", "khowar_raw": "horosum jus[tl]a" },
  { "id": "p068", "english": "instead of", "khowar_raw": "horo zha[gh]a" },
  { "id": "p069", "english": "in place of", "khowar_raw": "hey zha[gh]a" },
  { "id": "p070", "english": "against", "khowar_raw": "[kh]elaf" },
  { "id": "p071", "english": "according to", "khowar_raw": "lua" },
  { "id": "p072", "english": "than", "khowar_raw": "ar" },// suffix
  { "id": "p073", "english": "via", "khowar_raw": "zariya" },
  { "id": "p074", "english": "per", "khowar_raw": "har" },
  { "id": "p075", "english": "as well as", "khowar_raw": "achi" },
  { "id": "p076", "english": "in addition to", "khowar_raw": "hesum jus[tl]a" },
  { "id": "p077", "english": "on top of", "khowar_raw": "sora" },
  { "id": "p078", "english": "unlike", "khowar_raw": "no [kh]osheki" }
];