(function () {
    var controller = function ($scope, $uibModal, inspectionCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'WhatHappened'
        };

        $scope.what_inspection = $builder.forms['what_inspection'];
        if (typeof $builder.forms['what_inspection'] !== 'undefined' && $builder.forms['what_inspection'].length > 0) {
            var length = $builder.forms['what_inspection'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('what_inspection', $builder.forms['what_inspection'][0]);
            }
        }
        inspectionCustomService.getInspectionTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_inspection', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'inspectionCustomService', 'coreService', '$builder'];
    angular.module("inspectionCustomModule").controller("whatInspectionController", controller);
}());
