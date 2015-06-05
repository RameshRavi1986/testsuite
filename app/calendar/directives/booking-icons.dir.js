(function () {

  function bookingIcons() {
    return {
      restrict: "E",
      scope: {
        booking: "="
      },
      templateUrl: "booking-icons.dir.html",
      link: function (scope, element, attr) {

        scope.getResourcesIconClass = function() {
          if(!scope.booking.hasResources())
          {
            return "icon-none";
          }

          if(scope.booking.prepared) {
            return "icon-green";
          }

          return "icon-red";
        };
      }
    };
  }

  angular
    .module('rm')
    .directive('rmBookingIcons', bookingIcons)
})();