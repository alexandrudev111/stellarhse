(function () {
    var module = angular.module("coreReportModule",['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('HseTrackingReport', {
                        url: '/HseTrackingReport',
                        templateUrl: 'app/modules/coreReportModule/views/hseTrackingReport.html',
                        controller : "coreReportController"
                    })

        }]);
}())