
(function() {

//This line is replaced by the gulp file
  var svgMap={
 "before": "<path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" />",
 "busy": "<circle cx=\"12\" cy=\"12\" r=\"11\" /><rect x=\"5\" y=\"10\" width=\"14\" height=\"4\" style=\"fill:#fff\" />",
 "clock": "<path fill-opacity=\".9\" d=\"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" /><path fill-opacity=\".9\" d=\"M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z\" />",
 "edit": "<path d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" />",
 "group": "<path d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z\" />",
 "help": "<path d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z\" />",
 "home": "<path d=\"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z\" />",
 "list": "<path d=\"M7,5V7H21V5M7,13H21V11H7M7,19H21V17H7M4,16.67C3.26,16.67 2.67,17.27 2.67,18C2.67,18.73 3.27,19.33 4,19.33C4.73,19.33 5.33,18.73 5.33,18C5.33,17.27 4.74,16.67 4,16.67M4,4.5A1.5,1.5 0 0,0 2.5,6A1.5,1.5 0 0,0 4,7.5A1.5,1.5 0 0,0 5.5,6A1.5,1.5 0 0,0 4,4.5M4,10.5A1.5,1.5 0 0,0 2.5,12A1.5,1.5 0 0,0 4,13.5A1.5,1.5 0 0,0 5.5,12A1.5,1.5 0 0,0 4,10.5Z\" />",
 "location": "<path d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" />",
 "next": "<path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" />",
 "person": "<path d=\"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\" /><path d=\"M0 0h24v24H0z\" fill=\"none\" />",
 "resources": "<path d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM2 21h18v-2H2v2z\" />",
 "search": "<path d=\"M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z\" />",
 "sync": "<path d=\"M12,18A6,6 0 0,1 6,12C6,11 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12A8,8 0 0,0 12,20V23L16,19L12,15M12,4V1L8,5L12,9V6A6,6 0 0,1 18,12C18,13 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12A8,8 0 0,0 12,4Z\" />",
 "vacant": "<path d=\"M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z\" />"
};

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