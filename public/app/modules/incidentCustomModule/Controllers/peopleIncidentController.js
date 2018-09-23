(function () {
    var controller = function ($scope, $uibModal, incidentCustomService, coreService, $builder) {
        var init = function () {

        };
        init();
        $scope.people_incident = $builder.forms['peopleincident'];
        if (typeof $builder.forms['peopleincident'] !== 'undefined' && $builder.forms['peopleincident'].length > 0) {
            var length = $builder.forms['peopleincident'].length;
            for (var i = 0; i <length; i++) {
                $builder.removeFormObject('peopleincident', $builder.forms['peopleincident'][0]);
            }
        }
        var data = {
            language_id: $scope.user.language_id,
            org_id: $scope.user.org_id,
            tab_name: 'people'
        };
        incidentCustomService.getIncidentTabCustomFields(data)
            .then(function (response) {
                if (typeof response.data !== 'undefined' && response.data.length > 0) {
                    for (var i = 0; i < response.data.length; i++) {
                        $builder.addFormObject('peopleincident', response.data[i]);
                    }
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("peopleIncidentController", controller);
}());
