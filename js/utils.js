export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Ticks a countdown from `startedAtISO` for `seconds`, writing the
// remaining whole seconds into `displayEl`. Calls onExpire() once,
// exactly when it hits zero. Returns a stop() function.
export function startCountdown(displayEl, startedAtISO, seconds, onExpire) {
  const startedAt = new Date(startedAtISO).getTime();
  const endsAt = startedAt + seconds * 1000;
  let expired = false;

  function tick() {
    const remainingMs = endsAt - Date.now();
    const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    if (displayEl) displayEl.textContent = remaining + "s";
    if (remainingMs <= 0 && !expired) {
      expired = true;
      clearInterval(interval);
      onExpire && onExpire();
    }
  }

  tick();
  const interval = setInterval(tick, 250);
  return () => clearInterval(interval);
}
