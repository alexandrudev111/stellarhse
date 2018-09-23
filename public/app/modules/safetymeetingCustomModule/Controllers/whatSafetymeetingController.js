(function () {
    var controller = function ($scope, $uibModal, safetymeetingCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'WhatHappened'
        };

        $scope.what_safetymeeting = $builder.forms['what_safetymeeting'];
        if (typeof $builder.forms['what_safetymeeting'] !== 'undefined' && $builder.forms['what_safetymeeting'].length > 0) {
            var length = $builder.forms['what_safetymeeting'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('what_safetymeeting', $builder.forms['what_safetymeeting'][0]);
            }
        }
        safetymeetingCustomService.getSafetymeetingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_safetymeeting', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'safetymeetingCustomService', 'coreService', '$builder'];
    angular.module("safetymeetingCustomModule").controller("whatSafetymeetingController", controller);
}());