import * as path from "path";

//
// Joins multiple paths (and normalizes the result to foward slashes).
//
export function joinPath(...args: string[]): string {
    return path.join(...args).replace(/\\/g, "/");
}