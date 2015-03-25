'use strict';

angular.module('manageIt.auth', [
  'ui.router',
  'auth0',
  'angular-storage',
  'angular-jwt',
  'manageIt.config'
]).provider('mAuth', function () {
  var loginSuccessState = 'main';
  this.setLoginSuccessState = function (state) {
    loginSuccessState = state;
  };

  var loginFailState = 'main';
  this.setloginFailState = function (state) {
    loginFailState = state;
  };

  this.$get = ['$q', 'auth', 'store', '$state', function ($q, auth, store, $state) {

    var saveProfileToken = function (profileToken) {
      store.set('profile', profileToken.profile);
      store.set('token', profileToken.token);
    };

    var getToken = function () {
      store.get('token');
    };

    var getProfile = function () {
      store.get('profile');
    };

    var signIn = function (config, backState) {
      // We promisify the signin method
      var deferred = $q.defer();
      
      auth.signin(config, function (profile, token) {
        deferred.resolve({profile: profile, token: token});
      }, function (err) {
        deferred.reject(err);
      });

      // Change states depending on the promise resolution
      return deferred.promise
        .then(saveProfileToken)
        .then(function () {
          var returnState = backState || loginSuccessState;
          $state.go(returnState);
        }, function (err) {
          $state.go(loginFailState);
        });
    };

    var logOut = function () {
      auth.signout();
      store.remove('profile');
      store.remove('token');
    };

    return {
      loginSuccessState: loginSuccessState,
      loginFailState: loginFailState,
      signin: signIn,
      getProfile: getProfile,
      getToken: getToken,
      logout: logOut
    };
  }];

}).config(function ($httpProvider, jwtInterceptorProvider, authProvider, $stateProvider, mConfig) {
  authProvider.init({
    clientID: mConfig.auth0.clientID,
    callbackURL: location.href,
    domain: mConfig.auth0.domain,
    loginState: 'login'
  });

  // We're annotating this function so that the `store` is injected correctly when this file is minified
  jwtInterceptorProvider.tokenGetter = ['store', function(store) {
    // Return the saved token
    return store.get('token');
  }];

  $httpProvider.interceptors.push('jwtInterceptor');

  $stateProvider.state('login', {
    url: '/login',
    controller: 'LoginCtrl'
  }).state('logout', {
    url: '/logout',
    controller: function (mAuth, $state) {
      mAuth.logout();
      $state.go('login');
    }
  });

}).controller('LoginCtrl', function ($state, mAuth, auth) {
  if(auth.isAuthenticated){
    $state.go(mAuth.loginSuccessState);
  }else{
    mAuth.signin({
      popup: true
    });
  }
}).run(function($rootScope, auth, store, jwtHelper, $state) {
  auth.hookEvents();
  $rootScope.$on('$stateChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $state.go('login');
        }
      }
    }
  });
});