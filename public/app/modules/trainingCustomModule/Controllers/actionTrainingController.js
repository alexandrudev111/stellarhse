(function () {
    var controller = function ($scope, $uibModal, trainingCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.action_training = $builder.forms['action_training'];
        if (typeof $builder.forms['action_training'] !== 'undefined' && $builder.forms['action_training'].length > 0) {
            var length = $builder.forms['action_training'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('action_training', $builder.forms['action_training'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'Follows'
        };
        trainingCustomService.getTrainingTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('action_training', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'trainingCustomService', 'coreService', '$builder'];
    angular.module("trainingCustomModule").controller("actionTrainingController", controller);
}());
