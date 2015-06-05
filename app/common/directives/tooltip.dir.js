(function () {

  function tooltip() {
    return {
      restrict: "A",
      link: function (scope, element, attr) {

        //Find the element which will contain tooltip
        var target = element[0].querySelector('tooltip');

        //Bind mousemove event to the element which will show tooltip
        element[0].addeventListenetr('mousemove', function(e) {
          //find X & Y coords
          var x = e.clientX;
          var y = e.clientY;

          //Set tooltip position according to mouse position
          target.style.top  = (y + 20) + 'px';
          target.style.left = (x + 20) + 'px';
        });
      }
    };
  }

  angular
    .module('rm')
    .directive('tooltip', tooltip);
})();