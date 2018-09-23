(function () {
    var module = angular.module('hazardReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('createhazardreport', {
                        url: '/createhazardreport',
                        templateUrl: 'app/modules/hazardReportModule/views/createNewReport.html',
                        controller: "AddHazardReportController"
                        })
                    .state('edithazardreport', {
                        url: '/edithazardreport',
                        templateUrl: 'app/modules/hazardReportModule/views/editReport.html',
                        controller: "EditHazardReportController",
                        params:{
                            reportNumber: null,
                            draftId: null
                        }
                    })



        }]);
}());