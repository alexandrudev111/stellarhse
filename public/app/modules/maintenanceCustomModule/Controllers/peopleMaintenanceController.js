(function () {
    var controller = function ($scope, $uibModal, maintenanceCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.people_maintenance = $builder.forms['people_maintenance'];
        if (typeof $builder.forms['people_maintenance'] !== 'undefined' && $builder.forms['people_maintenance'].length > 0) {
            var length = $builder.forms['people_maintenance'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('people_maintenance', $builder.forms['people_maintenance'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'people'
        };
        maintenanceCustomService.getMaintenanceTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('people_maintenance', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'maintenanceCustomService', 'coreService', '$builder'];
    angular.module("maintenanceCustomModule").controller("peopleMaintenanceController", controller);
}());
