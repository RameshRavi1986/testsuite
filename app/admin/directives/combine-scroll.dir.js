(function () {

  function combineScroll($parse,$timeout) {

    function combine(element, propName, selector, initialValue) {
      var targets = element[0].querySelectorAll(selector);

      function setVal(val) {
        for(var i=0 ; i < targets.length; i++) {
          targets[i][propName] = val;
        }
      }

      function sync(e) {
        setVal(e.target[propName]);
      }

      //bind to on scroll events
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        target.addEventListener("scroll",sync);
      }

      if(initialValue) {
        $timeout(function () {
          target[propName] = initialValue;
        }, 100);
      }

    }

    return {
      restrict: "A",
      link: function (scope, element, attr) {

        var scrollLeft = $parse(attr.scrollLeft)(scope) | 0;
        var scrollTop  = $parse(attr.scrollTop)(scope)  | 0;

        combine(element, "scrollLeft", ".horizontal-scroll", scrollLeft);
        combine(element, "scrollTop", ".vertical-scroll", scrollTop);
      }
    };
  }

  angular
    .module('rm')
    .directive('combineScroll', combineScroll);
})();