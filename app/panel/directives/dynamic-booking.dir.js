
(function() {

function rmDynamicBooking(HeaderDataSvc) {
  return {
    restrict: "A",
    scope: true,
    templateUrl: "dynamic-booking.dir.html",
    link: function (scope, element, attributes) {

      var expr = attributes.rmDynamicBooking;

      scope.bookBtnVisible = function() {
        return HeaderDataSvc.panelBookingEnabled && scope.booking && !scope.booking.busy;
      };

      if(expr) {
        //scope.booking = undefined;
        scope.$watch(expr, function (value) {
          if (value) {
            scope.booking = value;
          }
        });
      }

      scope.now = !!attributes.now;
    }
  };
}

  angular
    .module('rm')
    .directive('rmDynamicBooking',rmDynamicBooking);
})();