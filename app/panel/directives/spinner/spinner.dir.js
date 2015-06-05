
(function() {


function rmSpinner($interpolate) {

  return {
    restrict: "EA",
    templateUrl:"spinner.dir.html",
    link: function (scope, element, attributes) {

    }
  };
}

  angular
    .module('rm')
    .directive('rmSpinner',rmSpinner);

})();