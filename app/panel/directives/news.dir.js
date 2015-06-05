
(function() {

var defaultDisplayTime = 10; //seconds

function rmNews($timeout) {
  return {
    restrict: "EA",
    scope: {
      news:"=rmNews"
    },
    templateUrl: "news.dir.html",
    link: function (scope, element, attr) {

      var news = scope.news;

      if(!news || !news.length) {
        console.debug("invalid news data");
        return;
      }

      var index = -1;
      function getActiveItem() {
        if(!news || !news.length) {
          scope.active = null;
          $interval(cycle, defaultDisplayTime*1000);
          return null;
        }

        index++;

        if(index >= news.length) {
          index = 0;
        }

        return news[index];
      }

      function tick() {
        var item = getActiveItem();

        var time = defaultDisplayTime;
        if(item && item.displayTime) {
          time = item.displayTime;
        }

        scope.active = item;
        $timeout(tick, time*1000);
      }

      tick();
    }
  };
}

  angular
    .module('rm')
    .directive('rmNews',rmNews);
})();