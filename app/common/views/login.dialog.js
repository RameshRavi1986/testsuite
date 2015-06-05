(function () {

  /**
   * @ngInject
   */
  function LoginDialogCtrl($scope, $timeout, $mdDialog, AuthSvc, localStorageService) {

    $scope.user = localStorageService.get("user");
    $scope.rememberMe = !(localStorageService.get("rememberMe") === "false"); //true unless explicitly stored as false

    function focus(id) {
      $timeout(function() {
        var element = document.getElementById(id);
        if (element) {
          element.focus();
        }
      });
    }

    if ($scope.user) {
      focus("loginPassword");
    }
    else {
      focus("loginUserName");
    }

    function hide() {
      $mdDialog.hide();
    }

    $scope.onKeyUp = function ($event) {
      if ($event.keyCode != 13) {
        return;
      }

      if ($scope.user && $scope.password) {
        $scope.confirm();
      }
    };

    $scope.cancel = function () {
      console.debug("dialog cancelled");
      hide();
    };

    $scope.confirm = function () {
      AuthSvc.login($scope.user, $scope.password, $scope.rememberMe, function (err) {

        if (err) {
          $scope.alert = err;
          return;
        }

        hide();
        localStorageService.set("user", $scope.user);
        localStorageService.set("rememberMe", $scope.rememberMe);
      });
    };
  }

  function LoginDialog($mdDialog) {
    var show = function() {
      return $mdDialog.show({
        clickOutsideToClose: false,
        escapeToClose: false,
        controller: "LoginDialogCtrl",
        templateUrl: 'login.dialog.html',
        focusOnOpen: false,
        locals: {}
      })
        .then(function (result) {
          console.debug("login dialog closed");
        });
    };

    return {
      show: show
    }
  }


  angular
    .module("rm")
    .factory('LoginDialog', LoginDialog)
    .controller('LoginDialogCtrl', LoginDialogCtrl);
})
();