import writingPrompts from "@/data/writing-prompts.json";

export function getRandomWritingPrompt() {
  return writingPrompts[Math.floor(Math.random() * writingPrompts.length)];
}

export function getWritingPrompts() {
  return writingPrompts;
}
