/**
 * Created by tom on 14/05/2015.
 */

module.export = function() {

//websocket server
  var ws = require("nodejs-websocket");

// Scream server example: "hi" -> "HI!!!"
  var server = ws.createServer(function (conn) {
    console.log("New connection");

    var interval = setInterval(function () {
      conn.sendText(new Date().toString())
    }, 5000);

    conn.on("text", function (str) {
      console.log("Received " + str);
      conn.sendText(str.toUpperCase() + "!!!")
    });

    conn.on("close", function (code, reason) {
      console.log("Connection closed");
      clearTimeout(interval);
    });


  });
  server.on("listening", function () {
    console.log("web socket listeneing");
  });

  server.on("error", function (err) {
    console.log("web socket error :", err);
  });

  server.listen(8001);
};