(function(){

  /**
   * @ngInject
   */
  function TimeCtrl ($scope, $http, HeaderDataSvc) {

    var time = this;

    this.offset = 0;

    function sync() {
      time.current = HeaderDataSvc.time;
      time.offset = HeaderDataSvc.offset;
    }

    this.updateOffset = function(value) {

      console.log("set offset ", value);
      var offset = time.offset+value;

      $http.post('/data/time', {'offset':offset}).
        success(function() {
          time.offset = offset; //give instant feedback before the server resync
          HeaderDataSvc.resync();
        }).
        error(function() {
          console.log("Failed to set time offset");
        });
    };

    $scope.$on("HeaderDataSvc:update", sync);
    sync();
  }

  angular
    .module("rm")
    .controller('TimeCtrl', TimeCtrl);
})();