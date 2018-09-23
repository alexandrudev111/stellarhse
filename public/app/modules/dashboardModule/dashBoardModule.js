(function () {
    var dashboardModule = angular.module('dashboardModule', ['ui.router']);
    dashboardModule.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("dashboard", {
                        url: "/dashboard",
                        templateUrl: "app/modules/dashboardModule/Views/dashboard.html",
                        controller: "dashboardCtrl"
                        
                    })
        }]);
}());