/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state,uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {

console.log($rootScope.equipment_id);
        $scope.gridOptionsHistory = coreService.getGridOptions();
        $scope.gridOptionsHistory.exporterPdfHeader = {text: "Equipments History", style: 'headerStyle'};
        $scope.gridOptionsHistory.exporterCsvFilename = 'equipments.csv';
        $scope.gridOptionsHistory.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        };

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance2))
                $scope.$uibModalInstance2.close('cancel');
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
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === "equipmentHistory") {    
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                var data = {
                    equipment_id: $rootScope.equipment_id,
                    org_id: $scope.user.org_id
                };
                console.log(data);
                customersService.equipmentHistory(data).then(function (response) {
                    $scope.gridOptionsHistory.columnDefs = [
                        {name: 'equipment_name', displayName: 'Equipment Name', cellTooltip: true, headerTooltip: true},
                        {name: 'equipment_type', displayName: 'Equipment Type', cellTooltip: true, headerTooltip: true},
                        {name: 'equipment_category_name', displayName: 'Equipment Category Name', cellTooltip: true, headerTooltip: true},
                        {name: 'equipment_number', displayName: 'Equipment Number', cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true},
                        {name: 'last_update_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                    ];
                 
                    $scope.girdData = response.data;
                    $scope.gridOptionsHistory.data = $scope.girdData;
                    $scope.setFilter();
                    $rootScope.equipment_id = '';

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
            var post = {language_id: $scope.user.language_id, alert_message_code: 'thhistory'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'customersCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
    };


    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state','uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('equipmentHistoryCtrl', controller);
}());

