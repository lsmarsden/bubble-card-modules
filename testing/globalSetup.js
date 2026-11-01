import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export default function globalSetup() {
  // Pin the timezone so time-of-day logic (e.g. separator_as_timeline) is deterministic.
  process.env.TZ = "UTC";

  // Build every module once, so module suites can also run against the built artifact (testing/artifact.js).
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "bubble-card-artifacts-"));
  execFileSync(process.execPath, ["--import", "tsx", "scripts/ts/build/writeTestArtifacts.ts", outDir], {
    stdio: ["ignore", "inherit", "inherit"],
  });
  process.env.BUBBLE_CARD_ARTIFACTS = outDir;
}
