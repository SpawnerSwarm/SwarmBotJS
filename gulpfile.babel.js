import gulp from "gulp";
import tslint from "gulp-tslint";
import ts from "gulp-typescript";
import { fs } from "fs";

export function lint() {
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report({
            allowWarnings: true,
        }));
};

export function tsc() {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            allowJs: true,
            module: "commonjs",
            target: "es6"
        }))
        .pipe(gulp.dest('dist'))
};
export { tsc as build }

export function start() {
    if(fs.existsSync('env.js')) {
        //Setup testing environment variables
        require('./env.js');
        //Start bot without Docker
        return require('./dist/main.js');
    }
};

export const bs = gulp.series(tsc, start);
gulp.task('build-start', bs);

export const lbs = gulp.series(lint, bs);
gulp.task('lint-build-start', lbs);

export const lb = gulp.series(lint, tsc);
gulp.task('lint-build', lb);

export default lb;