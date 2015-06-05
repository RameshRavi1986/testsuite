(function () {

  /*
  var templateLarge =
    '<div class="capacity-icon" layout layout-align="center center">'+
    '<ng-md-icon class="icon" icon="people" size="32"></ng-md-icon>'+
    '<span class="text">{{getText()}}</span>'+ //watch value
    '</div>';
    */

  function capacityIcon() {
    return {
      restrict: "E",
      scope: {
        capacity: "&"
      },
      templateUrl: "capacity-icon.dir.html",
      link: function (scope, element, attr) {

        scope.getText = function()
        {
          return scope.capacity() || "0";
        }
      }
    };
  }

  angular
    .module('rm')
    .directive('rmCapacityIcon', capacityIcon)
})();