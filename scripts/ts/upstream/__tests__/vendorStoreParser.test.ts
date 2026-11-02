/**
 * @jest-environment node
 */
import { extractFunction } from "../vendorStoreParser";

const source = [
  "import { x } from './x.js';",
  "",
  "export function exported(a) {",
  "  return { a, nested: { b: [1, 2].map((n) => { return n; }) } };",
  "}",
  "",
  "function internal(v) {",
  "  return v.replace(/\\n{3,}/g, ''); // a regex with braces",
  "}",
  "",
  "function opened() {",
  "  return 1;",
].join("\n");

describe("extractFunction", () => {
  it("copies an exported function up to its closing brace, nested braces included", () => {
    expect(extractFunction(source, "exported")).toBe(
      ["export function exported(a) {", "  return { a, nested: { b: [1, 2].map((n) => { return n; }) } };", "}"].join(
        "\n",
      ),
    );
  });

  it("exports a function the source keeps private", () => {
    expect(extractFunction(source, "internal")).toBe(
      ["export function internal(v) {", "  return v.replace(/\\n{3,}/g, ''); // a regex with braces", "}"].join("\n"),
    );
  });

  it("fails when the function is gone or never closes", () => {
    expect(() => extractFunction(source, "missing")).toThrow("function missing not found");
    expect(() => extractFunction(source, "opened")).toThrow("function opened is not closed");
  });

  it("matches the whole name only", () => {
    expect(() => extractFunction(source, "export")).toThrow("function export not found");
  });
});
