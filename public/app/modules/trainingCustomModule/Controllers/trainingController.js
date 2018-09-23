(function () {
    var controller = function ($scope, $uibModal, trainingCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();
        
        $scope.showCutomFields = false;
        init();
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['what_training'] !== 'undefined' && $builder.forms['what_training'].length > 0) {
                var length = $builder.forms['what_training'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('what_training', $builder.forms['what_training'][0]);
                }
            }
            if (typeof $builder.forms['people_training'] !== 'undefined' && $builder.forms['people_training'].length > 0) {
                var length = $builder.forms['people_training'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('people_training', $builder.forms['people_training'][0]);
                }
            }
            if (typeof $builder.forms['action_training'] !== 'undefined' && $builder.forms['action_training'].length > 0) {
                var length = $builder.forms['action_training'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('action_training', $builder.forms['action_training'][0]);
                }
            }
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'WhatHappened'
            };
            trainingCustomService.getTrainingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_training', response.data[i]);
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
            trainingCustomService.getTrainingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('people_training', response.data[i]);
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
            trainingCustomService.getTrainingTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('action_training', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        $scope.formsubmit = function () {
            var data = {
                what_training: $builder.forms['what_training'],
                people_training: $builder.forms['people_training'],
                action_training: $builder.forms['action_training'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);

            trainingCustomService.saveTrainingCustomFields(data)
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
    controller.$inject = ['$scope', '$uibModal', 'trainingCustomService','$state', 'coreService', '$builder'];
    angular.module("trainingCustomModule").controller("trainingController", controller);
}());
