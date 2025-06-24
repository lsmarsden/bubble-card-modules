import fs from "node:fs/promises";
import { PathLike } from "node:fs";

/**
 * Reads the content of a file at the specified path or returns an empty string if an error occurs.
 *
 * @param {string} filePath - The path to the file to be read.
 * @return {Promise<string>} A promise that resolves with the file's content as a string, or an empty string if an error occurs.
 */
export async function readOrEmpty(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

/**
 * Checks if a file or directory exists at the specified path.
 *
 * @param {string} filePath - The path to the file or directory to check.
 * @return {Promise<boolean>} - A promise that resolves to `true` if the file or directory exists otherwise `false`.
 */
export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new file by populating a template file with provided values.
 *
 * @param {PathLike} file - The path of the file to be created.
 * @param {PathLike} templateFile - The path to the template file to be used.
 * @param {Record<string, string>} values - An object containing placeholder-value pairs for replacing placeholders in the template.
 * @return {Promise<void>} A promise that resolves when the file has been created successfully.
 */
export async function createFileFromTemplate(
  file: PathLike,
  templateFile: PathLike,
  values: Record<string, string>,
): Promise<void> {
  const template = await fs.readFile(templateFile, "utf8");
  const content = replacePlaceholders(template, values);

  await fs.writeFile(file, content, "utf8");
}

function replacePlaceholders(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\${{(.*?)}}|\{\{(.*?)}}/g, (_, key1, key2, key3) => {
    const key = (key1 || key2 || key3).trim();
    return values[key] || "";
  });
}
