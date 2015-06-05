'use strict';
/* Services */
(function () {

  var logoutUrl = "/auth/logout";
  var loginUrl = "/auth/login";
  var userUrl = "/auth/user";
  var user = null;

  var initialized = false;

  var AuthGroup = {
    none: 0,
    viewer: 1,
    editor: 2,
    admin: 3,
    master: 4
  };

  var AuthSvc = function ($rootScope, $state, $q, $http) {

    function logout() {
      $http.post(logoutUrl).
        success(function () {
          user = null;
          console.log("logout successful");
          $state.reload();
          //$state.go("main", {}, {reload: true});
        });
    }

    function login(user, password, rememberMe, cb) {

      cb = cb || function (err) {
      };

      var req = {
        user: user,
        password: password,
        rememberMe: rememberMe === true
      };

      return $http.post("/auth/login", req).
        success(function () {

          authorize().then(function () {
            cb();
          });
          console.log("login successful");
        }).
        error(function (data) {
          cb(data.errorMessage || "Login failed");
        });
    }

    function setUser(data) {
      if (!data) {
        user = null;
        return;
      }
      user = data;
      user.displayName = user.displayName || user.userName;
      user.group = user.group || 2;
    }

    function authorize() {
      var deferred = $q.defer();
      if (user) {
        deferred.resolve();
        return deferred.promise;
      }

      return $http.get(userUrl)
        .success(function (data) {
          setUser(data);
        });
    }

    function isAuthorized() {
      return user != null;
    }

    function getUser() {
      return user;
    }

    function getUserName() {
      if (!user) {
        return null;
      }

      return user.name;
    }

    function getUserDisplayName() {
      if (!user) {
        return null;
      }

      return user.displayName;
    }

    function getUserGroup() {
      if (!user) {
        return AuthGroup.none;
      }

      return user.group || AuthGroup.viewer;
    }

    function canEditBookings() {
      return getUserGroup() >= AuthGroup.editor;
    }

    function isAdminUser() {
      return getUserGroup() >= AuthGroup.admin;
    }

    //public API
    return {
      logout: logout,
      login: login,
      authorize: authorize,
      isAuthorized: isAuthorized,

      getCurrentUser: getUser,
      getUserGroup: getUserGroup,
      getUserName: getUserName,
      getUserDisplayName: getUserDisplayName,
      canEditBookings: canEditBookings,
      isAdminUser: isAdminUser
    }
  };

  function AuthRouteConfig($rootScope, $location, $state, AuthSvc, LoginDialog) {

    initialized = true;
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

      if (AuthSvc.isAuthorized()) {
        return;
      }

      var requiredGroup = toState.data.group || 0;

      function go() {
        var data = toState.data || {};

        if (!user || user.group < requiredGroup) {
          return $location.path("/");
          //return $state.go("");
        }

        console.debug("state.go =>" + toState.name);
        return $state.go(toState.name, toParams, {reload: true});
      }

      event.preventDefault();

      AuthSvc.authorize()
        .then(go)
        .catch(function () {
          LoginDialog.show()
            .then(go);
        });
    });
  }


  angular.
    module('rm').
    constant('AuthGroup', AuthGroup).
    factory('AuthSvc', AuthSvc).
    run(AuthRouteConfig);
})();