'use strict';

/* Services */
(function () {

  var paths = {
    rooms: "rooms",
    logos: "meta/logos",
    categories: "meta/categories"
  };

  var RestFactory = function($interval, $rootScope, Restangular) {

    return function(options) {

      if(!options.path) {
        throw "options.path is not defined";
      }

      var path = options.path;
      var refreshInterval = options.refreshInterval || 0;
      var success = options.success || function() {}; //default to no-op
      var defaultValue = options.default || null;

      //id cache
      var map = {};

      //private data
      var collection = Restangular.all(path);
      var eTag = null;
      var updateEventName = path+":updated";
      var valid = false;
      var data = [];

      function refresh(force) {
        return collection.getList().then(function (result) {

          if (eTag == result.eTag && !force) {
            console.debug(path + " : etag unchanged", result.eTag);
            return;
          }

          //rebuild map
          map = {};
          result.forEach(function(value) {
            map[value.id] = value;
          });

          eTag = result.eTag;
          data  = result;
          valid = (result.length > 0);
          $rootScope.$broadcast(updateEventName);
          console.debug("broadcast " + updateEventName);

          //call success callback
          success(data);
        });
      }

      function add(item) {
        return collection.post(item)
      }


      function find(id) {
        return map[id] || defaultValue;
      }

      function subscribe(scope, callback) {
        scope.$on(updateEventName, callback);
      }

      function getData(copy) {
          return data;
      }

      function copyData() {
        var result = [];

        data.forEach(function(item) {
          result.push(Restangular.copy(item));
        });

        return result;
      }

      refresh();

      //resync at regular intervals if required
      if(refreshInterval > 0) {
        $interval(refresh, refreshInterval*1000);
      }
      //public API
      return {
        refresh: refresh,
        find: find,
        subscribe: subscribe,
        add: add,
        getData: getData,
        copyData: copyData
      };
    };
  };

  //Service instances
  function RoomListSvc(RestFactory) {
    var svc = RestFactory({path:paths.rooms});

    svc.getRoomName = function(id) {
      var room = svc.find(id);

      if(room) {
        return room.name;
      }

      return "Invalid Room";
    };

    svc.getRoomCapacity = function(id) {
      var room = svc.find(id);

      if(room) {
        return room.capacity;
      }

      return 0;
    };

    return svc;
  }

  function CategoryListSvc(RestFactory) {

    var defaultCategory = {name:"None", color:"#aaa"};

    //create service
    var svc = RestFactory({
      path:paths.categories,
      default: defaultCategory
    });

    //extend API
    svc.getCategory = function(id) {
      return svc.find(id);
    };

    svc.getColor = function(id) {
      return svc.find(id).color;
    };

    return svc;
  }

  function initRestangular(RestangularProvider) {

    RestangularProvider.setBaseUrl("/data");
    RestangularProvider.setRestangularFields({
      etag: "eTag"
    });
  }


  angular.module('rm')
    .config(initRestangular)
    .factory('RestFactory', RestFactory)

    .factory('CategoryListSvc', CategoryListSvc)
    .factory('RoomListSvc', RoomListSvc);

})();