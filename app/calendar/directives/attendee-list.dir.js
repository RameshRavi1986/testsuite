(function () {

  function AttendeeListCtrl($scope) {

    function notify() {
      if($scope.onChange) {
        $scope.onChange();
      }
    }

    $scope.selectedRows = [];

    $scope.add = function() {
      $scope.booking.addAttendee();
      notify();
    };

    $scope.delete = function() {

      var rows = $scope.selectedRows;

      if(rows.length == 0) {
        return;
      }
      var hash = {};
      rows.forEach(function(value) {
        hash[value.$$hashKey] = true;
      });

      var i = 0;
      var data = $scope.booking.attendees;
      while(i < data.length) {
        if(hash[data[i].$$hashKey]) {
          $scope.booking.removeAttendee(i);
        }
        else {
          i++;
        }
      }

      //reset the selection
      $scope.selectedRows = [];

      notify();
    };

    $scope.gridOptions = {
      enableGridMenu: false,
      enableSelectAll: false,
      enableColumnMenus: false,
      data: $scope.booking.attendees
    };

    $scope.gridOptions.columnDefs = [
      { name: 'name', width: '40%' },
      { name: 'company' },
      { name: 'sent', enableCellEdit: false, cellFilter: 'sentIcon', width: '55'}
    ];

    $scope.msg = {};

    $scope.gridOptions.onRegisterApi = function(gridApi){
      //set gridApi on scope
      $scope.gridApi = gridApi;
      gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
        $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;
        $scope.$apply();
      });

      //set gridApi on scope
      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        $scope.selectedRows = gridApi.selection.getSelectedRows();
      });
    };
  }

  function AttendeeListDir() {
    return {
      restrict: "E",
      controller: AttendeeListCtrl,
      scope: {
        booking: "=",
        onChange: "&"
      },
      templateUrl: "attendee-list.dir.html",
      link: function (scope, element, attr) {

      }
    };
  }

  function sentIconFilter() {
    return function(input) {
      if (!input){
        return '';
      } else {
        return "\u2713"
        //return '<ng-md-icon icon="send" size="10"></ng-md-icon>'
      }
    };
  }

  angular
    .module('rm')
    .filter('sentIcon', sentIconFilter)
    .directive('attendeeList', AttendeeListDir)
})();