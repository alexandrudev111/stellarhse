(function () {
    var admin = angular.module('manageGroupsModule', []);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("addGroup", {
                        url: "/addGroup",
                        templateUrl: "app/modules/adminToolsModule/manageGroupsModule/views/addGroup.html",
                        controller: "AddGroupController"
                    }) 
                    .state("editGroup", {
                        url: "/editGroup",
                        templateUrl: "app/modules/adminToolsModule/manageGroupsModule/views/editGroup.html",
                        controller: "EditGroupController",
                        params:{
                            selectedGroup: null
                        }
                    }) 
        }]);
}());