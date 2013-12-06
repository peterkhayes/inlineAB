
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

  var currentPromise;

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

  var handleAuthResult = function(token) { // important to set token?
    if (token) {
      service.token = token;
      gapi.client.load('analytics', 'v3', handleAuthorized);
    } else {
      handleUnauthorized();
    }
  };

  // Set demo button to trigger iabTest
  var handleAuthorized = function() {
    console.log('token is: ',service.token);
    listAccounts();
  };

  var handleUnauthorized = function() {
    var authorizeButton = document.getElementById('authorize-button');
    var runDemoButton = document.getElementById('run-demo-button');

    runDemoButton.style.visibility = 'hidden';
    authorizeButton.style.visibility = '';
    authorizeButton.onclick = handleAuthClick;
    console.log('Please authorize this script to access Google Analytics.');
  };

  var handleAuthClick = function(event) {
    // User prompted to give access
    checkAuth(false);
  };

  // Query (list) all accounts
  var listAccounts = function() {
    console.log("Listing accounts.");
    gapi.client.analytics.management.accounts.list().execute(handleAccounts);
  };

  var handleAccounts = function(response) {
    console.log("Handling the accounts list.");
    if (!response.code) {
      if (response.items && response.items.length) {
        service.accountList = response.items;
        console.log("Got a list!", service.accountList);
        $rootScope.$apply(function(){
          currentPromise.resolve(service.accountList);
        });
      } else {
        console.log('No accounts found for this user.');
        currentPromise.reject("No accounts found for this user.");
        //TODO; SEND TO ALEX FOR CREATION OF GA ACCOUNT
      }
    } else {
      currentPromise.reject('There was an error querying accounts: ' + response.message);
      console.log('There was an error querying accounts: ' + response.message);
    }
  };

  var handleWebProperties = function(response) {
    if (!response.code) {
      if (response.items && response.items.length) {
        console.log("got list of web properties!", response.items);
        service.webPropertyList = response.items;
        // $rootScope.$apply(function(){
        //   currentPromise.resolve(service.webPropertyList);
        // });
        queryProfiles(service.account, service.webProp);
      } else {
        console.log('No web properties found for this user.');
        currentPromise.reject('No web properties found for this user.');
        //TODO; SEND TO ALEX FOR CREATION OF WEB PROPERTY

      }
    } else {
      console.log('There was an error querying web properties: ' + response.message);
      currentPromise.reject('There was an error querying web properties: ' + response.message);
    }
  };

  var queryProfiles = function(account, webproperty) {
    console.log('Querying Profiles.');
    gapi.client.analytics.management.profiles.list({
      'accountId': account.id,
      'webPropertyId': webproperty.id // set as inlineAB?
    }).execute(handleProfiles);
  };

  // Selects by default the first profile
  // TODO: add logic for profile selection to pass on
  var handleProfiles = function(response) {
    if (!response.code) {
      if (response && response.items && response.items.length) {
        populateLists(response.items, "profileList");

        if(profileList["INLINEAB"]){
          $rootScope.$apply(function(){
            currentPromise.resolve(service.webPropertyList);
          });
        } else{
          //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
          console.log("INLINEAB profile not found.");
        }

      } else {
        console.log('No profiles found for this user.');
          //TODO; SEND TO ALEX FOR CREATION OF INLINEAB PROFILE
      }
    } else {
      console.log('There was an error querying profiles: ' + response.message);
    }
  };

  service.login = function() {
    currentPromise = $q.defer();
    checkAuth(false);
    console.log("Done checking auth");
    return currentPromise.promise;
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

  service.getWebProps = function(account) {
    currentPromise = $q.defer();

    gapi.client.analytics.management.webproperties.list({'accountId': account.id}).execute(handleWebProperties);

    return currentPromise.promise;
  };

  service.getTests = function(webProp) {
    var d = $q.defer();

    // REPLACE WITH REAL TEST FETCHER
    $timeout(function() {
      d.resolve(["Doge Vocabulary", "Bro-Quotient/Brotient", "Moral Fortitude", "Spline Reticulation"]);
    }, 200);

    return d.promise;
  };

  return service;
})
.controller('download', function($scope, google) {
  $scope.loading = {login: false};
  $scope.login = function() {
    $scope.loading.login = true;
    google.login().then(
      function(accounts) {
        console.log("We're back in the view!  With...", accounts);
        $scope.loggedIn = true;
        $scope.loading.login = false;
        $scope.accounts = accounts;
      },
      function(error) {$scope.error = error;}
    );
  };

  $scope.logout = function() {
    $scope.loading.login = true;
    google.logout().then(
      function() {
        $scope.loading.login = false;
        $scope.loggedIn = false;
        $scope.account = undefined;
        $scope.accounts = undefined;
        $scope.webProp = undefined;
        $scope.webProps = undefined;
      },
      function(error) {$scope.error = error;}
    );
  };

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
    getTests(webProp);
  };

  $scope.isSelectedWebProp = function(webProp) {
      return $scope.webProp === webProp;
  };

  var getTests = function(webProp) {
    $scope.loading.tests = true;
    google.getTests(webProp).then(
      function(tests) {
        $scope.loading.tests = false;
        $scope.tests = tests;
        setTimeout(function() {
          window.scrollTo(0, 5000);
        }, 20);
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