(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, uiGridConstants, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {

        $scope.user = coreService.getUser();
        $scope.products = $scope.user.products;
        $scope.product_code = $scope.products[0].product_code;
        $scope.permissions = coreService.getPermissions();

        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'CurrentMetrics.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

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
            if (coreService.getCurrentState() === 'currentMetrics') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id, product_code: $scope.product_code};
                analyticsService.getOrgMetrics(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'metrics_name', minWidth: 150, displayName: 'Metric Name', cellTooltip: true, headerTooltip: true},
                        {name: 'period_items_name', minWidth: 150, displayName: 'Period', cellTooltip: true, headerTooltip: true},
                        {name: 'metrics_value', minWidth: 150, displayName: 'Result', cellTooltip: true, headerTooltip: true, cellFilter: 'date'}
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

        $scope.shareMetric = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $scope.selectedMetric = $scope.gridApi.selection.getSelectedRows()[0];
                $scope.selectedMetric.product_code = $scope.product_code;
                $q.all([
                    analyticsService.getSharingOptions($scope.user.language_id),
                    analyticsService.getMetrSharingBoards($scope.selectedMetric.metrics_id)
                ]).then(function (queues) {
                    $scope.selectedMetric.sharing_boards = queues[1].data;
                    $scope.selectedMetric.shared_to_id = {};
                    angular.forEach($scope.selectedMetric.sharing_boards, function (val, k) {
                        $scope.selectedMetric.shared_to_id[val.shared_to_id] = true;
                    });
                    if (queues[0].data) {
                        $scope.share_options = queues[0].data;
                        angular.forEach($scope.share_options, function (value, key) {
                            if (angular.isDefined($filter('filter')($scope.selectedMetric.sharing_boards, {shared_to_id: value.shared_to_id})[0])) {
                                value.matched_choice = true;
                            }
                            if (value.field_code === 'anotherusersdashboards') {
                                angular.forEach($scope.selectedMetric.sharing_boards, function (val, k) {
                                    if (val.shared_employee_id !== "") {
//                                        value.specific_user_id_dashboard = val.shared_employee_id;
                                        $scope.selectedMetric.user_dashboard = val.full_name;
                                        $scope.selectedMetric.specific_user_id_dashboard = val.shared_employee_id;
                                    }
                                });
                            }
                        });

                        $scope.$uibModalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/analyticsModule/views/sharePopup.html',
                            backdrop: 'static',
                            scope: $scope,
                            resolve: {
                                item: function () {
                                    return $scope.selectedMetric.shared_to_id;
                                }}
                        });
                    }
                    console.log($scope.share_options);
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                });

            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
            console.log($scope.selectedMetric);
        };

        $scope.shareFunc = function () {
            post = [];
            sh_emp_id = null;
            if ($scope.selectedMetric.shared_to_id) {
                angular.forEach($scope.selectedMetric.shared_to_id, function (value, key) {
                    if (key === $filter('filter')($scope.share_options, {field_code: 'anotherusersdashboards'})[0].shared_to_id) {
                        console.log($filter('filter')($scope.share_options, {field_code: 'anotherusersdashboards'})[0].shared_to_id);
                        sh_emp_id = $scope.selectedMetric.specific_user_id_dashboard;
                    }else{
                        sh_emp_id = null;
                    }
                    if(value){
                      post.push({
                          shared_to_id: key,
                          shared_employee_id: sh_emp_id
                      });
                    }
                });
                $scope.selectedMetric.share_array = post;
                analyticsService.shareFunc($scope.selectedMetric).then(function (response) {
                    if (response.data === 1) {
                        $scope.cancel();
                        coreService.resetAlert();
                        coreService.setAlert({type: 'success', message: constantService.getMessage('shareSuccessfull')});
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('shareSelection')});
            }
        };

        $scope.getActiveEmployees = function (empLetters) {
            if (empLetters !== '' && empLetters !== null) {
                userData = {org_id: $scope.user.org_id, keyWord: empLetters};
                analyticsService.getMatchedActiveUsers(userData).
                        then(function (response) {
                            $scope.activeEmployees = response.data;
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
        };

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
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



        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'metrics'};
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

        $scope.deleteMetric = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $scope.selectedMetric = $scope.gridApi.selection.getSelectedRows()[0];
                $scope.selectedMetric.product_code = $scope.product_code;
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
                        analyticsService.deleteMetric($scope.selectedMetric).then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
//                                console.log(response);
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
        };


    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', 'uiGridConstants', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('analyticsModule')
            .controller('metricGridCtrl', controller);
}());

