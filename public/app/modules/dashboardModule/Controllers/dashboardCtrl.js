(function () {
    var controller = function ($scope, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm, $rootScope, dashboardService) {
        $scope.activeForm = 9;
        $scope.user = coreService.getUser();
        $scope.permissions = coreService.getPermissions();
        $scope.products = coreService.getProducts();
        // if($scope.products.Hazard || $scope.products.ABCanTrack || $scope.products.Inspection ||
        //     $scope.products.SafetyMeeting || $scope.products.Training || $scope.products.MaintenanceManagement)
        //     $scope.products.HSETracking = true;
            console.log($scope.products)
        
        $scope.gridOptions = coreService.getGridOptions(); //1
        $scope.inCompleteOptions = angular.copy($scope.gridOptions); //2
        $scope.inCompleteTrainingOptions = angular.copy($scope.gridOptions); //3
        $scope.rescentReportOptions = angular.copy($scope.gridOptions); //4
        $scope.HSEDocumentOptions = angular.copy($scope.gridOptions); //5
        $scope.BookMarkOptions = angular.copy($scope.gridOptions); //6
        $scope.allRecentOptions = angular.copy($scope.gridOptions); //7
        $scope.allincompleteActionsOptions = angular.copy($scope.gridOptions); //8
        $scope.allincompleteTrainingOptions = angular.copy($scope.gridOptions); //9
        $scope.allRescentReportOptions = angular.copy($scope.gridOptions); //10

        //1
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        //2
        $scope.inCompleteOptions.onRegisterApi = function (gridApi) {
            $scope.myIncomActions = gridApi;
        };
        //3
        $scope.inCompleteTrainingOptions.onRegisterApi = function (gridApi) {
            $scope.myIncomTraining = gridApi;
        };
        //4
        $scope.rescentReportOptions.onRegisterApi = function (gridApi) {
            $scope.myRecentOptions = gridApi;
        };
        //7
        $scope.allRecentOptions.onRegisterApi = function (gridApi) {
            $scope.allRecent = gridApi;
        };
        //8
        $scope.allincompleteActionsOptions.onRegisterApi = function (gridApi) {
            $scope.allIncompleteActions = gridApi;
        };
        //9
        $scope.allincompleteTrainingOptions.onRegisterApi = function (gridApi) {
            $scope.allIncompleteTraining = gridApi;
        };
        //10
        $scope.allRescentReportOptions.onRegisterApi = function (gridApi) {
            $scope.allRecentRep = gridApi;
        };


        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            if (coreService.getCurrentState() === 'dashboard') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                // $scope.products = $scope.user.products;
                var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, employee_id: $scope.user.employee_id};

                $scope.promise = $q.all([
                    dashboardService.getFieldLabels(post),
                    dashboardService.getMyNotificationDashboard(post),
                    dashboardService.getMyIncompleteActions(post),
                    dashboardService.getMyIncompleteTraining(post),
                    dashboardService.getMyRecentReports(post),
                    dashboardService.getAllNotificationDashboard(post),
                    dashboardService.getAllIncompleteActions(post),
                    dashboardService.getAllIncompleteTraining(post),
                    dashboardService.getAllRecentReports(post)
                ]).then(function (queues) {

                    $scope.gridOptions.columnDefs = []; //1
                    $scope.inCompleteOptions.columnDefs = [];//2
                    $scope.inCompleteTrainingOptions.columnDefs = []; //3
                    $scope.rescentReportOptions.columnDefs = [];//4
                    $scope.HSEDocumentOptions.columnDefs = []; //5
                    $scope.BookMarkOptions.columnDefs = []; //6
                    $scope.allRecentOptions.columnDefs = []; //7
                    $scope.allincompleteActionsOptions.columnDefs = []; //8
                    $scope.allincompleteTrainingOptions.columnDefs = []; //9
                    $scope.allRescentReportOptions.columnDefs = []; //10

//                    console.log(queues[0]);
//                    console.log(queues[1]);
//                    console.log(queues[2]);
//                    console.log(queues[3]);
//                    console.log(queues[4]);
//                    console.log(queues[5]);
//                    console.log(queues[6]);
//                    console.log(queues[7]);
//                    console.log(queues[8]);

                    $scope.all_mod_data = queues[0].data.all_mod;
                    $scope.training_data = queues[0].data.training;
                    angular.forEach($scope.all_mod_data, function (value, key) {
                        if (value['field_name'] === 'date') {
                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //4
                            $scope.rescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'SourceName') {
                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'ReportType') {
                            //4
                            $scope.rescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'report_number') {
                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //4
                            $scope.rescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'reported_by') {
//                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'Location' || value['field_name'] === 'description') {
//                            //4
                            $scope.rescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'risk_level') {
//                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //4
                            $scope.rescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //10
                            $scope.allRescentReportOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'PriorityName') {
                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'CorrActStatusName') {
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'Subject' || value['field_name'] === 'summary_desc') {
                            //1
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'assigned_to') {
//                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'sent_to') {
                            //7
                            $scope.allRecentOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        } else if (value['field_name'] === 'also_notified') {
                            //2
                            $scope.inCompleteOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                            //8
                            $scope.allincompleteActionsOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        }
                    });

                    angular.forEach($scope.training_data, function (value, key) {
                        if (value['field_name'] !== 'identified_by') {
                            //3
                            $scope.inCompleteTrainingOptions.columnDefs.push({
                                name: value.field_name,
                                displayName: value.label,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: true
                            });
                        }
                        //9
                        $scope.allincompleteTrainingOptions.columnDefs.push({
                            name: value.field_name,
                            displayName: value.label,
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        });
                    });

                    $scope.gridOptions.data = queues[1].data;
                    $scope.inCompleteOptions.data = queues[2].data;
                    $scope.inCompleteTrainingOptions.data = queues[3].data;
                    $scope.rescentReportOptions.data = queues[4].data;
                    $scope.allRecentOptions.data = queues[5].data;
                    $scope.allincompleteActionsOptions.data = queues[6].data;
                    $scope.allincompleteTrainingOptions.data = queues[7].data;
                    $scope.allRescentReportOptions.data = queues[8].data;
                    coreService.setAllRecentReport($scope.allRescentReportOptions);

                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                    coreService.setAlert({type: 'exception', message: errors[3].data});
                    coreService.setAlert({type: 'exception', message: errors[4].data});
                    coreService.setAlert({type: 'exception', message: errors[5].data});
                    coreService.setAlert({type: 'exception', message: errors[6].data});
                    coreService.setAlert({type: 'exception', message: errors[7].data});
                    coreService.setAlert({type: 'exception', message: errors[8].data});
                });


            }
        }, true);

        $scope.downloadCSV = function (grid) {
            if (grid === 'myRecentReport') {
                $scope.myRecentOptions.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myIncompleteTraining') {
                $scope.myIncomTraining.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allRecentReport') {
                $scope.allRecentRep.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allIncompleteTraining') {
                $scope.allIncompleteTraining.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myIncompleteActions') {
                $scope.myIncomActions.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allIncompleteActions') {
                $scope.allIncompleteActions.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myRecentNotifications') {
                $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allRecentNotifications') {
                $scope.allRecent.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            }
        };

        $scope.downloadPDF = function (grid) {
            if (grid === 'myRecentReport') {
                $scope.myRecentOptions.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myIncompleteTraining') {
                $scope.myIncomTraining.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allRecentReport') {
                $scope.allRecentRep.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allIncompleteTraining') {
                $scope.allIncompleteTraining.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myIncompleteActions') {
                $scope.myIncomActions.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allIncompleteActions') {
                $scope.allIncompleteActions.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'myRecentNotifications') {
                $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else if (grid === 'allRecentNotifications') {
                $scope.allRecent.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            }
        };

        $scope.openReport = function (type) {
            if (type === 'my') {
                $scope.selected_report = $scope.myRecentOptions.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_report = $scope.allRecentRep.selection.getSelectedRows()[0];
            }
            console.log($scope.selected_report);
            if ($scope.selected_report) {
                var product_code = $scope.selected_report['product_code'];
                if (product_code === 'ABCanTrack') {
                    $state.go('editincidentreport', {reportNumber: $scope.selected_report['report_number']});
                } else if (product_code === 'Hazard') {
                    $state.go('edithazardreport', {reportNumber: $scope.selected_report['report_number'],reportVersion:$scope.selected_report['version_number']});
                } else if (product_code === 'Inspection') {
                    $state.go('editinspectionreport', {reportNumber: $scope.selected_report['report_number']});
                } else if (product_code === 'SafetyMeeting') {
                    $state.go('editsafetymeetingreport', {reportNumber: $scope.selected_report['report_number']});
                } else if (product_code === 'MaintenanceManagement') {
                    $state.go('editmaintenancereport', {reportNumber: $scope.selected_report['report_number']});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.previewSummary = function (type) {
            if (type === 'my') {
                $scope.selected_report = $scope.myRecentOptions.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_report = $scope.allRecentRep.selection.getSelectedRows()[0];
            }
            console.log($scope.selected_report);
            if ($scope.selected_report) {
                var post = {report_id: $scope.selected_report.id, report_code: $scope.selected_report.product_code};
                dashboardService.getReportPopUpData(post).then(function (response) {
                    console.log(response.data);
                    $scope.selected_report.operation_type_name = response.data.operation_type_name;
                    $scope.selected_report.desc = response.data.desc;
                    $scope.selected_report.status = response.data.status;
                    $scope.selected_report.contractor_name = response.data.contractor_name;
                    $scope.selected_report.customer_name = response.data.customer_name;
                    $scope.selected_report.main_impact = response.data.main_impact;
                    $scope.selected_report.investigation_summary = response.data.investigation_summary;
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/dashboardModule/Views/generalReportPopup.html',
                        scope: $scope
                    });
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.previewTrainning = function (type) {
            if (type === 'my') {
                $scope.selected_training = $scope.myIncomTraining.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_training = $scope.allIncompleteTraining.selection.getSelectedRows()[0];
            }
            if ($scope.selected_training) {
                console.log($scope.selected_training);
                $scope.$uibModalInstance2 = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/dashboardModule/Views/trainingPopUp.html',
                    scope: $scope
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.cancel = function () {
            //myRecentReports & allReports
            if (angular.isDefined($scope.$uibModalInstance)) {
                $scope.$uibModalInstance.close('cancel');
                $scope.selected_report = null;
            }
            //myTraining & allTrainning
            if (angular.isDefined($scope.$uibModalInstance2)) {
                $scope.$uibModalInstance2.close('cancel');
                $scope.selected_training = null;
            }
            //myIncompleteCorrective & allIncompleteCorrective
            if (angular.isDefined($scope.$uibModalInstance3)) {
                $scope.$uibModalInstance3.close('cancel');
                $scope.selected_action = null;
            }
            //myRecentNotification & allRecentNotification email modal
            if (angular.isDefined($scope.$uibModalInstance4)) {
                $scope.$uibModalInstance4.close('cancel');
                $scope.selected_notification = null;
            }

            //myRecentNotification & allRecentNotification 
            if (angular.isDefined($scope.$uibModalInstance5)) {
                $scope.$uibModalInstance5.close('cancel');
                $scope.selected_notification = null;
            }
            //close corrective action
            if (angular.isDefined($scope.$uibModalInstance6)) {
                $scope.$uibModalInstance6.close('cancel');
                $scope.selected_action_to_close = null;
            }
        };

        $scope.corrActionSummary = function (type) {
            if (type === 'my') {
                $scope.selected_action = $scope.myIncomActions.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_action = $scope.allIncompleteActions.selection.getSelectedRows()[0];
            }
            if ($scope.selected_action) {
                console.log($scope.selected_action);
                $scope.$uibModalInstance3 = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/dashboardModule/Views/myIncompletePopUp.html',
                    scope: $scope
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.closeAction = function (type) {
            if (type === 'my') {
                $scope.selected_action_to_close = $scope.myIncomActions.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_action_to_close = $scope.allIncompleteActions.selection.getSelectedRows()[0];
            }
            console.log($scope.selected_action_to_close);
            if ($scope.selected_action_to_close) {
                $scope.$uibModalInstance6 = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/dashboardModule/Views/datePicker.html',
                    scope: $scope
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.update_action_status = function () {
            var date_array = $scope.selected_action_to_close.selected_end_date.split('/');
            var actual_end_date = date_array[2] + '-' + date_array[0] + '-' + date_array[1];
            var post = {
                product_code: $scope.selected_action_to_close.product_code,
                corrective_action_id: $scope.selected_action_to_close.corrective_action_id,
                org_id: $scope.user.org_id,
                lang_id: $scope.user.language_id,
                actual_end_date: actual_end_date
            };
            dashboardService.updateActionStatus(post).then(function (response) {
                if (response.data !== 0 && !response.data.hasOwnProperty('file')) {
                    $scope.$uibModalInstance6.close('cancel');
                    var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, employee_id: $scope.user.employee_id};
                    $scope.promise = $q.all([
                        dashboardService.getMyIncompleteActions(post),
                        dashboardService.getAllIncompleteActions(post)
                    ]).then(function (queues) {
                        $scope.inCompleteOptions.data = queues[0].data;
                        $scope.allincompleteActionsOptions.data = queues[1].data;
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });

        };
        $scope.viewEmailTrainning = function (type) {
            if (type === 'my') {
                $scope.selected_training = $scope.myIncomTraining.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_training = $scope.allIncompleteTraining.selection.getSelectedRows()[0];
            }
            if ($scope.selected_training) {
                console.log($scope.selected_training);
                var post = {email_log_id: $scope.selected_training.email_log_id, product_code: 'Training'};
                dashboardService.getemailContent(post).then(function (response) {
                    if (response.data !== '' && !response.data.hasOwnProperty('file')) {
                        $scope.msgBody = response.data.email_body;
                        $scope.msgTitle = 'Email Content';
                        $scope.from = response.data.email_data.from;
                        $scope.c_c = response.data.email_data.c_c;
                        $scope.to = response.data.email_data.to;
                        $scope.$uibModalInstance4 = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/dashboardModule/Views/help.html',
                            scope: $scope
                        });
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.viewEmail = function (type) {
            if (type === 'my') {
                $scope.selected_action = $scope.myIncomActions.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_action = $scope.allIncompleteActions.selection.getSelectedRows()[0];
            }
            if ($scope.selected_action) {
                console.log($scope.selected_action);
                var post = {email_log_id: $scope.selected_action.email_log_id, product_code: $scope.selected_action.product_code};
                dashboardService.getemailContent(post).then(function (response) {
                    if (response.data !== '' && !response.data.hasOwnProperty('file')) {
                        $scope.msgBody = response.data.email_body;
                        $scope.msgTitle = 'Email Content';
                        $scope.from = response.data.email_data.from;
                        $scope.c_c = response.data.email_data.c_c;
                        $scope.to = response.data.email_data.to;
                        $scope.$uibModalInstance4 = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/dashboardModule/Views/help.html',
                            scope: $scope
                        });
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.viewEmailNotification = function (type) {
            if (type === 'my') {
                $scope.selected_notification = $scope.gridApi.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_notification = $scope.allRecent.selection.getSelectedRows()[0];
            }
            if ($scope.selected_notification) {
                console.log($scope.selected_notification);
                var post = {email_log_id: $scope.selected_notification.email_log_id, product_code: $scope.selected_notification.product_code};
                dashboardService.getemailContent(post).then(function (response) {
                    console.log(response);
                    if (response.data !== '' && !response.data.hasOwnProperty('file')) {
                        $scope.msgBody = response.data.email_body;
                        $scope.msgTitle = 'Email Content';
                        $scope.from = response.data.email_data.from;
                        $scope.c_c = response.data.email_data.c_c;
                        $scope.to = response.data.email_data.to;
                        $scope.$uibModalInstance4 = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/dashboardModule/Views/help.html',
                            scope: $scope
                        });
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.notificationSummary = function (type) {
            if (type === 'my') {
                $scope.selected_notification = $scope.gridApi.selection.getSelectedRows()[0];
            } else if (type === 'all') {
                $scope.selected_notification = $scope.allRecent.selection.getSelectedRows()[0];
            }
            if ($scope.selected_notification) {
                console.log($scope.selected_notification);
                $scope.$uibModalInstance5 = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/dashboardModule/Views/notificationSummary.html',
                    scope: $scope
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
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

        $scope.config = {
            autoHideScrollbar: false,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 360,
            scrollInertia: 0
        };


        $scope.incompletePopUp = function (size) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/incompletePopup.html',
                controller: 'dashboardCtrl'
            });
        };

        $scope.allIncompletePopUp = function (size) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/allIncompletePopup.html',
                controller: 'dashboardCtrl'
            });
        };



        $scope.trainingPopUp = function (size) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/trainingPopUp.html',
                controller: 'dashboardCtrl'
            });
        };



        $scope.openRecentPopUp = function (gridType) {
            if(gridType === 'my')
                $scope.selected_report = $scope.myRecentOptions.selection.getSelectedRows()[0];
            else
                $scope.selected_report = $scope.allRecentRep.selection.getSelectedRows()[0];
            
           var report = {
               report_id: $scope.selected_report.id,
               report_code: $scope.selected_report.product_code
           };
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/recentReportPopup.html',
                controller: 'RecentReportCtrl',
                resolve:{
                    report:report
                }
            });
        };


        $scope.NotificationPopup = function (size) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/NotificationPopup.html',
                controller: 'dashboardCtrl'
            });
        };




        $scope.myIncompletePopUp = function (size) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/dashboardModule/Views/myIncompletePopUp.html',
                controller: 'dashboardCtrl'
            });
        };


//        $scope.generalReportPopup = function (size) {
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/dashboardModule/Views/generalReportPopup.html',
//                controller: 'dashboardCtrl'
//            });
//        };

    };
    controller.$inject = ['$scope', 'constantService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm', '$rootScope', 'dashboardService'];
    angular.module('dashboardModule')
            .controller('dashboardCtrl', controller);
}());
       