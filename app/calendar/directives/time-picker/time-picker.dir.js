(function () {

  function rmTimePicker($interpolate, $filter) {

    var wrapperTemplate =
      '<div class="time-picker">'+
      '  <div class="wrapper">' +
      '    <div class="content">{{::content}}</div>' +
      '  </div>'+
      '</div>';

    var rowTemplate = '<div data-time={{::time}} class="tp-row {{::class}}">{{::timeStr}}</div>';


    var wrapperInterp = $interpolate(wrapperTemplate);
    var rowInterpolate = $interpolate(rowTemplate);

    function formatTime(time) {
      //return $filter('date')(time, "h:mm a");
      return $filter('date')(time, "H:mm");
    }

    var active = false;

    return {
      restrict: "EA",
      scope: {
        model:"=ngModel",
        validate:"&"
      },

      templateUrl: "time-picker.dir.html",
      require: '?ngModel',
      link: function (scope, element, attr, ngModel) {

        if(!ngModel) {
          throw "ng-model must be set for time picker directive"
        }
        var wrapper = element[0].querySelector(".tp-wrapper");
        var target = element[0].querySelector(".tp-content");

        var start = parseInt(attr.start) || 5;
        var end   = parseInt(attr.end)   || 19;
        var step  = parseInt(attr.step)  || 30;
        var validationEnabled = !!attr.validate;

        //console.debug("start = %d, end = %d, step = %d", start, end, step);

        function hide(time) {
          if(time) {
            time = new Date(time);
            //ngModel.$modelValue = time;
            ngModel.$setViewValue(time);
            ngModel.$render();
            console.debug("time selected ", time)
          }

          wrapper.classList.remove("active");
          target.innerHTML = "";

          element.off('keydown');
        }

        function getTimes() {
          var time = new Date(scope.model);
          time.setHours(start,0,0,0);
          var counter = start*60;
          var times = [];

          for(var i = 0 ; i < 1000; i++) {
            var hours = Math.floor(counter /60);
            var mins = counter % 60;

            if(hours == end && mins > 0) {
              break;
            }

            if(hours > end) {
              break;
            }

            time.setHours(hours, mins);
            times.push({
              date: new Date(time)
            });
            counter += step;
          }

          return times;
        }

        function show() {
          var rows = "";
          var rowData = [];

          var firstRow = -1;
          var lastRow = -1;

          getTimes().forEach(function(item) {

            var available = true;
            if(validationEnabled) {
              available = scope.validate({time:item.date});
            }

            //keep track of the first and last available rows
            if(available){
              if(firstRow < 0) {
                  firstRow = rowData.length;
              }

              lastRow = rowData.length;
            }

            var data = {
              available: available,
              time: item.date,
              timeStr: formatTime(item.date),
              class: available ? "":"disabled"
            };

            rowData.push(data);
          });

          if(firstRow < 0) {
            rows = "No times available";
          }
          else {
            for (var i = firstRow; i <= lastRow; i++) {
              rows += rowInterpolate(rowData[i]);
            }
          }

          target.innerHTML = rows;
          wrapper.classList.add("active");

          element.on('keydown', function (event) {
            if (active && event.keyCode==27) {
              hide();
            }
          });
        }


        element.on('click', function(event) {
          var target = event.target || event.srcElement;
          if(target.classList.contains("disabled"))
          {
            return;
          }

          if(active) {
            hide(target.getAttribute("data-time"));
            active = false;
          }
          else {
            show();
            active = true;
          }
        });


      }
    };
  }

  angular
    .module('rm')
    .directive('rmTimePicker', rmTimePicker);
})();