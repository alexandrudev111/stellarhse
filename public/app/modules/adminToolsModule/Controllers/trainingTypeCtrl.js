(function () {
    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
      

        $scope.trainignOptions = coreService.getGridOptions();
        $scope.trainignOptions.exporterPdfHeader = {text: "trainning Types", style: 'headerStyle'};
        $scope.trainignOptions.exporterCsvFilename = 'trainningTypes.csv';
        $scope.trainignOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
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
                if (coreService.getCurrentState() === "ManageTrackingHSE" ) {    
                    $scope.module = coreService.getCurrentState();
                    coreService.setDB($scope.db);
                    $scope.user = coreService.getUser();
                    var data = {org_id: $scope.user.org_id};
                    customersService.getTrainings(data).then(function (response) {
                        $scope.trainignOptions.columnDefs = [
                            {name: 'training_name', displayName: 'Training Name', cellTooltip: true, headerTooltip: true},
                            {name: 'evidence_of_completion_required', displayName: 'Evidence Of Completion ', cellTooltip: true, headerTooltip: true},
                            {name: 'duration_of_training', displayName: 'Training Duration', cellTooltip: true, headerTooltip: true},
                            {name: 'recertificate_frequency', displayName: 'Recertification Frequency', cellTooltip: true, headerTooltip: true},
                        ];
                        $scope.girdData = response.data;
                        $scope.trainignOptions.data = $scope.girdData;
                        $scope.setFilter();

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                }
            }, true);

        $scope.setFilter = function () {
            var columns = $scope.trainignOptions.columnDefs;
            for (var i = 0; i < columns.length; i++) {
                $scope.trainignOptions.columnDefs[i].filter = {
                    condition: uiGridConstants.filter.CONTAINS
                };
            }
        };

        $scope.addTrainingType = function () {
            $rootScope.isNew = true;
            $rootScope.org_id = '';
            $rootScope.selectedRow = '';
            $state.go('addTrainingType');
        };

        $scope.editTrainingType = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.training_type_id = $scope.gridApi.selection.getSelectedRows()[0]['training_type_id = '];
                $rootScope.selectedProv = $scope.gridApi.selection.getSelectedRows()[0];
                $rootScope.isNew = false;
                $state.go('addTrainingType');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.trainingTypeHistory = function () {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.training_type_id = $scope.gridApi.selection.getSelectedRows()[0]['training_type_id'];
                $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
            }
            else{
                $rootScope.training_type_id = '';
                $rootScope.org_id = ''; 
            }
            $state.go('trainingTypeHistory');
        };

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'trainingTypes'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'trainingTypeCtrl',
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

        $scope.deleteTrainingTypeFun = function () {

            customersService.deleteTrainingType($scope.deletedTrainingType).then(function (response) {
                $scope.cancel();
                $state.reload();
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.deleteTrainingType = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.training_type_id = $scope.gridApi.selection.getSelectedRows()[0]['training_type_id'];
                $scope.$uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/adminToolsModule/views/deleteTrainingType.html',
                    controller: 'trainingTypeCtrl',
                    scope: $scope,
                    resolve: {
                        item: function () {
                            $scope.deletedTrainingType = {};
                            $scope.deletedTrainingType.editing_by = coreService.getUser().employee_id;
                            $scope.deletedTrainingType.org_id = $scope.user.org_id
                            $scope.deletedTrainingType.training_type_id = $rootScope.training_type_id;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };


    };

    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('trainingTypeCtrl', controller);
}());
