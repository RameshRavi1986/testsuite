
(function() {


function CalBookingController($scope, $element, HeaderDataSvc, BookingSvc, CategoryListSvc, DisplayParamsSvc) {

  var hourCount = DisplayParamsSvc.hourCount;
  var hourOffset = DisplayParamsSvc.hourOffset;

  if(!hourCount) {
    console.error("Invalid hour count");
  }

  if(!hourOffset) {
    console.error("Invalid hour offset");
  }

  var booking = $scope.booking;

  var style = {
    rowHeight: 0,
    top: 0,
    height: 0
  };

  function getHoursBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 3600000);
  }


  function pixelsToPercent(px) {
    return 100*px/(style.rowHeight*(hourCount+1));
  }


  function recalcStyle() {

    style.rowHeight = DisplayParamsSvc.height;

    //style.colWidth = $element.children()[0].offsetWidth;

    //var start = DisplayParamsSvc.calTimeToPositionPx(booking.start);
    //var end   = calcPosition(booking.end);


    var category = CategoryListSvc.getCategory(booking.categoryId);

    style.categoryName = category.name;
    style.color = category.color;

    //style.top = start;
    style.height = Math.floor(style.rowHeight*getHoursBetweenDates(booking.start,booking.end));

    style.topPercent =  DisplayParamsSvc.calTimeToPositionPercent(booking.start);
    style.bottomPercent =  DisplayParamsSvc.calTimeToPositionPercent(booking.end);

    if(style.topPercent < 0) {
      style.topPercent = 0;
    }

    style.topPercentRef = style.topPercent;

    if(style.bottomPercent > 100) {
      style.bottomPercent = 100;
    }

    style.heightPercent = style.bottomPercent - style.topPercent;
  }

  $scope.getStyle = function() {
    return {
      //top: style.top + "px",
      //height: style.height + "px"

      top: (style.topPercent) + "%",
      //height: (style.heightPercent) + "%"
      bottom: (100-style.bottomPercent) + "%"
    };
  };

  $scope.getCategoryName = function() {
    return style.categoryName;
  };

  $scope.getCategoryStyle = function() {
    return {
      backgroundColor: style.color
    };
  };

  $scope.getClass = function() {
    var classes = "";

    if(style.height <= 20) {
      classes = "small";
    }
    else if(style.height <= 50) {
      classes = "medium";
    }

    //if(style.colWidth < 100) {
     // classes += " narrow";
    //}

    return classes
  };


  var setStyle = function() {
    var firstChild = $element.children()[0];
    if(!firstChild) {
      console.error("Booking template invalid");
      return;
    }
    firstChild.style.top    = style.topPercent + '%';
    firstChild.style.bottom = (100-style.bottomPercent) + '%';

    if($scope.dirty) {
      firstChild.classList.add("dirty");
    } else {
      firstChild.classList.remove("dirty");
    }
  };


  var originalBooking = null;

  $scope.dragStart = function() {
    $scope.dirty = true;
    originalBooking = booking.duplicate();
    updateBooking();
  };

  $scope.dragEnd = function(delta) {
    BookingSvc.add(booking, function(err) {
      console.debug(err || "booking saved");

      $scope.dirty = false;

      if(err) {
        booking = originalBooking;
      }

      updateBooking();
    });
  };

  function calcLengthMins(start, end) {
    return (end.getTime()-start.getTime()) / 60000;
  }

  function updateBooking() {
    recalcStyle();
    setStyle();
  }

  $scope.updateTop = function(delta) {
    var start = DisplayParamsSvc.calUpdateTimeFromPx(originalBooking.start, delta);

    if(calcLengthMins(start, booking.end) < 10) {
      return;
    }

    booking.start = start;

    updateBooking();
  };

  $scope.updateBottom = function(delta) {
    var end = DisplayParamsSvc.calUpdateTimeFromPx(originalBooking.end, delta);

    if(calcLengthMins(booking.start, end) < 10) {
      return;
    }
    booking.end = end;

    updateBooking();
  };

  $scope.isClean = function() {
    return !$scope.dirty;
  };

  updateBooking();
}

  /**
   * @ngInject
   */
function calBooking(EditBookingSvc, HeaderDataSvc, CategoryListSvc) {
  return {
    restrict: "E",
    scope: true, //new scope based on parent
    templateUrl: "cal-booking.dir.html",
    controller: CalBookingController,
    link: function ($scope, $element, $attr) {
    }
  };
}

  angular
    .module('rm')
    .directive('calBooking',calBooking);
})();