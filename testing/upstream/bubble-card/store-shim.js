// Vendored from Clooos/Bubble-Card v3.4.3 (2c3b43d1168ca05701be15fd96e416609601ecfa) by scripts/ts/upstream/vendorStoreParser.ts.
// Do not edit: re-run the script against a newer checkout instead.

// src/modules/utils.js
export function _cleanMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1")     // Italic
    .replace(/`(.*?)`/g, "$1")       // Inline code
    .replace(/~~(.*?)~~/g, "$1")     // Strikethrough
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .replace(/<\/?[^>]+(>|$)/g, "")   // HTML tags
    .replace(/^#+\s+/gm, "")         // Headers
    .replace(/\n{3,}/g, "\n\n")      // Remove multiple spaces
    .trim();
}

// src/modules/utils.js
export function _slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// src/modules/utils.js
export function _normalizeVersionInput(version) {
  if (version === null || version === undefined) return '';
  if (typeof version === 'string') {
    const trimmed = version.trim();
    // Remove 'v' or 'V' prefix if present
    return trimmed.replace(/^[vV]/, '');
  }
  if (typeof version === 'number') return String(version);
  if (Array.isArray(version)) {
    return version.map(item => _normalizeVersionInput(item)).filter(Boolean).join('.');
  }
  if (typeof version === 'object') {
    if (typeof version.version === 'string' || typeof version.version === 'number') {
      return _normalizeVersionInput(version.version);
    }
    if (typeof version.value === 'string' || typeof version.value === 'number') {
      return _normalizeVersionInput(version.value);
    }
    return '';
  }
  return '';
}

// src/modules/utils.js
export function _compareVersions(v1, v2) {
  // Simple version comparison like 2025.03.15 > 2025.03.10
  const normalizedV1 = _normalizeVersionInput(v1);
  const normalizedV2 = _normalizeVersionInput(v2);

  if (!normalizedV1 || !normalizedV2) return 0;

  const v1Parts = normalizedV1.split('.').map(Number);
  const v2Parts = normalizedV2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const part1 = v1Parts[i] || 0;
    const part2 = v2Parts[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0; // Versions are identical
}

// src/modules/module-editor.js
export function getAvailableCardTypes() {
  return [
    { id: 'button', name: 'Button' }, 
    { id: 'calendar', name: 'Calendar' }, 
    { id: 'climate', name: 'Climate' }, 
    { id: 'cover', name: 'Cover' }, 
    { id: 'horizontal-buttons-stack', name: 'Horizontal buttons stack' }, 
    { id: 'media-player', name: 'Media player' }, 
    { id: 'pop-up', name: 'Pop-up' }, 
    { id: 'select', name: 'Select' }, 
    { id: 'separator', name: 'Separator' },
    { id: 'sub-buttons', name: 'Sub-buttons' }
  ];
}
