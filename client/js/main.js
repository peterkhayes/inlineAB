
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
.factory('google', function($q, $timeout, $rootScope) {

  var service = {
    accountList: {},
    webPropertyList: {},
    profileList: {}
  };

  var authPromise,
      accountsPromise,
      webPropsPromise,
      profilesPromise,
      testsPromise;

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
    console.log('token is: ',service.token);
    if (typeof authPromise !== 'undefined') {
      $rootScope.$apply(function(){
        authPromise.resolve(service.token);
      });
    }
  };

  var handleUnauthorized = function() {
    console.log('Please authorize this script to access Google Analytics.');
    if (typeof authPromise !== 'undefined') {
      $rootScope.$apply(function(){
        authPromise.reject('Please authorize this script to access Google Analytics.');
      });
    }
  };

  var handleAccounts = function(response) {
    console.log("Handling the accounts list.");
    if (!response.code) {
      if (response.items && response.items.length) {
        service.accountList = response.items;
        console.log("Got a list!", service.accountList);
        $rootScope.$apply(function(){
          if (typeof accountsPromise !== 'undefined') accountsPromise.resolve(service.accountList);
        });
      } else {
        $rootScope.$apply(function(){
          if (typeof accountsPromise !== 'undefined') accountsPromise.reject("No accounts found for this user.");
        });
        console.log('No accounts found for this user.');
        //TODO; SEND TO ALEX FOR CREATION OF GA ACCOUNT
      }
    } else {
      $rootScope.$apply(function(){
        if (typeof accountsPromise !== 'undefined') accountsPromise.reject('There was an error querying accounts: ' + response.message);
      });
      console.log('There was an error querying accounts: ' + response.message);
    }
  };

  var handleWebProperties = function(response) {
    console.log("Handling the web property lists.");
    if (!response.code) {
      if (response.items && response.items.length) {
        console.log("got list of web properties!", response.items);
        service.webPropertyList = response.items;
        $rootScope.$apply(function(){
          if (typeof webPropsPromise !== 'undefined') webPropsPromise.resolve(service.accountList);
        });
      } else {
        console.log('No web properties found for this user.');
        $rootScope.$apply(function(){
          if (typeof webPropsPromise !== 'undefined') webPropsPromise.reject('No web properties found for this user.');
        });
        //TODO; SEND TO ALEX FOR CREATION OF WEB PROPERTY
      }
    } else {
      console.log('There was an error querying web properties: ' + response.message);
      $rootScope.$apply(function(){
        if (typeof webPropsPromise !== 'undefined') webPropsPromise.reject('There was an error querying web properties: ' + response.message);
      });
    }
  };

  var handleProfiles = function(response) {
    if (!response.code) {
      if (response && response.items && response.items.length) {
        service.profileList = response.items;
        if (response.items["INLINEAB"]) {
          $rootScope.$apply(function(){
            profilesPromise.resolve(service.profileList);
          });
        } else {
          //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
          console.log("INLINEAB profile not found.");
          $rootScope.$apply(function(){
            profilesPromise.reject("INLINEAB profile not found.");
          });
        }
      } else {
        console.log('No profiles found for this user.');
        $rootScope.$apply(function(){
          profilesPromise.reject('No profiles found for this user.');
        });
          //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
      }
    } else {
      console.log('There was an error querying profiles: ' + response.message);
      $rootScope.$apply(function(){
        profilesPromise.reject('There was an error querying profiles: ' + response.message);
      });
    }
  };

  service.login = function() {
    authPromise = $q.defer();
    checkAuth(false);
    return authPromise.promise;
  };

  service.logout = function() {
    var d = $q.defer();

    // REPLACE WITH REAL LOGOUT
    $timeout(function() {
      service.token = null;
      d.resolve();
    }, 200);

    return d.promise;
  };

  service.getAccounts = function() {
    accountsPromise = $q.defer();
    gapi.client.analytics.management.accounts.list().execute(handleAccounts);
    return accountsPromise.promise;
  };

  service.getWebProps = function() {
    webPropsPromise = $q.defer();
    gapi.client.analytics.management.webproperties.list({'accountId': service.account.id}).execute(handleWebProperties);
    return webPropsPromise.promise;
  };

  service.getProfiles = function() {
    profilesPromise = $q.defer();
    console.log('Querying Profiles.');
    gapi.client.analytics.management.profiles.list({
      'accountId': service.webProp.accountId,
      'webPropertyId': service.webProp.id
    }).execute(handleProfiles);
    return profilesPromise.promise;
  };

  service.getTests = function(webProp) {
    testsPromise = $q.defer();

    // REPLACE WITH REAL TEST FETCHER
    $timeout(function() {
      d.resolve(["Doge Vocabulary", "Bro-Quotient/Brotient", "Moral Fortitude", "Spline Reticulation"]);
    }, 200);

    return testsPromise.promise;
  };

  return service;
})
.controller('download', function($scope, google) {
  $scope.loading = {};

  $scope.login = function() {
    $scope.loading.login = true; // spinner gif.

    // Attempt to log in with OAuth.
    google.login().then(

      // If authorized:
      function() {
        console.log("Authorized!");

        // Now get their list of accounts.
        google.getAccounts().then(

          // If we got a list of accounts:
          function(accounts) {
            console.log("We're back in the view!  With...", accounts);
            $scope.loggedIn = true;
            $scope.loading.login = false; // Go away, gif.
            $scope.accounts = accounts;
          },

          // If we did not get a list of accounts:
          function(err) {
            $scope.error = error;
          }
        );
      },

      // If not authorized:
      function(err) {
        $scope.error = error;
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
    console.log("selected an account");
    $scope.account = account;
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
      function(webProps) {
        $scope.loading.webProps = false;
        console.log("put web props into UI");
        $scope.webProps = webProps;
      }
    );
  };

  $scope.selectWebProp = function(webProp) {
    console.log("selected an WebProp");
    $scope.webProp = webProp;
    google.webProp = webProp;
    getTests();
  };

  $scope.isSelectedWebProp = function(webProp) {
      return $scope.webProp === webProp;
  };

  var getTests = function(webProp) {
    $scope.loading.tests = true;
    google.getProfiles().then(
      // Successfully got a profile called INLINEAB.
      function() {
        google.getTests().then(

          // Got a list of tests!
          function() {
            $scope.loading.tests = false;
            $scope.tests = tests;
            setTimeout(function() {
              window.scrollTo(0, 5000);
            }, 20);
          },

          // Did not get a list of tests.
          function() {

          }
        );
      },

      // Couldn't access profiles.
      function() {

      }
    );
  };

  $scope.deleteTest = function(test) {
    $scope.tests.splice($scope.tests.indexOf(test), 1);
  };

  $scope.addTest = function() {
    $scope.tests.push("");
    setTimeout(function() {
      window.scrollTo(0, 5000);
    }, 20);
  };

})
.controller('my-analytics', function() {

});

// var wow = function() {
//   console.log(["Wow.", "So analytics.", "Much testing.", "Very API."][Math.floor(Math.random()*4)]);
//   setTimeout(wow, Math.random()*30000);
// };

// wow();