(function() {

  var activeClass = 'active';

  var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;


  function rmBtnRadio() {
    return {
      restrict:"A",
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        //var ngModelCtrl = ctrls[0];

        var value = JSON.parse(attrs.rmBtnRadio);

        //model -> UI
        ngModelCtrl.$render = function () {

          var modelValue = ngModelCtrl.$modelValue;
          element.toggleClass(activeClass, modelValue == value);
        };

        //ui->model
        function go() {
          var isActive = element.hasClass(activeClass);

          if (!isActive || angular.isDefined(attrs.uncheckable)) {
            scope.$apply(function () {
              //ngModelCtrl.$setViewValue(isActive ? null : value);
              ngModelCtrl.$setViewValue(value);
              ngModelCtrl.$render();
            });
          }
        }

        if (supportsTouch) {
          element[0].ontouchstart = go;
        }
        else {
          element[0].onmousedown = go;
        }

        ngModelCtrl.$render();
      }
    }
  }

  angular
    .module('rm')
    .directive('rmBtnRadio',rmBtnRadio);
})();