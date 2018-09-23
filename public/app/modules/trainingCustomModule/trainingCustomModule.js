
(function () {
    var module = angular.module('trainingCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("training", {
                        url: "/training",
                        templateUrl: "app/modules/trainingCustomModule/views/training.html",
                        controller: "trainingCustomController"
                    })


        }]);
}());