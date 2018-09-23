(function () {
    var admin = angular.module('manageDocumentModule', []);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider) {
            $stateProvider
                    .state("manageDocument", {
                        url: "/manage_document",
                        templateUrl: "app/modules/manageDocumentModule/views/manageDocument.html",
                        controller: "ManageDocumentController"
                    })
                    
        }]);
}());