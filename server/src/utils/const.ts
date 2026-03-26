export const MAX_ROUNDS = 3
export const WORDS = ["elephant", "guitar", "volcano", "umbrella", "penguin"]
 
export function getRandomWords() {
  return [...WORDS].sort(() => Math.random() - 0.5).slice(0, 3)
}