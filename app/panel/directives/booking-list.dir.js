(function(){

  /**
   * @ngInject
   */
  function BookingListCtrl ($scope) {

    var list = this;

    var numPages = 1;
    var currentPage = 1;
    var pageSize = 7;
    var visibleBookings = [];

    var message = "Loading...";

    var targetTime = parseInt($scope.targetTime);

    function sync() {
      var bookings = $scope.bookings;

      var length = 0;
      numPages = 0;

      if(bookings instanceof Array) {
        length = bookings.length;
        numPages = Math.ceil(length / pageSize);
      }

      if(length > 0) {
          message = "";
      } else {
          message = "No booking data to display";
      }

      //set initial page if startTime is defined
      if(targetTime) {
        var targetIndex = 0;
        for(var i = 0; i < length; i++) {
          var startTime = bookings[i].start.getTime();
          var endTime = bookings[i].end.getTime();

          //then look for bookings containing the target time
          if(targetTime >= startTime && targetTime <= endTime)
          {
            targetIndex = i;
            break;
          }
        }
        targetTime = null;
        console.debug("targetIndex = %d", targetIndex);
        currentPage = 1+ Math.floor(targetIndex / pageSize);
      }

      currentPage  = Math.min(numPages,currentPage);

      if(currentPage <= 0) {
        currentPage = 1;
      }

      visibleBookings = [];
      var start = (currentPage -1)*pageSize;
      var end = Math.min(start + pageSize-1, length-1);

      for(var i = start; i <= end; i++) {
        visibleBookings.push(bookings[i]);
      }
    }

    sync();
    $scope.$watch('bookings', function(newValue, oldValue) {
      sync();
    }, true);

    //public API
    this.getVisibleBookings = function() {
      return visibleBookings;
    };

    this.setPage = function(value) {
      if(value <= 0 || value > numPages) {
        console.debug("invalid page %d/%d", value, numPages);
        return;
      }

      console.debug("currentPage set ", value);
      currentPage = value;
      sync();
    };

    this.nextPage = function() {
      this.setPage(currentPage + 1)
    };

    this.prevPage = function() {
      this.setPage(currentPage - 1)
    };

    this.prevPageEnabled = function() {
      return currentPage > 1;
    };

    this.nextPageEnabled = function() {
      return (currentPage < numPages);
    };

    this.getNumPages = function() {
      return numPages;
    };

    this.getCurrentPage = function() {
      return currentPage;
    };

    this.getMessage = function() {
      return message;
    };
  }

  function rmBookingList() {
    return {
      restrict: "E",
      scope: {
        targetTime: "@",
        bookings: "="
      },
      //bindToController: true,
      controller: BookingListCtrl,
      controllerAs: "list",
      templateUrl: "booking-list.dir.html",
      link: function (scope, element, attr) {
        scope.search = !!attr.search;
      }
    };
  }

  angular
    .module("rm")
    .directive('rmBookingList', rmBookingList);
})();