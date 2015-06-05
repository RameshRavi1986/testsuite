'use strict';

/* Services */
(function () {
  var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

  //var timeout = 5*1000*60; //5 minute
  var timeout = 1000*60; //1 minute

  var RmTouchService = function ($interval, $timeout, $rootScope) {
    var service = {
      lastTouch: 0
    };

    function registerTouch() {
      service.lastTouch = Date.now();
    }

    //check time between touches
    $interval(function() {

      if(service.lastTouch == 0) {
        return;
      }

      var now = Date.now();
      var time = now-service.lastTouch;

      if(time < timeout)
      {
        return;
      }

      service.lastTouch = 0;

      console.debug("timeout event triggered");
      $rootScope.$broadcast("RmTouch:timeout");

    }, timeout/2);

    /**
     * initialize the touch service timeout
     */
    service.init = function() {
      //registerTouch();
    };

    //returns true if a touch has been recently registered
    service.isActive = function() {
      return service.lastTouch > 0;
    };

    //Public API

    /**
     * Bind element to mouse/touch handler and keep track of touch events
     *
     * @param element {DOM Node}
     * @param callback
     */
    service.bind = function(element, callback, args) {

      var options = {
        repeatable: false,
        holdTime:500,
        repeatTime:100,
        maxRepeats: 100
      };

      if(args) {
        angular.extend(options, args);
      }

      //validate args
      function validateTime(val) {
        if(val <= 0)
        {
          val = 1000;
        }
        else if(val <=10) {
          val*=1000;
        }

        return Math.ceil(val);
      }
      options.holdTime = validateTime(options.holdTime);
      options.repeatTime = validateTime(options.repeatTime);

      if(!element) {
        throw "RmTouch: Invalid element"
      }

      //angular elements are arrays so we need to extract the dom node
      if(element.length) {
        element = element[0];
      }

      if(!element.nodeName) {
        throw "Invalid dom node";
      }

      if(!(callback instanceof Function)) {
        throw "Invalid callback";
      }

      var repeatCount = 0;
      var timer = null;

      function start(e) {

        //ignore right mouse clicks
        if(e.button == 2) {
          return;
        }

        //TODO: double check that this pattern does not cause memory leak
        registerTouch();

        callback(e);

        if(options.repeatable) {
          repeatCount = 0;
          timer = $timeout(repeat, options.holdTime);
        }
      }

      //repeat the command
      function repeat(e) {
        callback(e);
        repeatCount++;

        if(repeatCount >= options.maxRepeats) {
          clearTimer();
          return;
        }
        timer = $timeout(repeat, options.repeatTime);
      }

      function clearTimer() {
        if(timer) {
          $timeout.cancel(timer);
          timer = null;
        }
      }

      //end the command
      function end() {
        clearTimer();
      }

      //kill the click handler
      element.onclick = function(e) { };

      if(supportsTouch) {
        element.ontouchstart = start;
      }
      else {
        element.onmousedown = start;
      }

      if(options.repeatable) {
        if(supportsTouch) {
          element.ontouchend = end;
        }
        else {
          element.onmouseup = end;
          element.onmouseout = end;
        }
      }
    };

    return service;
  };

  angular.
    module('rm').
    factory('RmTouch', RmTouchService);

})();