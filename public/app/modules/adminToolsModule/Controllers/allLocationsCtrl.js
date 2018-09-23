(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
        // all locations grid
        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'allLocations.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        // country history grid
        $scope.gridOptionsCountry = coreService.getGridOptions();
        $scope.gridOptionsCountry.exporterCsvFilename = 'countryHistory.csv';
        $scope.gridOptionsCountry.onRegisterApi = function (gridApiCount) {
            $scope.gridApiCount = gridApiCount;
        };
        $scope.gridOptionsCountry.onRegisterApi = function (gridApiCount) {
            $scope.gridApiCount = gridApiCount;
        };
        // state history grid
        $scope.gridOptionsState = coreService.getGridOptions();
        $scope.gridOptionsState.exporterCsvFilename = 'stateHistory.csv';
        $scope.gridOptionsState.onRegisterApi = function (gridApiState) {
            $scope.gridApiState = gridApiState;
        };
        $scope.gridOptionsState.onRegisterApi = function (gridApiState) {
            $scope.gridApiState = gridApiState;
        };
        // area history grid
        $scope.gridOptionsArea = coreService.getGridOptions();
        $scope.gridOptionsArea.exporterCsvFilename = 'areaHistory.csv';
        $scope.gridOptionsArea.onRegisterApi = function (gridApiArea) {
            $scope.gridApiArea = gridApiArea;
        };
        $scope.gridOptionsArea.onRegisterApi = function (gridApiArea) {
            $scope.gridApiArea = gridApiArea;
        };
        // sitehistory grid
        $scope.gridOptionsSite = coreService.getGridOptions();
        $scope.gridOptionsSite.exporterCsvFilename = 'siteHistory.csv';
        $scope.gridOptionsSite.onRegisterApi = function (gridApiSite) {
            $scope.gridApiSite = gridApiSite;
        };
        $scope.gridOptionsSite.onRegisterApi = function (gridApiSite) {
            $scope.gridApiSite = gridApiSite;
        };

        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };

        var init = function () {
            $scope.locationLevels = [
                {value: 0, title: 'please select'},
                {value: 2, title: '2'},
                {value: 3, title: '3'},
                {value: 4, title: '4'}
            ];
            $scope.disabled = false;
        };
        init();

        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
//            if (coreService.getCurrentState() === "Location") {
            if (coreService.getCurrentState() === "ManageTrackingHSE") {
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                org_id = $scope.user.org_id;
                $scope.allLocations = {
                    selected_level: '',
                    location1_label: '',
                    location2_label: '',
                    location3_label: '',
                    location4_label: ''
                };
                var my_post = {org_id: $scope.user.org_id};
                $q.all([
                    customersService.getLocationsByOrgLevel(my_post),
                    customersService.getCountryHistory($scope.user.org_id),
                    customersService.getStateHistory($scope.user.org_id),
                    customersService.getAreaHistory($scope.user.org_id),
                    customersService.getSiteHistory($scope.user.org_id)
                ]).then(function (queues) {
                    $scope.allLocations.selected_level = parseInt(queues[0].data['select_location_level'], 10);
                    $scope.oldLocationLevel = $scope.allLocations.selected_level;

                    $scope.locations_labels = queues[0].data['locations_labels'];
                    $scope.allLocations.location1_label = $filter('filter')($scope.locations_labels, {field_name: 'Location1Id'})[0].label;
                    $scope.allLocations.location2_label = $filter('filter')($scope.locations_labels, {field_name: 'Location2Id'})[0].label;
                    $scope.allLocations.location3_label = $filter('filter')($scope.locations_labels, {field_name: 'Location3Id'})[0].label;
                    $scope.allLocations.location4_label = $filter('filter')($scope.locations_labels, {field_name: 'Location4Id'})[0].label;
                    // all locations
                    if ($scope.allLocations.selected_level === 2) {
                        $scope.show_city_history = true;
                        $scope.show_community_histoy = true;
                        $scope.gridOptions.columnDefs = [
                            {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location2_name', displayName: $scope.allLocations.location2_label, cellTooltip: true, headerTooltip: true}
                        ];
                    } else if ($scope.allLocations.selected_level === 3) {
                        $scope.show_city_history = false;
                        $scope.show_community_histoy = true;
                        $scope.gridOptions.columnDefs = [
                            {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location2_name', displayName: $scope.allLocations.location2_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location3_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true}
                        ];
                    } else if ($scope.allLocations.selected_level === 4) {
                        $scope.show_city_history = false;
                        $scope.show_community_histoy = false;
                        $scope.gridOptions.columnDefs = [
                            {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location2_name', displayName: $scope.allLocations.location2_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location3_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                            {name: 'location4_name', displayName: $scope.allLocations.location4_label, cellTooltip: true, headerTooltip: true}
                        ];
                    }
                    $scope.girdData = queues[0].data['all_Locations'];
                    $scope.gridOptions.data = $scope.girdData;
                    //country history
                    $scope.gridOptionsCountry.columnDefs = [
                        {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.gridCountryData = queues[1].data;
                    $scope.gridOptionsCountry.data = $scope.gridCountryData;
                    // state history 
                    $scope.gridOptionsState.columnDefs = [
                        {name: 'location2_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.gridStateData = queues[2].data;
                    $scope.gridOptionsState.data = $scope.gridStateData;
                    // Area History
                    $scope.gridOptionsArea.columnDefs = [
                        {name: 'location3_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location2_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.gridAreaData = queues[3].data;
                    $scope.gridOptionsArea.data = $scope.gridAreaData;
                    // Site History
                    $scope.gridOptionsSite.columnDefs = [
                        {name: 'location4_name', displayName: $scope.allLocations.location4_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location3_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location2_name', displayName: $scope.allLocations.location3_label, cellTooltip: true, headerTooltip: true},
                        {name: 'location1_name', displayName: $scope.allLocations.location1_label, cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.gridSiteData = queues[4].data;
                    $scope.gridOptionsSite.data = $scope.gridSiteData;

                    $scope.setFilter();
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                });
            }
        }, true);

        $scope.setFilter = function () {
            var columns = $scope.gridOptions.columnDefs;
            for (var i = 0; i < columns.length; i++) {
                $scope.gridOptions.columnDefs[i].filter = {
                    condition: uiGridConstants.filter.CONTAINS
                };
            }
        };

        $scope.openAddLocation = function () {
            $rootScope.location_level = $scope.allLocations.selected_level;
            $rootScope.isNew = true;
            $state.go('AddLocation');
        };

        $scope.addLocationLevel = function () {
            //  var post = {org_id: $scope.user.org_id, location_level: $scope.allLocations.selected_level, location_labels: $scope.allLocations};
            customersService.updateOrgLocation($scope.allLocations).then(function (response) {
                //$state.reload();
                coreService.setAlert({type: 'success', message: constantService.getMessage('update_location_labels')});
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.cancelLocationLevel = function () {
            $scope.allLocations.selected_level = $scope.oldLocationLevel;   //4;
            // $scope.addLocationLevel();
        };

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'location'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'allLocationsCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.openCountryHistoryHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'countryhist'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'allLocationsCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.openSiteHistoryHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'statehist'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'allLocationsCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.openAreaHistoryHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'areahist'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'allLocationsCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.openStateHistoryHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'sitehist'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'allLocationsCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.clearSearch = function () {
            $scope.gridApi.selection.clearSelectedRows(); // clear selected rows
            var columns = $scope.gridApi.grid.columns;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        };

        $scope.editLocation = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.location_level = $scope.allLocations.selected_level;
                $rootScope.selectedRowLocation = $scope.gridApi.selection.getSelectedRows()[0];
                $rootScope.isNew = false;
                $state.go('AddLocation');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
        };


    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('allLocationsCtrl', controller);
}());

