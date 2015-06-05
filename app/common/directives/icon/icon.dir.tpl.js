
(function() {

//This line is replaced by the gulp file
  var svgMap;

  var iconTemplate = '<span class="icon" style="width:{{size}}px;height:{{size}}px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="{{size}}" height="{{size}}">{{svg}}</svg></span>';
  var textTemplate = '<span class="text">{{text}}</span>';

  function rmIcon($interpolate) {

    var iconInterp = $interpolate(iconTemplate);
    var textInterp = $interpolate(textTemplate);

    return {
      restrict: "EA",
      scope: {},
      link: function (scope, element, attr) {

        //icon
        var icon = attr.rmIcon || attr.icon;

        //validate
        if (svgMap[icon] === undefined) {
          icon = 'help';
        }
        scope.svg = svgMap[icon];

        // size
        scope.size = attr.size || 24;

        //text caption
        scope.text = attr.text;

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