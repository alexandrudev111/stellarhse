(function () {
    var controller = function ($scope, $uibModal, maintenanceCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.action_maintenance = $builder.forms['action_maintenance'];
        if (typeof $builder.forms['action_maintenance'] !== 'undefined' && $builder.forms['action_maintenance'].length > 0) {
            var length = $builder.forms['action_maintenance'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('action_maintenance', $builder.forms['action_maintenance'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'Follows'
        };
        maintenanceCustomService.getMaintenanceTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('action_maintenance', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'maintenanceCustomService', 'coreService', '$builder'];
    angular.module("maintenanceCustomModule").controller("actionMaintenanceController", controller);
}());
