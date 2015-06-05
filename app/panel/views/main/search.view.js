(function () {

  var defaultQuery = {
    minLength: 0,
    minCapacity: 0,
    busy: false,
    vacant: true
  };


  /**
   * @ngInject
   */
  function SearchCtrl($timeout, HeaderDataSvc, BookingSvc) {

    var search = this;

    search.loading = false;

    search.query = BookingSvc.lastQuery || defaultQuery;
    search.bookings = [];

    var spinnerTimer = null;

    function hideSpinner() {
      spinnerTimer = $timeout(function () {
        search.loading = false;
      }, 300);
    }

    function showSpinner() {
      $timeout.cancel(spinnerTimer);
      search.loading = true;
    }

    function setData(data) {
      hideSpinner();
      search.bookings = data;
    }

    search.go = function () {
      showSpinner();
      search.query.from = HeaderDataSvc.time;
      search.query.to = HeaderDataSvc.getEndOfDay();
      BookingSvc.search(search.query, setData);
    };

    search.go();
  }

  angular
    .module("rm")
    .controller('SearchCtrl', SearchCtrl);

})();