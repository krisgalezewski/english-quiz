// Small, dependency-free sound effects. All tones are synthesized on the
// fly with the Web Audio API, so there's nothing to download or host.

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, startTime, duration, gainPeak = 0.15, type = "sine") {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// Plays the same note through two waveforms at once, softly - a bit closer
// to a real instrument's overtones than a single bare oscillator.
function warmTone(freq, startTime, duration, gainPeak = 0.1) {
  tone(freq, startTime, duration, gainPeak * 0.7, "sine");
  tone(freq, startTime, duration * 0.9, gainPeak * 0.35, "triangle");
}

// A soft, unobtrusive chime - tells the host everyone's answered without
// startling anyone.
export function playDing() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    warmTone(987.77, now, 0.5, 0.05); // B5, single gentle note
  } catch (e) {
    /* ignore - audio isn't essential */
  }
}

// A brief, tasteful ascending fanfare - synthesized fallback, used only if
// the real audio file (below) fails to load for some reason.
function playSynthesizedFanfare() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    const run = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    run.forEach((freq, i) => warmTone(freq, now + i * 0.15, 0.4, 0.12));

    const chordStart = now + run.length * 0.15 + 0.05;
    [659.25, 783.99, 1046.5].forEach((freq) => warmTone(freq, chordStart, 0.9, 0.09)); // E-G-C chord
  } catch (e) {
    /* ignore */
  }
}

// The real celebration sound - plays audio/fanfare.mp3. Falls back to a
// synthesized chime if the file can't be played (blocked, missing, etc).
export function playFanfare() {
  try {
    const audio = new Audio("audio/fanfare.mp3");
    audio.volume = 0.8;
    const playPromise = audio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => playSynthesizedFanfare());
    }
  } catch (e) {
    playSynthesizedFanfare();
  }
}
