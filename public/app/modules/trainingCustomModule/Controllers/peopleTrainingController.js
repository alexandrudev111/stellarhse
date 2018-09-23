(function () {
    var controller = function ($scope, $uibModal, trainingCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.people_training = $builder.forms['people_training'];
        if (typeof $builder.forms['people_training'] !== 'undefined' && $builder.forms['people_training'].length > 0) {
            var length = $builder.forms['people_training'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('people_training', $builder.forms['people_training'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'people'
        };
        trainingCustomService.getTrainingTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('people_training', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'trainingCustomService', 'coreService', '$builder'];
    angular.module("trainingCustomModule").controller("peopleTrainingController", controller);
}());