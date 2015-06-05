(function () {

  function CalDayCtrl($scope, $interval, $timeout, $element, $compile,
                      BookingSvc, DisplayParamsSvc, EditBookingSvc, Booking) {

    $scope.display = DisplayParamsSvc;

    var hourOffset = DisplayParamsSvc.hourOffset;
    $scope.times = DisplayParamsSvc.times;

    if (!$scope.room) {
      console.error("$scope.room is undefined");
    }

    var roomId = $scope.room.id;
    $scope.eTag = null;

    if (!($scope.date instanceof Date)) {
      console.error("Invalid date");
    }

    function calcDateFromPixels(offsetY) {

      return DisplayParamsSvc.calTimeFromPx(offsetY);
    }

    $scope.showAddDialog = function ($event) {
      var date = calcDateFromPixels($event.offsetY);
      EditBookingSvc.addBooking(roomId, date);
    };


    function sync() {
      if (!roomId) {
        console.debug("no bookings");
        $scope.bookings = [];
        return;
      }

      var options = {
        date: $scope.date
      };

      BookingSvc.getRoomData(roomId, options, function (data, eTag) {

        if (eTag && $scope.eTag == eTag) {
          return;
        }

        var startTime = new Date($scope.date);
        startTime.setHours(hourOffset, 0, 0, 0);


        data = data || [];

        var list = [];
        data.forEach(function (item) {

          if (item.end < startTime) {
            return;
          }

          list.push(item);
        });
        $scope.bookings = list;
        $scope.eTag = eTag;
      });
    }

    //forece list to regenerate by copying data to new array
    function rebuild() {
      $scope.bookings = angular.copy($scope.bookings);
      console.debug("rebuilding list");
    }

    $scope.$watch('date', function (newVal) {

      if (newVal) {
        sync();
      }
    });

    $scope.$on("DisplayUpdated", function (event, deletedBooking) {
      rebuild();
    });

    $scope.$on("BookingDeleted", function (event, deletedBooking) {
      if (deletedBooking && deletedBooking.roomId == roomId) {
        return sync();
      }
    });

    $scope.$on("BookingUpdated", function (event, oldBooking, newBooking) {

      if (oldBooking && oldBooking.roomId == roomId) {
        return sync();
      }

      if (newBooking && newBooking.roomId == roomId) {
        return sync();
      }
    });


    //$event = the drop event
    //$data contains the bookings as json
    //$offset is the mouse position on the target object
    $scope.onDrop = function ($event, $data, $delta) {

      if (!$data) {
        console.debug("Invalid drop : no data found");
        return;
      }

      var booking = new Booking($data);

      //var y0 = DisplayParamsSvc.calTimeToPositionPx(booking.start) + $offset.y;
      //var y1 = $event.offsetY; //y position after drag

      var copy = $event.shiftKey;

      var delta = $delta.y;
      booking.roomId = roomId;
      booking.start = DisplayParamsSvc.calUpdateTimeFromPx(booking.start, delta);
      booking.end = DisplayParamsSvc.calUpdateTimeFromPx(booking.end, delta);

      if (copy) {
        booking.asNew();
      }

      console.debug("Dropped ", $delta, booking.start);

      BookingSvc.add(booking, function (err) {
        console.debug(err || "booking saved");
      });
    };

    var tempElement = null;

    function hideBooking() {
      if (!tempElement) {
        return;
      }

      tempElement.remove();
      tempElement = null;
      $scope.booking = null;
    }

    function isBookingDefined() {
      return $scope.booking && $scope.booking.getLengthMinutes() >= 10;
    }

    function isBookingValid() {
      return isBookingDefined() && BookingSvc.validateFromCache($scope.booking);
    }

    function updateBooking(args) {
      //var tempBooking = $compile('<cal-booking></cal-booking>')($scope);


      if (!$scope.booking) {
        var time = calcDateFromPixels(args.offset);
        $scope.booking = new Booking({
          roomId: roomId,
          start: time,
          end: time
        });
      }
      else {
        var end = DisplayParamsSvc.calUpdateTimeFromPx($scope.booking.start, args.delta, 1);
        $scope.booking.setEnd(end);
      }

      if (!isBookingDefined()) {
        hideBooking();
        return;
      }

      if (!tempElement) {
        tempElement = angular.element('<cal-booking class="dummy"></cal-booking>');
        $element.append(tempElement);
      }


      if (isBookingValid()) {
        tempElement.removeClass("warning");
      } else {
        tempElement.addClass("warning");
      }

      $timeout(function () {
        $compile(tempElement)($scope);
      }, 1);
    }

    $scope.onDragStart = function (args) {
      console.debug("onscreen add booking started");
      updateBooking(args);
    };

    $scope.onDragMove = function (args) {
      console.debug("onscreen add booking move", args);
      updateBooking(args);
    };

    $scope.onDragEnd = function (args) {
      console.debug("onscreen add booking end", args);
      updateBooking(args);

      if (isBookingValid()) {
        EditBookingSvc.addBooking(roomId, $scope.booking.start, $scope.booking.end);
      }
      hideBooking();
    };


    $interval(sync, 5 * 1000); //every 5 seconds
  }

  /**
   * @ngInject
   */
  function rmCalDay($document, EditBookingSvc) {
    return {
      restrict: "EA",
      replace: true,
      templateUrl: "cal-day.dir.html",
      controller: CalDayCtrl,
      scope: {
        room: "=",
        date: "="
      },
      //scope: true,
      link: function (scope, element, attr) {

        var refPageY = 0;
        var offset = 0;

        function calcShift(event) {
          return {
            offset: offset,
            delta: event.pageY - refPageY
          }
        }

        var dragDropInProgress = false;

        scope.$on("ANGULAR_DRAG_START", function() {
          dragDropInProgress = true;
        });

        scope.$on("ANGULAR_DRAG_END", function() {
          dragDropInProgress = false;
        });

        element.on('mousedown', function (event) {

          if(!event.target || event.target.className != "cal-container")
          {
            return;
          }

          if(dragDropInProgress) {
            return;
          }

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);

          offset = event.offsetY;
          refPageY = event.pageY;

          scope.onDragStart(calcShift(event));
        });

        function mousemove(event) {
          scope.onDragMove(calcShift(event));
        }

        function mouseup(event) {

          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);

          scope.onDragEnd(calcShift(event));
        }
      }
    };
  }

  angular
    .module('rm')
    .directive('rmCalDay', rmCalDay)

})();