(function () {
    var controller = function ($scope, $uibModal, maintenanceCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'WhatHappened'
        };

        $scope.what_maintenance = $builder.forms['what_maintenance'];
        if (typeof $builder.forms['what_maintenance'] !== 'undefined' && $builder.forms['what_maintenance'].length > 0) {
            var length = $builder.forms['what_maintenance'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('what_maintenance', $builder.forms['what_maintenance'][0]);
            }
        }
        
        maintenanceCustomService.getMaintenanceTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_maintenance', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'maintenanceCustomService', 'coreService', '$builder'];
    angular.module("maintenanceCustomModule").controller("whatMaintenanceController", controller);
}());
