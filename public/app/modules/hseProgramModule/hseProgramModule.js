(function () {
    var module = angular.module('hseProgramModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("hseProgram", {
                        url: "/hseProgram",
                        templateUrl: "app/modules/hseProgramModule/views/hseProgram.html",
                        controller: "HseProgramController"
                    });
                 
        }]);
}());