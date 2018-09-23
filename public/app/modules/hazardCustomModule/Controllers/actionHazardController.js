(function () {
    var controller = function ($scope, $uibModal, hazardCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.action_hazard = $builder.forms['default4'];
        if (typeof $builder.forms['default4'] !== 'undefined' && $builder.forms['default4'].length > 0) {
            var length = $builder.forms['default4'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('default4', $builder.forms['default4'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'actions'
        };
        hazardCustomService.getHazardTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('default4', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'hazardCustomService', 'coreService', '$builder'];
    angular.module("hazardCustomModule").controller("actionHazardController", controller);
}());
