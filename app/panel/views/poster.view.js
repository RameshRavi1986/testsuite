(function(){

  /**
   * @ngInject
   */
  function PosterView ($scope, $timeout, $state, HeaderDataSvc, RoomStatusSvc) {

    var view = this;

    view.validLogo = false;

    view.header = HeaderDataSvc;

    view.exit = function() {
      console.debug("Exiting poster view");
      $timeout(function() {
        $state.go("main.home");
      },100);
    };

    function sync() {

      view.currentBooking = RoomStatusSvc.currentBooking;
      view.logoSrc = view.currentBooking.getLogoSrc();
      view.logoText = view.currentBooking.logoText || null;

      if(!view.currentBooking || !view.currentBooking.hasFullscreenLogo()) {
        view.exit();
        return;
      }

      view.currentBooking.verifyLogo()
        .catch(function() {
            view.exit();
        });
    }

    sync();
    $scope.$on("RoomStatusSvc:update", sync);
  }

  angular
    .module("rm")
    .controller('PosterView', PosterView);
})();