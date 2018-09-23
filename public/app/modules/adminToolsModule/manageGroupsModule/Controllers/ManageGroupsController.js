(function () {
    var controller = function ($scope, constantService, $state, $filter, coreService, manageGroupsService, $uibModal, uiGridExporterConstants, coreReportService) {

        $scope.user = coreService.getUser();
        $scope.permissions = coreService.getPermissions();
        // groups
        $scope.ManageGroupsOptions = coreService.getGridOptions();
        $scope.ManageGroupsOptions.exporterCsvFilename = 'group_users.csv';
        $scope.ManageGroupsOptions.columnDefs = [
            {
                name: 'group_name',
                minWidth: 150,
                // categoryDisplayName: 'group_name',
                displayName: 'User Group',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'employee_names',
                minWidth: 150,
                displayName: 'Group Members',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'description',
                minWidth: 250,
                displayName: 'Overview of Group Role',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'creation_date',
                minWidth: 150,
                categoryDisplayName: 'Creation Date',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'is_active',
                minWidth: 90,
                categoryDisplayName: 'Status',cellTooltip: true, headerTooltip: true
            }
        ];
        $scope.ManageGroupsOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        var init = function(){
            var data = {
                org_id : $scope.user.org_id
            };
            manageGroupsService.getGroupsGrid(data)
            .then(function(response){
                $scope.ManageGroupsOptions.data = response.data;
                console.log($scope.ManageGroupsOptions.data);
            }, function(error){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
        init();

        $scope.$watch(function(){
            if($scope.gridApi)
                return $scope.gridApi.selection.getSelectedRows();
        }, function(newVal){
            console.log(newVal);
            if(newVal){
                $scope.selectedRecord = $scope.gridApi.selection.getSelectedRows()[0];
                console.log($scope.selectedRecord);
            }
        }, true);
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
        // $scope.downloadPDF = function () {
        //     $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        // }
        $scope.deleteGroup = function(){
            coreService.resetAlert();
            var data = {};
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
                    if (result === 'ok') {
                        var index = $scope.ManageGroupsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                        data.group = $scope.gridApi.selection.getSelectedRows()[0];
                        console.log(data)
                        manageGroupsService.deleteGroup(data)
                            .then(function (response) {
                            console.log(response);
                                if (response.data == 'has users') {
                                    coreService.setAlert({type: 'error', message: constantService.getMessage('grouphasusers')});
                                }
                                if (response.data === 1) {
                                    $scope.ManageGroupsOptions.data.splice(index, 1);
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
        $scope.activateGroup = function(){
            coreService.resetAlert();
            var data = {};
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $scope.ManageGroupsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                data.group = $scope.gridApi.selection.getSelectedRows()[0];
                console.log(data)
                manageGroupsService.activateGroup(data)
                    .then(function (response) {
                        if (response.data === 1) {
                            $scope.ManageGroupsOptions.data[index].is_active = 'Active';
                            coreService.setAlert({type: 'success', message: constantService.getMessage('activeRecord')});
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
        $scope.deactivateGroup = function(){
            coreService.resetAlert();
            var data = {};
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $scope.ManageGroupsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                data.group = $scope.gridApi.selection.getSelectedRows()[0];
                console.log(data)
                manageGroupsService.deactivateGroup(data)
                    .then(function (response) {
                        if (response.data === 1) {
                            $scope.ManageGroupsOptions.data[index].is_active = 'Inactive';
                            coreService.setAlert({type: 'success', message: constantService.getMessage('deactiveRecord')});
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
        $scope.openUsersPopUp = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var data = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id,
                    group_id: $scope.gridApi.selection.getSelectedRows()[0].group_id
                };
                manageGroupsService.getOrgEmployeesNotHaveGroup(data)
                    .then(function (response) {
                        var msg = {
                            title: "Assign a user to this group:",
                            body: "Choose a user:",
                            users: response.data,
                            group: $scope.gridApi.selection.getSelectedRows()[0]
                        };
                        var modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/adminToolsModule/manageGroupsModule/views/assignUsers.html',
                            controller: 'AssignUsersController',
                            backdrop: 'static',
                            resolve: {
                                msg: msg
                            }
                        });
                        modalInstance.result.then(function (result) {
                            console.log(result)
                            if (result === 'ok') {
                                init();
                            }
                        }, function () {
                            console.log('modal-component dismissed at: ' + new Date());
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
        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'groups'};
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
        $scope.editGroup = function(){
            coreService.resetAlert();
            var data = {};
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $state.go('editGroup', {selectedGroup: $scope.gridApi.selection.getSelectedRows()[0]});
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        // $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        //     if (col.filters[0].term) {
        //         return 'header-filtered';
        //     } else {
        //         return '';
        //     }
        // };
        // $scope.groups = {
        //     paginationPageSizes: [10, 20, 30],
        //     paginationPageSize: 10,
        //     enableColumnResizing: true,
        //     enableFiltering: true,
        //     columnDefs: [
        //         {
        //             name: 'UserGroup',
        //             minWidth: 150,
        //             categoryDisplayName: 'address',
        //             displayName: 'User Group'
        //         },
        //         {
        //             name: 'GroupMembers',
        //             minWidth: 150,
        //             displayName: 'Group Members'
        //         },
        //         {
        //             name: 'OverPointGroup',
        //             minWidth: 250,
        //             displayName: 'OverPoint of Group Role'
        //         },
        //         {
        //             name: 'CreationDate',
        //             minWidth: 150,
        //             categoryDisplayName: 'Creation Date'
        //         },
        //         {
        //             name: 'Status',
        //             minWidth: 90,
        //             categoryDisplayName: 'Status'
        //         }
        //         ],
        //     enableGridMenu: false,
        //     enableSelectAll: false,
        //     exporterMenuPdf: false,
        //     exporterMenuCsv: false,
        //     exporterCsvFilename: 'myFile.csv',
        //     exporterPdfDefaultStyle: {
        //         fontSize: 9
        //     },
        //     exporterPdfTableStyle: {
        //         margin: [30, 30, 30, 30]
        //     },
        //     exporterPdfTableHeaderStyle: {
        //         fontSize: 10,
        //         bold: true,
        //         italics: true,
        //         color: 'red'
        //     },
        //     exporterPdfHeader: {
        //         text: "My Header",
        //         style: 'headerStyle'
        //     },
        //     exporterPdfFooter: function (currentPage, pageCount) {
        //         return {
        //             text: currentPage.toString() + ' of ' + pageCount.toString(),
        //             style: 'footerStyle'
        //         };
        //     },
        //     exporterPdfCustomFormatter: function (docDefinition) {
        //         docDefinition.styles.headerStyle = {
        //             fontSize: 22,
        //             bold: true
        //         };
        //         docDefinition.styles.footerStyle = {
        //             fontSize: 10,
        //             bold: true
        //         };
        //         return docDefinition;
        //     },
        //     exporterPdfOrientation: 'portrait',
        //     exporterPdfPageSize: 'LETTER',
        //     exporterPdfMaxGridWidth: 500,
        //     exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        //     onRegisterApi: function (gridApi) {
        //         $scope.gridApi = gridApi;
        //     }
        // };




        // // get data
        // var data = [
        //     {
        //         "UserGroup": "Administration",
        //         "GroupMembers": "Rasha,Hossam",
        //         "OverPointGroup": "Abcanada Internal Admin",
        //         "CreationDate": "2018-01-15 11:30:20",
        //         "Status": "Active"
        //         },
        //     {
        //         "UserGroup": "Demo Members",
        //         "GroupMembers": "John,Adams",
        //         "OverPointGroup": "Members",
        //         "CreationDate": "2018-01-17 10:35:15",
        //         "Status": "Active"
        //         }, {
        //         "UserGroup": "Administration",
        //         "GroupMembers": "Rasha,Hossam",
        //         "OverPointGroup": "Abcanada Internal Admin",
        //         "CreationDate": "2018-01-15 11:30:20",
        //         "Status": "Active"
        //         },
        //     {
        //         "UserGroup": "Demo Members",
        //         "GroupMembers": "John,Adams",
        //         "OverPointGroup": "Members",
        //         "CreationDate": "2018-01-17 10:35:15",
        //         "Status": "Active"
        //         }
        //     ];

        // $scope.groups.showGridFooter = true;
        // $scope.groups.showColumnFooter = true;
        // $scope.groups.data = data;

    };
    controller.$inject = ['$scope','constantService', '$state', '$filter', 'coreService','manageGroupsService', '$uibModal', 'uiGridExporterConstants', 'coreReportService'];
    angular.module('manageGroupsModule').controller('ManageGroupsController', controller);
}());