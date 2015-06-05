'use strict';
(function() {

  angular.module('rm', [
    'ui.router',
    'restangular',
    'LocalStorageModule',

    'ngMdIcons',
    'ngMaterial',

    'ui.grid',
    'ui.grid.edit',
    'ui.grid.cellNav',
    'ui.grid.selection'
  ]).

  //by referencing all the key services we force them to be instantiated in advance
  run(function(AuthSvc, HeaderDataSvc, BookingSvc, RoomListSvc, CategoryListSvc, LogoListSvc) {
      console.log("App started");
      console.debug("Debug enabled");
  }).

  config(function($logProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, AuthGroup) {

    $logProvider.debugEnabled(false);

    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('blue-grey');

    //
    // For any unmatched url, redirect to /state1
    //$urlRouterProvider.otherwise("/");

    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('main.default');
    });

    $stateProvider.
      state('main', {
        templateUrl: "cal.main.html",
        data:{group:AuthGroup.viewer},
        controller: "CalCtrl",
        controllerAs: "calCtrl"
      }).
      state('main.default', {
        url: "/",
        templateUrl: "cal.main.default.html",
        controller: "OverviewCtrl",
        controllerAs: "overviewCtrl"
      })
  });

  //manually trigger app load
  angular.element(document).ready( function() {
    setTimeout(function() {
      console.log("Angular loading...");
      angular.bootstrap(document, ['rm']);
    }, 100);
  });
})();