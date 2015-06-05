(function () {

  function rmResizer($document) {
    return {
      restrict: "A",
      scope: {
        onResize:"&"
      },
      link: function ($scope, $element) {

        var ref = 0;

        $element.on('click', function(event) {
          event.stopPropagation();
        });

        $element.on('mousedown', function(event) {
          event.preventDefault();
          event.stopPropagation();

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);

          $element.addClass("active");
          ref = event.pageY;
        });

        function mousemove(event) {
            var delta = event.pageY - ref;

            $scope.onResize({delta:delta});
        }

        function mouseup(event) {
          event.preventDefault();
          event.stopPropagation();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);

          $element.removeClass("active");
        }
      }
    };
  }

  angular
    .module('rm')
    .directive('rmResizer', rmResizer);
})();