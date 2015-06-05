
(function() {

function rmBooking(HeaderDataSvc) {
  return {
    restrict: "EA",
    scope: true, //new scope based on parent
    templateUrl: "booking.dir.html",
    link: function (scope, element, attr) {
      var booking = scope.booking;

      scope.icons = !!attr.icons;
      scope.busy = booking.busy;

      //the search param is set on the containing booking-list directive
      if(scope.search) {
        scope.title = booking.getRoomName();
        scope.info  = booking.title;
      }
      else
      {
        scope.title = booking.title;
        scope.info = booking.getOrganizerName();

        if(booking.organizer.email) {
          scope.info += " - "+booking.organizer.email;
        }
      }

      scope.bookBtnVisible = HeaderDataSvc.panelBookingEnabled && !booking.busy;
    }
  };
}

  angular
    .module('rm')
    .directive('rmBooking',rmBooking);
})();