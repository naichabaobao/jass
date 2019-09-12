const app = angular.module("boot", []);

app.controller("hello", function ($scope) {
  $scope.hello = "珍惜反";
})

app.directive("hello", function () {
  return {
    restrict: "E",
    template: document.querySelector("#home").innerHTML,
    controller: "hello"
  }
})



app.controller('appController', function ($scope) {
  $scope.hello = "hello angular";
});

