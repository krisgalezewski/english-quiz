// A generous set of friendly, appropriate emoji avatars. Kept to
// animals/creatures/nature/objects - nothing that could be read as a face
// or figure representing a specific person.

export const DEFAULT_AVATARS = ["🦊", "🐙", "🐝", "🦉", "🐢", "🦜", "🐬", "🦔"];

export const MORE_AVATARS = [
  "🐼", "🦁", "🐯", "🐸", "🐨", "🐵", "🦄", "🐰",
  "🦋", "🐞", "🦖", "🐳", "🦈", "🐡", "🦩", "🦚",
  "🦥", "🦦", "🦫", "🐿️", "🦇", "🐺", "🐴", "🐮",
  "🐷", "🐔", "🦆", "🕊️", "🦀", "🐠", "🌵", "🍄",
  "🌻", "⭐", "🔥", "🌊", "🍉", "🍩", "🎈", "🎲",
];

export const AVATARS = [...DEFAULT_AVATARS, ...MORE_AVATARS];

export function randomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}
