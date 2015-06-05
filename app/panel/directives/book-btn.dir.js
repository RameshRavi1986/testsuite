
(function() {

  var iconMap = {
    "busy" : "minus-sign",
    "vacant" : "ok-sign"
  };

  function BookBtn($state, RmTouch) {
    return {
      restrict: "E",
      replace: true,
      scope: false,
      templateUrl: "book-btn.dir.html",
      link: function (scope, element, attributes) {

        RmTouch.bind(element, function() {

          $state.go("main.add-booking", {
            booking: scope.booking
          });

          //var ctrl = $controller('BookModalCtrl',{booking: scope.booking});
          //ctrl.open();
        });
      }
    };
  }

  angular
      .module('rm')
      .directive('rmBookBtn',BookBtn);
})();