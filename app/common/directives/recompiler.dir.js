(function () {
  'use strict';

  function recompiler($compile, $parse) {
    return {
      scope: true, // required to be able to clear watchers safely
      compile: function(el) {
        var template = el.html();
        return function link(scope, $el, attrs) {
          scope.$parent.$watch(attrs.recompiler, function(_new, _old) {
            var useBoolean = attrs.hasOwnProperty('useBoolean');
            if ((useBoolean && (!_new || _new === 'false')) || (!useBoolean && (!_new || _new === _old))) {
              return;
            }
            // remove all watchers because the recompiled version will set them up again.
            removeChildrenWatchers($el);
            // reset kcdRecompile to false if we're using a boolean
            if (useBoolean) {
              $parse(attrs.recompiler).assign(scope.$parent, false);
            }

            // recompile
            var newEl = $compile(template)(scope.$parent.$new());
            $el.html(newEl);
          });
        };
      }
    };

    function removeChildrenWatchers(element) {
      angular.forEach(element.children(), function(childElement) {
        removeAllWatchers(angular.element(childElement));
      });
    }

    function removeAllWatchers(element) {
      if (element.data().hasOwnProperty('$scope')) {
        element.data().$scope.$$watchers = [];
      }
      removeChildrenWatchers(element);
    }
  }

  angular
    .module('rm')
    .directive('recompiler', recompiler);
})();