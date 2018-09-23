/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
        $scope.thirdPartyLabels = {};
        $scope.frmlabels = constantService.getThirdPartyFormLabels();
        angular.forEach($scope.frmlabels, function (value, key) {
            $scope.thirdPartyLabels[key] = value;
        });
        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'ThirdParties.csv';
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

        $scope.openAddThirdParty = function () {
            $rootScope.isNew = true;
            $rootScope.org_id = '';
            $rootScope.selectedRowThirdParty = '';
            $rootScope.nocustomercheck = $scope.nocustomercheck;
            $state.go('addThirdParties');
        };


        $scope.editThirdParty = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.third_party_id = $scope.gridApi.selection.getSelectedRows()[0]['third_party_id'];
                $rootScope.selectedRowThirdParty = $scope.gridApi.selection.getSelectedRows()[0];
                $rootScope.isNew = false;
                $rootScope.nocustomercheck = $scope.nocustomercheck;
                $state.go('addThirdParties');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.thirdPartyHistory = function () {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.third_party_id = $scope.gridApi.selection.getSelectedRows()[0]['third_party_id'];
                $rootScope.thirdPartyCheck = true;
            }
            $state.go('ThirdPartiesHistory');
        };

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
//            if (coreService.getCurrentState() === "thirdParties") {
            if (coreService.getCurrentState() === "ManageTrackingHSE" ) {    
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $q.all([
                    customersService.getOrgCustomerStatus($scope.user.org_id)
                ]).then(function (queues) {
                    $scope.nocustomercheck = queues[0].data;
                    post = {org_id: $scope.user.org_id, customer_checker: $scope.nocustomercheck};
                    customersService.thirdParties(post).then(function (response) {
                        $scope.gridOptions.columnDefs = [
                            {name: 'third_party_name', displayName: 'Third Party Name', cellTooltip: true, headerTooltip: true},
                            {name: 'third_party_type_name', displayName: 'Third Party Type', cellTooltip: true, headerTooltip: true},
                            {name: 'contact_name', displayName: 'Contact Name', cellTooltip: true, headerTooltip: true},
                            {name: 'address', displayName: 'Address', cellTooltip: true, headerTooltip: true},
                            {name: 'city_name', displayName: 'City', cellTooltip: true, headerTooltip: true},
                            {name: 'province_name', displayName: 'Province/State', cellTooltip: true, headerTooltip: true},
                            {name: 'country_name', displayName: 'Country Name', cellTooltip: true, headerTooltip: true},
                            {name: 'postal_code', displayName: 'Postal/Zip Code', cellTooltip: true, headerTooltip: true},
                            {name: 'primary_phone', displayName: 'Phone', cellTooltip: true, headerTooltip: true},
                            {name: 'is_active_view', displayName: 'Status', cellTooltip: true, headerTooltip: true},
                        ];
                        $scope.girdData = response.data;
                        $scope.gridOptions.data = $scope.girdData;
                        $scope.setFilter();

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                });
//                $scope.nocustomercheck = customersService.getOrgCustomerStatus($scope.user.org_id);


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
            var post = {language_id: $scope.user.language_id, alert_message_code: 'thirdparties'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'thirdPartiesCtrl',
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

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance2))
                $scope.$uibModalInstance2.close('cancel');
        };

        $scope.deletethirdpartyFun = function () {

            customersService.deleteThirdParty($scope.deletedThirdParty).then(function (response) {
                $scope.cancel();
                $state.reload();
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.deleteThirdParty = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.third_party_id = $scope.gridApi.selection.getSelectedRows()[0]['third_party_id'];
                $scope.$uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/adminToolsModule/views/deleteThirdParty.html',
                    controller: 'thirdPartiesCtrl',
                    scope: $scope,
                    resolve: {
                        item: function () {
                            $scope.deletedThirdParty = {};
                            $scope.deletedThirdParty.editing_by = coreService.getUser().employee_id;
                            $scope.deletedThirdParty.org_id = $scope.user.org_id
                            $scope.deletedThirdParty.third_party_id = $rootScope.third_party_id;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.cancelCustomers = function () {
            $scope.nocustomercheck = false;
            $rootScope.nocustomercheck = false;
        };


        $scope.submitCustomers = function () {
            if ($scope.nocustomercheck) {
                show_customer = 1;
            } else {
                show_customer = 0;
            }
            var post = {org_id: $scope.user.org_id, show_customer: show_customer};
            console.log(post);
            customersService.updateThirdPartyCustomers(post).then(function (response) {
                console.log(response.data);
                $state.reload();
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

    };

    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('thirdPartiesCtrl', controller);
}());
