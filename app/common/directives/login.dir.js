(function () {

  function rmLoginCtrl($scope, AuthSvc, LoginDialog, LogoutDialog) {
    $scope.auth = AuthSvc;
    $scope.login = LoginDialog.show;
    $scope.logout = LogoutDialog.show;
  }

  function rmLogin() {
    return {
      restrict: "EA",
      scope: true, //new scope based on parent
      templateUrl: "login.dir.html",
      controller: rmLoginCtrl,
      link: function (scope, element, attr) {

      }
    };
  }

  angular
    .module('rm')
    .directive('rmLogin', rmLogin);
})();