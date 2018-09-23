(function () {
    var controller = function ($scope, $uibModal, inspectionCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.action_inspection = $builder.forms['action_inspection'];
        if (typeof $builder.forms['action_inspection'] !== 'undefined' && $builder.forms['action_inspection'].length > 0) {
            var length = $builder.forms['action_inspection'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('action_inspection', $builder.forms['action_inspection'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'actions'
        };
        inspectionCustomService.getInspectionTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('action_inspection', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'inspectionCustomService', 'coreService', '$builder'];
    angular.module("inspectionCustomModule").controller("actionInspectionController", controller);
}());
