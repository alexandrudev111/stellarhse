(function () {
    var module = angular.module('maintenanceReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('createmaintenancereport', {
                        url: '/createmaintenancereport',
                        templateUrl: 'app/modules/maintencaneReportModule/views/createNewReport.html',
                        controller: "AddMaintenanceReportController"
                    })
                    .state('editmaintenancereport', {
                        url: '/editmaintenancereport',
                        templateUrl: 'app/modules/maintencaneReportModule/views/editReport.html',
                        controller: "EditMaintenanceReportController",
                        params: {
                            reportNumber: null
                        }
                    });
        }]);
}());