(function () {
    var controller = function ($scope, $uibModal, inspectionCustomService,$state, coreService, $builder) {

        var init = function () {

        };
        $scope.user = coreService.getUser();

        $scope.showCutomFields = false;
        init();
        $scope.cancelSubmit = function () {
            if (typeof $builder.forms['what_inspection'] !== 'undefined' && $builder.forms['what_inspection'].length > 0) {
                var length = $builder.forms['what_inspection'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('what_inspection', $builder.forms['what_inspection'][0]);
                }
            }
            if (typeof $builder.forms['detail_inspection'] !== 'undefined' && $builder.forms['detail_inspection'].length > 0) {
                var length = $builder.forms['detail_inspection'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('detail_inspection', $builder.forms['detail_inspection'][0]);
                }
            } 
            if (typeof $builder.forms['people_inspection'] !== 'undefined' && $builder.forms['people_inspection'].length > 0) {
                var length = $builder.forms['people_inspection'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('people_inspection', $builder.forms['people_inspection'][0]);
                }
            }
            if (typeof $builder.forms['action_inspection'] !== 'undefined' && $builder.forms['action_inspection'].length > 0) {
                var length = $builder.forms['action_inspection'].length;
                for (var i = 0; i <length; i++) {
                    $builder.removeFormObject('action_inspection', $builder.forms['action_inspection'][0]);
                }
            }
            
            var data = {
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                tab_name: 'WhatHappened'
            };
            inspectionCustomService.getInspectionTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('what_inspection', response.data[i]);
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
            inspectionCustomService.getInspectionTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('detail_inspection', response.data[i]);
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
            inspectionCustomService.getInspectionTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('people_inspection', response.data[i]);
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
            inspectionCustomService.getInspectionTabCustomFields(data)
                .then(function (response) {
                    if (typeof response.data !== 'undefined' && response.data.length > 0) {
                        for (var i = 0; i < response.data.length; i++) {
                            $builder.addFormObject('action_inspection', response.data[i]);
                        }
                    }

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        
        };
        $scope.formsubmit = function () {
            var data = {
                what_inspection: $builder.forms['what_inspection'],
                detail_inspection: $builder.forms['detail_inspection'],
                people_inspection: $builder.forms['people_inspection'],
                action_inspection: $builder.forms['action_inspection'],
                language_id: $scope.user.language_id,
                org_id: $scope.user.org_id,
                user_id: $scope.user.employee_id
            };
            console.log(data);

            inspectionCustomService.saveInspectionCustomFields(data)
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
    controller.$inject = ['$scope', '$uibModal', 'inspectionCustomService','$state', 'coreService', '$builder'];
    angular.module("inspectionCustomModule").controller("inspectionController", controller);
}());