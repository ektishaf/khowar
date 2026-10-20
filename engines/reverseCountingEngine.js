// 1. Digit mappings with PUA normalization support
const khowarDigitsMap = {
  "sifur": 0n,
  "e": 1n,
  "ju": 2n,
  "[tl]roi": 3n,
  "troi": 3n,
  "chor": 4n,
  "ponj": 5n,
  "[ch]oi": 6n,
  "choi": 6n,
  "coi": 6n,
  "so[tl]": 7n,
  "sot": 7n,
  "soth": 7n,
  "osht": 8n,
  "neof": 9n,
  "josh": 10n
};

// 2. Pure scale units with aliases
const khowarScaleUnitsMap = {
  "shankh": 100000000000000000n,
  "padam": 1000000000000000n,
  "neel": 10000000000000n,
  "kharab": 100000000000n,
  "arab": 1000000000n,
  "khorur": 10000000n,
  "khorur": 10000000n,
  "lakh": 100000n,
  "hazar": 1000n,
  "shor": 100n
};

function parseBase20Tokens(tokens) {
  let total = 0n;
  let i = 0;

  while (i < tokens.length) {
    let token = tokens[i];

    if (/[\uE000-\uF8FF]roi/.test(token) || token.includes('roi')) {
      token = '[tl]roi';
    }

    if (token === "bishir") {
      total += 20n;
      i++;
    } else if (khowarDigitsMap[token] !== undefined && tokens[i + 1] === "bishir") {
      total += BigInt(khowarDigitsMap[token]) * 20n;
      i += 2;
    } else if (token === "josh") {
      total += 10n;
      i++;
    } else if (khowarDigitsMap[token] !== undefined) {
      total += BigInt(khowarDigitsMap[token]);
      i++;
    } else {
      i++;
    }
  }

  return total;
}

function parseKhowarTokens(tokens) {
  if (!tokens || tokens.length === 0) return 0n;

  let grandTotal = 0n;
  let currentChunkTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (khowarScaleUnitsMap[token] !== undefined) {
      const scaleVal = khowarScaleUnitsMap[token];
      const multiplier = currentChunkTokens.length > 0 ? parseBase20Tokens(currentChunkTokens) : 1n;

      grandTotal += multiplier * scaleVal;
      currentChunkTokens = [];
    } else {
      currentChunkTokens.push(token);
    }
  }

  if (currentChunkTokens.length > 0) {
    const finalVal = parseBase20Tokens(currentChunkTokens);
    
    grandTotal += finalVal;
  }

  return grandTotal;
}

function translateKhowarToNumber(khowarText) {
  if (!khowarText) return null;

  const tokens = khowarText
    .toString()
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t !== "" && t !== "oche");

  if (tokens.length === 0) return null;
  if (tokens.length === 1 && tokens[0] === "sifur") return "0";

  try {
    const bigIntResult = parseKhowarTokens(tokens);
    
    return bigIntResult.toString();
  } catch (err) {
    console.error("💥 [Parser Error]:", err);
    return null;
  }
}