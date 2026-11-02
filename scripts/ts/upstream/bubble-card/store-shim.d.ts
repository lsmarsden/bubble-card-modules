// Types for the functions vendored into store-shim.js, covering what the contract tests use.
export function getAvailableCardTypes(): { id: string; name: string }[];
export function _compareVersions(v1: string, v2: string): number;
