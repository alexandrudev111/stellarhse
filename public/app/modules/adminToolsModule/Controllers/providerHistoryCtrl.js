/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state,uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
console.log($rootScope.provider_id);

        $scope.gridOptionsHistory = coreService.getGridOptions();
        $scope.gridOptionsHistory.exporterPdfHeader = {text: "trainning ؛Provider History", style: 'headerStyle'};
        $scope.gridOptionsHistory.exporterCsvFilename = 'trainingProviderHistory.csv';
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
            if (coreService.getCurrentState() === "trainingProviderHistory") {    
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                console.log("data");
                var data = {
                    provider_id: $rootScope.provider_id,
                    org_id: $scope.user.org_id
                };
                console.log(data);
                customersService.trainingProviderHistory(data).then(function (response) {
                    $scope.gridOptionsHistory.columnDefs = [
                        {name: 'provider_name', displayName: 'Training Provider Name', cellTooltip: true, headerTooltip: true},
                        {name: 'phone', displayName: 'Phone  ', cellTooltip: true, headerTooltip: true},
                        {name: 'website', displayName: 'Website', cellTooltip: true, headerTooltip: true},
                        {name: 'full_name', displayName: 'Updated By', cellTooltip: true, headerTooltip: true},
                        {name: 'history_operation_name', displayName: 'Operation', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true},
                    ];
                 
                    $scope.girdData = response.data;
                    $scope.gridOptionsHistory.data = $scope.girdData;
                    $scope.setFilter();
                    $rootScope.provider_id = '';

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
            .controller('providerHistoryCtrl', controller);
}());

