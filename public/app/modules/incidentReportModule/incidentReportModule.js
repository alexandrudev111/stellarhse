(function () {
    var module = angular.module('incidentReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('addincident', {
                        url: '/addincident',
                        templateUrl: 'app/modules/incidentReportModule/views/createNewReport.html',
                        controller: "AddIncidentReportController"
                    })
                    .state('editincidentreport', {
                        url: '/editincidentreport',
                        templateUrl: 'app/modules/incidentReportModule/views/editReport.html',
                        controller: "EditIncidentReportController",
                        params: {
                            reportNumber: null,
                            draftId: null
                        }
                    })

        }]);
}());