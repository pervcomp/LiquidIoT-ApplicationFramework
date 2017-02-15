/**
 * Copyright (c) 2015-2017 Tampere University of Technology.
 * Use is subject to license terms.
 */

'use strict';

angular.module('koodainApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngFileUpload',
  'ngVis',
  'ui.router',
  'ui.bootstrap',
  'ui-notification',
  'ui.ace',
  'rt.encodeuri',
  'nya.bootstrap.select'//,
  //'ui.select'//,
  //'ngSanitize'
])
    .constant('deviceManagerUrl', 'http://130.230.142.101:3000')
  //.constant('deviceManagerUrl', 'http://localhost:3000')
 .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, NotificationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    NotificationProvider.setOptions({startTop: 55});
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $location.path('/login');
        }
      });
    });
  });