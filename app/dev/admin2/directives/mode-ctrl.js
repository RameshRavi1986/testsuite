(function(){

  /**
   * @ngInject
   */
  function ModeCtrl ($scope, $http, HeaderDataSvc) {

    var mode = this;

    function sync() {
      mode.selected = HeaderDataSvc.mode;
    }

    this.update = function() {

      var value = mode.selected;
      console.log("set mode ", value);

      $http.post('/data/settings', {'mode':value}).
        success(function() {
          mode.selected = HeaderDataSvc.mode;
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
    .controller('ModeCtrl', ModeCtrl);
})();