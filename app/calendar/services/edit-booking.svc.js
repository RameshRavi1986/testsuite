
'use strict';
/* Services */
(function () {

  var EditBookingSvc = function ($mdDialog, AuthSvc) {

    function show(args) {

      if(!AuthSvc.canEditBookings()) {

        var alert = $mdDialog.alert()
            .title('Sorry!')
            .content('You are not authorised to edit/add bookings')
            .ok('OK');

        return $mdDialog.show(alert);
      }

      $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: true, //NB no option given to save data
        controller: "BookingDialog",
        templateUrl: 'booking.dialog.html',
        locals: {args:args}
      });
    }

    //public API
    return {

      editBooking: function (booking) {
        show({booking: booking});
      },

      addBooking: function (roomId, start, end) {
        show({roomId: roomId, start: start, end:end});
      }
    }
  };

  angular.
    module('rm').
    factory('EditBookingSvc', EditBookingSvc);
})();