
(function() {

  function CalAlertListCtrl($scope, $interval, HeaderDataSvc, BookingSvc) {

    $scope.alerts = [];

    function sync() {

      $scope.info = {
        date: HeaderDataSvc.dateStr,
        from: HeaderDataSvc.formatTime(HeaderDataSvc.alerts.from),
        to:   HeaderDataSvc.formatTime(HeaderDataSvc.alerts.to)
      };

      BookingSvc.getAlerts(function(data) {
        var list = [];
        data.forEach(function(item) {
          //only include item if it has resources
          if (item.hasResources()) {
            list.push(item);
          }
        });
        $scope.alerts = list;
        console.debug("Alerts updated : %d", list.length);
      });
    }

    $scope.$on("BookingUpdated", function(oldBooking, newBooking) {
      sync();
    });
    $scope.$on("BookingDeleted", function(event, deletedBooking) {
      sync();
    });


    sync();
    $interval(sync, 60*1000); //every minute
  }

  function CalAlertListDir() {
    return {
      restrict: "E",
      scope: true, //new scope based on parent
      controller: CalAlertListCtrl,
      templateUrl: "cal-alert-list.dir.html",
      link: function (scope, element, attr) {
      }
    };
  }

  angular
    .module('rm')
      .directive('calAlertList',CalAlertListDir);
})();