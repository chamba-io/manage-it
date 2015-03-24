'use strict';

angular.module('manageIt.auth', [
  'ui.router',
  'auth0'
]).config(function (authProvider, $stateProvider) {
  authProvider.init({
    clientID: 'yOy4nJyAbJiHSdlDekiGJLifnnbRisvE',
    callbackURL: location.href,
    domain: 'gobliiop.auth0.com'
  });

  $stateProvider.state('login', {
    url: '/login',
    controller: 'LoginCtrl'
  });

}).controller('LoginCtrl', function (auth, $state) {
  auth.signin({
    popup: true
  }, function () {
    $state.go('main');
  });
});