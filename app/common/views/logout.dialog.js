(function () {

  /**
   * @ngInject
   */
  function LogoutDialog($mdDialog,AuthSvc) {
    var dialogPreset = $mdDialog.confirm()
      .title('Logout')
      .content('Are you sure you want to logout?')
      .ariaLabel('Logout')
      .ok('Yes')
      .cancel('No');

    function show() {
      return $mdDialog.show(dialogPreset)
        .then(function() {
          AuthSvc.logout();
        })
    }

    return {
      show: show
    }
}


  angular
    .module("rm")
    .factory('LogoutDialog', LogoutDialog)
})();