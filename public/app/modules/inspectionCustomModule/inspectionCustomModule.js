
(function () {
    var module = angular.module('inspectionCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("inspection", {
                        url: "/inspection",
                        templateUrl: "app/modules/inspectionCustomModule/views/inspection.html",
                        controller: "inspectionCustomController"
                    })


        }]);
}());