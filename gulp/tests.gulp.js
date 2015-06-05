var gulp = require('gulp'),
    karma = require('karma').server,
    protractor = require("gulp-protractor").protractor;




gulp.task('unit', function (done) {
  karma.start({
    configFile: __dirname + '/tests/unit/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('e2e', function(done) {
  var args = ['--baseUrl', 'http://127.0.0.1:8888'];
  gulp.src(["./tests/e2e/**/*.js"])
    .pipe(protractor({
      configFile: "../tests/e2e/protractor.conf.js",
      args: args
    }))
    .on('error', function(e) { throw e; });
});

