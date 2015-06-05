(function () {

  /**
   * @ngInject
   */
  function HomeCtrl($scope, $state, HeaderDataSvc, RoomStatusSvc, News, RmTouch) {

    var home = this;

    home.mode = 0;

    function checkFullscreenLogo() {
      if (home.currentBooking && home.currentBooking.hasFullscreenLogo() && !RmTouch.isActive()) {
        home.currentBooking.verifyLogo()
          .then(function() {
            $state.go("poster");
          });
      }
    }

    function sync() {

      home.mode = HeaderDataSvc.mode;

      home.currentBooking = RoomStatusSvc.currentBooking;
      home.nextBooking = RoomStatusSvc.nextBooking;

      //check if we should redirect to fullscreen logo mode
      checkFullscreenLogo();

      home.logoSrc = null;

      if (home.currentBooking && home.currentBooking.hasEmbeddedLogo()) {
        home.logoSrc = home.currentBooking.getLogoSrc();
      }

      home.busyIcon = RoomStatusSvc.busy && !home.logoSrc;
      home.vacantIcon = !RoomStatusSvc.busy && !home.logoSrc;

      home.status = RoomStatusSvc.getStatus();

      home.showStatus = function () {
        //true if booking is defined and it is NOT busy
        return home.currentBooking && !home.currentBooking.busy;
      };

      home.class = "default";
      home.showVideo = false;
      home.showNews = false;

      switch (home.mode) {
        case 1:
          home.class = "video";
          home.showVideo = true;
          break;

        case 2:
          home.news = News.getData();

          if (home.news && home.news.length) {
            home.class = "news";
            home.showNews = true;
          }

          break;

      }
    }

    $scope.$on("RoomStatusSvc:update", sync);

    $scope.$on("News:update", sync);

    sync();

    home.reload = function () {
      window.location.reload();
    };

    $scope.ctrl = {
      show: false
    };

    home.canBookNow = function () {
      return RoomStatusSvc.availableFor > 5;
    };
  }

  angular
    .module("rm")
    .controller('HomeCtrl', HomeCtrl);
})();