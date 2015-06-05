'use strict';
(function() {

  // Declare app level module which depends on home, and components
  angular.module('rm', [
    'ngRoute',
    'ui.router',
    'restangular',
    //'ngWebSocket', //not currently used

    'bloodhound',
    'ui.bootstrap'
  ]).

  //by referencing all the key services we force them to be instantiated in advance
  run(function($rootScope, $state, HeaderDataSvc, BookingSvc, RmTouch) {
    //initialize the touch timeout
    RmTouch.init();

    console.log("Room Mate : Panel App started");

    //redirect to home screen on touch timeout
    $rootScope.$on("RmTouch:timeout", function() {
      $state.go("main.home");
    });
  }).

  config(function($logProvider, $stateProvider, $urlRouterProvider, RmConfigSvcProvider) {

    //Setup the rm config object to use panel
    RmConfigSvcProvider.enablePanelMode();

    //default route
    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('main.home');
    });

    //
    // Now set up the states
    $stateProvider.
      state('offline', {
        url: "/offline",
        templateUrl: "offline.view.html",
        controller: "OfflineView",
        controllerAs: "view"
      }).
      state('poster', {
        templateUrl: "poster.view.html",
        controller: "PosterView",
        controllerAs: "view"
      }).
      state('main', {
        templateUrl: "main.view.html",
        controller: "MainView",
        controllerAs: "main"
      }).
      state('main.home', {
        url: "/",
        templateUrl: "home.view.html",
        controller: "HomeCtrl",
        controllerAs: "home"
      }).
      state('main.today', {
        url: "/today",
        templateUrl: "today.view.html",
        controller: "TodayCtrl",
        controllerAs: "today",
        params: {
          start: { value: null }
        }
      }).
      state('main.search', {
        url: "/search",
        templateUrl: "search.view.html",
        controller: "SearchCtrl",
        controllerAs: "search"
      }).
      state('main.add-booking', {
        url: "/add",
        templateUrl: "add-booking.view.html",
        controller: "AddBookingCtrl",
        controllerAs: "addBooking",
        params: {
          booking: { value: null }
        }
      });
  });

  angular.element(document).ready( function() {
    setTimeout(function() {
      console.log("Angular loading...");
      angular.bootstrap(document, ['rm']);
    }, 100);
  });
})();