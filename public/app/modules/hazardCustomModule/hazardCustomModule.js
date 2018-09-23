
(function () {
    var module = angular.module('hazardCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("hazard", {
                        url: "/hazard",
                        templateUrl: "app/modules/hazardCustomModule/views/hazard.html",
                        controller: "hazardCustomController"
                    })


        }]);
}());