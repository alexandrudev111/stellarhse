(function () {
    var controller = function ($scope, $rootScope, constantService, chartService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {

        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'Charts.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === 'chartgrid') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id};
                chartService.getIncidentCharts(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'stat_table_name', displayName: 'Report name', cellTooltip: true, headerTooltip: true},
                        {name: 'operation_name', displayName: 'Formula', cellTooltip: true, headerTooltip: true},
                        {name: 'output_type_name', displayName: 'Report type', cellTooltip: true, headerTooltip: true},
                        {name: 'creation_date', displayName: 'Date Generated', cellTooltip: true, headerTooltip: true},
                        {name: 'updated_date', displayName: 'Last Update', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.girdData = response.data;
                    $scope.gridOptions.data = $scope.girdData;

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        }, true);

        $scope.editChart = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.selectedChart = $scope.gridApi.selection.getSelectedRows()[0];
                $state.go('generatechart');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        }

        $scope.addChart = function () {
            $rootScope.selectedChart = null;
            $state.go('generatechart');
        }

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'charts'};
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
        }

        $scope.deleteChart = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $scope.selectedChart = $scope.gridApi.selection.getSelectedRows()[0];
                $confirm({
                    text: constantService.getMessage('confirm_delete'),
                    title: 'Delete Chart',
                    cancel: 'No',
                    ok: "Yes, I'm sure"
                }).then(function () {
                    chartService.deleteChart($scope.selectedChart).then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            $state.reload();
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                }, function () {
//                console.log('No');
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        }

        $scope.clearSearch = function () {
            $scope.gridApi.selection.clearSelectedRows(); // clear selected rows
            var columns = $scope.gridApi.grid.columns;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        }

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
        }
    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'chartService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('chartModule')
            .controller('chartGridCtrl', controller);
}());

