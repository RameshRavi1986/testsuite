(function () {

  function calEditBtn(EditBookingSvc) {
    return {
      restrict: "A",
      link: function ($scope, element, attr) {

        element.on("click", function($event) {
            $event.stopPropagation();
            EditBookingSvc.editBooking($scope.booking);
        });
      }
    };
  }

  angular
    .module('rm')
    .directive('rmCalEditBtn', calEditBtn);
})();