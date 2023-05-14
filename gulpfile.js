const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// Tarea para minificar el archivo CSS
gulp.task('minify-css', function(done) {
  return gulp.src('src/css/style.css')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('src/css'));
});

// Tarea para minificar el archivo JS
gulp.task('minify-js', function(done) {
  return gulp.src('src/js/scripts.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('src/js'));
});

