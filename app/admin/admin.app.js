'use strict';
(function() {

  // Declare app level module which depends on home, and components
  angular.module('rm', [
    'ui.router',
    'restangular',
    'LocalStorageModule',

    'ngMdIcons',
    'ngMaterial',
    'flow',

    'ui.grid',
    'ui.grid.edit',
    'ui.grid.selection'
  ]).

  //by referencing all the key services we force them to be instantiated in advance
  run(function(AuthSvc, HeaderDataSvc, BookingSvc, RoomListSvc, CategoryListSvc, LogoListSvc) {

      console.log("Room Mate : Admin App started");
  }).

  config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
      target: '/images/upload',
      testChunks: false
    };
    // You can also set default events:
    flowFactoryProvider.on('catchAll', function (event) {

    });
  }]).

  config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, AuthGroup) {

    $mdThemingProvider.theme('default')
      .primaryPalette('indigo')
      .accentPalette('blue-grey');

    //
    // For any unmatched url, redirect to /state1
    //$urlRouterProvider.otherwise("/");

    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('main.logos');
    });

    //
    // Now set up the states
    $stateProvider.
      state('main', {
        templateUrl: "main.view.html",
        controller: "MainView",
        controllerAs: "view",
        data:{group:AuthGroup.editor}
      }).
      state('main.logos', {
        url: "/logos",
        templateUrl: "logos.view.html",
        controller: "LogosView",
        controllerAs: "view",
        data:{group:AuthGroup.admin}
      }).
      state('main.users', {
        url: "/users",
        templateUrl: "users.view.html",
        controller: "UsersView"
      }).
      state('main.panels', {
        url: "/panels",
        templateUrl: "panels.view.html",
        controller: "PanelsView"
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