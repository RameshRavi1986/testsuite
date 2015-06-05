/**
 * Created by tmakin on 26/10/14.
 */
'use strict';
/* Services */
(function () {

  var refreshInterval = 60000; //1 minute
  var url = "/data/news";

  var NewsService = function ($http, $interval, $rootScope, HeaderDataSvc) {

    var service = {
      enabled: true,
      data: []
    };

    function processData(data) {
      data.forEach(function (item) {

        var content = item.content || [];

        if(!Array.isArray(content)) {
          content = [content];
        }

        item.content = content;
      });
    }

    function clearData() {
      service.data = [];
    }

    function setData(data) {
      service.data = [];

      if(!data) {
        return;
      }

      processData(data);

      bookings.forEach(function (item) {
        //add all news for now
        service.data.push(item);
      });

      $rootScope.$broadcast("News:update", data);
      console.debug("News updated %d", data.length);
    }

    var eTag = null;
    function sync() {

      if(!HeaderDataSvc.newsEnabled) {
        setData(null);
        return;
      }

      var query = {roomId:HeaderDataSvc.roomId};
      //resource.query(setData);
      $http({
        url:url,
        method: "GET",
        params: query
      }).success(function(data, status, headers) {

        var newETag = headers('ETag') + HeaderDataSvc.offset+HeaderDataSvc.mode;

        if(eTag != newETag) {
          eTag = newETag;
          setData(data);
        }
      });
    }

    //public API
    service.getData = function () {
      return service.data;
    };

    //startup
    sync();
    $interval(sync, refreshInterval);

    return service;
  };

  angular.
    module('rm').
    factory('News', NewsService);
})();