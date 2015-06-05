module.exports = function(roomData, basePath) {

  var express = require("express"),
    bodyParser = require('body-parser'),
    path = require('path'),
    errorHandler = require('errorhandler');

  basePath = path.resolve(basePath);
  var contentPath = path.resolve(__dirname + "/content");

  console.log("content path : %s",contentPath);


  var router = require('./router.js');

  /*
  function acceptsSmil(req) {
    var userAgent = req.headers["user-agent"];
    //console.log(userAgent);
    return (userAgent && (userAgent.indexOf("ADAPI") >= 0));
  }
  */

  var app = express()
    .use(bodyParser.json())

    .use(function (req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    })

    .use(function (req, res, next) {
      console.log('%s %s', req.method, req.url, req.ip);

      if (req.method == "HEAD") {
        //console.log(req);
      }
      next();
    })

    .use("/content",express.static(contentPath))

    .use("/", new router(roomData))

    .use("/app", express.static(basePath))
    .use(express.static(basePath))



    .use(errorHandler({
      dumpExceptions: true,
      showStack: true
    }));

    //helper method for starting the server
    app.start = function(port) {
      app.listen(port, function() {
        console.log("Starting static @ http://localhost:" + port);
        console.log("Root:" + basePath);
      });
    };

  return app;
};


