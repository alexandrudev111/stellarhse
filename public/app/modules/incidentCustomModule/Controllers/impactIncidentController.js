(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.impact_incident = $builder.forms['impactincident'];
        if (typeof $builder.forms['impactincident'] !== 'undefined' && $builder.forms['impactincident'].length > 0) {
            var length = $builder.forms['impactincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('impactincident', $builder.forms['impactincident'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'impacts'
        };
        incidentCustomService.getIncidentTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('impactincident', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("impactIncidentController", controller);
}());
