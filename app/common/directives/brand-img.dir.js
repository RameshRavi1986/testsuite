(function () {

  var template = '<div class="brand-small"><img src="/content/images/brand_small.png"/></div>';

  function rmBrandImg() {
    return {
      restrict: "E",
      replace:true,
      scope: true, //new scope based on parent
      template: template,
      link: function (scope, element, attr) {

      }
    };
  }

  angular
    .module('rm')
    .directive('rmBrandImg', rmBrandImg);
})();