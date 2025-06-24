import * as util from "node:util";
import { exec } from "child_process";
import path from "node:path";
import { exists } from "./helpers/files";
import { shareModule } from "./share_module";

export async function generateDocs(moduleId: string) {
  const moduleDir = path.join("./modules", moduleId);

  console.debug(`Generating docs for ${moduleId}`);
  await generateSchemaDoc(moduleDir, moduleId);
  await shareModule(moduleId);
  console.debug(`Done generating docs for ${moduleId}`);
}

async function generateSchemaDoc(moduleDir: string, moduleId: string) {
  const execAsync = util.promisify(exec);

  const schemaPath = path.join(moduleDir, "schema.yaml");
  if (await exists(schemaPath)) {
    try {
      const { stdout } = await execAsync(
        `python3 scripts/py/generate_schema_doc.py "${moduleDir}"`,
      );
      console.debug(`Generated schema doc for ${moduleId}`);
      console.debug(stdout);
    } catch (err) {
      console.error(`Failed to generate schema doc for ${moduleId}`, err);
    }
  }
}
