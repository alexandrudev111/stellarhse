(function () {
    var controller = function ($scope, $uibModal, safetymeetingCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();
        
        $scope.showCutomFields = false;
        init();
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['what_safetymeeting'] !== 'undefined' && $builder.forms['what_safetymeeting'].length > 0) {
                var length = $builder.forms['what_safetymeeting'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('what_safetymeeting', $builder.forms['what_safetymeeting'][0]);
                }
            }
            if (typeof $builder.forms['people_safetymeeting'] !== 'undefined' && $builder.forms['people_safetymeeting'].length > 0) {
                var length = $builder.forms['people_safetymeeting'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('people_safetymeeting', $builder.forms['people_safetymeeting'][0]);
                }
            }
            if (typeof $builder.forms['action_safetymeeting'] !== 'undefined' && $builder.forms['action_safetymeeting'].length > 0) {
                var length = $builder.forms['action_safetymeeting'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('action_safetymeeting', $builder.forms['action_safetymeeting'][0]);
                }
            }
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'WhatHappened'
            };
            safetymeetingCustomService.getSafetymeetingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_safetymeeting', response.data[i]);
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
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'actions'
            };
            safetymeetingCustomService.getSafetymeetingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('action_safetymeeting', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        $scope.formsubmit = function () {
            var data = {
                what_safetymeeting: $builder.forms['what_safetymeeting'],
                people_safetymeeting: $builder.forms['people_safetymeeting'],
                action_safetymeeting: $builder.forms['action_safetymeeting'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);

            safetymeetingCustomService.saveSafetymeetingCustomFields(data)
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
    controller.$inject = ['$scope', '$uibModal', 'safetymeetingCustomService','$state', 'coreService', '$builder'];
    angular.module("safetymeetingCustomModule").controller("safetymeetingController", controller);
}());
