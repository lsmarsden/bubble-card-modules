import {readOrEmpty} from "./files";
import path from "node:path";
import fsSync from "node:fs";
import {ModuleInfo, modulesDir} from "../build_modules";

/**
 * Creates a module function by combining module-specific code and helper functions.
 *
 * @param {ModuleInfo} moduleInfo - An object containing information about the module, such as its ID and code file name.
 * @return {Promise<string>} A promise that resolves to the complete combined module code as a string.
 */
export async function createModuleFunction(moduleInfo: ModuleInfo): Promise<string> {

    const rawCode = await readOrEmpty(path.join(modulesDir, moduleInfo.id, moduleInfo.code_file));
    const moduleCode = extractFunctionBody(rawCode, moduleInfo.id, false);
    const helperFunctions = importHelperFunctions(rawCode);

    const helperStart = "/**" +
        "\n * ======== IMPORTED HELPER FUNCTIONS =========" +
        "\n */"

    const moduleCodeStart = "/**" +
        "\n * ======== MAIN MODULE CODE =========" +
        "\n */"

    return [helperStart, ...helperFunctions, moduleCodeStart, moduleCode].join("\n\n");
}

function importHelperFunctions(rawCode: string): string[] {

    const importLines = rawCode.trim().split("\n").filter(line => line.startsWith("import") && line.includes("helpers/"));
    const helperFunctions: string[] = [];
    const importMap = new Map<string, Set<string>>();

    for (const importLine of importLines) {
        const match = importLine.match(/import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/);
        if (!match) continue;

        const importedNames = match[1].split(",").map(name => name.trim());
        const importPath = match[2];
        if (!importMap.has(importPath)) {
            importMap.set(importPath, new Set());
        }
        importedNames.forEach(name => importMap.get(importPath)!.add(name));
    }

    for (const [importPath, namesSet] of importMap.entries()) {
        const filePath = path.resolve(modulesDir, "helpers", importPath) + ".js";
        const helperFileContent = fsSync.readFileSync(filePath, "utf8");
        const extractedFunctionsMap = extractFunctionBodies(helperFileContent, Array.from(namesSet), true);
        helperFunctions.push(...Array.from(extractedFunctionsMap.values()));
    }

    return helperFunctions;
}

function extractFunctionBody(code: string, functionName: string, includeDeclaration: boolean): string {
    const extracted = extractFunctionBodies(code, [functionName], includeDeclaration);
    const func = extracted.get(functionName);
    if (!func) throw new Error(`Function ${functionName} not found in ${code}`);
    return func;
}

function extractFunctionCode(startIndex: number, code: string, includeDeclaration: boolean) {

    let braceIndex = code.indexOf('{', startIndex);
    let depth = 0;
    for (let i = braceIndex; i < code.length; i++) {
        const char = code[i];
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                if (includeDeclaration) {
                    return code.substring(startIndex, i + 1);
                } else {
                    return code.substring(braceIndex + 1, i);
                }
            }
        }
    }

    throw new Error("Unbalanced braces in function body, please check the function code");
}

function extractFunctionBodies(code: string, functionNames: string[], includeDeclaration: boolean): Map<string, string> {
    const result = new Map<string, string>();
    const nameSet = new Set(functionNames);
    const regex = /function\s+([A-z0-9_]+)\s*\([^)]*\)\s*{/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        const name = match[1];
        if (!nameSet.has(name)) continue;
        let functionBody = extractFunctionCode(match.index, code, includeDeclaration);
        result.set(name, functionBody);
    }

    return result;
}