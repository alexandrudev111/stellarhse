(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'whathappened'
        };

        $scope.what_incident = $builder.forms['whatincident'];
        if (typeof $builder.forms['whatincident'] !== 'undefined' && $builder.forms['whatincident'].length > 0) {
            var length = $builder.forms['whatincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('whatincident', $builder.forms['whatincident'][0]);
            }
        }
        incidentCustomService.getIncidentTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('whatincident', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("whatIncidentController", controller);
}());
