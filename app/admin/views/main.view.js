(function(){

  /**
   * @ngInject
   */
  function MainCtrl ($scope, HeaderDataSvc, AuthSvc) {

    $scope.getTime = function() {
      return HeaderDataSvc.timeStr;
    };

    $scope.auth = AuthSvc;
  }

  angular
    .module("rm")
    .controller('MainView', MainCtrl);
})();