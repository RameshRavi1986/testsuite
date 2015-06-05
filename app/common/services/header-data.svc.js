'use strict';

/* Services */
(function () {
  var refreshInterval = 5; //seconds
  var url = "header.json"; //relative url
  var timeout = 2000;

  var defaultAlertOffsets = {
    from: -30,
    to: 60
  };

  var HeaderDataSvc = function ($http, $interval, $rootScope, $filter, RmConfigSvc) {
    var service = {
      roomName: null,
      roomId: null,
      time: new Date(),
      authGroup: 0,
      alerts: {},
      newsEnabled: false,
      errorMsg: null
    };

    service.settings = {
      minLength: 15,
      maxLength: 90,
      buffer: 15,   // length of time that must be left between this and the next booking,
      increment: 15 // increment of time for booking adjustment
    };

    //var resource = $resource(url);
    service.valid = false;

    function processHeaderData(data) {
      var time     = data.time ? new Date(data.time) : new Date();

      service.offset   = parseInt(data.offset);
      service.mode     = parseInt(data.mode);
      service.time = time;
      service.valid    = true;
      service.timeStr = service.formatTime(service.time);
      service.dateStr = $filter('date')(service.time, "EEEE, MMMM d");
      service.errorMsg = null;

      //panel specific config
      if(RmConfigSvc.panelModeEnabled) {

        service.panelTheme = data.panelTheme;
        service.panelBookingEnabled = data.panelBookingEnabled || false;

        var room = data.room || {};
        service.roomName = room.name || "";
        service.roomId = room.id || null;

        if(!service.roomId) {
          service.errorMsg = "Invalid Room";
        }
      }

      //alerts info
      if(data.alertOffsets) {
        var alertOffsets = data.alertOffsets || defaultAlertOffsets;

        service.alerts.from = service.getOffsetTime(alertOffsets.from, 10);
        service.alerts.to   = service.getOffsetTime(alertOffsets.to, 10);
      }

      $rootScope.$broadcast("HeaderDataSvc:update");
    }

    function handleError(data, status) {
      switch(status) {

        case 304:
          return;

        case 401:
        case 403:
          service.errorMsg = "Authentication Error";
          break;

        case 503:
        default:
          service.errorMsg = "Server Offline";
          break;
      }

      $rootScope.$broadcast("HeaderDataSvc:error");
    }

    function sync() {
      $http.get(url,{
        timeout: timeout
      })
        .success(processHeaderData)
        .error(handleError)
    }

    sync();

    //resync at regular intervals
    $interval(sync, refreshInterval*1000);

    //public API
    service.resync = function () {
      sync();
    };

    service.isValid = function() {
      return service.errorMsg == null;
    };

    service.formatTime = function(time) {
      //return $filter('date')(time, "h:mm a");
      return $filter('date')(time, "H:mm");
    };

    function getTime(hour, min) {
      var time = new Date(service.time);

      time.setHours(hour);
      time.setMinutes(min);
      time.setMilliseconds(0);

      return time;
    }

    var DAY = 86400000;
    var MINUTE = 60*1000;

    /**
     * Returns true if the supplied date object is the same day as the current time
     * @param date
     * @returns {boolean}
     */
    service.isToday = function(date) {
      var a = Math.floor(date.getTime() / DAY);
      var b = Math.floor(service.time.getTime() / DAY);
      return a == b;
    };

    //timeline vars are currently constant but could be moved to header data config in the future
    var timelineStart = 8;
    var timelineEnd = 18;
    var timeline = [];

    function calcTimeline() {
      timeline = [];

      for(var i = timelineStart ; i <= timelineEnd; i++) {
        timeline.push(getTime(i,0));
      }
    }
    calcTimeline();

    service.getTime = function(hour, min) {
      if(!hour) {
        return time;
      }

      min = min || 0;
      return getTime(hour, min);
    };

    service.getOffsetTime = function(offsetMins, step) {

      offsetMins = offsetMins || 0;

      var mins = service.time.getTime()/MINUTE + offsetMins;

      //round to nearest multiple of step
      if(step) {
        mins = step*Math.round(mins/step)
      }

      return new Date(mins*MINUTE);
    };

    service.getOffsetTimeStr = function(offsetMins) {
      return service.formatTime(service.getOffsetTime(offsetMins));
    };

    service.getTimeline = function() {
      return timeline;
    };

    service.getTimelineStart = function() {
      return timeline[0];
    };

    service.getTimelineEnd = function() {
      return timeline[timeline.length-1];
    };

    service.getEndOfDay = function() {
      return service.getTime(20,0);
    };


    return service;
  };

  angular.
    module('rm').
    factory('HeaderDataSvc', HeaderDataSvc);

})();