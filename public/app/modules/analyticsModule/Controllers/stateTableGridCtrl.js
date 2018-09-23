(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {
        $scope.user = coreService.getUser();
        $scope.products = $scope.user.products;
        $scope.product_code = $scope.products[0].product_code;
        $scope.permissions = coreService.getPermissions();

        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'Charts.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === 'stateTableGrid') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id, product_code: $scope.product_code, output_code: 'table'};
                analyticsService.getOrgCharts(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'stat_table_name', displayName: 'Report name', cellTooltip: true, headerTooltip: true},
                        {name: 'operation_name', displayName: 'Formula', cellTooltip: true, headerTooltip: true},
                        {name: 'time_frame', displayName: 'Time Frame', cellTooltip: true, headerTooltip: true},
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


        $scope.$watch('product_code', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id, product_code: newVal, output_code: 'table'};
                analyticsService.getOrgCharts(post).then(function (response) {
                    $scope.girdData = response.data;
                    $scope.gridOptions.data = $scope.girdData;

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        });

        $scope.editStatTable = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.selectedChart = $scope.gridApi.selection.getSelectedRows()[0];
                $rootScope.selectedChart.product_code = $scope.product_code;
                $rootScope.selectedChart.product_name = ($filter('filter')($scope.products, {product_code: $scope.product_code})[0]).product_name;
                $state.go('generateStateTable');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        }

        $scope.addStatTable = function () {
            $rootScope.selectedChart = {};
            var chart = {
                stat_table_id: '',
                stat_table_name: '',
                employee_id: $scope.user.employee_id,
                org_id: $scope.user.org_id,
                creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                field_id1: '',
                field_id2: '',
//                field_name: '',
//                field_name2: '',
//                field_name3: '',
                hidden_params: '',
                operation_code: '',
                output_code: '',
                time_frame: '',
                product_code: $scope.product_code,
                product_name: ($filter('filter')($scope.products, {product_code: $scope.product_code})[0]).product_name,
                updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
            }
            $rootScope.selectedChart = chart;
            $state.go('generateStateTable');
        }

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'charts'};
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
        }

        $scope.deleteStatTable = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $scope.selectedChart = $scope.gridApi.selection.getSelectedRows()[0];
                $scope.selectedChart.product_code = $scope.product_code;
                var msg = {
                    title: constantService.getMessage('delete_confirm_title'),
                    body: constantService.getMessage('delete_confirm_msg')
                };
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreModule/views/confirm.html',
                    controller: 'ShowPopUpController',
                    backdrop: 'static',
                    resolve: {
                        msg: msg
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result === 'ok') {
                        analyticsService.deleteChart($scope.selectedChart).then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $state.reload();
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
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


        $scope.config = {
            autoHideScrollbar: false,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 350,
            scrollInertia: 0
        };


    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('analyticsModule')
            .controller('stateTableGridCtrl', controller);
}());

