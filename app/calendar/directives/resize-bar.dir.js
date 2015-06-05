(function () {

  function rmResizer($document) {
    return {
      restrict: "A",
      scope: {
        onDragStart:"&",
        onDragEnd:"&",
        onDrag:"&"
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

          if($scope.onDragStart) {
            $scope.onDragStart();
          }
        });

        function mousemove(event) {
            var delta = event.pageY - ref;

            $scope.onDrag({delta:delta});
        }

        function mouseup(event) {

          var delta = event.pageY - ref;

          event.preventDefault();
          event.stopPropagation();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);

          $element.removeClass("active");

          if($scope.onDragEnd) {
            $scope.onDragEnd({delta:delta});
          }
        }
      }
    };
  }

  angular
    .module('rm')
    .directive('rmResizer', rmResizer);
})();