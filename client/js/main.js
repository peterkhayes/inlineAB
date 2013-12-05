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
.factory('google', function($q, $timeout) {
  var service = {};

  service.login = function() {
    var d = $q.defer();

    // REPLACE WITH REAL LOGIN
    var name = "A GOOGLE USER";
    $timeout(function() {
      service.username = name;
      d.resolve(name);
    }, 200);

    return d.promise;
  };

  service.logout = function() {
    var d = $q.defer();

    // REPLACE WITH REAL LOGOUT
    $timeout(function() {
      service.username = undefined;
      d.resolve();
    }, 200);

    return d.promise;
  };

  service.getAccounts = function() {
    var d = $q.defer();

    // REPLACE WITH REAL ACCOUNT FETCHER
    $timeout(function() {
      d.resolve(["Personal Account", "Business Account", "H4CK3R 4CC0|_|N7"]);
    }, 200);

    return d.promise;
  };

  service.getWebProps = function(account) {
    var d = $q.defer();

    // REPLACE WITH REAL WEB PROP FETCHER
    $timeout(function() {
      d.resolve(["DRUGS", "KIDNAPPINGS", "LAUNDERING"]);
    }, 200);

    return d.promise;
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
      function(username) {
        $scope.loading.login = false;
        $scope.username = username;
        getAccounts();
      },
      function(error) {$scope.error = error;}
    );
  };

  $scope.logout = function() {
    $scope.loading.login = true;
    google.logout().then(
      function() {
        $scope.loading.login = false;
        $scope.username = undefined;
        $scope.account = undefined;
        $scope.accounts = undefined;
        $scope.webProp = undefined;
        $scope.webProps = undefined;
      },
      function(error) {$scope.error = error;}
    );
  };

  // Get the google accounts.
  var getAccounts = function() {
    $scope.loading.accounts = true;
    google.getAccounts().then(
      function(accounts) {
        $scope.loading.accounts = false;
        $scope.accounts = accounts;
      }
    );
  };

  $scope.selectAccount = function(account) {
    console.log("selected an account");
    $scope.account = account;
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
        console.log("got web props");
        $scope.webProps = webProps;
      }
    );
  };

  $scope.selectWebProp = function(webProp) {
    console.log("selected an WebProp");
    $scope.webProp = webProp;
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