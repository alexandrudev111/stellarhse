(function () {
    var controller = function ($scope, $uibModal, safetymeetingCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.people_safetymeeting = $builder.forms['people_safetymeeting'];
        if (typeof $builder.forms['people_safetymeeting'] !== 'undefined' && $builder.forms['people_safetymeeting'].length > 0) {
            var length = $builder.forms['people_safetymeeting'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('people_safetymeeting', $builder.forms['people_safetymeeting'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'people'
        };
        safetymeetingCustomService.getSafetymeetingTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('people_safetymeeting', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'safetymeetingCustomService', 'coreService', '$builder'];
    angular.module("safetymeetingCustomModule").controller("peopleSafetymeetingController", controller);
}());
