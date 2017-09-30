// Gulp tasks for roycebrooks

// Load plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    size = require('gulp-size'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    minifyCSS = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    csslint = require('gulp-csslint'),
    browserSync = require('browser-sync').create('roycebrooks'),
    browserReload = browserSync.reload;

// Load PostCSS plugins
var postcss = require('gulp-postcss'),
    corepostcss = require('postcss'),
    simplevars = require('postcss-simple-vars'),
    autoprefixer = require('autoprefixer-core'),
    mqpacker = require('css-mqpacker'),
    csswring = require('csswring'),
    nestedcss = require('postcss-nested');


// Minify all css files in the css directory
// Run this in the root directory of the project with `npm minify-css `
gulp.task('minify-css', function(){
  var processors = [
      csswring
    ];
  return gulp.src('src/css/main.css')
    .pipe(postcss(processors))
    .pipe(minifyCSS())
    .pipe(rename('main.min.css'))
    .pipe(size({gzip:true, showFiles: true}))
    .pipe(gulp.dest('public/css/'));
});

// Task that shaves some kB's from images
// Run this in the root directory of the project with `npm minify-img `
gulp.task('minify-img', function(){
  gulp.src('src/img/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
    }))
    .pipe(gulp.dest('public/img/'));
});

// Use csslint without box-sizing or compatible vendor prefixes (these
// don't seem to be kept up to date on what to yell about)
gulp.task('csslint', function(){
  gulp.src('src/css/main.css')
    .pipe(csslint({
          'compatible-vendor-prefixes': false,
          'box-sizing': false,
          'important': false,
          'known-properties': false
        }))
    .pipe(csslint.reporter());
});

// Task that compiles scss files down to good old css
gulp.task('pre-process', function(){
    var processors = [
        autoprefixer({browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']}),
        mqpacker
    ];
    return gulp.src("src/css/main.scss")
        .pipe(sass())
        .on('error', swallowError)
        .pipe(postcss(processors))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/css'))
        .pipe(gulp.dest('public/css'))
        .pipe(minifyCSS())
        .pipe(rename('main.min.css'))
        .pipe(size({gzip: false, showFiles: true}))
        .pipe(size({gzip: true, showFiles: true}))
        .pipe(gulp.dest('src/css/'))
        .pipe(gulp.dest('public/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});


// Task that concats js files down to one file
// It needs much improvements, we know ;-)
gulp.task('scripts', function() {
  return gulp.src(['src/js/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

// Task that moves html files from a to b
gulp.task('html', function() {
  gulp.src('src/**/*.html')
    .pipe(gulp.dest('public/'))
});

// Initialize browser-sync which starts a static server also allows for
// browsers to reload on filesave
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
          baseDir: "public/",
          injectChanges: true
        }
    });
});



// Allows gulp to not break after a sass error.
// Spits error out to console
function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}

/*
   DEFAULT TASK

 • Process sass then auto-prefixes and lints outputted css
 • Starts a server on port 3000
 • Reloads browsers when you change html, javascript or sass files

*/
gulp.task('default', ['pre-process', 'scripts', 'html', 'browser-sync'], function(){
  gulp.start('pre-process', 'csslint', 'minify-img');
  gulp.watch('src/css/*', ['pre-process']);
  gulp.watch('src/js/**/*.js', ['scripts', browserReload]);
  gulp.watch('src/*.html', ['html']);
  gulp.watch('public/*.html', browserReload);
});

