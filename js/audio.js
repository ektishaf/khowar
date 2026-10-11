/**
 * js/audio.js
 * Phonetic audio engine for letter clicks and full sentence text-to-speech.
 */

// 1. Play individual letter sound - STRICTLY custom MP3s only (No WebSpeech fallback)
function playLetterSound(letterToken) {
    if (!letterToken) return;

    // Clean token down to filename (e.g. "[sh]" or "sh" -> "sh")
    const fileName = letterToken.toLowerCase().replace(/[\[\]]/g, '');
    const audioPath = `audio/${fileName}.mp3`;

    console.log(`🔊 [Audio Engine] Playing custom letter sound: ${audioPath}`);

    const customAudio = new Audio(audioPath);
    const playPromise = customAudio.play();

    if (playPromise !== undefined) {
        playPromise.catch((err) => {
            console.error(`❌ [Audio Engine] Failed to play letter sound at "${audioPath}". Error:`, err);
        });
    }
}

// 2. Play full sentence using HYBRID mode (Custom MP3s for special tokens + SpeechSynthesis for regular words)
async function speakSentence(text) {
    if (!text || !text.trim()) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // Convert raw PUA glyphs back to bracketed tokens before splitting
    const rawText = typeof unformatKhowarText === 'function' ? unformatKhowarText(text) : text;
    const tokens = rawText.match(/\[[a-zA-Z]+\]|\S+/g) || [];

    console.log(`🔊 [Audio Engine] Playing hybrid sentence sequence:`, tokens);

    for (const token of tokens) {
        const isSpecial = /^\[[a-zA-Z]+\]$/.test(token);

        if (isSpecial) {
            const fileName = token.toLowerCase().replace(/[\[\]]/g, '');
            await playAudioFile(`audio/${fileName}.mp3`);
        } else {
            await speakWordFallback(token);
        }
    }
}

// Helper: Plays custom MP3 file asynchronously for sequence playback
function playAudioFile(src) {
    return new Promise((resolve) => {
        const audio = new Audio(src);
        audio.onended = () => resolve();
        audio.onerror = () => {
            console.warn(`⚠️ [Audio Engine] Audio file missing or unplayable: ${src}`);
            resolve();
        };
        audio.play().catch(() => resolve());
    });
}

// Helper: Web Speech API fallback for standard words in sentences
function speakWordFallback(word) {
    return new Promise((resolve) => {
        if (!('speechSynthesis' in window)) {
            resolve();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.85;
        utterance.lang = 'en-US';
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
    });
}