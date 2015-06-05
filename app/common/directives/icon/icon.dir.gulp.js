/**
 * Created by tmakin on 21/03/15.
 */


function parseSvgs() {

  var map = {};

  var fs = require("fs");
  var cheerio = require("cheerio");

  var files = fs.readdirSync("./svg");

  var htmlOptions = {
    preserveLineBreaks:false,
    collapseWhitespace: true,
    removeComments:true
  };

  var htmlmin = require("htmlmin");

  files.forEach(function(file) {
    var path = "./svg/"+file;
    var contents = fs.readFileSync(path);
    var $ = cheerio.load(contents.toString());

    //var data = $("svg").text();

    var data = $.xml('svg > *');

    var name = file.substr(0,file.indexOf("."));

    map[name] = htmlmin(data);
  });

  return map;
}

var prefix = "var svgMap";

var gulp   = require('gulp');
gulp.task('compile', function() {

  var replace = require('gulp-replace');
  var rename = require('gulp-rename');

  var shapes   = parseSvgs();
  var text = prefix+"="+JSON.stringify(shapes, null, 1);

  return gulp.src('./icon.dir.tpl.js')
    .pipe(replace(prefix, text))
    .pipe(rename('icon.dir.js'))
    .pipe(gulp.dest('./'));
});