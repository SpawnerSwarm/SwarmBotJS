const gulp = require('gulp');
const tslint = require('gulp-tslint');
const ts = require('gulp-typescript');
const fs = require('fs');

gulp.task('lint', () => {
    gulp.src('src')
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report({
            allowWarnings: true,
        }));
})

gulp.task('tsc', () => {
    gulp.src('src/**/*.ts')
        .pipe(ts({
            allowJs: true,
            module: "commonjs",
            target: "es6"
        }))
        .pipe(gulp.dest('dist'))
})

gulp.task('start', () => {
    if(fs.existsSync('env.js')) {
        //Setup testing environment variables
        require('./env.js');
        //Start bot without Docker
        require('./dist/main.js');
    }
});

gulp.task('build-start', ['tsc', 'start']);

gulp.task('bs', ['build-start']);

gulp.task('lint-build-start', ['lint', 'build-start']);

gulp.task('lbs', ['lint-build-start']);

gulp.task('default', ['lint', 'tsc']);