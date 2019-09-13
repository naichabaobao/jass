app.directive("blp", function () {
  return {
    restrict: "E",
    template: document.querySelector("#blp").innerHTML,
    scope: {
      "src": ""
    },
    controller: function ($scope) {
      $scope.testdata = "測試";
    }
  }
})