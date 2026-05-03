const SLUG_WORDS = [
  "after",
  "amber",
  "apple",
  "april",
  "arch",
  "atlas",
  "autumn",
  "baker",
  "bay",
  "beacon",
  "birch",
  "bloom",
  "book",
  "bottle",
  "branch",
  "brass",
  "brook",
  "cabin",
  "candle",
  "canvas",
  "cedar",
  "chalk",
  "chapter",
  "clay",
  "cloud",
  "clover",
  "coffee",
  "copper",
  "corner",
  "cotton",
  "courtyard",
  "cricket",
  "dawn",
  "desk",
  "drift",
  "echo",
  "ember",
  "evening",
  "fable",
  "fern",
  "field",
  "fig",
  "flint",
  "garden",
  "glass",
  "golden",
  "grain",
  "harbor",
  "hazel",
  "hearth",
  "honey",
  "hour",
  "iris",
  "island",
  "ivory",
  "jasmine",
  "journal",
  "juniper",
  "kettle",
  "kindle",
  "lantern",
  "lark",
  "leaf",
  "letter",
  "linen",
  "little",
  "loft",
  "maple",
  "marble",
  "market",
  "meadow",
  "mint",
  "mirror",
  "morning",
  "moss",
  "notebook",
  "novel",
  "olive",
  "orchard",
  "paper",
  "pearl",
  "pencil",
  "pepper",
  "plain",
  "plum",
  "pocket",
  "porch",
  "quiet",
  "quill",
  "rain",
  "ribbon",
  "river",
  "room",
  "rose",
  "sable",
  "sage",
  "salt",
  "shadow",
  "shelf",
  "signal",
  "silver",
  "sketch",
  "slate",
  "snow",
  "sparrow",
  "spring",
  "stone",
  "story",
  "summer",
  "table",
  "thread",
  "thistle",
  "timber",
  "toast",
  "umber",
  "valley",
  "velvet",
  "violet",
  "walnut",
  "water",
  "window",
  "winter",
  "wool",
  "yellow",
  "yonder",
  "zephyr",
  "zinc",
] as const;

const SLUG_WORD_COUNT = 5;
const SLUG_BASE = BigInt(SLUG_WORDS.length);
const SLUG_CAPACITY = SLUG_BASE ** BigInt(SLUG_WORD_COUNT);
const SLUG_MULTIPLIER = 2_654_435_761n;
const SLUG_OFFSET = 982_451_653n;

export function encodeSlugSequence(sequence: bigint) {
  if (sequence < 0n || sequence >= SLUG_CAPACITY) {
    throw new Error(
      `Slug sequence is outside the ${SLUG_CAPACITY.toLocaleString()} slug capacity.`,
    );
  }

  // The odd multiplier is coprime with 128^5, so this is a bijection across
  // the full slug space. It keeps early slugs varied without using randomness.
  const shuffledSequence =
    (sequence * SLUG_MULTIPLIER + SLUG_OFFSET) % SLUG_CAPACITY;
  const words: string[] = [];
  let remaining = shuffledSequence;

  for (let index = 0; index < SLUG_WORD_COUNT; index += 1) {
    const wordIndex = Number(remaining % SLUG_BASE);
    words.unshift(SLUG_WORDS[wordIndex]);
    remaining = remaining / SLUG_BASE;
  }

  return words.join("-");
}

export function getSlugCapacity() {
  return SLUG_CAPACITY;
}
