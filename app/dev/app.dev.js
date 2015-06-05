/**
 * Created by tmakin on 28/11/14.
 */

(function(){

  angular.module('rm').config(function($logProvider) {
    $logProvider.debugEnabled(true);
  });

    setTimeout(function() {
    showAngularStats();
  },1000);

})();