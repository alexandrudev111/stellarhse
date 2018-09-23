(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.impact_incident = $builder.forms['analysisincident'];
        if (typeof $builder.forms['analysisincident'] !== 'undefined' && $builder.forms['analysisincident'].length > 0) {
            var length = $builder.forms['analysisincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('analysisincident', $builder.forms['analysisincident'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'scatanalysis'
        };
        incidentCustomService.getIncidentTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('analysisincident', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("analysisIncidentController", controller);
}());
