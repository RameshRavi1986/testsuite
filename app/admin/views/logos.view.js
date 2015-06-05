(function(){

  /**
   * @ngInject
   */
  function LogosView ($timeout, LogoListSvc, $mdDialog, AuthSvc) {

    this.auth = AuthSvc;

    LogoListSvc.refresh();


    this.getLogos = function() {
      return LogoListSvc.getData();
    };

    var extensionMap = {png:1,gif:1,jpg:1,jpeg:1};

    this.checkExtension = function($file) {
      var ext = $file.getExtension();
      console.log("checking extension ", ext);
      return !!extensionMap[ext];
    };

    this.uploadComplete = function() {
      console.log("upload complete");
      $timeout(function() {
        LogoListSvc.refresh();
      },10);
    };

    this.deleteLogo = function(logo) {

      // Appending dialog to document.body to cover sidenav in docs app
      var confirm = $mdDialog.confirm()
        .title('Delete Logo?')
        .content(logo.name)
        .ok('Confirm')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        logo.remove().then(function() {
          LogoListSvc.refresh();
        });
      });
    };
  }

  angular
    .module("rm")
    .controller('LogosView', LogosView);
})();