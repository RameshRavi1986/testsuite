(function(){

  //var panelStatusCellTemplate = '<div>status={{COL_FIELD}}</div>';

  var panelStatusCellTemplate = '<div class="ngCellText status-icon" ng-class="{online: row.entity.online}">&#9679;</div>';

  /**
   * @ngInject
   */
  function PanelsView ($scope, $mdToast, $mdDialog, AuthSvc, PanelStatusSvc) {
    $scope.gridOptions = {
      enableGridMenu: false,
      enableSelectAll: false,
      enableColumnMenus: false,
      multiSelect: false
    };
    
    $scope.gridOptions.columnDefs = [
      { name: 'online',
        displayName: '',
        cellTemplate:panelStatusCellTemplate,
        width: 40
      },
      { name: 'id', width: 60},
      { name: 'ip'},
      { name: 'roomId'},
      { name: 'lastUpdated', cellFilter: 'date:"MM/dd/yyyy @ h:mma"'}
    ];

    $scope.msg = {};
    var selection = [];

    $scope.showAdd = function() {
      return false;
      //return AuthSvc.isAdminUser();
    };

    $scope.showDelete = function() {
      return false;
      //return AuthSvc.isAdminUser() && selection.length > 0;
    };

    function showToast(msg) {
      console.log(msg);

      $mdToast.show(
        $mdToast.simple()
          .content(msg)
          .position("top right")
          .hideDelay(3000)
      );
    }

    $scope.gridOptions.onRegisterApi = function(gridApi){

      $scope.gridApi = gridApi; //set gridApi on scope

    };

    function updateGrid() {
      $scope.gridOptions.data = PanelStatusSvc.getData(); //use a copy so that we can revert
      console.log("grid updated");
    }

    updateGrid();
    PanelStatusSvc.subscribe($scope, updateGrid);
    PanelStatusSvc.refresh();
  }
  angular
    .module("rm")
    .controller('PanelsView', PanelsView)
})();