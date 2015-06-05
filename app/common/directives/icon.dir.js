
(function() {

//This line is replaced by the gulp file
/*svg*/

var iconTemplate = '<span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="{{size}}" height="{{size}}">{{svg}}</svg></span>';
var textTemplate = '<span class="text">{{text}}</span>';

function rmIcon($interpolate) {

  var iconInterp = $interpolate(iconTemplate);
  var textInterp = $interpolate(textTemplate);

  return {
    restrict: "EA",
    scope: {},
    link: function (scope, element, attributes) {

      //icon
      var icon = attributes.rmIcon || attributes.icon;

      //validate
      if (shapes[icon] === undefined) {
        icon = 'help';
      }
      scope.svg = shapes[icon];

      // size
      scope.size = attr.size || 24;

      //text caption
      scope.text = attributes.text;

      var html = iconInterp(scope);

      if(scope.text) {
        html+= textInterp(scope);
      }

      element.html(html);
    }
  };
}

  angular
    .module('rm')
    .directive('rmIcon',rmIcon);

})();