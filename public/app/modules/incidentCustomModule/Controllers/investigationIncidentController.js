(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.investigation_incident = $builder.forms['investigationincident'];
        if (typeof $builder.forms['investigationincident'] !== 'undefined' && $builder.forms['investigationincident'].length > 0) {
            var length = $builder.forms['investigationincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('investigationincident', $builder.forms['investigationincident'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'investigation'
        };
        incidentCustomService.getIncidentTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('investigationincident', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("investigationIncidentController", controller);
}());
