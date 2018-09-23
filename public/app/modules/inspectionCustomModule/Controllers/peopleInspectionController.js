(function () {
    var controller = function ($scope, $uibModal, inspectionCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.people_inspection = $builder.forms['people_inspection'];
        if (typeof $builder.forms['people_inspection'] !== 'undefined' && $builder.forms['people_inspection'].length > 0) {
            var length = $builder.forms['people_inspection'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('people_inspection', $builder.forms['people_inspection'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'people'
        };
        inspectionCustomService.getInspectionTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('people_inspection', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'inspectionCustomService', 'coreService', '$builder'];
    angular.module("inspectionCustomModule").controller("peopleInspectionController", controller);
}());
