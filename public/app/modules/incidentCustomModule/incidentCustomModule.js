
(function () {
    var module = angular.module('incidentCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("incident", {
                        url: "/incident",
                        templateUrl: "app/modules/incidentCustomModule/views/incident.html",
                        controller: "incidentCustomController"
                    })


        }]);
}());