import fs from "node:fs";

export default function globalTeardown() {
  const dir = process.env.BUBBLE_CARD_ARTIFACTS;
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
}
