
angular.module('rm').config(function($httpProvider) {
  var templateMap = {};
  var list = document.getElementsByTagName("script");
  for (var i = 0; i < list.length; i++) {
    var node = list[i];
    if(!node.src) {
      continue;
    }
    var url = node.src.substr(0, node.src.lastIndexOf(".")) + ".html";
    var id = url.substr(url.lastIndexOf("/") + 1);
    templateMap[id] = url;
  }

  //register the interceptor via an anonymous factory
  $httpProvider.interceptors.push(function () {
    return {
      'request': function (config) {
        var url = config.url;
        config.url = templateMap[url] || url;
        return config;
      }
    };
  });
});