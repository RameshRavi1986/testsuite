
(function() {

  function VisitorReportCtrl($scope, $timeout, $window, dateFilter, $interval, AuthSvc, Restangular, DisplayParamsSvc) {

    $scope.visitors = [];
    $scope.date = null;

    $scope.unsent = "false";

    $scope.display = DisplayParamsSvc;

    function sync() {

      var collection = Restangular.all("visitors");

      var query = {
        from: $scope.date,
        unsent: $scope.unsent
      };

      collection.getList(query).then(function (data) {
        var list = [];
        data.forEach(function(item) {
            item.host = item.host || "";
            list.push(item);
        });

        $scope.visitors = list;

        if(list.length == 0) {
            $scope.message = "No visitors today";
        } else {
            $scope.message = list.length + " visitors";
        }
      });
    }

    $scope.$watch('display.date', function(newVal) {

      if(newVal) {
        $scope.message = "Loading...";
        $scope.date = newVal;
        $scope.visitors = [];

        $scope.dateStr = dateFilter(newVal);
        sync();
      }
    });

    $scope.refresh = function() {
      sync();
    };

    function generateArgs() {
      return "from="+$scope.date.toISOString()+"&unsent="+$scope.unsent;
    }

    $scope.generateEmail = function() {
      var url = "/data/visitors.eml?"+generateArgs();
      $window.location.href = url;
      $timeout(sync, 1000);
    };

    $scope.generateCsv = function() {
      var url = "/data/visitors.csv?"+generateArgs();
      $window.location.href = url;
      $timeout(sync, 1000);
    };

    $scope.showGenerateBtn = function() {
      return AuthSvc.canEditBookings();
    };


    //sync();
    $interval(sync, 60*1000); //every minute

    //update if booking updated
    $scope.$on("BookingUpdated",function(oldBooking, newBooking) {
        sync();
    });
  }

  function VisitorReportDir() {
    return {
      restrict: "E",
      scope: true, //new scope based on parent
      controller: VisitorReportCtrl,
      templateUrl: "visitor-report.dir.html",
      link: function (scope, element, attr) {
      }
    };
  }

  angular
    .module('rm')
      .directive('rmVisitorReport',VisitorReportDir);
})();