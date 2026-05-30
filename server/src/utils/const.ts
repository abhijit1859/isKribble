export const MAX_ROUNDS = 1

export const WORDS = [
   
  "elephant",
  "penguin",
  "lion",
  "tiger",
  "monkey",
  "giraffe",
  "rabbit",
  "duck",
  "fish",
  "cat",
  "dog",
  "horse",
  "cow",

   
  "pizza",
  "burger",
  "ice cream",
  "banana",
  "apple",
  "cake",
  "donut",
  "hotdog",
  "watermelon",
  "sandwich",

 
  "guitar",
  "umbrella",
  "clock",
  "chair",
  "table",
  "lamp",
  "phone",
  "camera",
  "key",
  "backpack",
  "bicycle",
  "toothbrush",
  "scissors",

  
  "volcano",
  "mountain",
  "tree",
  "sun",
  "moon",
  "rainbow",
  "cloud",
  "river",
  "flower",
  "cactus",

   
  "car",
  "bus",
  "train",
  "airplane",
  "rocket",
  "helicopter",
  "boat",
  "submarine",

  
  "school",
  "hospital",
  "castle",
  "beach",
  "park",
  "zoo",

  // Sports
  "football",
  "basketball",
  "cricket",
  "tennis",
  "baseball",

  
  "robot",
  "ghost",
  "pirate",
  "superhero",
  "crown",
  "treasure",
  "diamond",
  "gift",
  "balloon",
  "trophy"
]

export function getRandomWords() {
  return [...WORDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
}