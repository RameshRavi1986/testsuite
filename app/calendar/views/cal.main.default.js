(function(){

  /**
   * @ngInject
   */
  function OverviewCtrl ($scope, $interval, HeaderDataSvc, RoomListSvc, DisplayParamsSvc) {

    var hourCount = DisplayParamsSvc.hourCount;

    var isToday = true;

    var overviewCtrl = this;
    overviewCtrl.rooms = [];

    var getWidth = function() {
      var colWidth = DisplayParamsSvc.width;
      var count = overviewCtrl.rooms.length || 1;
      return Math.round(Math.max(colWidth, 100));
    };

    //the extra row param is required to make the left hand side
    //a bit longer to account for scrollbars messing with height in the main window
    var getHeight = function(extraRows) {

      var rowHeight = DisplayParamsSvc.height;
      return (hourCount+1+extraRows) * rowHeight;
    };

    var getHeightLeft = function() {
      var rowHeight = DisplayParamsSvc.height;
    };

    $scope.display = DisplayParamsSvc;

    //$scope.currentDate = $scope.display.date;
    $scope.date = new Date();

    $scope.$watch('display.date', function(newVal) {

      if(newVal) {
        $scope.date.setTime(newVal.getTime());
        isToday = HeaderDataSvc.isToday($scope.date);
      }
    });

    var height = DisplayParamsSvc.height;
    $interval(function() {
      if(DisplayParamsSvc.height != height) {
        height = DisplayParamsSvc.height;
        $scope.$broadcast("DisplayUpdated");
      }
    }, 2000);

    $scope.getStyleTimeBar = function() {
      if(!isToday) {
        return {
          display:"none"
        }
      }

      var top = DisplayParamsSvc.calTimeToPositionPx(HeaderDataSvc.time);

      return {
        "display": "block",
        "top": top+"px"
      }
    };

    $scope.getStyleMain = function() {
      return {
        "width": getWidth() +"%",
        "height":getHeight(0)+"px"
      }
    };

    $scope.getStyleTop = function() {
      return {
        "width":getWidth()+"%"
      }
    };

    $scope.getStyleLeft = function() {
      return {
        "height":getHeight(1)+"px"
      }
    };

    $scope.initialScroll = 200;

    function sync() {
      var rooms = RoomListSvc.getData();
      overviewCtrl.rooms = rooms;
      console.debug("room list updated :length=%d", rooms.length);
    }

    sync();
    RoomListSvc.subscribe($scope, sync);
  }

  angular
    .module("rm")
    .controller('OverviewCtrl', OverviewCtrl);
})();