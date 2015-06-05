'use strict';

/* Services */
(function () {

  var path = "panels";

  function PanelStatusSvc(RestFactory) {
    return RestFactory({
      path:path,
      refreshInterval:10 //seconds
    });
  }

  angular.module('rm')
    .factory('PanelStatusSvc', PanelStatusSvc)
})();