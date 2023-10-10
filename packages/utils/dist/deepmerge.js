import deepmerge from "deepmerge";
export const deepMerge = (x, y, arrayMode = "merge") => {
    const options = {};
    if (arrayMode === "replace") {
        options.arrayMerge = (_d, s, _o) => s;
    }
    else if (arrayMode === "merge") {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options);
};
//# sourceMappingURL=deepmerge.js.map