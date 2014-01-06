
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

  service.getTests = function(webProp) {
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
.controller('download', function($scope, $http, $q, google) {
  // Variable Setup.
  $scope.loading = {};
  $scope.error = {};

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
            $scope.loading.login = false; // Go away, gif.

          }
        );
      },

      // If not authorized:
      function(err) {
        $scope.error.login = err;
        $scope.loading.login = false; // Go away, gif.

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
    $scope.error = {};
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
        $scope.loading.webProps = false;
      }
    );
  };

  $scope.selectWebProp = function(webProp) {
    $scope.webProp = webProp;
    $scope.variations = null;
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

          // Got a list of variations!
          function(tests) {
            $scope.error.tests = null;
            $scope.loading.tests = false;
            $scope.tests = tests;
            $scope.goals = [""];
            if ($scope.tests.length > 0) $scope.selectTest($scope.tests[0]);
            setTimeout(function() {
              window.scrollTo(0, 5000);
            }, 20);
          },

          // Did not get a list of variations.
          function(err) {
            $scope.error.tests = err;
            $scope.loading.tests = false;
          }
        );
      },

      // Couldn't access profiles.
      function(err) {
        $scope.error.tests = err;
        $scope.loading.tests = false;
      }
    );
  };

  $scope.selectTest = function(test) {
    $scope.selectedTest = test;
    $scope.variations = test.variations;
  };

  $scope.attemptToDeleteTest = function(test) {
    // var toErase = $scope.tests.splice($scope.tests.indexOf(test), 1);
    if(test.id){ // If the test has an ID, it's on the server, and we have to be careful.
      $scope.toBeDeleted = test;
    } else { // Otherwise just get rid of it.
      deleteTest(test);
    }
  };

  var deleteTest = function(test) {
    // console.log($scope.tests);
    $scope.error.tests = null;
    $scope.tests.splice($scope.tests.indexOf(test), 1);
    // console.log($scope.tests);
    if ($scope.selectedTest === test) {
      $scope.selectedTest = $scope.tests[0] || null;
    }
  };

  $scope.cancelDeletion = function() {
    $scope.toBeDeleted = null;
  };

  $scope.deleteTestFromGA = function(){
    var toErase = $scope.toBeDeleted;
    $scope.toBeDeleted = null;
    console.log("About to delete", toErase);
    $http({
      url: 'deleteExperiment',
      method: "POST",
      data: {
        "token": google.token,
        "accountId": google.account.id,
        "webPropertyId": google.webProp.id,
        "profileId": google.profile.id,
        "experimentId": toErase.id
        }
    })
    .success(function() {
      deleteTest(toErase);
    })
    .error(function(err) {
      $scope.error.tests = err;
    });
  };

  $scope.addTest = function() {
    var newTest = {name: "", variations: []};
    $scope.tests.push(newTest);
    $scope.selectTest(newTest);
  };

  $scope.deleteVariation = function(variation) {
    $scope.variations.splice($scope.variations.indexOf(variation), 1);
  };

  $scope.addVariation = function() {
    $scope.variations.push({name: ""});
  };

  $scope.deleteGoal = function(goal) {
    $scope.goals.splice($scope.goals.indexOf(goal), 1);
  };

  $scope.addGoal = function() {
    $scope.goals.push("");
  };

  var updateExperiment = function(){
    var d = $q.defer();
    $http({
      url: 'updateExperiment',
      method: "POST",
      data: {
        "token": google.token,
        "accountId": google.account.id,
        "webPropertyId": google.webProp.id,
        "profileId": google.profile.id,
        "experimentId": $scope.selectedTest.id,
        "body": {
          "name": $scope.selectedTest.name,
          "status": $scope.selectedTest.status, // perhaps later:   make a dropdown menu--READY_TO_RUN, RUNNING, or DRAFT
          "objectiveMetric": 'ga:pageViews',  // The metric that the experiment is optimizing. Valid values: "ga:goal(n)Completions", "ga:bounces", "ga:pageviews", "ga:timeOnSite", "ga:transactions", "ga:transactionRevenue". This field is required if status is "RUNNING" and servingFramework is one of "REDIRECT" or "API".
          "variations": createVariationList()
          }
        } //end data
    })
    .success(function() {
      d.resolve();
    })
    .error(function(err) {
      d.reject(err);
    });

    return d.promise;
  };


  var createExperiment = function(){
    var d = $q.defer();

    $http({
      url: 'createExperiment',
      method: "POST",
      data: {
        "token": google.token,
        "accountId": google.account.id,
        "webPropertyId": google.webProp.id,
        "profileId": google.profile.id,
        "body": {
          "name": $scope.selectedTest.name,
          "status": "RUNNING", // make a dropdown menu--READY_TO_RUN, RUNNING, or DRAFT
          "objectiveMetric": 'ga:pageViews',  // The metric that the experiment is optimizing. Valid values: "ga:goal(n)Completions", "ga:bounces", "ga:pageviews", "ga:timeOnSite", "ga:transactions", "ga:transactionRevenue". This field is required if status is "RUNNING" and servingFramework is one of "REDIRECT" or "API".
          "variations": createVariationList()
          }
        } //end data
    })
    .success(function(data) {
      console.log(data);
      d.resolve(data);
    })
    .error(function(err) {
      d.reject(err);
    });

    return d.promise;
  };


  var createVariationList = function(){
    var variationList = [];
    for(var i = 0; i < $scope.variations.length; i++){
      variationList.push({"name": $scope.variations[i].name, "url":"http://www.inlineab.com/"+i, "status":"ACTIVE"});
    }
    return variationList;
  };

  var getVariationNames = function(variationList){
    var variationNames = [];
    for (var i = 0; i < variationList.length; i++) {
      variationNames.push(variationList[i]['name']);
    };
    return variationNames;
  };

  var download = function(expID) {
    var snippetSite = $scope.webProps[0].websiteUrl;
    if(snippetSite.search("http://") !== -1){
      snippetSite = snippetSite.substr(7);  // substr to cut off the 'http://' if it exists
    }
    var snippet = $scope.webProps[0].id;
    expID = $scope.selectedTest.id || "expid"
    var fullURL = ["expID=" + expID, "vars=" + JSON.stringify(getVariationNames($scope.variations)), "snipID=" + snippet, "snipSite=" + snippetSite].join("&");
    window.open('/downloadCustom?' + fullURL);
  };

  $scope.saveAndDownload = function(){
    if($scope.selectedTest.id){ // if the test already exists....
      updateExperiment().then(
        function(data) {
          download(data.id);
        },
        function(err) {
          $scope.error.download = err;
        }
      );
    } else { // if its brand new...
      createExperiment().then(
        function(data) {
          debugger;
          //TODO: send download the newly created EXP ID
          download();
        },
        function(err) {
          $scope.error.download = err;
        }
      );
    }
  };
});
