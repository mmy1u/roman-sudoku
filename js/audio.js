let soundEnabled = true;
let audioContext = null;

function playTone(frequency, duration) {
    if (!soundEnabled) return;
    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playClickSound() { playTone(400, 0.08); }
function playCorrectSound() { playTone(600, 0.15); }
function playErrorSound() { playTone(150, 0.2); }
function playWinSound() {
    playTone(500, 0.15);
    setTimeout(function() { playTone(700, 0.15); }, 150);
    setTimeout(function() { playTone(900, 0.25); }, 300);
}