(function () {
    var module = angular.module('trainingReportModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('createtrainingreport', {
                        url: '/createtrainingreport',
                        templateUrl: 'app/modules/trainingReportModule/views/createNewReport.html',
                        controller: "AddTrainingReportController"
                    })
                    .state('edittrainingreport', {
                        url: '/edittrainingreport',
                        templateUrl: 'app/modules/trainingReportModule/views/editReport.html',
                        controller: "EditTrainingReportController",
                        params:{
                            reportNumber: null
                        }
                    });
        }]);
}());