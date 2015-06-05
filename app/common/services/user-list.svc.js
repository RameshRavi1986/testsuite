'use strict';

/* Services */
(function () {

  var path = "users";

  function UserListSvc(RestFactory) {
    return RestFactory({path:path});
  }

  angular.module('rm')
    .factory('UserListSvc', UserListSvc)
})();