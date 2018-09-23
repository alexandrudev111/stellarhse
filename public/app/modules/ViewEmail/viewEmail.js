(function () {
    var viewEmail = angular.module('viewEmail', ['ui.router']);
    viewEmail.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("viewEmail", {
                        url: "/viewEmail",
                        templateUrl: "app/modules/ViewEmail/Views/ViewEmail.html",
                        controller: "viewEmailCtrl"
                    })





        }]);
}());