
(function() {

var template = '<span class="icon glyphicon glyphicon-{{::icon}}"></span>';

var iconMap = {
  "busy" : "minus-sign",
  "vacant" : "ok-sign",
  "minus": "minus",
  "plus":  "plus",
  "location": "map-marker"
};

function rmIconHeading() {
  return {
    restrict: "EA",
    scope: {},
    template: template,
    link: function (scope, element, attributes) {

      var icon = attributes.rmIcon || attributes.icon;
      var text = attributes.rmText;

      scope.icon = iconMap[icon] || icon;
    }
  };
}

  angular
    .module('rm')
    .directive('rmIconHeading',rmIconHeading);

})();