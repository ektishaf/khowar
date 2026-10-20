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

// Pure scale units in descending order (with BigInt 'n' suffixes)
const scaleUnits = [
  { threshold: 100000000000000000n, name: "shankh" },    // 100 Quadrillion
  { threshold: 1000000000000000n, name: "padam" },       // 1 Quadrillion
  { threshold: 10000000000000n, name: "neel" },          // 10 Trillion
  { threshold: 100000000000n, name: "kharab" },          // 100 Billion
  { threshold: 1000000000n, name: "arab" },              // 1 Billion
  { threshold: 10000000n, name: "khorur" },              // 10 Million
  { threshold: 100000n, name: "lakh" },                  // 100 Thousand
  { threshold: 1000n, name: "hazar" },                   // Thousand
  { threshold: 100n, name: "shor" }                      // Hundred
];

/**
 * Translates any positive integer into Khowar dynamically
 */
function translateNumberToKhowar(num) {
  // Safely coerce input into a BigInt to prevent 16-digit floating-point truncation
  let n;
  try {
    n = typeof num === 'bigint' ? num : BigInt(num.toString().trim());
  } catch (e) {
    return null;
  }

  if (n < 0n) return null;

  // 0 check
  if (n === 0n) return "sifur"; // Zero handling

  // 1 to 10
  if (n <= 10n) return digitsKhowar[Number(n)];

  // 11 to 19 (e.g., 11 = "josh e")
  if (n < 20n) return `josh ${digitsKhowar[Number(n - 10n)]}`;

  // Exactly 20
  if (n === 20n) return "bishir";

  // 21 to 99 (Vigesimal Base-20 System)
  if (n < 100n) {
    const bishirMultiplier = n / 20n;
    const remainder = n % 20n;

    let base = bishirMultiplier === 1n ? "bishir" : `${digitsKhowar[Number(bishirMultiplier)]} bishir`;

    if (remainder === 0n) return base;
    if (remainder <= 10n) return `${base} ${digitsKhowar[Number(remainder)]}`;

    const subRemainder = remainder - 10n;
    return `${base} josh ${digitsKhowar[Number(subRemainder)]}`;
  }

  // Pure recursive formula for 100 and above
  for (const unit of scaleUnits) {
    if (n >= unit.threshold) {
      const count = n / unit.threshold;
      const remainder = n % unit.threshold;

      const prefix = `${translateNumberToKhowar(count)} ${unit.name}`;

      if (remainder === 0n) {
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

  // Pure digit string check of ANY length -> returns BigInt instead of parseInt
  if (/^\d+$/.test(cleanText)) {
    return BigInt(cleanText);
  }

  const numMap = {
    "zero": 0n, "one": 1n, "two": 2n, "three": 3n, "four": 4n, "five": 5n,
    "six": 6n, "seven": 7n, "eight": 8n, "nine": 9n, "ten": 10n,
    "eleven": 11n, "twelve": 12n, "twenty": 20n, "thirty": 30n,
    "forty": 40n, "fifty": 50n, "sixty": 60n, "seventy": 70n,
    "eighty": 80n, "ninety": 90n, "hundred": 100n, "thousand": 1000n,
    "lakh": 100000n, "crore": 10000000n, "arab": 1000000000n,
    "kharab": 100000000000n, "neel": 10000000000000n,
    "padam": 1000000000000000n, "shankh": 100000000000000000n
  };

  return numMap[cleanText] !== undefined ? numMap[cleanText] : null;
}