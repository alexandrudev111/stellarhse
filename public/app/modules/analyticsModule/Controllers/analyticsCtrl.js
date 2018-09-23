(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, uiGridConstants, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {
        $scope.index = 0;
        $scope.user = coreService.getUser();
        $scope.permissions = coreService.getPermissions();
        $scope.gridOptions = coreService.getGridOptions();

//        var start_year = 2013;
//        var range = {};
//        for (var i = start_year; i < 2041; i++) {
//            range[start_year] = start_year++;
//        }
//        $scope.years = range;

        $scope.years = [
            {id: '-Year-', name: '-Year-'},
            {id: 2013, name: '2013'},
            {id: 2014, name: '2014'},
            {id: 2015, name: '2015'},
            {id: 2016, name: '2016'},
            {id: 2017, name: '2017'},
            {id: 2018, name: '2018'},
            {id: 2019, name: '2019'},
            {id: 2020, name: '2020'},
            {id: 2021, name: '2021'},
            {id: 2022, name: '2022'},
            {id: 2023, name: '2023'},
            {id: 2024, name: '2024'},
            {id: 2025, name: '2025'},
            {id: 2026, name: '2026'},
            {id: 2027, name: '2027'},
            {id: 2028, name: '2028'},
            {id: 2029, name: '2029'},
            {id: 2030, name: '2030'}
        ];

        $scope.months = [
            {id: '-Month-', name: '-Month-'},
            {id: 'January', name: 'January'},
            {id: 'February', name: 'February'},
            {id: 'March', name: 'March'},
            {id: 'April', name: 'April'},
            {id: 'May', name: 'May'},
            {id: 'June', name: 'June'},
            {id: 'July', name: 'July'},
            {id: 'August', name: 'August'},
            {id: 'September', name: 'September'},
            {id: 'October', name: 'October'},
            {id: 'November', name: 'November'},
            {id: 'December', name: 'December'}
        ];
//        $scope.monthes = {
//            January: 'January', February: 'February', March: 'March', April: 'April', May: 'May', June: 'June', July: 'July', August: 'August', September: 'September', October: 'October', November: 'November', December: 'December'
//        };


        $scope.externalDataObj = {};
        $scope.employeeHOptions = angular.copy($scope.gridOptions);
        $scope.employeeHOptions.exporterCsvFilename = 'EmployeeHours.csv';
        $scope.employeeHOptions.onRegisterApi = function (gridApi) {
            $scope.employeeHgridApi = gridApi;
        };

        $scope.employeeKMOptions = angular.copy($scope.gridOptions);
        $scope.employeeKMOptions.exporterCsvFilename = 'EmployeeKM.csv';
        $scope.employeeKMOptions.onRegisterApi = function (gridApi) {
            $scope.employeeKMgridApi = gridApi;
        };

        $scope.contractorHOptions = angular.copy($scope.gridOptions);
        $scope.contractorHOptions.exporterCsvFilename = 'ContractorHours.csv';
        $scope.contractorHOptions.onRegisterApi = function (gridApi) {
            $scope.contractorHgridApi = gridApi;
        };

        $scope.contractorKMOptions = angular.copy($scope.gridOptions);
        $scope.contractorKMOptions.exporterCsvFilename = 'ContractorKM.csv';
        $scope.contractorKMOptions.onRegisterApi = function (gridApi) {
            $scope.contractorKMgridApi = gridApi;
            console.log(' $scope.contractorKMgridApi: ' + $scope.contractorKMgridApi);
        };


        $scope.downloadCSV = function (gridNumber) {
            if (gridNumber === 1) {
                $scope.employeeHgridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (gridNumber === 2) {
                $scope.contractorHgridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (gridNumber === 3) {
                $scope.employeeKMgridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (gridNumber === 4) {
                $scope.contractorKMgridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            }
        };

        $scope.clearFilters = function (gridNumber) {
            var columns ;
            if (gridNumber === 1) {
                $scope.employeeHgridApi.selection.clearSelectedRows(); // clear selected rows
              columns = $scope.employeeHgridApi.grid.columns;
            } else if (gridNumber === 2) {
                $scope.contractorHgridApi.selection.clearSelectedRows(); // clear selected rows
                columns = $scope.contractorHgridApi.grid.columns;
            } else if (gridNumber === 3) {
               $scope.employeeKMgridApi.selection.clearSelectedRows(); // clear selected rows
               columns = $scope.employeeKMgridApi.grid.columns;
            } else if (gridNumber === 4) {
                $scope.contractorKMgridApi.selection.clearSelectedRows(); // clear selected rows
                 columns = $scope.contractorKMgridApi.grid.columns;
            }
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        };

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === 'ManageKPIFactor') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.decimal_valid = constantService.getMessage('decimal_valid');
                var post = {org_id: $scope.user.org_id};
                $scope.promise = analyticsService.getOrgExternslData(post).then(function (response) {
                    $scope.gridData = $scope.checkDataDecOrInt(response.data);
                    $scope.loadEmployeeHGrid();
                    $scope.loadContractorHGrid();
                    $scope.loadEmployeeKMGrid();
                    $scope.loadContractorKMGrid();

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        }, true);

        $scope.checkDataDecOrInt = function (data_grid) {
            angular.forEach(data_grid, function (value, key) {
                var total_array = value['total'].split('.');
                if (parseInt(total_array[1]) === 0) {
                    value['total'] = total_array[0];
                }
            });
            return data_grid;
        };

        $scope.loadEmployeeHGrid = function () {
            $scope.employeeHOptions.columnDefs = [
                {name: 'org_year', displayName: 'Year', cellTooltip: true, headerTooltip: true},
                {name: 'org_month', displayName: 'Month', cellTooltip: true, headerTooltip: true},
                {name: 'total', displayName: 'Hours', cellTooltip: true, headerTooltip: true}
            ];
            $scope.employeeHOptions.data = ($filter('filter')($scope.gridData, {type: 'employee_total_hour'}));

        };

        $scope.loadContractorHGrid = function () {
            $scope.contractorHOptions.columnDefs = [
                {name: 'org_year', displayName: 'Year', cellTooltip: true, headerTooltip: true},
                {name: 'org_month', displayName: 'Month', cellTooltip: true, headerTooltip: true},
                {name: 'total', displayName: 'Hours', cellTooltip: true, headerTooltip: true}
            ];
            $scope.contractorHOptions.data = ($filter('filter')($scope.gridData, {type: 'contractor_total_hour'}));
        };

        $scope.loadEmployeeKMGrid = function () {
            $scope.employeeKMOptions.columnDefs = [
                {name: 'org_year', displayName: 'Year', cellTooltip: true, headerTooltip: true},
                {name: 'org_month', displayName: 'Month', cellTooltip: true, headerTooltip: true},
                {name: 'total', displayName: 'KM', cellTooltip: true, headerTooltip: true}
            ];
            $scope.employeeKMOptions.data = ($filter('filter')($scope.gridData, {type: 'employee_total_km'}));
        };

        $scope.loadContractorKMGrid = function () {
            $scope.contractorKMOptions.columnDefs = [
                {name: 'org_year', displayName: 'Year', cellTooltip: true, headerTooltip: true},
                {name: 'org_month', displayName: 'Month', cellTooltip: true, headerTooltip: true},
                {name: 'total', displayName: 'KM', cellTooltip: true, headerTooltip: true}
            ];
            $scope.contractorKMOptions.data = ($filter('filter')($scope.gridData, {type: 'contractor_total_km'}));
        };

        $scope.setFilter = function (columns) {
            for (var i = 0; i < columns.length; i++) {
                columns[i].filter = {
                    condition: uiGridConstants.filter.CONTAINS
                };
            }
        };


        $scope.AddExternalData = function (kmHoursChecker, type) {
            $scope.externalDataObj = {
                org_year: '-Year-',
                org_month: '-Month-'
            };
            $rootScope.dataType = '';
            $rootScope.newId = '';
            if (kmHoursChecker === 'hoursEntered') {
                $scope.hoursEntered = true;
                $scope.kmEntered = false;
            } else if (kmHoursChecker === 'kmEntered') {
                $scope.hoursEntered = false;
                $scope.kmEntered = true;
            }
            $rootScope.dataType = type;
            coreService.getUuid().then(function (response) {
                $rootScope.newId = response.data.success;
                $scope.$uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/analyticsModule/views/AddExternalData.html',
                    controller: 'analyticsDataCtrl',
                    scope: $scope,
                    resolve: {
                        externalDataObj: function () {
                            return $scope.externalDataObj;
                        }
                    }
                });
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

        };

        $scope.EditExternalData = function (gridNum) {
            coreService.resetAlert();
            if (gridNum === 1) {
                $scope.hoursEntered = true;
                $scope.kmEntered = false;
                if ($scope.employeeHgridApi.selection.getSelectedRows()[0]) {
                    $scope.externalDataObj = $scope.employeeHgridApi.selection.getSelectedRows()[0];
                    $scope.externalDataObj.total_hour = $scope.employeeHgridApi.selection.getSelectedRows()[0]['total'];
                    $scope.externalDataObj.extDataType = 'employee_total_hour';
                }
            } else if (gridNum === 2) {
                $scope.hoursEntered = true;
                $scope.kmEntered = false;
                if ($scope.contractorHgridApi.selection.getSelectedRows()[0]) {
                    $scope.externalDataObj = $scope.contractorHgridApi.selection.getSelectedRows()[0];
                    $scope.externalDataObj.total_hour = $scope.contractorHgridApi.selection.getSelectedRows()[0]['total'];
                    $scope.externalDataObj.extDataType = 'contractor_total_hour';
                }
            } else if (gridNum === 3) {
                $scope.hoursEntered = false;
                $scope.kmEntered = true;
                if ($scope.employeeKMgridApi.selection.getSelectedRows()[0]) {
                    $scope.externalDataObj = $scope.employeeKMgridApi.selection.getSelectedRows()[0];
                    $scope.externalDataObj.total_km = $scope.employeeKMgridApi.selection.getSelectedRows()[0]['total'];
                    $scope.externalDataObj.extDataType = 'employee_total_km';
                }
            } else if (gridNum === 4) {
                $scope.hoursEntered = false;
                $scope.kmEntered = true;
                if ($scope.contractorKMgridApi.selection.getSelectedRows()[0]) {
                    $scope.externalDataObj = $scope.contractorKMgridApi.selection.getSelectedRows()[0];
                    $scope.externalDataObj.total_km = $scope.contractorKMgridApi.selection.getSelectedRows()[0]['total'];
                    $scope.externalDataObj.extDataType = 'contractor_total_km';
                }
            }

            if ($scope.employeeHgridApi.selection.getSelectedRows()[0] || $scope.contractorHgridApi.selection.getSelectedRows()[0]
                    || $scope.employeeKMgridApi.selection.getSelectedRows()[0] || $scope.contractorKMgridApi.selection.getSelectedRows()[0]) {
                $scope.externalDataObj.operation = 'update';
                $scope.$uibModalInstance1 = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/analyticsModule/views/AddExternalData.html',
                    controller: 'analyticsDataCtrl',
                    scope: $scope,
                    resolve: {
                        externalDataObj: function () {
                            return $scope.externalDataObj;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }

        };

        $scope.cancel = function () {
            if (angular.isDefined($scope.$uibModalInstance))
                $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance1))
                $scope.$uibModalInstance1.close('cancel');
        };

        $scope.editFunction = function () {
            $scope.disabled = false;
        };

        $scope.submitFunction = function () {
            if (!$scope.externalDataObj.operation) {
                $scope.externalDataObj.extDataType = $rootScope.dataType;
                $scope.externalDataObj.org_external_value_id = $rootScope.newId;
            } else {
                $scope.externalDataObj.editing_by = $scope.user.employee_id;
            }
            $scope.externalDataObj.org_id = $scope.user.org_id;
            if ($scope.externalDataObj.org_year === '-Year-' && $scope.externalDataObj.org_month === '-Month-' && (!$scope.externalDataObj.total_hour || !$scope.externalDataObj.total_km)) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: 'Please enter all form data'});
            } else {
                analyticsService.addOrgExternslData($scope.externalDataObj).then(function (response) {
                    if (response.data.month_year_found) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'error', message: 'external data already exist for this month in this year'});
                    } else if (response.data.insert_op || response.data.update_op) {
                        $scope.cancel();
                        coreService.resetAlert();
                        coreService.setAlert({type: 'success', message: 'external data added  successfully'});
                        var post = {org_id: $scope.user.org_id};
                        $scope.promise = analyticsService.getOrgExternslData(post).then(function (resp) {
                            $scope.gridData = $scope.checkDataDecOrInt(resp.data);
//                            $scope.gridData = resp.data;

                            $scope.loadEmployeeHGrid();
                            $scope.loadContractorHGrid();
                            $scope.loadEmployeeKMGrid();
                            $scope.loadContractorKMGrid();

                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });

                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }

        };
        
        
        
        
         $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
        $scope.data = [300, 500, 100];

        $scope.lineLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        $scope.series = ['Series A', 'Series B'];

        $scope.lineData = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
           $scope.thirdLabels = ["January", "February", "March", "April", "May", "June", "July"];
        $scope.thirdSeries = ['Series A', 'Series B'];
        $scope.thirdData = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}];
        $scope.thirdOptions = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        display: true,
                        position: 'right'
                    }
                ]
            }
        };



    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', 'uiGridConstants', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('analyticsModule')
            .controller('analyticsCtrl', controller);
}());
