import inquirer from "inquirer";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import {PathLike} from "node:fs";

interface ModuleInfo {
    id: string;
    name: string;
    supported: string[];
    version: string;
}

async function generateModule() {
    const answers = await inquirer.prompt([
        {type: "input", name: "id", message: "Module ID (e.g. my_timeline)"},
        {type: "input", name: "name", message: "Module Name"},
        {type: "input", name: "supported", message: "Supported card types (comma-separated)"},
        {type: "input", name: "version", message: "Starting version?", default: "1.0.0"}
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

    await fs.mkdir(modulePath, {recursive: true});

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

    await fs.mkdir(path.join(modulePath, "assets"), {recursive: true});
    await fs.copyFile("./modules/templates/assets/preview.png", path.join(modulePath, "assets/preview.png"));
    await fs.writeFile(path.join(modulePath, "module.yaml"), yaml.dump(moduleYaml));
    await fs.writeFile(path.join(modulePath, "styles.css"), `/* Styles for ${answers.name} */`);
    await fs.writeFile(path.join(modulePath, "editor.yaml"), `editor:`);
    await fs.writeFile(path.join(modulePath, "code.js"), `function ${answers.id}(card, hass) { // this allows IDEs to parse the file normally - will be removed automatically during build.\n  // add module code here\n}`);

    await createFileFromTemplate(path.join(modulePath, "module_store_description.html"), "./modules/templates/module_store_description.html", {
        MODULE_NAME: moduleInfo.name,
        MODULE_ID: moduleInfo.id
    });

    await createFileFromTemplate(path.join(modulePath, "README.md"), "./modules/templates/README_TEMPLATE.md", {
        MODULE_NAME: moduleInfo.name,
        MODULE_ID: moduleInfo.id,
        MAIN_IMAGE: "preview.png",
        SUPPORTED_CARDS: moduleInfo.supported.map(s => `> - ${s}`).join("\n")
    });

    console.log(`Created new module at ${modulePath}`);
}

async function createFileFromTemplate(file: PathLike, templateFile: PathLike, values: Record<string, string>) {
    const template = await fs.readFile(templateFile, "utf8");
    const content = replacePlaceholders(template, values);

    await fs.writeFile(file, content, "utf8");
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
    return template.replace(/\{\{(.*?)}}/g, (_, key) => values[key.trim()] || "");
}

generateModule();