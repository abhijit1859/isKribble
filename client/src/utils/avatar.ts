
const AVATAR_COLORS = [
  ["#FF6B6B", "#FFE66D"],
  ["#4ECDC4", "#44A08D"],
  ["#A770EF", "#CF8BF3"],
  ["#f7971e", "#ffd200"],
  ["#56CCF2", "#2F80ED"],
  ["#F2994A", "#F2C94C"],
  ["#6FCF97", "#219653"],
  ["#EB5757", "#B24592"],
];

const EMOJIS = ["🐶","🐱","🦊","🐼","🐨","🦁","🐸","🐧","🦄","🐙","🦋","🦜"];

function hashName(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(h);
}

export function getAvatarColors(name: string): [string, string] {
  return AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length] as [string, string];
}

export function getAvatarEmoji(name: string): string {
  return EMOJIS[hashName(name) % EMOJIS.length];
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}