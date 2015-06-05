
'use strict';
/* Services */
(function () {

  var DisplayParamsSvc = function (localStorageService) {

    var ls = localStorageService;

    var params = {
      hourOffset:7,
      hourCount:24-7,
      times: []
    };

    for(var i = params.hourOffset; i <= 24 ; i++) {
      params.times.push(i);
    }

    //local storage helpers
    function getInt(key,defaultValue) {
      params[key] = parseInt(ls.get(key) || defaultValue);
    }

    function getBool(key, defaultValue) {
      params[key] = ls.get(key) === "true";
    }

    function getDate(key, defaultValue) {
      var val = ls.get(key);
      var date = new Date(val || defaultValue);

      params[key] = date;
    }

    function set(key) {
      ls.set(key, params[key].toString());
    }

    getInt("height",50);
    getInt("width", 100);
    getBool("alerts", false);
    getBool("visitors", false);
    getDate("date", new Date());

    params.save = function() {
      set("height");
      set("width");
      set("alerts");
      set("visitors");
      set("date");
    };

    params.getDate = function()
    {
      return params.date;
    };

    params.calTimeToPositionPx = function(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();

      if(minutes == 0) {
        return params.height*(hours-params.hourOffset);
      }

      return Math.floor(params.height*((hours-params.hourOffset) + minutes/60));
    };

    params.calTimeToPositionPercent = function(date) {
      var startTime = new Date(params.date);
      startTime.setHours(params.hourOffset,0,0,0);

      var diff = (date - startTime);
      var factor = 100/(params.hourCount+1);
      var result = factor*diff/HOUR;

      return Math.round(result*100)/100;
    };

    var HOUR = 3600000;
    var MINUTE = 60000;
    params.calUpdateTimeFromPx = function(refDate, deltaPx, stepMins) {

      stepMins = stepMins || 5;

      var deltaHours = deltaPx/params.height;

      //round to nearest 5 mins
      var step = stepMins*MINUTE;
      var deltaTime = Math.round((deltaHours*HOUR)/step)*step;

      return new Date(refDate.getTime() + deltaTime);
    };

    params.calTimeFromPx = function(px) {
      var refDate = new Date(params.date);
      refDate.setHours(params.hourOffset,0,0,0);

      return params.calUpdateTimeFromPx(refDate, px);
    };

    return params;
  };

  angular.
    module('rm').
    factory('DisplayParamsSvc', DisplayParamsSvc);
})();