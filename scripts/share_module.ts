import path from "node:path";
import fs from "node:fs/promises";
import yaml from "js-yaml";
import {ModuleInfo} from "./build_modules";
import {createFileFromTemplate} from "./helpers";

export async function shareModule(moduleId: string) {
    const modulePath = path.join("./modules", moduleId);
    const moduleYamlPath = path.join(modulePath, "module.yaml");

    const rawYaml = await fs.readFile(moduleYamlPath, "utf8");
    const parsed = yaml.load(rawYaml) as { module_info: ModuleInfo };
    const info = parsed.module_info;

    const moduleStoreDescription = await fs.readFile(path.join(modulePath, info.description_file), "utf8");
    const moduleDistYaml = await fs.readFile(path.join(modulePath, `dist/${info.id}.yaml`), "utf8");

    const values = {
        MODULE_NAME: info.name,
        MODULE_VERSION: info.version,
        MODULE_CREATOR: info.creator,
        MAIN_IMAGE: "preview.png",
        SUPPORTED_CARDS: info.supported.map((s) => `> - ${s}`).join("\n").substring(2),
        MODULE_DESCRIPTION: moduleStoreDescription.trim(),
        MODULE_YAML: moduleDistYaml.trim(),
    };

    await createFileFromTemplate(path.join(modulePath, "SHARE_MODULE.md"), "./modules/templates/SHARE_MODUlE_TEMPLATE.md", values);

    console.log(`Share file generated at ${modulePath}/SHARE_MODULE.md`);
}