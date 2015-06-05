module.exports = "smil.all";

var gulp    = require("gulp");

var outputDir = "../build/app/smil/";
var smilDir = "../app/smil/";

var cacheBuster = "v"+Math.round(new Date().getTime() / 1000);

gulp.task("smil.clean", function(cb) {
  var rimraf  = require("rimraf");
  rimraf(outputDir, cb);
});

gulp.task("smil.index", function(cb) {
  var replace = require("gulp-replace");

  return gulp.src([smilDir+'index.smil',smilDir+'panel.smil'])
    .pipe(replace("cacheBuster", cacheBuster))
    .pipe(gulp.dest(outputDir));
});


gulp.task("smil.all", function() {
  var runSequence  = require("run-sequence");

  runSequence('smil.clean', "smil.index"
  );
});

//this will overwrite the defualt tasks defined in the required files
gulp.task("default", ["smil.all"], function() {
});
