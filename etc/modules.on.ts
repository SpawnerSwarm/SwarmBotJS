import { PathLike } from "fs";

export type Modules = {root: PathLike, modules: PathLike[]}

export default {
    root: "./modules",
    modules: [
        "/Bazaar/Haven.js",
        "/Bazaar/Maroo.js",
        "/DeadlyRunners.js"
    ]
} as Modules;
