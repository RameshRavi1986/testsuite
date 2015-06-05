/**
 * Created by tmakin on 26/10/14.
 */
'use strict';
/* Services */
(function () {

  var refreshInterval = 5000; //10 seconds
  var url = "/data/bookings";
  var timeout = 5000;

  var BookingSvc = function ($http, $interval, $rootScope, HeaderDataSvc, Booking) {

    var service = {
      lastQuery: null
    };


    //private methods
    function transformBookings(data) {
      var bookings = [];

      data.forEach(function (item) {
        try {
          bookings.push(new Booking(item));
        }
        catch(error) {
          console.warn(error, item);
        }
      });

      return bookings;
    }

    function getQueryUrl(booking) {
      var queryUrl = url+"/"+booking.roomId;

      //update
      if(booking.id) {
        queryUrl += "/"+booking.id;
      }

      return queryUrl;
    }

    service.validate = function(booking, callback) {
      if(!booking) {
        callback("Invalid booking");
        return;
      }

      $http({
        url: getQueryUrl(booking)+"?validate",
        method: booking.id ? "PUT" : "POST",
        data: booking,
        timeout: timeout
      }).success(function(data, status, headers) {

        callback(null);

      }).error(function(data, status, headers) {
        callback(data);
      });
    };

    function formatError(data, status) {
      switch(status) {
        case 503:
          return "Server offline";

        case 501:
          return "Server error";

        case 400:
          return data;

        default:
          return "Unknown error"
      }

    }

    service.add = function(booking, callback) {
      if(!booking) {
        return false;
      }

      var originalBooking = booking.getOriginalBooking();
      var deleteOriginal = false;

      if(originalBooking && originalBooking.roomId != booking.roomId) {
        booking.id = null;
        deleteOriginal = true;
      }

      function done(err, updatedBooking) {
        if(err) {
          console.debug(err);
        }
        else {
          $rootScope.$broadcast("BookingUpdated", booking, updatedBooking);
        }

        if(callback) {
          callback(err, updatedBooking);
        }
      }

      $http({
        url: getQueryUrl(booking),
        method: booking.id ? "PUT" : "POST",
        data: booking,
        timeout: timeout
      }).success(function(data, status, headers) {

        function done() {
          var updatedBooking = new Booking(data);
          $rootScope.$broadcast("BookingUpdated", updatedBooking);

          if(callback) {
            callback(null, updatedBooking);
          }
        }

        //check if we need to delete the original booking
        if(deleteOriginal) {
          service.delete(originalBooking, done);
        }
        else {
          done();
        }

      }).error(function(data, status, headers) {

        var err = "Failed to add booking: " + formatError(data, status);
        console.debug(err);
        if(callback) {
          callback(err, null);
        }
      });
    };

    service.delete = function(booking, callback) {
      if(!booking || !booking.id) {
        if(callback) {
          callback("Invalid booking");
        }
        return false;
      }

      function done(err) {
        if(err) {
          console.debug(err);
        }
        else {
          //console.debug("Broadcast booking deleted message");
          $rootScope.$broadcast("BookingDeleted", booking);
        }

        if(callback) {
          callback(err);
        }
      }

      $http({
        url: getQueryUrl(booking),
        method: "DELETE",
        timeout: timeout
      }).success(function() {
        done(null);
      }).error(function(data) {
        done("Delete failed : " + data);
      });
    };

    //booking search
    service.search = function(query, callback) {
        service.lastQuery = query;

        var queryUrl = url;

        if(query.roomId) {
          queryUrl += "/"+ query.roomId;
          delete query.roomId;
        }

        $http({
          url:queryUrl,
          method: "GET",
          params: query,
          timeout: timeout
        }).success(function(data, status, headers) {

          //console.debug("Search returned %d results", data.length);
          if(callback) {
            var bookings = transformBookings(data);
            callback(bookings);
          }
        }).error(function() {
          callback(null)
        });
    };

    // Booking cache stuff
    var roomDataCache = {};
    var HOUR = 60*60*1000;
    var DAY = 86400000;
    var MAX_CACHE_SIZE = 100;

    function clearCache() {
      console.debug("Booking data cache cleared");
      roomDataCache = {};
    }

    function expireCache() {
      var now = new Date();

      var count=0;

      for(var key in roomDataCache) {
        if(key && roomDataCache.hasOwnProperty(key)) {
          if(roomDataCache[key].expiry < now) {
            delete roomDataCache[key];
            console.debug("Cache entry expired %s", key);
          }
          else {
            count++
          }
        }

        //safety measure to prevent memory leaks
        if(count > MAX_CACHE_SIZE) {
          clearCache();
        }
      }
    }
    $interval(expireCache, 1000);

    function addCacheEntry(key, eTag, data) {

      if(!key) {
        console.debug("invalid cache key");
        return false;
      }

      //set expiry for 1 hour
      var now = new Date();
      var expiry = new Date(now.getTime() + HOUR);

      roomDataCache[key] = {
        eTag: eTag,
        expiry: expiry,
        data: data
      };

      return true;
    }

    function getCacheEntry(key) {

      var entry = roomDataCache[key];

      if(!entry) {
          return null;
      }

      //check for expiry
      var now = new Date();
      if(entry.expiry < now)
      {
        roomDataCache[key] = null;
        return null;
      }

      return entry;
    }


    service.validateFromCache = function(booking) {
      if(!booking || !booking.isValid()) {
        return false;
      }

      var cacheKey = generateCacheKey(booking.roomId, booking.start);
      var cachedData = getCacheEntry(cacheKey);
      if(!cachedData || !cachedData.data) {
        return true;
      }

      var bookings = cachedData.data;

      for(var i = 0 ; i < bookings.length; i++) {
        var test = bookings[i];

        //ignore booking with same id
        if(test.id == booking.id) {
          continue;
        }

        if(test.start < booking.end && test.end > booking.start) {
          return false;
        }
      }

      return true;
    };

    function generateCacheKey(roomId, date) {

      if(!roomId) {
        console.error("Invalid roomId");
        return null;
      }

      if(!(date instanceof Date)) {
        console.error("Invalid date");
        return null;
      }
      return roomId + ":"+Math.floor(date.getTime() / DAY);
    }

    service.getRoomData = function(roomId, options, callback) {

      if(!roomId) {
          console.error("Invalid room id");
          return;
      }

      var date = options.date || HeaderDataSvc.time;

      if(!(date instanceof Date)) {
          console.error("Invalid date");
          return;
      }

      var cacheKey = generateCacheKey(roomId, date);
      var cachedData = getCacheEntry(cacheKey);

      var from = new Date(date);
      var to = new Date(date);

      from.setHours(0,0,0,0);
      to.setHours(24,0,0,0);

      var query = {
        from:from,
        to:to
      };

      if(options.vacant) {
          query.vacant = true;
      }

      var headers = {};

      if(cachedData) {
        headers["ETag"] = cachedData.eTag;
      }

      $http({
        url:url +"/"+ roomId,
        method: "GET",
        params: query,
        headers: headers,
        timeout: timeout
      }).success(function(data, status, headers) {

        var bookings = transformBookings(data);

        var eTag = headers("ETag");
        if(eTag) {
          addCacheEntry(cacheKey, eTag, bookings);
        }

        callback(bookings, eTag);
      }).error(function(data, status) {

        if(status == 304 && callback) {
          //console.debug("Room data returned from cache %s", roomId);

          callback(cachedData.data, cachedData.eTag);
        }else {
          callback(null,null);
        }
      })
    };

    service.getAlerts = function(callback) {

      var query = {
        from:HeaderDataSvc.alerts.from,
        to:HeaderDataSvc.alerts.to,
        startOnly:true
      };

      service.search(query, callback);
    };

    return service;
  };

  angular.
    module('rm').
    factory('BookingSvc', BookingSvc);
})();