(function () {

  /**
   * @ngInject
   */
  function EditBookingModal(
      $scope, $timeout, $mdDialog, $mdToast,
      AuthSvc, BookingSvc, RoomListSvc, LogoListSvc, CategoryListSvc, Booking,
      args) {

    $scope.categories = CategoryListSvc.getData();
    $scope.logos = LogoListSvc.getData();
    $scope.rooms = RoomListSvc.getData();

    if(args.booking) {
      $scope.isNew = false;
      $scope.title = "Edit Booking";
      $scope.booking = args.booking.duplicate();
    }
    else {
      $scope.isNew = true;
      $scope.title = "Add Booking";

      var step   = 5*60000; //30 mins
      var length = 60*60000; //1 hour

      var start = args.start || new Date();
      var startTime = Math.round(start.getTime()/step)*step; //round to nearest multiple of step

      var end = args.end || new Date(startTime + length);
      var endTime = Math.round(end.getTime()/step)*step; //round to nearest multiple of step

      var data = {
          roomId : args.roomId || $scope.rooms[0].Id,
          title : "New booking",
          start : new Date(startTime),
          end   : new Date(endTime)
      };

      $scope.booking = new Booking(data);
    }

    $scope.date = $scope.booking.start;

    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {

      console.debug("cancel booking dialog");

      //$mdDialog.cancel();

      var showConfirm2 = function(ev) {
        var confirm = $mdDialog.confirm()
          .title('Discard unsaved changes?')
          .ariaLabel('Discard Changes')
          .ok('Yes')
          .cancel('Back')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function() {
          $scope.alert = 'You decided to get rid of your debt.';
        }, function() {
          $mdDialog.cancel();
        });
      };

      //TODO : replace this when md v9 comes out
      var showConfirm = function() {
        if(confirm("Discard unsaved changes?"))
        {
          $mdDialog.cancel();
        }
      };

      if($scope.dirty)
      {
        showConfirm();
      }
      else
      {
        $mdDialog.cancel();
      }
    };

    function showMessage(message) {
      $mdToast.show(
          $mdToast.simple()
              .content(message)
              .position("top center")
              .hideDelay(3000)
      );
    }

    $scope.valid = true;

    function validate() {
      $scope.valid = BookingSvc.validateFromCache($scope.booking);
    }

    /**
     * preload data relevant to the current booking
     */
    function updateCache() {
      BookingSvc.getRoomData($scope.booking.roomId, {date:$scope.booking.start}, function() {
        $timeout(validate)
      });
    }

    $scope.deleteBooking = function() {
      var booking = $scope.booking;

      if(!window.confirm("Are you sure you want to delete this booking?"))
      {
        return;
      }

      $mdDialog.hide();

      BookingSvc.delete(booking, function(err) {
        showMessage(err || "Booking Deleted!");
      });
    };

    $scope.confirm = function() {
      var booking = $scope.booking;
      $mdDialog.hide();

      BookingSvc.add(booking, function(err) {
        showMessage(err || "Booking saved!")
      });
    };

    $scope.getCategoryColor = function() {
      return CategoryListSvc.getColor($scope.booking.categoryId);
    };

    $scope.dirty = false;

    $scope.onChange = function() {
      $scope.dirty = true;
    };

    $scope.onChangeRoom = function() {
      updateCache();
      $scope.onChange();
    };

    $scope.onChangeDate = function() {
      $scope.booking.setDate($scope.date);
      updateCache();
      $scope.onChange();
    };

    $scope.onChangeTime = function() {
      validate();
      $scope.onChange();
    };

    $scope.onChangePrepared = function() {

      if($scope.booking.prepared && !$scope.booking.preparedBy) {
        $scope.booking.preparedBy = AuthSvc.getUserName();
      }
      $scope.onChange();
    };

    $scope.onChangeAttendees = function() {
      $scope.booking.updateAttendees();
      $scope.dirty = true;
    };

    $scope.onChangeLogoImage = function() {
      $scope.dirty = true;
    };

    $scope.validateStartTime = function(time) {

      if(time >= $scope.booking.end) {
        return false;
      }

      //TODO: consider changing the behaviour when booking is not in valid state
      if(!$scope.valid) {
        //return true;
      }


      var test = $scope.booking.duplicate();
      test.start = time;

      return BookingSvc.validateFromCache(test);
    };

    $scope.validateEndTime = function(time) {

      if(time <= $scope.booking.start) {
        return false;
      }

      if(!$scope.valid) {
        //return true;
      }

      var test = $scope.booking.duplicate();
      test.end = time;

      return BookingSvc.validateFromCache(test);
    };
  }

  angular
    .module('rm')
    .controller('BookingDialog', EditBookingModal);
})();