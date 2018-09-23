(function () {
    var controller = function ($scope, $uibModal, inspectionCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.detail_inspection = $builder.forms['detail_inspection'];
        if (typeof $builder.forms['detail_inspection'] !== 'undefined' && $builder.forms['detail_inspection'].length > 0) {
            var length = $builder.forms['detail_inspection'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('detail_inspection', $builder.forms['detail_inspection'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'hazarddetails'
        };
        inspectionCustomService.getInspectionTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('detail_inspection', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'inspectionCustomService', 'coreService', '$builder'];
    angular.module("inspectionCustomModule").controller("detailInspectionController", controller);
}());
