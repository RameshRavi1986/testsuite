
var gulp   = require('gulp');

gulp.task('compile:jade', function() {

  var jade   = require('gulp-jade');
  var rename = require('gulp-rename');
  var ngtemplate = require('gulp-angular-templatecache');

  return gulp.src(['./date-picker.dir.jade'])
    .pipe(jade({pretty:true}))
    .pipe(rename('date-picker.dir.html'))
    .pipe(gulp.dest(''))
    //.pipe(ngtemplate({module: 'rm'}))
    //.pipe(rename('rm-date-picker.dir.tpl.js'))
    //.pipe(gulp.dest(''));
});