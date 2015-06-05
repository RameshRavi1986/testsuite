'use strict';

//reusable gulp script for building panel, admin and calendar pages
module.exports = function(configName) {

    var util    = require("util");
    var gulp    = require("gulp");
    var plugins = require('gulp-load-plugins')();
    var through = require('through');

    var config = require("./config/"+configName+"-config.json");
    var common = require("./config/common-config.json");

    var path= require("path");

    var appDir = path.resolve(common.outputDir + config.prefix);

    console.log("App Dir = %s",appDir);

    var cacheBuster = "v"+Math.round(new Date().getTime() / 1000);

    var outputFiles = {
        vendorJs:   config.prefix + ".vendor.js",
        appJs:      config.prefix + ".app.js",
        templateJs: config.prefix + ".templates.js",
        vendorCss:  config.prefix + ".vendor.css",
        appCss:     config.prefix + ".app.css"
    };

    function processBowerPaths(arr) {
        return arr.map(function (a) {
            return 'app/bower_components/' + a
        });
    }

    function count(name) {

        var count = 0;

        function countFiles(data) {
            count++;
            this.queue(data);
        }

        function endStream() {
            console.log(name + ": " + count + " files processed");
            this.queue(null);
        }

        return through(countFiles, endStream);
    }

    function echo(tag) {

        var count = 0;

        function countFiles(data) {
            console.log("%s : %s", tag, data.path);
            this.queue(data);
        }

        function endStream() {
            this.queue(null);
        }

        return through(countFiles, endStream);
    }

    function getTaskName(name) {
        return config.prefix + "." + name;
    }

    function start(name) {
        gulp.start(getTaskName(name));
    }

    //uses similar syntax to gulp task
    function task(name, dependencies, fn) {

        name = getTaskName(name);

        if(!fn) {
            fn = dependencies;
            gulp.task(name, fn);
        }
        else {
            for(var i= 0 ; i <dependencies.length; i++) {
                dependencies[i] = getTaskName(dependencies[i]);
            }
            gulp.task(name, dependencies, fn);
        }

        return name;
    }

    var src = null;

    task("appHtml", function (cb) {

        if(src) {
            console.log("sources already defined");
            return;
        }

        src = {
            js:  {vendor: [], app: []},
            css: {vendor: [], app: []},
            templates: []
        };

        //console.log("Finding sources...");

        var htmlPath = config.appDir + config.appHtml;

        var fs = require("fs");
        var cheerio = require("cheerio");

        var contents = fs.readFileSync(htmlPath);

        var $ = cheerio.load(contents.toString());

        var missingFiles = [];

        function appendFile(list, fileName) {
            if(!fileName || fileName.indexOf("dev") >=0) {
                return;
            }
            fileName = "../app"+fileName;

            try {
                //query the file
                fs.statSync(fileName);
            }
            catch (e) {
                missingFiles.push(fileName);
            }

            if(fileName.indexOf("bower_components") >= 0 || fileName.indexOf("vendor") >= 0) {
                list.vendor.push(fileName);
            } else {
                list.app.push(fileName);
            }
        }

        //process script tags
        $("script").each(function() {
            var element = $(this);
            appendFile(src.js, element.attr("src"));
        }).remove();


        var contentLinks = [];

        //process style tags
        $("link").each(function() {
            var element = $(this);
            var fileName = element.attr("href");

            //main refs to content
            if(fileName.indexOf("/content/") >=0) {
              contentLinks.push(fileName);
              return;
            }

            appendFile(src.css, element.attr("href"));
        }).remove();

        //check for missing files
        if(missingFiles.length) {
            console.log("Missing files", missingFiles);
            cb("One or more missing source files");
            return;
        }


        //find associated template files
        src.js.app.forEach(function(file) {
            var template = file.substr(0, file.lastIndexOf(".")) + ".html";
            try {
                //check if file exists
                fs.statSync(template);
                src.templates.push(template);
            }
            catch (e){}
        });


        [outputFiles.vendorCss, outputFiles.appCss].forEach(function(file) {
            var el = util.format('<link rel="stylesheet" href="/app/%s/%s?%s"/>',config.prefix, file,cacheBuster);
            $('head').append(el);
        });

        contentLinks.forEach(function(file) {
          var el = util.format('<link rel="stylesheet" href="%s?%s"/>',file,cacheBuster);
          $('head').append(el);
        });

        [outputFiles.vendorJs, outputFiles.appJs, outputFiles.templateJs].forEach(function(file) {
            var el = util.format('<script src="/app/%s/%s?%s"></script>',config.prefix, file,cacheBuster);
            $('body').append(el);
        });

        var outputFile = appDir+"/"+config.appHtml;

        var doc = $.html();

        var htmlOptions = {
            preserveLineBreaks:false,
            collapseWhitespace: true,
            removeComments:true
        };

        return gulp.src("dummy.html")
            .pipe(plugins.file(config.appHtml, doc))
            .pipe(plugins.htmlmin(htmlOptions))
            .pipe(gulp.dest(appDir));
    });

    task("templateJs",["appHtml"], function () {
        return gulp.src(src.templates)
            //.pipe(echo())
            .pipe(plugins.htmlmin({
                collapseWhitespace: true,
                removeComments: true,
                removeAttributeQuotes: true
            }))
            .pipe(plugins.angularTemplatecache({
                filename: outputFiles.templateJs,
                module: 'rm'
            }))
            .pipe(gulp.dest(appDir));
    });

    task("vendorCss", ["appHtml"], function () {

        var cssOptions = {
          keepSpecialComments: 0,
          advanced:false,
          aggressiveMerging:false,
          shorthandCompacting:false
        };

        return gulp.src(src.css.vendor)
            .pipe(plugins.minifyCss(cssOptions)) //minify before concat
            .pipe(plugins.concat(outputFiles.vendorCss))   // Combine into 1 file
            .pipe(gulp.dest(appDir));
    });

    task("vendorJs", ["appHtml"], function () {
        return gulp.src(src.js.vendor)            // Read the files
            //.pipe(echo("vendor js"))
            .pipe(plugins.concat(outputFiles.vendorJs))   // Combine into 1 fil
            .pipe(plugins.uglify({mangle: false}))                // Minify
            .pipe(gulp.dest(appDir));                      // Write minified to disk
    });

    task("appCss", ["appHtml"], function () {

        var cssOptions = {
          keepSpecialComments: 0,
          advanced:true,
          aggressiveMerging:true,
          shorthandCompacting:true
        };

        //cssOptions = {};

        return gulp.src(src.css.app)
            .pipe(plugins.concat(outputFiles.appCss))
            .pipe(plugins.minifyCss(cssOptions)) //minify after concat
            .pipe(gulp.dest(appDir));
    });

    task("appJs", ["appHtml"], function () {
        return gulp.src(src.js.app)
            //.pipe(echo("appJs"))
            .pipe(plugins.concat(outputFiles.appJs))
            .pipe(plugins.ngAnnotate())
            .pipe(plugins.stripDebug()) //remove console messages
            .pipe(plugins.uglify())
            .pipe(gulp.dest(appDir));
    });

    return task("all", ["vendorJs",
        "vendorCss",
        "appJs",
        "appCss",
        "templateJs"
    ],function(cb){cb()});
};