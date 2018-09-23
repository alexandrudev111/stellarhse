(function () {
    var controller = function ($scope, $uibModal, hazardCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();

        init();
        $scope.showCutomFields = false;
        $scope.what_hazard_custom = $builder.forms['default'];
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['default'] !== 'undefined' && $builder.forms['default'].length > 0) {
                var length = $builder.forms['default'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('default', $builder.forms['default'][0]);
                }
            }
            if (typeof $builder.forms['default2'] !== 'undefined' && $builder.forms['default2'].length > 0) {
                var length = $builder.forms['default2'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('default2', $builder.forms['default2'][0]);
                }
            }
            if (typeof $builder.forms['default4'] !== 'undefined' && $builder.forms['default4'].length > 0) {
                var length = $builder.forms['default4'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('default4', $builder.forms['default4'][0]);
                }
            }
            if (typeof $builder.forms['default3'] !== 'undefined' && $builder.forms['default3'].length > 0) {
                var length = $builder.forms['default3'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('default3', $builder.forms['default3'][0]);
                }
            }
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'WhatHappened'
            };
            hazardCustomService.getHazardTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('default', response.data[i]);
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
                
            
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'hazarddetails'
            };
            hazardCustomService.getHazardTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('default2', response.data[i]);
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
            hazardCustomService.getHazardTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('default4', response.data[i]);
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
            hazardCustomService.getHazardTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('default3', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        
        $scope.formsubmit = function () {
            var data = {
                what_hazard: $builder.forms['default'],
                detail_hazard: $builder.forms['default2'],
                people_hazard: $builder.forms['default3'],
                action_hazard: $builder.forms['default4'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);

            hazardCustomService.saveHazardCustomFields(data)
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
    controller.$inject = ['$scope', '$uibModal', 'hazardCustomService','$state', 'coreService', '$builder'];
    angular.module("hazardCustomModule").controller("hazardController", controller);
}());
