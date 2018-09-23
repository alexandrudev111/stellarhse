(function () {
    var module = angular.module('safetyMeetingReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('createsafetymeetingreport', {
                        url: '/createsafetymeetingreport',
                        templateUrl: 'app/modules/safetyMeetingReportModule/views/createNewReport.html',
                        controller: "AddSafetyMeetingReportController"
                    })
                    .state('editsafetymeetingreport', {
                        url: '/editsafetymeetingreport',
                        templateUrl: 'app/modules/safetyMeetingReportModule/views/editReport.html',
                        controller: "EditSafetyMeetingReportController",
                        params:{
                            reportNumber: null
                        }
                    });
        }]);
}());