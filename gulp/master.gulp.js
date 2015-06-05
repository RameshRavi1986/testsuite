var gulp    = require("gulp");
var zip     = require("gulp-zip");
var rimraf  = require("rimraf");
var runSequence  = require("run-sequence");
var plugins = require('gulp-load-plugins')();

var appOutputDir = "../build/app";
var zipOutputDir = "../build/zip";
var binDir = "D:/Dropbox/RoomMate/C#/ServerConsole/bin/Release/App";

var config = require("./config/common-config.json");

var fontDir  = config.outputDir + "fonts";
var imageDir = config.outputDir + "images";

gulp.task("clean", function(cb) {
    rimraf(appOutputDir, cb);
});

gulp.task("fonts", function () {
  return gulp.src("../app/fonts/*")
    .pipe(gulp.dest(fontDir))
});

gulp.task("images", function () {
  return gulp.src("../app/images/*")
    .pipe(plugins.imagemin())
    .pipe(gulp.dest(imageDir));
});

gulp.task("zip", function() {

    //var expectOptions = {
    //  reportUnexpected:false
    //};

    //var expectedFiles=["**/*.ttf","*.woff","*.css","*.html", "*.js"];


    //var expect = require("gulp-expect-file");

    return gulp.src([appOutputDir+'/**',"!**/*.zip"])
        //.pipe(expect(expectOptions, expectedFiles))
        .pipe(zip('app.zip'))
        .pipe(gulp.dest(binDir))
        .pipe(gulp.dest(zipOutputDir));
});

//this will overwrite the default tasks defined in the required files
gulp.task("default", function() {

  var build = require("./build.gulp.js");

  var calendar = build("calendar");
  var panel    = build("panel");
  var admin    = build("admin");

  var smil = require('./smil.gulp.js');

  console.log(calendar, panel, admin, smil);

  runSequence('clean',
    ["fonts","images",panel,calendar,admin,smil],
    "zip"
  );
});
