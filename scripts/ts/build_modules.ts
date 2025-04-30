import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import {generateDocs} from "./generate_docs";

export interface ModuleInfo {
    id: string;
    name: string;
    version: string;
    creator: string;
    link?: string;
    supported: string[];
    description_file: string;
    code_file: string;
    styles: string;
    editor_file: string;
}

async function buildModules() {
    const modulesPath = path.resolve("./modules");

    const moduleFolders = await fs.readdir(modulesPath);

    for (const moduleFolder of moduleFolders) {
        const moduleDir = path.join(modulesPath, moduleFolder);
        const stat = await fs.stat(moduleDir);
        if (!stat.isDirectory()) continue;

        const moduleYamlPath = path.join(moduleDir, "module.yaml");
        if (!await exists(moduleYamlPath)) continue;

        const rawYaml = await fs.readFile(moduleYamlPath, "utf8");
        const parsed = yaml.load(rawYaml) as { module_info: ModuleInfo };
        const info = parsed.module_info;

        validateModuleInfo(info, moduleDir);

        const description = await readOrEmpty(path.join(moduleDir, info.description_file));
        const code = cleanExportedFunction(await readOrEmpty(path.join(moduleDir, info.code_file)));
        const styles = await readOrEmpty(path.join(moduleDir, info.styles));
        const editorYaml = await readOrEmpty(path.join(moduleDir, info.editor_file));

        const editorParsed = yaml.load(editorYaml);
        const editor = (editorParsed as any)?.editor || editorParsed;

        const output = {
            [info.id]: {
                name: info.name,
                version: `v${info.version}`,
                creator: info.creator,
                link: info.link || `https://github.com/lsmarsden/bubble-card-modules/tree/main/${moduleFolder}`,
                supported: info.supported || [],
                description: description.trim(),
                code: `\${(() => {\n${code.trim()}\n})()}\n\n${styles.trim()}`,
                editor: editor,
            },
        };

        const outputYaml = yaml.dump(output, {lineWidth: 120});

        const distPath = path.join(moduleDir, "dist");
        await fs.mkdir(distPath, {recursive: true});
        await fs.writeFile(path.join(distPath, `${info.id}.yaml`), outputYaml, "utf8");

        console.log(`Built module: ${info.id}`);

        await generateDocs(info.id);
    }
}

async function readOrEmpty(filePath: string): Promise<string> {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch {
        return "";
    }
}

export async function exists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function validateModuleInfo(info: ModuleInfo, moduleDir: string) {
    if (!info.id || !/^[a-z0-9_]+$/.test(info.id)) {
        throw new Error(`Invalid or missing module ID for module in ${moduleDir}`);
    }
    if (!info.version || !/^\d+\.\d+\.\d+$/.test(info.version)) {
        throw new Error(`Invalid or missing version for module ${info.id}`);
    }
    if (!Array.isArray(info.supported)) {
        throw new Error(`Supported must be an array for module ${info.id}`);
    }

    const requiredFiles = [info.description_file, info.code_file, info.styles, info.editor_file];
    for (const file of requiredFiles) {
        if (!file) {
            throw new Error(`Missing file reference in module info for ${info.id}`);
        }
    }
}

// remove the function wrapper to inject into the module code block
function cleanExportedFunction(raw: string): string {
    const lines = raw.trim().split("\n");

    if (lines[0].startsWith("function")) {
        lines.shift(); // remove first line
        lines.pop();   // remove last line
    }

    return lines.join("\n");
}

// Entry
buildModules();