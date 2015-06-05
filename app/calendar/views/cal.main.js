(function(){

  /**
   * @ngInject
   */
  function CalCtrl ($scope, HeaderDataSvc, DisplayParamsSvc) {

    $scope.display = DisplayParamsSvc;

    $scope.onDateChange = function() {
      DisplayParamsSvc.save();
      console.debug("CalCtrl : date updated : ", DisplayParamsSvc.date);
    };

    $scope.checkStart = function(time) {
      console.debug("Validating time");
      return Math.random() < 0.6;
    };

    $scope.getTime = function() {
      return HeaderDataSvc.timeStr;
    }
  }

  angular
    .module("rm")
    .controller('CalCtrl', CalCtrl);
})();