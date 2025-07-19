/**
 * Utility for parsing ES module imports from code
 */

export function parseImports(code: string): Map<string, Set<string>> {
  const importMap = new Map<string, Set<string>>();

  // Match import statements - handle both single and multi-line
  // Use a more restrictive regex that doesn't cross import boundaries
  const importRegex = /import\s*\{\s*([^}]*?)\s*}\s*from\s*["']([^"']+)["']/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const fullMatch = match[0];
    const namesString = match[1];
    const importPath = match[2];

    // Check if this import is inside a comment or string
    const beforeMatch = code.substring(0, match.index);

    // Check if we're inside a line comment
    const lastLineBreak = beforeMatch.lastIndexOf("\n");
    const currentLine = beforeMatch.substring(lastLineBreak);
    if (currentLine.includes("//")) {
      continue; // Skip imports in line comments
    }

    // Check if we're inside a block comment
    const lastBlockCommentStart = beforeMatch.lastIndexOf("/*");
    const lastBlockCommentEnd = beforeMatch.lastIndexOf("*/");
    if (lastBlockCommentStart > lastBlockCommentEnd) {
      continue; // Skip imports in block comments
    }

    // Check if we're inside a string literal
    // Count quotes before this match to see if we're inside a string
    const singleQuotes = (beforeMatch.match(/'/g) || []).length;
    const doubleQuotes = (beforeMatch.match(/"/g) || []).length;
    const backticks = (beforeMatch.match(/`/g) || []).length;

    // If odd number of quotes, we're inside a string
    if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1) {
      continue; // Skip imports in strings
    }

    // Additional validation: check if the names string looks malformed
    // If it contains quotes or semicolons, it's probably malformed
    if (namesString.includes('"') || namesString.includes("'") || namesString.includes(";")) {
      continue; // Skip malformed imports
    }

    // Parse the names, handling multi-line formatting
    const names = namesString
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)); // Valid JS identifiers only

    // Only add if we have valid names
    if (names.length === 0) continue;

    if (!importMap.has(importPath)) {
      importMap.set(importPath, new Set());
    }

    names.forEach((name) => importMap.get(importPath)!.add(name));
  }

  return importMap;
}
