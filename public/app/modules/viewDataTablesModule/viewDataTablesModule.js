(function () {
    var module = angular.module('viewDataTablesModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("viewDataTables", {
                        url: "/viewDataTables",
                        templateUrl: "app/modules/viewDataTablesModule/views/viewDataTables.html",
                        controller: "viewDataTablesController",
                        /*params:{ 
                            moduleType: null 
                        } */
                    })
                    .state("searchForReport", {
                        url: "/searchForReport",
                        templateUrl: "app/modules/viewDataTablesModule/views/searchForReport.html",
                        controller: "viewDataTablesController"
                    });
        }]);
}());