'use strict';

/* Services */
(function () {

  var path = "meta/logos";

  function LogoListSvc(RestFactory) {
    return RestFactory({
      path:path,
      refreshInterval: 30 //seconds
    });
  }

  angular.module('rm')
    .factory('LogoListSvc', LogoListSvc)
})();