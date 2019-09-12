const app = angular.module("boot", []);

app.controller('appController', function ($scope) {
  $scope.hello = "hello angular";
});

