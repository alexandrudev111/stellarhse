(function () {
    var controller = function ($scope, constantService, manageNotificationService, $state, $filter, coreService, uiGridExporterConstants, $uibModal, $confirm) {
        
      
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.user = coreService.getUser();
        if (!$scope.user)
            $state.go('login');
        $scope.reportTypes = [
            {id: 'hazard', name: 'Hazard ID'},
            {id: 'incident', name: 'Incident'},
            {id: 'inspection', name: 'Inspection'},
            {id: 'safetymeeting', name: 'Safety Meeting'},
            {id: 'maintenance', name: 'Maintenance'},
            {id: 'training', name: 'Training'}
        ];
        $scope.choosedReportType = 'incident';

        $scope.ManageNotificationOptions = coreService.getGridOptions();
        $scope.ManageNotificationOptions.exporterCsvFilename = 'notifications.csv';
        $scope.ManageNotificationOptions.columnDefs = [
            {name: 'group_name', minWidth: 150, displayName: 'Group Name',cellTooltip: true, headerTooltip: true},
            {name: 'employee_name', minWidth: 150, displayName: 'Individual Name',cellTooltip: true, headerTooltip: true},
            {name: 'position', minWidth: 150, displayName: 'Position',cellTooltip: true, headerTooltip: true},
            {name: 'report_type', minWidth: 150, displayName: 'Report Type',cellTooltip: true, headerTooltip: true},
            {name: 'assigned_notifications', minWidth: 150, displayName: 'Notification Filters',cellTooltip: true, headerTooltip: true},
            {name: 'email_type_name', minWidth: 150, displayName: 'Scope',cellTooltip: true, headerTooltip: true},
            {name: 'last_sent_date', minWidth: 150, displayName: 'last notification sent',cellTooltip: true, headerTooltip: true},
            {name: 'creation_date', minWidth: 150, displayName: 'Date created',cellTooltip: true, headerTooltip: true},
            {name: 'last_update_date', minWidth: 150, displayName: 'Last updated',cellTooltip: true, headerTooltip: true}
            // {name: 'days_start', minWidth: 150, displayName: 'Number of days after expiry'},
            // {name: 'days_freq', minWidth: 150, displayName: 'Frequency of email reminder (days)'},
            // {name: 'days_start_inc', minWidth: 150, displayName: 'Number of days from Incident Date'},
            // {name: 'days_freq_inc', minWidth: 150, displayName: 'Frequency of email reminder (days)'},
        ];
        $scope.ManageNotificationOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
//         var notification_params = {
//             IncidentParameters: {
//                 org_id: $scope.user.org_id,
//                 page: 1,
// //                limit: 10,
//                 sortOrder: 'desc',
//                 index: 'employee_name',
// //                Export: false
//             }
//         };
        $scope.getNotifications = function () {
            // var x2js = new X2JS();
            // var xml = x2js.json2xml_str(notification_params);
            var data = {
                org_id: $scope.user.org_id
                // xml: xml,
                // reportType: $scope.choosedReportType
            };
            // console.log(xml);
            manageNotificationService.getNotifications(data)
                    .then(function (response) {
                        console.log(response.data);
                        $scope.ManageNotificationOptions.data = response.data;
                    }, function (error) {
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getNotifications();

        $scope.deleteNotification = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
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
                    console.log(result)
                    if (result === 'ok') {
                        console.log($scope.gridApi.selection.getSelectedRows()[0])
                        var index = $scope.ManageNotificationOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                        console.log(index)
                        var data = {
                            report_type_code: $scope.gridApi.selection.getSelectedRows()[0].report_type_code,
                            org_id: $scope.gridApi.selection.getSelectedRows()[0].org_id,
                            notification_trigger_number: $scope.gridApi.selection.getSelectedRows()[0].notification_trigger_number
                        };
                        // data.fieldValue = $scope.gridApi.selection.getSelectedRows()[0];
                        console.log(data)
                        manageNotificationService.deleteNotification(data)
                                .then(function (response) {
                                    if (response.data.row1 >= 1 || response.data.row2 >= 1) {
                                        $scope.ManageNotificationOptions.data.splice(index, 1);
                                        coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
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

        $scope.editNotification = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $state.go('editNotification', {selectedRow: $scope.gridApi.selection.getSelectedRows()[0]});
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.downloadCSV = function (gridNumber) {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        };
        $scope.downloadPDF = function (gridNumber) {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };
    };
    controller.$inject = ['$scope', 'constantService', 'manageNotificationService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$uibModal', '$confirm'];
    angular.module('manageNotificationModule')
            .controller('ManageNotificationController', controller);
}());
