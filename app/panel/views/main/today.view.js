(function(){

  /**
   * @ngInject
   */
  function TodayCtrl ($scope, $stateParams, RoomStatusSvc) {

    var overview = this;
    overview.bookings = [];

    function sync() {
      overview.bookings = RoomStatusSvc.getData();
    }

    sync();
    $scope.$on("RoomStatusSvc:update", sync);

    this.targetTime = $stateParams.start || 0;
  }

  angular
    .module("rm")
    .controller('TodayCtrl', TodayCtrl);
})();