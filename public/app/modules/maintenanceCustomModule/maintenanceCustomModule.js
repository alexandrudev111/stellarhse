
(function () {
    var module = angular.module('maintenanceCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("maintenance", {
                        url: "/maintenance",
                        templateUrl: "app/modules/maintenanceCustomModule/views/maintenance.html",
                        controller: "maintenanceCustomController"
                    })


        }]);
}());