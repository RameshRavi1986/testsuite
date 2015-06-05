(function(){

  /**
   * @ngInject
   */
  function BodyCtrl ($scope, HeaderDataSvc) {
    $scope.getTheme = function() {
      return HeaderDataSvc.panelTheme || "default";
    };
  }

  angular
    .module("rm")
    .controller('BodyCtrl', BodyCtrl);
})();