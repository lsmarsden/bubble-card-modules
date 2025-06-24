import inquirer from "inquirer";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { createFileFromTemplate } from "./helpers/files";

interface ModuleInfo {
  id: string;
  name: string;
  supported: string[];
  version: string;
}

async function generateModule() {
  const answers = await inquirer.prompt([
    { type: "input", name: "id", message: "Module ID (e.g. my_timeline)" },
    { type: "input", name: "name", message: "Module Name" },
    {
      type: "input",
      name: "supported",
      message: "Supported card types (comma-separated)",
    },
    {
      type: "input",
      name: "version",
      message: "Starting version?",
      default: "1.0.0",
    },
  ]);

  const moduleInfo: ModuleInfo = {
    id: answers.id.trim(),
    name: answers.name.trim(),
    version: answers.version.trim(),
    supported: answers.supported.split(",").map((s: string) => s.trim()),
  };

  const modulePath = path.join("./modules", moduleInfo.id);

  try {
    await fs.access(modulePath);
    console.error("Module already exists!");
    return;
  } catch {
    // good, folder doesn't exist yet
  }

  await fs.mkdir(modulePath, { recursive: true });

  const moduleYaml = {
    module_info: {
      id: moduleInfo.id,
      name: moduleInfo.name,
      version: moduleInfo.version,
      creator: "lsmarsden",
      link: `https://github.com/lsmarsden/bubble-card-modules/tree/main/${moduleInfo.id}`,
      supported: moduleInfo.supported,
      description_file: "module_store_description.html",
      code_file: "code.js",
      styles: "styles.css",
      editor_file: "editor.yaml",
    },
  };

  await fs.mkdir(path.join(modulePath, "assets"), { recursive: true });
  await fs.copyFile("./modules/templates/assets/preview.png", path.join(modulePath, "assets/preview.png"));
  await fs.writeFile(path.join(modulePath, "module.yaml"), yaml.dump(moduleYaml));
  await fs.writeFile(path.join(modulePath, "styles.css"), `/* Styles for ${answers.name} */`);
  await fs.writeFile(path.join(modulePath, "editor.yaml"), `editor:`);
  await fs.writeFile(
    path.join(modulePath, "code.js"),
    `export function ${answers.id}(card, hass) { // this allows IDEs to parse the file normally - will be removed automatically during build.\n  // add module code here\n}`,
  );

  await fs.mkdir(path.join(modulePath, "__tests__"), { recursive: true });
  await fs.writeFile(
    path.join(modulePath, "__tests__", "code.test.js"),
    `import {jest} from '@jest/globals';\n\n const { ${answers.id} } = await import("../code.js");\n\ndescribe('${answers.id}()', () => {\n    it('should be implemented', () => {\n        // TODO: Add tests for your module\n        expect(true).toBe(true);\n    });\n});\n`,
  );

  await createFileFromTemplate(path.join(modulePath, "schema.yaml"), "./modules/templates/schema_template.yaml", {
    MODULE_ID: moduleInfo.id,
  });
  await createFileFromTemplate(
    path.join(modulePath, "module_store_description.html"),
    "./modules/templates/module_store_description.html",
    {
      MODULE_NAME: moduleInfo.name,
      MODULE_ID: moduleInfo.id,
    },
  );

  await createFileFromTemplate(path.join(modulePath, "README.md"), "./modules/templates/README_TEMPLATE.md", {
    MODULE_NAME: moduleInfo.name,
    MODULE_ID: moduleInfo.id,
    MAIN_IMAGE: "preview.png",
    SUPPORTED_CARDS: moduleInfo.supported
      .map((s) => `> - ${s}`)
      .join("\n")
      .substring(2),
  });

  console.log(`Created new module at ${modulePath}`);
  console.log(`Don't forget to add tests in ${modulePath}/tests/code.test.js`);
}

generateModule();
