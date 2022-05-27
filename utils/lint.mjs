import eslint from "gulp-eslint7";
import gulp from "gulp";
import gulpIf from "gulp-if";
import mergeStream from "merge-stream";
import yargs from "yargs";


const parsedArgs = yargs.argv;

/**
 * Paths of javascript files that should be linted.
 * @type {string[]}
 */
const LINTING_PATHS = ["./dnd5e.js", "./module/"];


/**
 * Lint javascript sources and optionally applies fixes.
 *
 * - `gulp lint` - Lint all javascript files.
 * - `gulp lint --fix` - Lint and apply available fixes automatically.
 */
function lintJavascript() {
  const applyFixes = !!parsedArgs.fix;
  const tasks = LINTING_PATHS.map(path => {
    const src = path.endsWith("/") ? `${path}**/*.js` : path;
    const dest = path.endsWith("/") ? path : `${path.split("/").slice(0, -1).join("/")}/`;
    return gulp
      .src(src)
      .pipe(eslint({fix: applyFixes}))
      .pipe(eslint.format())
      .pipe(gulpIf(file => file.eslint != null && file.eslint.fixed, gulp.dest(dest)));
  });
  return mergeStream(null, tasks);
}
export const lint = lintJavascript;
