const digitsKhowar = {
  1: "e",
  2: "ju",
  3: "[tl]roi",
  4: "chor",
  5: "ponj",
  6: "[ch]oi",
  7: "so[tl]",
  8: "osht",
  9: "neof",
  10: "josh"
};

// Pure scale units in descending order
const scaleUnits = [
  { threshold: 100000000000000000, name: "shankh" },     // 100 Quadrillion
  { threshold: 1000000000000000, name: "padam" },        // 1 Quadrillion
  { threshold: 10000000000000, name: "neel" },           // 10 Trillion
  { threshold: 100000000000, name: "kharab" },          // 100 Billion
  { threshold: 1000000000, name: "arab" },              // 1 Billion
  { threshold: 10000000, name: "khorur" },              // 10 Million
  { threshold: 100000, name: "lakh" },                  // 100 Thousand
  { threshold: 1000, name: "hazar" },                   // Thousand
  { threshold: 100, name: "shor" }                      // Hundred
];

/**
 * Translates any positive integer into Khowar dynamically
 */
function translateNumberToKhowar(num) {
  num = parseInt(num, 10);
  if (isNaN(num) || num < 0) return null;

  // 0 check
  if (num === 0) return "sifur"; // Zero handling

  // 1 to 10
  if (num <= 10) return digitsKhowar[num];

  // 11 to 19 (e.g., 11 = "josh e")
  if (num < 20) return `josh ${digitsKhowar[num - 10]}`;

  // Exactly 20
  if (num === 20) return "bishir";

  // 21 to 99 (Vigesimal Base-20 System)
  if (num < 100) {
    const bishirMultiplier = Math.floor(num / 20);
    const remainder = num % 20;

    let base = bishirMultiplier === 1 ? "bishir" : `${digitsKhowar[bishirMultiplier]} bishir`;

    if (remainder === 0) return base;
    if (remainder <= 10) return `${base} ${digitsKhowar[remainder]}`;

    const subRemainder = remainder - 10;
    return `${base} josh ${digitsKhowar[subRemainder]}`;
  }

  // Pure recursive formula for 100 and above
  for (const unit of scaleUnits) {
    if (num >= unit.threshold) {
      const count = Math.floor(num / unit.threshold);
      const remainder = num % unit.threshold;

      const prefix = `${translateNumberToKhowar(count)} ${unit.name}`;

      if (remainder === 0) {
        return prefix;
      }

      // Connect lower remainders with "oche"
      return `${prefix} oche ${translateNumberToKhowar(remainder)}`;
    }
  }

  return null;
}

/**
 * Parses English numeric inputs or digit strings
 */
function parseEnglishNumberWord(text) {
  if (!text) return null;
  
  const cleanText = text.toString().replace(/,/g, '').trim().toLowerCase();

  // Pure digit string check (e.g., "10000000000")
  if (/^\d+$/.test(cleanText)) {
    return parseInt(cleanText, 10);
  }

  const numMap = {
    "zero": 0,"one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "twenty": 20, "thirty": 30,
    "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
    "eighty": 80, "ninety": 90, "hundred": 100, "thousand": 1000,
    "lakh": 100000, "crore": 10000000, "arab": 1000000000,
    "kharab": 100000000000, "neel": 10000000000000,
    "padam": 1000000000000000, "shankh": 100000000000000000
  };

  return numMap[cleanText] !== undefined ? numMap[cleanText] : null;
}
