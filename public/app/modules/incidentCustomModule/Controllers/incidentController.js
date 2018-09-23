(function () {
    var controller = function ($scope, $uibModal, incidentCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();

        $scope.showCutomFields = false;
        init();
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['whatincident'] !== 'undefined' && $builder.forms['whatincident'].length > 0) {
                var length = $builder.forms['whatincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('whatincident', $builder.forms['whatincident'][0]);
                }
            }
            if (typeof $builder.forms['impactincident'] !== 'undefined' && $builder.forms['impactincident'].length > 0) {
                var length = $builder.forms['impactincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('impactincident', $builder.forms['impactincident'][0]);
                }
            }
            if (typeof $builder.forms['peopleincident'] !== 'undefined' && $builder.forms['peopleincident'].length > 0) {
                var length = $builder.forms['peopleincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('peopleincident', $builder.forms['peopleincident'][0]);
                }
            }
            if (typeof $builder.forms['observationincident'] !== 'undefined' && $builder.forms['observationincident'].length > 0) {
                var length = $builder.forms['observationincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('observationincident', $builder.forms['observationincident'][0]);
                }
            }
            if (typeof $builder.forms['analysisincident'] !== 'undefined' && $builder.forms['analysisincident'].length > 0) {
                var length = $builder.forms['analysisincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('analysisincident', $builder.forms['analysisincident'][0]);
                }
            }   
            if (typeof $builder.forms['investigationincident'] !== 'undefined' && $builder.forms['investigationincident'].length > 0) {
                var length = $builder.forms['investigationincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('investigationincident', $builder.forms['investigationincident'][0]);
                }
            }
            if (typeof $builder.forms['actionincident'] !== 'undefined' && $builder.forms['actionincident'].length > 0) {
                var length = $builder.forms['actionincident'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('actionincident', $builder.forms['actionincident'][0]);
                }
            }
        
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'whathappened'
            };
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
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'observation'
            };
            incidentCustomService.getIncidentTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('observationincident', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
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
        $scope.formsubmit = function () {
            var data = {
                what_incident: $builder.forms['whatincident'],
                impact_incident: $builder.forms['impactincident'],
                people_incident: $builder.forms['peopleincident'],
                action_incident: $builder.forms['actionincident'],
                analysis_incident: $builder.forms['analysisincident'],
                observation_incident: $builder.forms['observationincident'],
                investigation_incident: $builder.forms['investigationincident'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);
            

            incidentCustomService.saveIncidentCustomFields(data)
                .then(function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'success', message: 'Custom fields has been added Successfully'});
                    $state.go('ManageTrackingHSE', {grid: 'custom_fields'});
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        
        $scope.hideSlide = true;
        $scope.slideButton = function(){
            
            $scope.hideSlide = !$scope.hideSlide;
            
        }


    };
    controller.$inject = ['$scope', '$uibModal', 'incidentCustomService','$state', 'coreService', '$builder'];
    angular.module("incidentCustomModule").controller("incidentController", controller);
}());
