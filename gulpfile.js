const gulp = require('gulp');
const tslint = require('gulp-tslint');

const fs = require('fs');

let config = JSON.parse(fs.readFileSync('./tslint.json'));

gulp.task('tslint', () => {
    gulp.src(['src/**/*.ts', 'test/**/*.ts'])
      .pipe(tslint(config))
        .pipe(tslint.report())
});

gulp.task('default', ["tslint"]);