/**
 * Created by tom on 14/05/2015.
 */


  //room data
var roomData = require("./room-data.js");
roomData.startup();

//http servers
var server = require("./server.js");

var devPath = __dirname + '/../app';
var buildPath = __dirname + '/../build/app';

var devServer = new server(roomData, devPath);
var buildServer = new server(roomData, buildPath);

devServer.start(8000);
buildServer.start(9000);

//udp server
//var udp = require("./udp.js").broadcast();