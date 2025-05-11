import {readOrEmpty} from "./files";
import path from "node:path";
import fsSync from "node:fs";
import {ModuleInfo, modulesDir} from "../build_modules";
import {logDebug} from "./logging";

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
    const importedNames = new Set<string>();
    const importedFiles = new Set<string>();

    for (const importLine of importLines) {
        const match = importLine.match(/import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/);
        if (!match) continue;

        const names = match[1].split(",").map(name => name.trim());
        const importPath = match[2];
        if (!importMap.has(importPath)) {
            importMap.set(importPath, new Set());
        }
        names.forEach(name => importMap.get(importPath)!.add(name));
    }

    logDebug(`Importing the following helper functions:`)
    for (const [importPath, namesSet] of importMap.entries()) {
        logDebug(`  - ${importPath}.js: ${Array.from(namesSet).join(", ")}`);
    }

    for (const [importPath, namesSet] of importMap.entries()) {
        const resolvedPath = path.resolve(modulesDir, "helpers", importPath.endsWith(".js") ? importPath : importPath + ".js");

        if (importedFiles.has(resolvedPath)) continue;
        importedFiles.add(resolvedPath);

        const helperFileContent = fsSync.readFileSync(resolvedPath, "utf8");
        resolveHelperDependencies(resolvedPath, helperFileContent, Array.from(namesSet), helperFunctions, importedNames, importedFiles);
        extractFunctionBodies(helperFileContent, Array.from(namesSet), true);
    }

    return helperFunctions;
}


function resolveHelperDependencies(
    filePath: string,
    fileContent: string,
    names: string[],
    helperFunctions: string[],
    importedNames: Set<string>,
    importedFiles: Set<string>
) {
    const extracted = extractFunctionBodies(fileContent, names, true);
    for (const [name, body] of extracted.entries()) {
        if (importedNames.has(name)) continue;
        importedNames.add(name);
        helperFunctions.push(body);

        const calledFunctions = Array.from(body.matchAll(/\b([A-z0-9_]+)\s*\(/g))
            .map(match => match[1])
            .filter(functionName =>
                functionName !== 'if' &&
                functionName !== 'for' &&
                functionName !== 'while' &&
                functionName !== 'switch'
            );

        // filter already imported or known function names
        const uniqueCalled = [...new Set(calledFunctions)]
            .filter(depName => !importedNames.has(depName));

        if (uniqueCalled.length > 0) {
            const additionalFunctions = extractFunctionBodies(fileContent, uniqueCalled, true);
            for (const [depName, depBody] of additionalFunctions.entries()) {
                if (!importedNames.has(depName)) {
                    importedNames.add(depName);
                    helperFunctions.push(depBody);
                }
            }
            resolveHelperDependencies(filePath, fileContent, uniqueCalled, helperFunctions, importedNames, importedFiles);
        }
    }
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
    const regex = /function\s+([A-z0-9_]+)|const\s+([A-z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*{/g;

    let match;
    while ((match = regex.exec(code)) !== null) {
        const name = match[1] || match[2];
        if (!nameSet.has(name)) continue;
        let functionBody = extractFunctionCode(match.index, code, includeDeclaration);
        result.set(name, functionBody);
    }

    return result;
}