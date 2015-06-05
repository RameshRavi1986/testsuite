
(function() {

  //TODO make this an angular global value
  var timeCount=  24-7+1;

  var times = [];
  for(var i = 7; i <= 24 ; i++) {
    times.push(i);
  }

  /**
   * @ngInject
   */
  function rmCalDayHeader() {
    return {
      restrict: "A",
      replace:true,
      templateUrl: "cal-day-header.dir.html",
      scope: {},
      link: function (scope, element, attr) {
        scope.times = times;
      }
    };
  }

  angular
    .module('rm')
    .directive('rmCalDayHeader',rmCalDayHeader);

})();