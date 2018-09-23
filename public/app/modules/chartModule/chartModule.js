(function () {
    var admin = angular.module('chartModule', []);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("chartgrid", {
                        url: "/chartgrid",
                        templateUrl: "app/modules/chartModule/views/chartGrid.html",
                        controller: "chartGridCtrl"
                    })
                    .state("generatechart", {
                        url: "/generatechart",
                        templateUrl: "app/modules/chartModule/views/generatechart.html",
                        controller: "chartCtrl"
                    })
        }]);
}());