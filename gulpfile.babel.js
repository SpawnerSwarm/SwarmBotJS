import gulp from "gulp";
import tslint from "gulp-tslint";
import ts from "gulp-typescript";
import * as fs from "fs";
import del from "del";
import { exec } from 'child_process';

export function lint() {
    return gulp.src('src/**/*.ts')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report({
            allowWarnings: true,
        }));
};

export function clean() {
    return del(['dist/**/*.js.map']);
}

export function tsc() {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            allowJs: true,
            module: "commonjs",
            target: "es2016",
        }))
        .pipe(gulp.dest('dist'))
};
export { tsc as build }

export function docker() {
    return exec('docker build -t swarmbot -f Dockerfile .');
}

export function start() {
    if(fs.existsSync('env.js')) {
        //Setup testing environment variables
        require('./env.js');
        //Start bot without Docker
        return require('./dist/main.js');
    }
    return 1;
};

export const bs = gulp.series(tsc, clean, start);
gulp.task('build-start', bs);

export const bd = gulp.series(tsc, clean, docker);
gulp.task('build-docker', bd);

export const lbs = gulp.series(lint, bs);
gulp.task('lint-build-start', lbs);

export const lb = gulp.series(lint, tsc, clean);
gulp.task('lint-build', lb);

export default lb;