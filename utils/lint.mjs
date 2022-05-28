import eslint from "gulp-eslint7";
import gulp from "gulp";
import gulpIf from "gulp-if";
import htmlLint from "gulp-html-lint";
import mergeStream from "merge-stream";
import through2 from "through2";
import yargs from "yargs";


const parsedArgs = yargs.argv;

/**
 * Paths of javascript files that should be linted.
 * @type {string[]}
 */
const JAVASCRIPT_LINTING_PATHS = ["./dnd5e.js", "./module/"];

/**
 * Paths of template files that should be linted.
 * @type {string[]}
 */
const TEMPLATE_LINTING_PATHS = ["./templates/"];


/**
 * Lint javascript sources and optionally applies fixes.
 *
 * - `gulp lint` - Lint all javascript files.
 * - `gulp lint --fix` - Lint and apply available fixes automatically.
 */
export function lintJavascript() {
  const applyFixes = !!parsedArgs.fix;
  const tasks = JAVASCRIPT_LINTING_PATHS.map(path => {
    const src = path.endsWith("/") ? `${path}**/*.js` : path;
    const dest = path.endsWith("/") ? path : `${path.split("/").slice(0, -1).join("/")}/`;
    return gulp
      .src(src)
      .pipe(eslint({fix: applyFixes}))
      .pipe(eslint.format())
      .pipe(gulpIf(file => file.eslint != null && file.eslint.fixed, gulp.dest(dest)));
  });
  return mergeStream(tasks);
}


export async function lintTemplates(cb) {
  return gulp
    // .src("./templates/chat/item-card.html")
    .src("./templates/**/*.html")
    .pipe(htmlLint({ htmllintrc: ".htmllintrc.json" }))
    .pipe(htmlLint.format())
    .pipe(htmlLint.failOnError());
}
