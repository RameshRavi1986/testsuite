/**
 * Created by tmakin on 26/10/14.
 */
'use strict';
/* Services */
(function () {

  var refreshInterval = 5000; //10 seconds

  var RoomStatusSvc = function ($http, $state, $rootScope, HeaderDataSvc, BookingSvc, Booking) {

    /*
    var socket = null;

    function checkSocket() {
      if (!socket || socket.readyState == WebSocket.CLOSED) {

        console.debug("socket connecting...");
        socket = $websocket('ws://localhost:8001')
          .onOpen(function () {
            console.debug("socket open!");
          })
          .onMessage(function (message) {
            console.debug("Websocket data: ",message.data);
            //console.debug(socket.readyState);
          });
      }
    }

    if(window.WebSocket) {
      setInterval(checkSocket, 10000);
    }
    */

    var lastUpdate = {
        eTag:null,
        time:null
    };

    var data = [];

    var service = {
      lastQuery: null
    };

    //private methods
    function getMinutesBetweenDates(startDate, endDate) {
      var diff = endDate.getTime() - startDate.getTime();
      return (diff / 60000);
    }

    function clearData() {
      data = [];
    }

    function setData(bookings) {
      clearData();

      var time = HeaderDataSvc.time;

      bookings.forEach(function (item) {

        var end = new Date(item.end);

        if(end < time) {
          return;
        }

        data.push(item);
      });

      if (data.length) {
        var first = data[0];

        var availableFor = 0;
        if(first.vacant) {
          first.setStart(HeaderDataSvc.time);

          availableFor = getMinutesBetweenDates(HeaderDataSvc.time, first.end);

          if (availableFor < 0) {
            availableFor = 0;
          }
        }

        service.availableFor = availableFor;
        service.busy = availableFor < 5;
        service.currentBooking = first;
        service.nextBooking = data.length > 1 ? data[1] : null;
      }
      else {

        service.currentBooking = null;
        service.nextBooking = null;
        service.availableFor = 24 * 60; //24 hours is default value
      }
    }

    function sync() {

      if(!HeaderDataSvc.isValid()) {
        $state.go("offline");
        return;
      }

      var time = HeaderDataSvc.time;

      BookingSvc.getRoomData(HeaderDataSvc.roomId, {
          date:time,
          vacant:true
      }, function(bookings, eTag) {

          //clear the etag if more than 5 minutes different (older or newer)
          if(lastUpdate.eTag && Math.abs(getMinutesBetweenDates(time, lastUpdate.time)) > 5) {
              lastUpdate.eTag = null;
          }

          if(eTag == lastUpdate.eTag) {
              console.debug("Booking data already up to date");
              return;
          }

          lastUpdate = {
              eTag: eTag,
              time: time
          };

          setData(bookings);

          $rootScope.$broadcast("RoomStatusSvc:update", data);
          console.debug("Booking data updated");
      });
    }

    //events
    sync();
    $rootScope.$on("HeaderDataSvc:update", sync);
    $rootScope.$on("HeaderDataSvc:error", sync);

    //public API
    service.getBooking = function (index) {
      if (service.data && service.data.length > index) {
        return service.data[index];
      }

      console.debug("no booking at index " + index);

      return null;
    };

    service.getData = function () {
      return data;
    };

    service.getStatus = function (booking) {
      if(!booking) {
        booking = service.currentBooking;
      }

      if(!booking) {
        return "None";
      }

      if (booking.busy) {
        return "Busy";
      }

      var endOfDay = HeaderDataSvc.getTimelineEnd();
      if (booking.end > endOfDay) {
        return "Available for the rest of the day";
      }

      var msg = "Available for ";

      return msg + booking.getLengthText();
    };

    service.getFirstAvailableBooking = function() {
      for(var i =0; i < data.length; i++) {
        if(data[i].vacant) {
          return data[i];
        }
      }

      return null;
    };

    return service;
  };

  angular.
    module('rm').
    factory('RoomStatusSvc', RoomStatusSvc);
})();