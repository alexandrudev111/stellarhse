(function () {
    var controller = function ($scope, $uibModal, hazardCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.detail_hazard = $builder.forms['default2'];
        if (typeof $builder.forms['default2'] !== 'undefined' && $builder.forms['default2'].length > 0) {
            var length = $builder.forms['default2'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('default2', $builder.forms['default2'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'hazarddetails'
        };
        hazardCustomService.getHazardTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('default2', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'hazardCustomService', 'coreService', '$builder'];
    angular.module("hazardCustomModule").controller("detailHazardController", controller);
}());
