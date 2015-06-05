/**
 * Created by tmakin on 31/10/14.
 */
(function(){

  var STATUS_NONE = 0;
  var STATUS_BUSY = 1;
  var STATUS_DONE = 2;

  /**
   * @ngInject
   */
  function AddBookingCtrl ($scope, $timeout, $stateParams, HeaderDataSvc, BookingSvc, Contacts, virtualKeyService) {

    var bookingStatus = STATUS_NONE; //non

    $scope.selectedContact = "";
    $scope.booking = null;
    $scope.message = "";


    $scope.name = function() {
      var c = $scope.selectedContact;

      if(!c.name) {
        return "Please enter a contact name";
      }

      return c.name;
    };


    $scope.email = function() {
      return $scope.selectedContact.email;
    };

    $scope.number = function() {
      var c = $scope.selectedContact;

      if(!c.number) {
        return null;
      }

      return "Ext: "+c.number;
    };


    $scope.getContacts = function(val) {

      var test = $scope.asyncSelected;
      return Contacts.get(val);
    };

    $scope.hideKeyboard = function() {

      //save contact
      $scope.booking.organizer = $scope.selectedContact;

      $timeout(function() {
        virtualKeyService.hide();
      },10);
    };

    function setMessage(msg) {
      $scope.message = msg;
    }

    $scope.confirmEnabled = function() {
      return $scope.booking != null && bookingStatus === STATUS_NONE;
    };

    $scope.confirm = function() {
      if(bookingStatus !== STATUS_NONE) {
        return;
      }

      setMessage("Processing...");
      bookingStatus = STATUS_BUSY;

      BookingSvc.add($scope.booking, function(err, msg) {
        if(err) {
          setMessage("Failed to add booking");
          bookingStatus = STATUS_NONE;
          return;
        }

        setMessage("Booking added successfully");
        bookingStatus = STATUS_NONE;

      });
    };

    var settings = HeaderDataSvc.settings;
    var flashTime = 1000;

    var timeouts = {};

    function flashVar(target, value) {
      $scope[target] = value;
      $timeout.cancel(timeouts[target]);
      timeouts[target] = $timeout(function() {
        $scope[target] = null;
      },flashTime);
    }

    function adjustStart(direction) {
      if(!$scope.booking) {
        return;
      }

      if(!$scope.booking.adjustStart(settings.increment*direction)) {
        flashVar("startClass", "error");
      }
    }

    function adjustEnd(direction) {
      if(!$scope.booking) {
        return;
      }

      if(!$scope.booking.adjustEnd(settings.increment*direction))
      {
        flashVar("endClass", "error");
      }
    }

    //flash css class when models change
    $scope.$watch('booking.startStr', function(newValue, oldValue) {
      if(oldValue) {
        flashVar("startClass", "ok");
      }
    }, true);

    $scope.$watch('booking.endStr', function(newValue, oldValue) {
      if(oldValue) {
        flashVar("endClass", "ok");
      }
    }, true);

    $scope.adjustStartPlus = function() {
      adjustStart(1);
    };
    $scope.adjustStartMinus = function() {
      adjustStart(-1);
    };
    $scope.adjustEndPlus = function() {
      adjustEnd(1);
    };
    $scope.adjustEndMinus = function() {
      adjustEnd(-1);
    };

    function setBooking(value) {
      if(!value) {
        return false;
      }

      var booking = value.duplicate();
      booking.setMaxLength(settings.maxLength);


      booking.title = "Impromptu Meeting";

      $scope.booking = booking;
      setMessage("");
      return true;
    }

    if(!setBooking($stateParams.booking))
    {
      $timeout(function() {
        if(!setBooking(BookingSvc.getFirstAvailableBooking())) {
          setMessage("No vacant slots available");
        }
      },500);
    }

    //setMessage("No vacant slots");

  }

  angular
    .module("rm")
    .controller('AddBookingCtrl', AddBookingCtrl);
})();