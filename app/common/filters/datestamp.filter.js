/**
 * Created by tmakin on 18/04/15.
 */

(function() {
  function dateStampFilter() {

    function formatDate(date) {
      var day = date.getDay();
      var month = date.getMonth()+1;
      var year = date.getFullYear();

      return day+"/"+month+"/"+year;
    }

    var HOUR = 1000*60*60;

    function formatTime(date) {
      var hours   = date.getHours();
      var minutes = date.getMinutes();

      if (minutes < 10) {minutes = "0"+minutes;}

      return hours+':'+minutes;
    }

    return function (input) {
      input = input || {};

      var date = input.date;

      if(!(date instanceof Date)) {
        return "";
      }

      var today = new Date();
      today.setHours(0,0,0,0);

      var result;

      if(date < today) {
        result = formatDate(date);
      } else {
        result = formatTime(date);
      }

      if(input.user) {
        result += " by " + input.user;
      }

      return result;
    };
  }

  angular.module('rm').filter('rmDateStamp', dateStampFilter);

})();