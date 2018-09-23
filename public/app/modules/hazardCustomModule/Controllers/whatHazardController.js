(function () {
    var controller = function ($scope, $uibModal, hazardCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'WhatHappened'
        };

        $scope.what_hazard = $builder.forms['default'];
        if (typeof $builder.forms['default'] !== 'undefined' && $builder.forms['default'].length > 0) {
            var length = $builder.forms['default'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('default', $builder.forms['default'][0]);
            }
        }
        hazardCustomService.getHazardTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('default', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'hazardCustomService', 'coreService', '$builder'];
    angular.module("hazardCustomModule").controller("whatHazardController", controller);
}());
