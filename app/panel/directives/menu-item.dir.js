/**
 * Created by tmakin on 28/10/14.
 */
(function(){

  function rmMenuItem($state) {
    return {
      link: {
        //pre link is used to ensure that the icon var is available to the child elements
        pre: function(scope, element, attributes) {
          scope.text = attributes.rmMenuItem;
          scope.icon = attributes.icon;

          var state = attributes.state;

          scope.isActive = function() {
            return $state.includes(state);
          };

          scope.go = function() {
            $state.go(state);
          }
        }
      },
      scope: {}, //each menu item requires its own controller scope
      restrict: 'A',
      templateUrl: 'menu-item.dir.html'
    };
  }

  angular
    .module("rm")
    .directive('rmMenuItem', rmMenuItem);
})();