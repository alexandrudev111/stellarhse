(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.action_incident = $builder.forms['actionincident'];
        if (typeof $builder.forms['actionincident'] !== 'undefined' && $builder.forms['actionincident'].length > 0) {
            var length = $builder.forms['actionincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('actionincident', $builder.forms['actionincident'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'actions'
        };
        incidentCustomService.getIncidentTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('actionincident', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("actionIncidentController", controller);
}());
