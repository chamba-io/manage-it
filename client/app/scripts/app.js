'use strict';

/**
 * @ngdoc overview
 * @name manageItClientApp
 * @description
 * # manageItClientApp
 *
 * Main module of the application.
 */
angular.module('manageIt', [
  'ui.router',
  'manageIt.auth'
]).config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('main', {
    url: '/',
    template: '<h1>Welcome Inside</h1>',
    data: {
      requiresLogin: true
    }
  });
  $urlRouterProvider.otherwise('/');
});
