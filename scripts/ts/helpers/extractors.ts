import { readOrEmpty } from "./files";
import path from "node:path";
import fsSync from "node:fs";
import { ModuleInfo, modulesDir } from "../build_modules";
import { logDebug } from "./logging";
import { parseImports } from "./importParser";

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

  const helperStart = "/**" + "\n * ======== IMPORTED HELPER FUNCTIONS =========" + "\n */";

  const moduleCodeStart = "/**" + "\n * ======== MAIN MODULE CODE =========" + "\n */";

  return [helperStart, ...helperFunctions, moduleCodeStart, moduleCode].join("\n\n");
}

function importHelperFunctions(rawCode: string): string[] {
  // Parse imports - handle both single-line and multi-line imports
  const importMap = parseImports(rawCode);
  const helperFunctions: string[] = [];
  const importedNames = new Set<string>();
  const importedFiles = new Set<string>();

  logDebug(`Importing the following helper functions:`);
  for (const [importPath, namesSet] of importMap.entries()) {
    logDebug(`  - ${importPath}.js: ${Array.from(namesSet).join(", ")}`);
  }

  for (const [importPath, namesSet] of importMap.entries()) {
    // Fix path resolution to handle imports like "../helpers/progressBorder.js"
    let resolvedPath: string;
    if (importPath.includes("helpers/")) {
      // Extract the filename from paths like "../helpers/file.js"
      const filename = importPath.split("helpers/")[1];
      // Don't add .js if it already has it
      const finalFilename = filename.endsWith(".js") ? filename : filename + ".js";
      resolvedPath = path.resolve(modulesDir, "helpers", finalFilename);
    } else {
      resolvedPath = path.resolve(modulesDir, "helpers", importPath.endsWith(".js") ? importPath : importPath + ".js");
    }

    if (importedFiles.has(resolvedPath)) continue;
    importedFiles.add(resolvedPath);

    const helperFileContent = fsSync.readFileSync(resolvedPath, "utf8");
    resolveHelperDependencies(
      resolvedPath,
      helperFileContent,
      Array.from(namesSet),
      helperFunctions,
      importedNames,
      importedFiles,
    );
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
  importedFiles: Set<string>,
) {
  // First, resolve any imports from this helper file
  const helperImports = parseImports(fileContent);

  logDebug(`Processing file: ${filePath}`);
  logDebug(`Looking for functions: ${names.join(", ")}`);
  logDebug(`Helper file imports found: ${helperImports.size}`);

  for (const [importPath, importedNamesSet] of helperImports.entries()) {
    logDebug(`  Import: ${importPath} -> [${Array.from(importedNamesSet).join(", ")}]`);

    // Resolve the import path correctly
    let resolvedPath: string;
    if (importPath.startsWith("./")) {
      // Relative import from the same directory
      const helpersDir = path.dirname(filePath);
      resolvedPath = path.resolve(helpersDir, importPath);
    } else {
      // Handle other relative imports
      resolvedPath = path.resolve(path.dirname(filePath), importPath);
    }

    if (!resolvedPath.endsWith(".js")) {
      resolvedPath += ".js";
    }

    logDebug(`  Resolved to: ${resolvedPath}`);

    if (importedFiles.has(resolvedPath)) {
      logDebug(`  Already processed ${resolvedPath}, processing again to resolve new dependencies.`);
    }
    importedFiles.add(resolvedPath);

    try {
      const importedFileContent = fsSync.readFileSync(resolvedPath, "utf8");
      logDebug(`  Successfully read file, recursing...`);
      // Recursively resolve dependencies from the imported file
      resolveHelperDependencies(
        resolvedPath,
        importedFileContent,
        Array.from(importedNamesSet),
        helperFunctions,
        importedNames,
        importedFiles,
      );
    } catch (error) {
      logDebug(`Warning: Could not read helper file ${resolvedPath}: ${error}`);
    }
  }

  // Then extract the requested functions from this file
  const extracted = extractFunctionBodies(fileContent, names, true);
  for (const [name, body] of extracted.entries()) {
    if (importedNames.has(name)) continue;
    importedNames.add(name);
    helperFunctions.push(body);

    const calledFunctions = Array.from(body.matchAll(/\b([A-z0-9_]+)\s*\(/g))
      .map((match) => match[1])
      .filter(
        (functionName) =>
          functionName !== "if" && functionName !== "for" && functionName !== "while" && functionName !== "switch",
      );

    // filter already imported or known function names
    const uniqueCalled = [...new Set(calledFunctions)].filter((depName) => !importedNames.has(depName));

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

export function extractFunctionCode(startIndex: number, code: string, includeDeclaration: boolean) {
  // Find the opening parenthesis of the function parameters
  let parenIndex = code.indexOf("(", startIndex);
  if (parenIndex === -1) {
    throw new Error("Function signature not found - missing opening parenthesis");
  }

  // Skip over the complete parameter list to find the function body brace
  let parenDepth = 0;
  let i = parenIndex;

  // Traverse through the parameter list to find the matching closing parenthesis
  for (; i < code.length; i++) {
    const char = code[i];
    if (char === "(") {
      parenDepth++;
    } else if (char === ")") {
      parenDepth--;
      if (parenDepth === 0) {
        // Found the end of the parameter list
        break;
      }
    }
  }

  if (parenDepth !== 0) {
    throw new Error("Unbalanced parentheses in function signature");
  }

  // Now find the opening brace of the function body (after the parameter list)
  let braceIndex = code.indexOf("{", i);
  if (braceIndex === -1) {
    throw new Error("Function body opening brace not found");
  }

  // Now extract the function body using brace matching
  let depth = 0;
  for (let j = braceIndex; j < code.length; j++) {
    const char = code[j];
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        if (includeDeclaration) {
          // Check if this is an arrow function that needs a trailing semicolon
          let endIndex = j + 1;

          // For arrow functions, look for the trailing semicolon
          if (code.substring(startIndex).includes("=>")) {
            // Skip whitespace after the closing brace
            while (endIndex < code.length && /\s/.test(code[endIndex])) {
              endIndex++;
            }
            // Include the semicolon if it's there
            if (endIndex < code.length && code[endIndex] === ";") {
              endIndex++;
            }
          }

          return code.substring(startIndex, endIndex);
        } else {
          return code.substring(braceIndex + 1, j);
        }
      }
    }
  }

  throw new Error("Unbalanced braces in function body, please check the function code");
}

export function extractFunctionBodies(
  code: string,
  functionNames: string[],
  includeDeclaration: boolean,
): Map<string, string> {
  const result = new Map<string, string>();
  const nameSet = new Set(functionNames);
  const regex = /(?:export\s+)?function\s+([A-z0-9_]+)|const\s+([A-z0-9_]+)\s*=\s*\([^)]*\)\s*=>\s*{/g;

  let match;
  while ((match = regex.exec(code)) !== null) {
    const name = match[1] || match[2];
    if (!nameSet.has(name)) continue;

    // Find the start of the actual function declaration (after 'export ' if present)
    let functionStart = match.index;
    if (code.substring(functionStart, functionStart + 7) === "export ") {
      functionStart += 7; // Skip 'export '
    }

    let functionBody = extractFunctionCode(functionStart, code, includeDeclaration);
    result.set(name, functionBody);
  }

  return result;
}
