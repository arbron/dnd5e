import gulp from "gulp";

import * as CSS from "./utils/css.mjs";
import * as linting from "./utils/lint.mjs";
import * as packs from "./utils/packs.mjs";


export default gulp.series(
  gulp.parallel(CSS.compile),
  CSS.watchUpdates
);
export const css = gulp.series(CSS.compile);
export const cleanPacks = gulp.series(packs.clean);
export const compilePacks = gulp.series(packs.compile);
export const extractPacks = gulp.series(packs.extract);
export const lint = gulp.series(linting.lint);
export const buildAll = gulp.parallel(
  CSS.compile,
  packs.compile
);
