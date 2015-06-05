(function () {

  function initialScroll($parse)
  {
    return {
      restrict: "A",
      scope: true, //new scope based on parent
      link: function (scope, element, attr) {

        var scrollTop = $parse(attr.initialScroll)(scope);
        element[0].scrollTop =scrollTop;
      }
    };
  }

  angular
    .module('rm')
    .directive('initialScroll', initialScroll);
})();