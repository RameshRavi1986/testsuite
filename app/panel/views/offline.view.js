(function(){

  /**
   * @ngInject
   */
  function OfflineView ($scope, $interval, $state, HeaderDataSvc) {

    var view = this;
    view.header = HeaderDataSvc;

    view.exit = function() {
      console.debug("Exiting offline view");
      $state.go("main.home");
    };

    function sync() {
      if(HeaderDataSvc.isValid()) {
        view.exit();
      }
    }

    $interval(sync, 1000);
  }

  angular
    .module("rm")
    .controller('OfflineView', OfflineView);
})();
