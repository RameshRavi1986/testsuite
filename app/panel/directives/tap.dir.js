
(function() {

  var ACTIVE_CLASS_NAME = 'tap-active';


function rmTap($parse, $timeout, RmTouch) {
  return {
    restrict: "A",
    scope: false, //inherit existing scope
    link: {
      pre: function (scope, element, attr) {
        var clickHandler = $parse(attr.rmTap);

        var timer = null;

        function go(event){
          element.addClass(ACTIVE_CLASS_NAME);
          $timeout.cancel(timer);

          timer = $timeout(function(){
            element.removeClass(ACTIVE_CLASS_NAME);
          },300);

          scope.$apply(function() {
              clickHandler(scope);
          });
        }

        var options = {
          repeatable: (attr.repeatable === "true")
        };

        RmTouch.bind(element, go, options);
      }
    }
  };
}

  angular
    .module('rm')
    .directive('rmTap',rmTap);
})();