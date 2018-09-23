(function () {
    var module = angular.module('myAdminModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state('myLoginHistory', {
                        url: '/myLoginHistory',
                        templateUrl: 'app/modules/myAdmin/views/myLoginHistory.html',
                        controller: "myAccountCtrl"
                    })
                    .state('myEmailNotification', {
                        url: '/myEmailNotification',
                        templateUrl: 'app/modules/myAdmin/views/myEmailNotification.html',
                        controller: "myAccountCtrl"
                    })
                    .state('myFollowUpActions', {
                        url: '/myFollowUpActions',
                        templateUrl: 'app/modules/myAdmin/views/myFollowUpActions.html',
                        controller: "myAccountCtrl"
                    })
                    .state('myTrainingRecords', {
                        url: '/myTrainingRecords',
                        templateUrl: 'app/modules/myAdmin/views/myTrainingRecords.html',
                        controller: "myAccountCtrl"
                    })
        
                    .state('myProfile', {
                        url: '/myProfile',
                        templateUrl: 'app/modules/myAdmin/views/myProfile.html',
                        controller: "myAccountCtrl"
                    })
        
        
        }]);
}());