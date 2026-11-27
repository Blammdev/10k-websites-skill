export type CategoryMeta = {
  id: string;
  kind: "seed" | "merch";
  title: string;
  kicker: string;
  blurb: string;
  image: string;
  accent: string;
  glow: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "houseplants",
    kind: "seed",
    title: "House Plants",
    kicker: "Indoor · Slow green",
    blurb:
      "Seeds for leafy roommates that thrive on a windowsill and forgive a missed watering. Patience is the main ingredient.",
    image: "/images/houseplants.jpg",
    accent: "#7ee0a1",
    glow: "rgba(126,224,161,0.18)",
  },
  {
    id: "vegetables",
    kind: "seed",
    title: "Vegetables",
    kicker: "Garden · Kitchen bound",
    blurb:
      "Heirloom and open-pollinated seeds for the unhurried grower. Sow, wander off, come back to dinner.",
    image: "/images/vegetables.jpg",
    accent: "#ffb15e",
    glow: "rgba(255,177,94,0.16)",
  },
  {
    id: "fruit",
    kind: "seed",
    title: "Fruit",
    kicker: "Orchard · Worth the wait",
    blurb:
      "Berries, melons and long-game trees. Some reward you this summer, others in a few seasons. We like it that way.",
    image: "/images/fruit.jpg",
    accent: "#ff7a90",
    glow: "rgba(255,122,144,0.16)",
  },
  {
    id: "hemp",
    kind: "seed",
    title: "Hemp Seeds",
    kicker: "Hemp / Compliance",
    blurb:
      "Farm Bill-compliant hemp seeds selected for genetic lineage and terpene profiles.",
    image: "/images/hemp.jpg",
    accent: "#b7f06a",
    glow: "rgba(183,240,106,0.16)",
  },
];

export const MERCH_CATEGORY: CategoryMeta = {
  id: "merch",
  kind: "merch",
  title: "Merch",
  kicker: "Wearables · Slow living",
  blurb:
    "Soft goods and small things for people who garden at their own pace. Printed in small batches, shipped whenever it is ready.",
  image: "/images/merch.jpg",
  accent: "#f5c76a",
  glow: "rgba(245,199,106,0.16)",
};

type Seed = {
  id: string;
  kind: "seed" | "merch";
  category: string;
  name: string;
  emoji: string;
  note: string;
  tag: string;
  detail: string;
  price: number;
  stock: number;
  isHemp?: boolean;
};

const S: Seed[] = [
  // House plants
  { id: "hp1", kind: "seed", category: "houseplants", name: "Monstera Deliciosa", emoji: "🪴", note: "Split leaves, big personality", tag: "Low light", detail: "14 to 28 days", price: 6.5, stock: 120 },
  { id: "hp2", kind: "seed", category: "houseplants", name: "Snake Plant", emoji: "🌿", note: "Nearly indestructible", tag: "Beginner", detail: "21 to 35 days", price: 5, stock: 120 },
  { id: "hp3", kind: "seed", category: "houseplants", name: "Spider Plant", emoji: "🌱", note: "Cascading baby plantlets", tag: "Pet friendly", detail: "10 to 21 days", price: 4.5, stock: 120 },
  { id: "hp4", kind: "seed", category: "houseplants", name: "Aloe Vera", emoji: "🌵", note: "Soothing succulent gel", tag: "Bright light", detail: "14 to 30 days", price: 5.5, stock: 120 },
  { id: "hp5", kind: "seed", category: "houseplants", name: "Maidenhair Fern", emoji: "🍃", note: "Delicate, humidity loving", tag: "Moody", detail: "30 to 60 days", price: 6, stock: 120 },
  { id: "hp6", kind: "seed", category: "houseplants", name: "Peace Lily", emoji: "🤍", note: "White blooms in shade", tag: "Flowering", detail: "21 to 40 days", price: 7, stock: 120 },
  // Vegetables
  { id: "vg1", kind: "seed", category: "vegetables", name: "Black Krim Tomato", emoji: "🍅", note: "Smoky, deep mahogany fruit", tag: "Heirloom", detail: "70 to 85 days", price: 3.9, stock: 200 },
  { id: "vg2", kind: "seed", category: "vegetables", name: "Purple Dragon Carrot", emoji: "🥕", note: "Violet skin, orange heart", tag: "Heirloom", detail: "70 to 80 days", price: 3.5, stock: 200 },
  { id: "vg3", kind: "seed", category: "vegetables", name: "Lacinato Kale", emoji: "🥬", note: "Dinosaur kale, frost sweetened", tag: "Cool season", detail: "55 to 65 days", price: 3.2, stock: 200 },
  { id: "vg4", kind: "seed", category: "vegetables", name: "Jalapeño Pepper", emoji: "🌶️", note: "Warm, never reckless", tag: "Spicy", detail: "70 to 80 days", price: 3.8, stock: 200 },
  { id: "vg5", kind: "seed", category: "vegetables", name: "Lemon Cucumber", emoji: "🥒", note: "Round, crisp and mild", tag: "Prolific", detail: "60 to 70 days", price: 3.4, stock: 200 },
  { id: "vg6", kind: "seed", category: "vegetables", name: "Sweet Corn 'Golden'", emoji: "🌽", note: "Summer on a cob", tag: "Warm season", detail: "75 to 90 days", price: 3.6, stock: 200 },
  // Fruit
  { id: "fr1", kind: "seed", category: "fruit", name: "Alpine Strawberry", emoji: "🍓", note: "Tiny, intensely sweet", tag: "Perennial", detail: "90 to 120 days", price: 4.2, stock: 150 },
  { id: "fr2", kind: "seed", category: "fruit", name: "Sugar Baby Watermelon", emoji: "🍉", note: "Compact, ice-box size", tag: "Warm season", detail: "75 to 85 days", price: 3.9, stock: 150 },
  { id: "fr3", kind: "seed", category: "fruit", name: "Charentais Melon", emoji: "🍈", note: "Perfumed orange flesh", tag: "Heirloom", detail: "80 to 90 days", price: 4, stock: 150 },
  { id: "fr4", kind: "seed", category: "fruit", name: "Meyer Lemon", emoji: "🍋", note: "Patio tree, fragrant blooms", tag: "Long game", detail: "2 to 3 years", price: 7.5, stock: 80 },
  { id: "fr5", kind: "seed", category: "fruit", name: "Blueberry Bush", emoji: "🫐", note: "Acid-loving, bird-loved", tag: "Perennial", detail: "2 to 3 years", price: 6.8, stock: 80 },
  { id: "fr6", kind: "seed", category: "fruit", name: "Ground Cherry", emoji: "🟠", note: "Husked golden pineapple-ish treats", tag: "Curious", detail: "70 to 80 days", price: 3.7, stock: 150 },
  // Hemp
  { id: "cs1", kind: "seed", category: "hemp", name: "Sloth OG", emoji: "🍃", note: "Heavy, calming hybrid", tag: "Indica-dom", detail: "Pack of 5 · Feminized", price: 38, stock: 60, isHemp: true },
  { id: "cs2", kind: "seed", category: "hemp", name: "Slowpoke Haze", emoji: "🌿", note: "Bright, long-flowering sativa", tag: "Sativa", detail: "Pack of 5 · Feminized", price: 42, stock: 60, isHemp: true },
  { id: "cs3", kind: "seed", category: "hemp", name: "Lazy Sunday Auto", emoji: "☁️", note: "Easygoing autoflower", tag: "Autoflower", detail: "Pack of 5 · Auto", price: 35, stock: 60, isHemp: true },
  { id: "cs4", kind: "seed", category: "hemp", name: "Midnight Moss", emoji: "🌑", note: "Earthy and deep, dark foliage", tag: "Indica", detail: "Pack of 5 · Feminized", price: 40, stock: 60, isHemp: true },
  { id: "cs5", kind: "seed", category: "hemp", name: "Couch Cake", emoji: "🍰", note: "Sweet, dessert-leaning hybrid", tag: "Hybrid", detail: "Pack of 5 · Feminized", price: 45, stock: 60, isHemp: true },
  { id: "cs6", kind: "seed", category: "hemp", name: "Dozy Diesel", emoji: "⛽", note: "Classic sour, mellow finish", tag: "Hybrid", detail: "Pack of 5 · Regular", price: 39, stock: 60, isHemp: true },
  // Merch
  { id: "mc1", kind: "merch", category: "merch", name: "Slow Grow Tee", emoji: "👕", note: "Heavyweight organic cotton, relaxed fit", tag: "Unisex", detail: "Sizes S to XL · Moss green", price: 28, stock: 60 },
  { id: "mc2", kind: "merch", category: "merch", name: "Napping Sloth Hoodie", emoji: "🧥", note: "Brushed fleece, deep pocket, zero urgency", tag: "Bestseller", detail: "Sizes S to XXL · Forest", price: 58, stock: 40 },
  { id: "mc3", kind: "merch", category: "merch", name: "Do Nothing Dad Hat", emoji: "🧢", note: "Washed twill with embroidered sprout", tag: "One size", detail: "Adjustable · Sage", price: 24, stock: 50 },
  { id: "mc4", kind: "merch", category: "merch", name: "Windowsill Mug", emoji: "☕", note: "Speckled stoneware, 12 oz", tag: "Ceramic", detail: "Dishwasher safe · Cream", price: 18, stock: 70 },
  { id: "mc5", kind: "merch", category: "merch", name: "Seed Haul Tote", emoji: "👜", note: "Sturdy canvas, fits a whole spring", tag: "Canvas", detail: "15 x 16 in · Natural", price: 20, stock: 80 },
  { id: "mc6", kind: "merch", category: "merch", name: "Garden Apron", emoji: "🧑‍🌾", note: "Waxed canvas with tool pockets", tag: "Workwear", detail: "Adjustable · Olive", price: 34, stock: 30 },
  { id: "mc7", kind: "merch", category: "merch", name: "Lazy Sticker Pack", emoji: "✨", note: "Six weatherproof vinyl stickers", tag: "Pack of 6", detail: "Die cut · Matte", price: 6, stock: 200 },
  { id: "mc8", kind: "merch", category: "merch", name: "Sprout Enamel Pin", emoji: "📍", note: "Hard enamel, gold plating", tag: "Collectible", detail: "1 inch · Butterfly clutch", price: 9, stock: 100 },
];

export const SEED_PRODUCTS = S.map((p, i) => ({
  id: p.id,
  kind: p.kind,
  category: p.category,
  name: p.name,
  emoji: p.emoji,
  note: p.note,
  tag: p.tag,
  detail: p.detail,
  priceCents: Math.round(p.price * 100),
  stock: p.stock,
  sku: `LG-${p.id.toUpperCase()}`,
  sortOrder: i,
  active: true,
  isHemp: !!p.isHemp,
}));

export const SHIPPING_FLAT_CENTS = 595;
export const FREE_SHIPPING_OVER_CENTS = 5000;

export function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
