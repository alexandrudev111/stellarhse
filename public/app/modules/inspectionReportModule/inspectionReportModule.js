(function () {
    var module = angular.module('inspectionReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('createinspectionreport', {
                        url: '/createinspectionreport',
                        templateUrl: 'app/modules/inspectionReportModule/views/createNewReport.html',
                        controller: "AddInspectionReportController"
                    })
                    .state('editinspectionreport', {
                        url: '/editinspectionreport',
                        templateUrl: 'app/modules/inspectionReportModule/views/editReport.html',
                        controller: "EditInspectionReportController",
                        params: {
                            reportNumber: null
                        }
                    })



        }]);
}());
