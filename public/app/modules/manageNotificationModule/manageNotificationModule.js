(function () {
    var admin = angular.module('manageNotificationModule', []);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider) {
            $stateProvider
                    .state("manageNotification", {
                        url: "/manageNotification",
                        templateUrl: "app/modules/manageNotificationModule/views/manageNotification.html",
                        controller: "ManageNotificationController"
                    })
            
                 .state("manageTemplate", {
                        url: "/manageTemplate",
                        templateUrl: "app/modules/manageNotificationModule/views/manageTemplate.html",
                        controller: "ManageNotificationController"
                    })
                
                 .state("addNotification", {
                        url: "/addNotification",
                        templateUrl: "app/modules/manageNotificationModule/views/addNotification.html",
                        controller: "AddNotificationController"
                    })
            
                    .state("editNotification", {
                        url: "/editNotification",
                        templateUrl: "app/modules/manageNotificationModule/views/editNotification.html",
                        controller: "EditNotificationController",
                        params:{
                            selectedRow: null
                        }
                    })
                    
        }]);
}());