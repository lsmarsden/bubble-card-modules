export function suffix(str, suffix) {
    str = String(str);
    return str.endsWith(suffix) ? str : str + suffix;
}

export function prefix(str, prefix) {
    str = String(str);
    return str.startsWith(prefix) ? str : prefix + str;
}