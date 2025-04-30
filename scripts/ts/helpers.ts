import {PathLike} from "node:fs";
import fs from "node:fs/promises";

export async function createFileFromTemplate(file: PathLike, templateFile: PathLike, values: Record<string, string>) {
    const template = await fs.readFile(templateFile, "utf8");
    const content = replacePlaceholders(template, values);

    await fs.writeFile(file, content, "utf8");
}

export function replacePlaceholders(template: string, values: Record<string, string>): string {
    return template.replace(/\${{(.*?)}}|\{\{(.*?)}}/g, (_, key1, key2) => {
        const key = key1 || key2;
        return values[key.trim()] || "";
    });
}