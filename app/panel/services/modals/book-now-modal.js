/**
 * Created by tmakin on 28/10/14.
 */
(function(){

  /**
   * @ngInject
   */
  function BookModalCtrl($modal, booking) {

    if(!booking || booking.busy) {
      console.warn("Invalid booking");
      return;
    }

    this.open = function (size) {

      var modalInstance = $modal.open({
        templateUrl: '/book-now.html',
        controller: 'BookModalInstanceCtrl',
        size: size,
        resolve: {
          booking: function () {
            return booking;
          }
        }
      });

      var self = this;

      modalInstance.result.then(function (selectedItem) {
        this.selected = selectedItem;
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    };
  }

  /**
   * @ngInject
   */
  function BookModalInstanceCtrl($scope, $modalInstance, BookingSvc, booking) {

    $scope.booking = booking;

    $scope.getStatus = function() {
      return BookingSvc.getStatus(booking);
    };

    var length = (Math.round(BookingSvc.availableFor/15) * 15);
    $scope.length = length;

    $scope.ok = function () {

      BookingData.bookNow($scope.length);
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    var inc = 15;

    $scope.minus = function() {

      if($scope.length <= inc) {
        $scope.length = 0;
      } else {
        $scope.length -= inc;
      }
    };

    $scope.plus = function() {
      $scope.length += inc;
    };
  }

  angular.
    module("rm").
    controller('BookModalCtrl', BookModalCtrl).
    controller('BookModalInstanceCtrl', BookModalInstanceCtrl);


  angular.module("template/modal/backdrop.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/modal/backdrop.html",
      "<div class=\"modal-backdrop {{ backdropClass }} in\"\n" +
      "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"\n" +
      "></div>\n" +
      "");
  }]);

  angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/modal/window.html",
      "<div tabindex=\"-1\" role=\"dialog\" class=\"modal\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
      "  <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\">" +
      "  <div class=\"modal-content\" modal-transclude></div></div>\n" +
      "</div>");
  }]);


})();