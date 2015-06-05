(function () {

  function rmDatePickerCtrl($scope,$filter, $sce) {
    var _dateFilter = $filter('date');

    var i;

    $scope.visible = false;

    $scope.hide = function() {
      $scope.visible = false;
    };

    $scope.restrictions = {
      mindate: void 0,
      maxdate: void 0
    };
    $scope.setDate = function(newVal) {
      $scope.date = newVal != null ? new Date(newVal) : new Date();
      $scope.calendar._year = $scope.date.getFullYear();
      $scope.calendar._month = $scope.date.getMonth();
    };
    $scope.display = {
      fullTitle: function() {
        return _dateFilter($scope.date, 'EEEE d MMMM yyyy');
      },
      title: function() {
        if ($scope._mode === 'date') {
          return _dateFilter($scope.date, ($scope._displayMode === 'date' ? 'EEEE' : 'EEEE h:mm a'));
        } else {
          return _dateFilter($scope.date, 'MMMM d yyyy');
        }
      },
      "super": function() {
        if ($scope._mode === 'date') {
          return _dateFilter($scope.date, 'MMM');
        } else {
          return '';
        }
      },
      main: function() {
        return $sce.trustAsHtml($scope._mode === 'date' ? _dateFilter($scope.date, 'd') : "" + (_dateFilter($scope.date, 'h:mm')) + "<small>" + (_dateFilter($scope.date, 'a')) + "</small>");
      },
      sub: function() {
        if ($scope._mode === 'date') {
          return _dateFilter($scope.date, 'yyyy');
        } else {
          return _dateFilter($scope.date, 'HH:mm');
        }
      }
    };
    $scope.calendar = {
      _month: 0,
      _year: 0,
      _months: (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; _i <= 11; i = ++_i) {
          _results.push(_dateFilter(new Date(0, i), 'MMMM'));
        }
        return _results;
      })(),
      offsetMargin: function() {
        return "" + (new Date(this._year, this._month).getDay() * 2.7) + "rem";
      },
      isVisible: function(d) {
        return new Date(this._year, this._month, d).getMonth() === this._month;
      },
      "class": function(d) {
        if (($scope.date != null) && new Date(this._year, this._month, d).getTime() === new Date($scope.date.getTime()).setHours(0, 0, 0, 0)) {
          return "selected md-fab md-primary";
        } else if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
          return "today md-primary";
        } else {
          return "";
        }
      },
      select: function(d) {
        $scope.date.setFullYear(this._year, this._month, d);
        $scope.save();
      },
      monthChange: function() {
        if ((this._year == null) || isNaN(this._year)) {
          this._year = new Date().getFullYear();
        }
        $scope.date.setFullYear(this._year, this._month);
        if ($scope.date.getMonth() !== this._month) {
          return $scope.date.setDate(0);
        }
      },
      _incMonth: function(months) {
        this._month += months;
        while (this._month < 0 || this._month > 11) {
          if (this._month < 0) {
            this._month += 12;
            this._year--;
          } else {
            this._month -= 12;
            this._year++;
          }
        }
        return this.monthChange();
      }
    };

    $scope.today = function() {
      $scope.setDate();
      $scope.save();
    };
  }

  function rmDatePicker($parse) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {},
      //scope: {
      //  _modelValue: '=ngModel'
      //},
      require: 'ngModel',
      templateUrl: "date-picker.dir.html",
      controller: rmDatePickerCtrl,

      link: function(scope, element, attrs, ngModel) {
        var cancelFn, saveFn;

        attrs.$observe('mindate', function(val) {
          if ((val != null) && angular.isDate(val)) {
            return scope.restrictions.mindate = val;
          }
        });
        attrs.$observe('maxdate', function(val) {
          if ((val != null) && angular.isDate(val)) {
            return scope.restrictions.maxdate = val;
          }
        });

        ngModel.$render = function() {
          return scope.setDate(ngModel.$modelValue);
        };

        scope.save = function() {
          scope.hide();

          ngModel.$setViewValue(scope.date);
          ngModel.$render();
          scope.$eval(attrs.ngChange);
        };
        return scope.cancel = function() {
          scope.hide();
        };
      }
    };
  }

  angular
    .module('rm')
    .directive('rmDatePicker', rmDatePicker);
})();