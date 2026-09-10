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
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// A short, gentle two-note chime - used to tell the host everyone's answered.
export function playDing() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    tone(880, now, 0.15, 0.12);
    tone(1318.5, now + 0.1, 0.25, 0.12);
  } catch (e) {
    /* ignore - audio isn't essential */
  }
}

// A brief, tasteful ascending fanfare for the end-of-game celebration.
export function playFanfare() {
  try {
    const audioCtx = getCtx();
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => tone(freq, now + i * 0.14, 0.35, 0.14, "triangle"));
    tone(1046.5, now + notes.length * 0.14 + 0.05, 0.5, 0.16, "triangle");
  } catch (e) {
    /* ignore */
  }
}
