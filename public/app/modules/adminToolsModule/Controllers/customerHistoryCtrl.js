/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function () {
    var controller = function ($scope, $rootScope, constantService, customersService, $state,uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'CustomersHistory.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        }
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };


        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === "customerhistory") {
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                var post = {language_code: $scope.user.language_code, org_id: $rootScope.org_id};
                customersService.getCustomersHistory(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'org_name', displayName: 'Name', cellTooltip: true, headerTooltip: true},
                        {name: 'address', displayName: 'Address', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'city_name', displayName: 'City', cellTooltip: true, headerTooltip: true},
                        {name: 'postal_code', displayName: 'Postal/Zip Code', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'mailing_address', displayName: 'Mailing Address', cellTooltip: true, headerTooltip: true},
                        {name: 'email', displayName: 'Email Address', cellTooltip: true, headerTooltip: true},
                        {name: 'billing_city_name', displayName: 'Billing City', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'billing_postal_code', displayName: 'Postal/Zip Code', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'org_status', displayName: 'Status', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true},
                        {name: 'system_admin_name', displayName: 'System Administrator', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.girdData = response.data;
                    $scope.gridOptions.data = $scope.girdData;
                    $scope.setFilter();

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
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

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'orghistory'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    var msg = {
                        title: response.data['alert_name'],
                        body: response.data['alert_message_description']
                    };
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/coreModule/views/help.html',
                        controller: 'ShowPopUpController',
                        resolve: {
                            msg: msg
                        }
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
        
        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance2))
                $scope.$uibModalInstance2.close('cancel');
        };

    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants','$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('customerHistoryCtrl', controller);
}());
