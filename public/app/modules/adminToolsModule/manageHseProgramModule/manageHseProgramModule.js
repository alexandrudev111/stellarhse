(function () {
    var module = angular.module('manageHseProgramModule', []);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state("ManageHSEDocuments", {
                    url: "/ManageHSEDocuments",
                    templateUrl: "app/modules/adminToolsModule/manageHseProgramModule/views/manageHseDocuments.html",
                    controller: "ManageHseProgramController"
                });
                 
        }]);
}());