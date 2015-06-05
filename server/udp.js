/**
 * Created by tmakin on 08/01/15.
 */
var dgram = require('dgram');

var testMessage = "RoomMate Server Online 3";
var multicastAddress = '224.0.0.1';
var multicastPort = 8001;

function createSocket() {
  var socket = dgram.createSocket('udp4');

  socket.bind(function () {
    var address = socket.address();
    console.log('UDP socket bound to ' + address.address + ":" + address.port);
    socket.setBroadcast(true);
    //socket.setMulticastTTL(128);
    //socket.addMembership(multicastAddress);
  });

  return socket;
}

module.exports = {

  //udp client
  broadcast : function () {
    var socket = dgram.createSocket('udp4');

    socket.bind(function () {
      var address = socket.address();
      console.log('UDP broadcaster bound to ' + address.address + ":" + address.port);
      socket.setBroadcast(true);
      socket.setMulticastTTL(128);
      socket.addMembership(multicastAddress);
    });

    var count = 0;

    var send = function () {
      count++;
      var message = "RoomMate server " + count;

      socket.send(new Buffer(message ),
        0,
        message.length,
        multicastPort,
        multicastAddress,
        function (err) {
          if (err) console.log(err);

          //console.log("Message sent: %s", message);
        }
      );
    };

    setInterval(send, 1000);
    send();

    return socket;
  },

  //create udp server
  listen : function() {
    var socket = dgram.createSocket('udp4');

    socket.bind(multicastPort, function () {
      var address = socket.address();
      console.log('UDP listener bound to ' + address.address + ":" + address.port);
      socket.setBroadcast(true);
      //socket.setMulticastTTL(128);
      socket.addMembership(multicastAddress);
    });

    socket.on("message", function (data, rinfo) {
      console.log("Message received from ", rinfo.address, " : ", data.toString());
    });

    return socket;
  }
};