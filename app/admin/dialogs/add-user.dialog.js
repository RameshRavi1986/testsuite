(function(){

  /**
   * @ngInject
   */
  function AddUserDialog ($scope, $mdDialog, userTypes, userGroups) {

    $scope.user = {
      type: userTypes[1].id,
      group: userGroups[1].id
    };

    $scope.userTypes = userTypes;
    $scope.userGroups = userGroups;


    $scope.cancel = function() {
      console.log("dialog cancelled");
      $mdDialog.cancel();
    };

    $scope.confirm = function() {

      if(!$scope.user.name ) {
        $scope.alert = "Name required";
        return;
      }

      if($scope.user.type == 1) {
        if(!$scope.user.password ) {
          $scope.alert = "Password required";
          return;
        }

        if($scope.user.password != $scope.user.passwordRepeat) {
          $scope.alert = "Passwords do not match";
          return;
        }
      }

      $mdDialog.hide($scope.user);
    };
  }

  angular
    .module("rm")
    .controller('AddUserDialog', AddUserDialog);
})();