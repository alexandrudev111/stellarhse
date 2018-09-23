(function () {
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {

        var init = function () {
            $scope.locationLabels = {};
            $scope.frmlabels = constantService.getLocationsFormLabels();
            angular.forEach($scope.frmlabels, function (value, key) {
                $scope.locationLabels[key] = value;
            });

            $scope.selectedLocation = {};
            $scope.loca1_checker = $scope.loca2_checker = $scope.loca3_checker = $scope.loca4_checker = true;
        };
        init();

        $scope.locationLabels.location_type = '';
        location_level = $rootScope.location_level;
        if (location_level === 2) {
            $scope.locationLabels.location_type = 'province';
            $scope.min_check_para = 4;
        } else if (location_level === 3) {
            $scope.locationLabels.location_type = 'area';
            $scope.min_check_para = 5;
        } else if (location_level === 4) {
            $scope.locationLabels.location_type = 'site';
            $scope.min_check_para = 6;
        }

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            if (coreService.getPreviousState() === 'ManageTrackingHSE') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $q.all([
                    customersService.getLocations1($scope.user.org_id)
//                    coreService.getUuid()
                ]).then(function (queues) {
                    $scope.locations1 = queues[0].data;
                    if (!$rootScope.isNew) {
                        $scope.selectedLocation = $rootScope.selectedRowLocation;
                    }
                    $scope.selectedLocation.org_id = $scope.user.org_id;
                    $scope.selectedLocation.updated_by = coreService.getUser().employee_id;
                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                });
            }

        }, true);

        $scope.$watch('selectedLocation.location1_id', function (newVal, oldVal) {
            $scope.selectedLocation.location1_name = '';
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getlocation2(newVal, 'location1_id');
            } else {
                $scope.locations2 = '';
            }
        });

        $scope.$watch('selectedLocation.location2_id', function (newVal, oldVal) {
            $scope.selectedLocation.location2_name = '';
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getlocation3(newVal, 'location2_id');
            } else {
                $scope.locations3 = '';
            }
        });

        $scope.$watch('selectedLocation.location3_id', function (newVal, oldVal) {
            $scope.selectedLocation.location3_name = '';
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getlocation4(newVal, 'location3_id');
            } else {
                $scope.locations4 = '';
            }
        });

        $scope.$watch('selectedLocation.location4_id', function (newVal, oldVal) {
            $scope.selectedLocation.location4_name = '';

        });

        var getlocation2 = function (location1_id, arrayFrom) {
            customersService.getLocations2(location1_id)
                    .then(function (response) {
                        if (arrayFrom === 'location1_id') {
                            $scope.locations2 = response.data;
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        var getlocation3 = function (location2_id, arrayFrom) {
            customersService.getLocations3(location2_id)
                    .then(function (response) {
                        if (arrayFrom === 'location2_id') {
                            $scope.locations3 = response.data;
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        var getlocation4 = function (location3_id, arrayFrom) {
            customersService.getLocations4(location3_id)
                    .then(function (response) {
                        if (arrayFrom === 'location3_id') {
                            $scope.locations4 = response.data;
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.showHideForAddAndEdit = function (location_checker) {
            $scope.enter_country = $scope.enter_province = $scope.enter_area = $scope.enter_site = '';
            if (location_checker === 'loca1_checker') {
                $scope.loca1_checker = false;
            } else if (location_checker === 'loca2_checker') {
                $scope.loca2_checker = false;
            } else if (location_checker === 'loca3_checker') {
                $scope.loca3_checker = false;
            } else if (location_checker === 'loca4_checker') {
                $scope.loca4_checker = false;
            } else if (location_checker === '!loca1_checker') {
                $scope.loca1_checker = true;
            } else if (location_checker === '!loca2_checker') {
                $scope.loca2_checker = true;
            } else if (location_checker === '!loca3_checker') {
                $scope.loca3_checker = true;
            } else if (location_checker === '!loca4_checker') {
                $scope.loca4_checker = true;
            }
        };

        $scope.editLocations = function (locations) {
            if (locations === 'locations1') {
                if ($scope.selectedLocation.location1_id) {
                    $scope.showHideForAddAndEdit('loca1_checker');
                    $scope.selectedLocation.location1_name = $filter('filter')($scope.locations1, {location1_id: $scope.selectedLocation.location1_id})[0].location1_name;
                } else {
                    $scope.enter_country = constantService.getMessage('enter_country_first');
                }
            } else if (locations === 'locations2') {
                if ($scope.selectedLocation.location2_id) {
                    $scope.showHideForAddAndEdit('loca2_checker');
                    $scope.selectedLocation.location2_name = $filter('filter')($scope.locations2, {location2_id: $scope.selectedLocation.location2_id})[0].location2_name;
                } else {
                    $scope.enter_province = constantService.getMessage('enter_province');
                }
            } else if (locations === 'locations3') {
                if ($scope.selectedLocation.location3_id) {
                    $scope.showHideForAddAndEdit('loca3_checker');
                    $scope.selectedLocation.location3_name = $filter('filter')($scope.locations3, {location3_id: $scope.selectedLocation.location3_id})[0].location3_name;
                } else {
                    $scope.enter_area = constantService.getMessage('enter_area');
                }

            } else if (locations === 'locations4') {
                if ($scope.selectedLocation.location4_id) {
                    $scope.showHideForAddAndEdit('loca4_checker');
                    $scope.selectedLocation.location4_name = $filter('filter')($scope.locations4, {location4_id: $scope.selectedLocation.location4_id})[0].location4_name;
                } else {
                    $scope.enter_site = constantService.getMessage('enter_site');
                }
            }
        };

        $scope.cancelAdd = function () {
            $state.go('ManageTrackingHSE', {grid: 'form_locations'});
        };


        $scope.submit = function () {
            console.log($scope.selectedLocation);

            customersService.updateLocations($scope.selectedLocation)
                    .then(function (response) {
//                        console.log(response);
                        $state.go('ManageTrackingHSE', {grid: 'form_locations'});

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });

        };

        $scope.delLocation = function (location_level, location_id) {
            coreService.resetAlert();
            if (location_id) {
                $scope.$uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/adminToolsModule/views/deleteLocation.html',
                    controller: 'addLocationCtrl',
                    scope: $scope,
                    resolve: {
                        item: function () {
                            $scope.deletedLocation = {};
                            $scope.deletedLocation.location_id = location_id;
                            $scope.deletedLocation.location_level = location_level;
                            $scope.deletedLocation.editing_by = coreService.getUser().employee_id;
                            $scope.deletedLocation.org_id = $scope.user.org_id;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectLocation')});
            }
        };

        $scope.deleteLocFunc = function () {
            customersService.deleteLocation($scope.deletedLocation).then(function (response) {
                $scope.cancelDelLoc();
                coreService.resetAlert();
                if (response.data === 1) {
                    coreService.setAlert({type: 'success', message: constantService.getMessage('locDeleted')});
                    if ($scope.deletedLocation.location_level === 1) {
                        var index = $scope.locations1.indexOf($scope.deletedLocation.location_id);
                        $scope.locations1.splice(index, 1);
                    } else if ($scope.deletedLocation.location_level === 2) {
                        var index = $scope.locations2.indexOf($scope.deletedLocation.location_id);
                        $scope.locations2.splice(index, 1);
                    } else if ($scope.deletedLocation.location_level === 3) {
                        var index = $scope.locations3.indexOf($scope.deletedLocation.location_id);
                        $scope.locations3.splice(index, 1);
                    } else if ($scope.deletedLocation.location_level === 4) {
                        var index = $scope.locations4.indexOf($scope.deletedLocation.location_id);
                        $scope.locations4.splice(index, 1);
                    }
                } else {
                    coreService.setAlert({type: 'error', message: constantService.getMessage('locNotDeleted')});
                }

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.cancelDelLoc = function () {
            $scope.$uibModalInstance.close('cancel');
        };


    };

    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('addLocationCtrl', controller);
}());


