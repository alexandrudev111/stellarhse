(function () {
    var controller = function ($scope, $uibModal, trainingCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'WhatHappened'
        };

        $scope.what_training = $builder.forms['what_training'];
        if (typeof $builder.forms['what_training'] !== 'undefined' && $builder.forms['what_training'].length > 0) {
            var length = $builder.forms['what_training'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('what_training', $builder.forms['what_training'][0]);
            }
        }
        trainingCustomService.getTrainingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_training', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'trainingCustomService', 'coreService', '$builder'];
    angular.module("trainingCustomModule").controller("whatTrainingController", controller);
}());

