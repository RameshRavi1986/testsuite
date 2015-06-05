(function () {

  function calAlertCtrl(HeaderDataSvc, $scope) {
    if(!$scope.booking) {
      console.error("Booking not defined");
    }

    $scope.alertText = function() {
      var mins = $scope.booking.getTimeBeforeStart();

      if(mins <= 1 && mins >= -1)
      {
        return "Starting now";
      }

      if(mins > 1)
      {
        return "Starts in " +mins + " mins";
      }

      if(mins < -1)
      {
        return "Started " + (-mins) + " mins ago";
      }
    }
  }

  function calAlert(EditBookingSvc) {
    return {
      restrict: "E",
      scope: true, //new scope based on parent
      controller: calAlertCtrl,
      templateUrl: "cal-alert.dir.html",
      link: function ($scope, element, attr) {

      }
    };
  }

  angular
    .module('rm')
    .directive('calAlert', calAlert);
})();