(function(){

  var userGroups = [
    { id: 1, value: 'Viewer' },
    { id: 2, value: 'Editor' },
    { id: 3, value: 'Admin'  }
  ];

  var userTypes = [
    { id: 1, value: 'Local' },
    { id: 2, value: 'Active Directory' }
  ];

  function userTypeFilter() {
    return hashFilter({
      1: 'Local',
      2: 'Active Directory'
    });
  }

  function userGroupFilter() {
    return hashFilter({
      0: 'None',
      1: 'Viewer',
      2: 'Editor',
      3: 'Admin',
      4: 'Master'
    });
  }

  function hashFilter(hash) {
    return function(input) {
      if (!input){
        return '';
      } else {
        return hash[input];
      }
    };
  }

  /**
   * @ngInject
   */
  function UsersView ($scope, $mdToast, $mdDialog, AuthSvc, UserListSvc) {
    $scope.gridOptions = {
      enableGridMenu: false,
      enableSelectAll: false,
      enableColumnMenus: false,
      multiSelect: false
    };
    
    $scope.gridOptions.columnDefs = [
      { name: 'name', enableCellEdit: false, width: '25%' },
      { name: 'type',
        enableCellEdit: false,
        //editableCellTemplate: 'ui-grid/dropdownEditor',
        cellFilter: 'userTypeFilter'
        //editDropdownOptionsArray: userTypes
      },
      { name: 'displayName', width: '30%' },
      { name: 'group',
        editableCellTemplate: 'ui-grid/dropdownEditor',
        cellFilter: 'userGroupFilter',
        editDropdownOptionsArray: userGroups
      }
    ];

    $scope.msg = {};
    var selection = [];

    $scope.showAdd = function() {
      return AuthSvc.isAdminUser();
    };

    $scope.showDelete = function() {
      return AuthSvc.isAdminUser() && selection.length > 0;
    };

    $scope.add = function() {
      console.log("showing dialog");

      return $mdDialog.show({
        controller: "AddUserDialog",
        templateUrl: 'add-user.dialog.html'
      }).
      then(function(user) {
        UserListSvc
          .add(user)
          .then(function() {
            console.log("user added successfully");
            UserListSvc.refresh();
          })
          .catch(function() {
            console.log("failed to add user");
          });
      });
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

    $scope.delete = function() {

      if(selection.length == 0) {
        return;
      }

      var user = selection[0];

      user.remove()
        .then(function() {
          UserListSvc.refresh();
          console.log("User deleted")
        })
        .catch(function(result) {
          var msg = result.data || "Delete failed";
          showToast(msg);
        });

      selection = [];
    };

    function save(user) {
      user.save()
        .then(function() {
          console.log("user saved");
        })
        .catch(function(result) {
          var msg = result.data || "Save failed";
          showToast(msg);
          UserListSvc.refresh(true); //force
        });
    }

    $scope.gridOptions.onRegisterApi = function(gridApi){

      $scope.gridApi = gridApi; //set gridApi on scope

      gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
        $scope.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue ;
        save(rowEntity);
        $scope.$apply();
      });

      gridApi.selection.on.rowSelectionChanged($scope,function(row){
        selection = gridApi.selection.getSelectedRows();
      });
    };

    function updateGrid() {
      $scope.gridOptions.data = UserListSvc.getData(); //use a copy so that we can revert
      console.log("grid updated");
    }

    updateGrid();
    UserListSvc.subscribe($scope, updateGrid);
    UserListSvc.refresh();
  }
  angular
    .module("rm")
    .controller('UsersView', UsersView)
    .constant('userGroups',userGroups)
    .constant('userTypes',userTypes)
    .filter('userTypeFilter', userTypeFilter)
    .filter('userGroupFilter', userGroupFilter);
})();