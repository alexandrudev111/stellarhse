
(function () {
    var module = angular.module('safetymeetingCustomModule', ['ui.router','builder', 'builder.components', 'validator.rules']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                    .state("safetyMeeting", {
                        url: "/safetyMeeting",
                        templateUrl: "app/modules/safetymeetingCustomModule/views/safetymeeting.html",
                        controller: "safetymeetingCustomController"
                    })


        }]);
}());