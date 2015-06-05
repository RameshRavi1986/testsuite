(function(){

    /**
     * @ngInject
     */
    function MainView (HeaderDataSvc) {
      this.data = HeaderDataSvc;
    }

    angular
        .module("rm")
        .controller('MainView', MainView);
})();
