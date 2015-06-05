(function(){

  /**
   * @ngInject
   */
  function SettingsCtrl ($scope, $http, HeaderDataSvc) {

    var settings = this;

    function sync() {
      settings.mode   = HeaderDataSvc.mode;
      settings.panelBookingEnabled = HeaderDataSvc.panelBookingEnabled;
    }

    this.update = function() {

      $http.post('/data/settings', {
        mode: settings.mode,
        panelBookingEnabled: settings.panelBookingEnabled
      }).
        success(function() {
          HeaderDataSvc.resync();
        }).
        error(function() {
          console.log("Failed to set panel mode");
        });
    };

    $scope.$on("HeaderDataSvc:update", sync);
    sync();
  }

  angular
    .module("rm")
    .controller('SettingsCtrl', SettingsCtrl);
})();