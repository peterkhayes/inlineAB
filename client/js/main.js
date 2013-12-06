
var app = angular.module('inlineAB', [])
.config(function($routeProvider, $locationProvider) {
  $routeProvider.when("/", {templateUrl: 'templates/home.html'})
  .when("/getting-started", {templateUrl: 'templates/getting-started.html'})
  .when("/download", {controller: 'download', templateUrl: 'templates/download.html'})
  .when("/my-analytics", {controller: 'my-analytics', templateUrl: 'templates/my-analytics.html'})
  .when("/documentation", {templateUrl: 'templates/documentation.html'})
  .when("/authors", {templateUrl: 'templates/authors.html'})
  .otherwise({redirectTo: '/'});
})
.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
})

// Service that handles Google Analytics calls.
.factory('google', function($q, $timeout, $rootScope) {

  var service = {
    accountList: {},
    webPropertyList: {},
    profileList: {}
  };

  // Cloud console
  var clientId = '434808078941-u814h6clkbve3dpp5cuaolqto1cmk0ui.apps.googleusercontent.com';
  // Will need to change if Write access required
  var scopes = 'https://www.googleapis.com/auth/analytics';
  // InlineAB API key
  var apiKey = 'AIzaSyCWpnPpii3cWo2RBlpi731U_bifkregbd8';

  var checkAuth = function(immediately) {
    gapi.auth.authorize({
      client_id: clientId, scope: scopes, immediate: immediately}, handleAuthResult);
  };

  var handleAuthResult = function(token) {
    if (token) {
      service.token = token;
      gapi.client.load('analytics', 'v3', handleAuthorized);
    } else {
      handleUnauthorized();
    }
  };

  var handleAuthorized = function() {
    if (typeof authPromise !== 'undefined') {
      $rootScope.$apply(function(){
        authPromise.resolve(service.token);
      });
    }
  };

  var handleUnauthorized = function() {
    if (typeof authPromise !== 'undefined') {
      $rootScope.$apply(function(){
        authPromise.reject('Please authorize this script to access Google Analytics.');
      });
    }
  };

  service.login = function() {
    authPromise = $q.defer();
    checkAuth(false);
    return authPromise.promise;
  };

  // service.logout = function() {
  //   var d = $q.defer();

  //   // REPLACE WITH REAL LOGOUT
  //   $timeout(function() {
  //     service.token = null;
  //     d.resolve();
  //   }, 200);

  //   return d.promise;
  // };

  service.getAccounts = function() {
    var d = $q.defer();
    gapi.client.analytics.management.accounts.list().execute(function(response) {
      if (!response.code) {
        if (response.items && response.items.length) {
          service.accountList = response.items;
          $rootScope.$apply(function(){
            d.resolve(service.accountList);
          });
        } else {
          $rootScope.$apply(function(){
            d.reject("No accounts found for this user.");
          });
          //TODO; SEND TO ALEX FOR CREATION OF GA ACCOUNT
        }
      } else {
        $rootScope.$apply(function(){
          d.reject('There was an error querying accounts: ' + response.message);
        });
      }
    });
    return d.promise;
  };

  service.getWebProps = function() {
    var d = $q.defer();
    gapi.client.analytics.management.webproperties.list({accountId: service.account.id}).execute(function(response) {
      if (!response.code) {
        if (response.items && response.items.length) {
          service.webPropertyList = response.items;
          $rootScope.$apply(function(){
            d.resolve(service.webPropertyList);
          });
        } else {
          $rootScope.$apply(function(){
            d.reject('No web properties found for this user.');
          });
          //TODO; SEND TO ALEX FOR CREATION OF WEB PROPERTY
        }
      } else {
        $rootScope.$apply(function(){
          d.reject('There was an error querying web properties: ' + response.message);
        });
      }
    });
    return d.promise;
  };

  service.getProfiles = function() {
    var d = $q.defer();
    gapi.client.analytics.management.profiles.list({
      accountId: service.account.id,
      webPropertyId: service.webProp.id
    }).execute(function(response) {
      if (!response.code) {
        if (response && response.items && response.items.length) {
          service.profileList = response.items;
          // CHANGE THIS TO ACTUALLY WORK INLINE AB.
          //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
          service.profile = service.profileList[0];
          $rootScope.$apply(function(){
            d.resolve(service.profileList[0]);
          });
        } else {
          $rootScope.$apply(function(){
            d.reject('No profiles found for this user.');
          });
            //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
        }
      } else {
        $rootScope.$apply(function(){
          d.reject('There was an error querying profiles: ' + response.message);
        });
      }
    });
    return d.promise;
  };

  service.getVariations = function(webProp) {
    var d = $q.defer();
    gapi.client.analytics.management.experiments.list({
      accountId: service.account.id,
      webPropertyId: service.webProp.id,
      profileId: service.profile.id
    }).execute(function(response) {
      if (!response.code) {
        if (response.items && response.items.length) {
          $rootScope.$apply(function(){
            d.resolve(response.items);
          });
        } else {
          $rootScope.$apply(function(){
            d.reject('No tests found for this user.');
          });
        }
      } else {
        $rootScope.$apply(function(){
          profilesPromise.reject('There was an error querying tests: ' + response.message);
        });
      }
    });
    return d.promise;
  };

  return service;
})

// Controller for the download page.
.controller('download', function($scope, $http, google) {
  // Variable Setup.
  $scope.loading = {};
  $scope.error = {};

  // Load a copy of inlineAB.js in memory.
  var inlineABScript;
  var getInlineABScript = function() {
    $http.get('js/inlineab.js')
    .success(function(text) {
      console.log(text);
      inlineABScript = text;
    })
    .error(function(err) {
      console.log("Error fetching inlineAB script", err);
      getInlineABScript();
    });
  };
  getInlineABScript();

  // Bindings.
  $scope.login = function() {
    $scope.loading.login = true; // spinner gif.

    // Attempt to log in with OAuth.
    google.login().then(

      // If authorized:
      function() {

        // Now get their list of accounts.
        google.getAccounts().then(

          // If we got a list of accounts:
          function(accounts) {
            $scope.loggedIn = true;
            $scope.loading.login = false; // Go away, gif.
            $scope.accounts = accounts;
            $scope.error.login = null;
          },

          // If we did not get a list of accounts:
          function(err) {
            $scope.error.login = err;
          }
        );
      },

      // If not authorized:
      function(err) {
        $scope.error.login = err;
      }
    );
  };

  // $scope.logout = function() {
  //   $scope.loading.login = true;
  //   google.logout().then(
  //     function() {
  //       $scope.loading.login = false;
  //       $scope.loggedIn = false;
  //       $scope.account = undefined;
  //       $scope.accounts = undefined;
  //       $scope.webProp = undefined;
  //       $scope.webProps = undefined;
  //     },
  //     function(error) {$scope.error = error;}
  //   );
  // };

  $scope.selectAccount = function(account) {
    $scope.account = account;
    $scope.webProp = null;
    $scope.variations = null;
    google.account = account;
    getWebProps(account);
  };

  $scope.isSelectedAccount = function(account) {
      return $scope.account === account;
  };

  // Get the web properties for a specified account.
  var getWebProps = function(account) {
    $scope.loading.webProps = true;
    google.getWebProps(account).then(
      // Success.
      function(webProps) {
        $scope.loading.webProps = false;
        $scope.webProps = webProps;
        $scope.error.webProp = null;
      },

      // Failure.
      function(err) {
        $scope.error.webProp = err;
      }
    );
  };

  $scope.selectWebProp = function(webProp) {
    $scope.webProp = webProp;
    $scope.variations = null;
    google.webProp = webProp;
    getVariations();
  };

  $scope.isSelectedWebProp = function(webProp) {
    return $scope.webProp === webProp;
  };

  var getVariations = function(webProp) {
    $scope.loading.variations = true;
    google.getProfiles().then(
      // Successfully got a profile called INLINEAB.
      function() {
        google.getVariations().then(

          // Got a list of variations!
          function(variations) {
            $scope.error.variations = null;
            $scope.loading.variations = false;
            $scope.variations = variations;
            setTimeout(function() {
              window.scrollTo(0, 5000);
            }, 20);
          },

          // Did not get a list of variations.
          function(err) {
            $scope.error.variations = err;
          }
        );
      },

      // Couldn't access profiles.
      function(err) {
        $scope.error.variations = err;
      }
    );
  };

  $scope.deleteVariation = function(variation) {
    $scope.variations.splice($scope.variations.indexOf(variation), 1);
  };

  $scope.addvariation = function() {
    $scope.variations.push("");
    setTimeout(function() {
      window.scrollTo(0, 5000);
    }, 20);
  };

  $scope.deleteGoal = function(goal) {
    $scope.goals.splice($scope.goals.indexOf(goal), 1);
  };

  $scope.addGoal = function() {
    $scope.goals.push("");
    setTimeout(function() {
      window.scrollTo(0, 5000);
    }, 20);
  };

  $scope.download = function() {
    if (!inlineABScript) return;
    var variationsText = "'default',",
        goalsText = "";
    for (var i = 0; i < $scope.variations.length; i++) {
      variationsText += "'" + $scope.variations[i].name + "',";
    }
    variationsText = "[" + variationsText.slice(0, variationsText.length - 1) + "]";
    inlineABScript = inlineABScript.replace("/* EXPERIMENT ID */", "EXPERIMENT ID I GOT FROM ALEX");
    inlineABScript = inlineABScript.replace("/* VARIATIONS */", variationsText);
    console.log(inlineABScript);
  };

})
.controller('my-analytics', function() {

});

// var wow = function() {
//   console.log(["Wow.", "So analytics.", "Much testing.", "Very API."][Math.floor(Math.random()*4)]);
//   setTimeout(wow, Math.random()*30000);
// };

// wow();