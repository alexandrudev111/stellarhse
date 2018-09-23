(function () {
    var controller = function ($scope, $uibModal, maintenanceCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();

        $scope.showCutomFields = false;
        init();
        
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['what_maintenance'] !== 'undefined' && $builder.forms['what_maintenance'].length > 0) {
                var length = $builder.forms['what_maintenance'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('what_maintenance', $builder.forms['what_maintenance'][0]);
                }
            }
            if (typeof $builder.forms['people_maintenance'] !== 'undefined' && $builder.forms['people_maintenance'].length > 0) {
                var length = $builder.forms['people_maintenance'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('people_maintenance', $builder.forms['people_maintenance'][0]);
                }
            }
            if (typeof $builder.forms['action_maintenance'] !== 'undefined' && $builder.forms['action_maintenance'].length > 0) {
                var length = $builder.forms['action_maintenance'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('action_maintenance', $builder.forms['action_maintenance'][0]);
                }
            }
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'WhatHappened'
            };
            maintenanceCustomService.getMaintenanceTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_maintenance', response.data[i]);
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
            maintenanceCustomService.getMaintenanceTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('people_maintenance', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'Follows'
            };
            maintenanceCustomService.getMaintenanceTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('action_maintenance', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        $scope.formsubmit = function () {
            var data = {
                what_maintenance: $builder.forms['what_maintenance'],
                people_maintenance: $builder.forms['people_maintenance'],
                action_maintenance: $builder.forms['action_maintenance'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);

            maintenanceCustomService.saveMaintenanceCustomFields(data)
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
    controller.$inject = ['$scope', '$uibModal', 'maintenanceCustomService','$state', 'coreService', '$builder'];
    angular.module("maintenanceCustomModule").controller("maintenanceController", controller);
}());