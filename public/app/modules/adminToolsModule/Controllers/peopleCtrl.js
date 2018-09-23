(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q) {
        $scope.peopleLabels = {};
        $scope.frmlabels = constantService.getManagePeopleFormLabels();
        angular.forEach($scope.frmlabels, function (value, key) {
            $scope.peopleLabels[key] = value;
        });
        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.multiSelect = true;
        $scope.gridOptions.exporterCsvFilename = 'managePeople.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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
            if (coreService.getCurrentState() === "ManagePeople") {
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $rootScope.updated_by = $scope.user.employee_id;
                $rootScope.org_id = $scope.user.org_id;
                $rootScope.language_id = $scope.user.language_id;
                post = {org_id: $scope.user.org_id, language_code: $scope.user.language_code};
                customersService.getOrgPeople(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'first_name', displayName: 'First Name', cellTooltip: true, headerTooltip: true, orderable: true},
                        {name: 'last_name', displayName: 'last Name', cellTooltip: true, headerTooltip: true},
                        {name: 'position', displayName: 'Position', cellTooltip: true, headerTooltip: true},
                        {name: 'email', displayName: 'Email Address', cellTooltip: true, headerTooltip: true},
                        {name: 'primary_phone', displayName: 'Phone', cellTooltip: true, headerTooltip: true},
                        {name: 'alternate_phone', displayName: 'Alternate phone', cellTooltip: true, headerTooltip: true},
                        {name: 'company', displayName: 'Company', cellTooltip: true, headerTooltip: true},
                        {name: 'classification_name', displayName: 'Clssification', cellTooltip: true, headerTooltip: true},
                        {name: 'group_name', displayName: 'User Group', cellTooltip: true, headerTooltip: true},
                        {name: 'emp_is_active', displayName: 'Status', cellTooltip: true, headerTooltip: true}
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

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'employee'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];

                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'peopleCtrl',
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

        $scope.activePeople = function () {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                post = [{org_id: $rootScope.org_id, updated_by_id: $rootScope.updated_by}];
                angular.forEach($scope.gridApi.selection.getSelectedRows(), function (value, key) {
                    post.push(value.employee_id);
                });
                customersService.activePeople(post).then(function (response) {
                    if (response.data.activiation_history) {
                        $state.reload();
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

        $scope.inActivePeople = function () {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                post = [{org_id: $rootScope.org_id, updated_by_id: $rootScope.updated_by}];
                angular.forEach($scope.gridApi.selection.getSelectedRows(), function (value, key) {
                    post.push({
                        employee_id: value.employee_id,
                        group_id: value.group_id
                    });

                });
                customersService.inActivePeopleFun(post).then(function (response) {
                    if (response.data.inActiviation_history) {
                        $state.reload();
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

        $scope.groupAssign = function () {
            if ($scope.gridApi.selection.getSelectedRows().length) {
                console.log("Inside group assign");
                console.log($scope.gridApi.selection.getSelectedRows()[0].group_name);
                var group_name = $scope.gridApi.selection.getSelectedRows()[0].group_name;
                if (group_name === "" || group_name === "No access" || group_name === "Notifications only") {
                    coreService.setAlert({type: 'error', message: "Sorry you can't  be reassigned until you create user account "});
                } else {
                    post = {org_id: $rootScope.org_id, updated_by_id: $rootScope.updated_by, lang_id: $rootScope.language_id};
                    inactive_people = [];
                    active_people = [];
                    angular.forEach($scope.gridApi.selection.getSelectedRows(), function (value, key) {
                        if (value.emp_status === '0') {
                            inactive_people.push(value.first_name + ' ' + value.last_name);
                        } else {
                            active_people.push(value);
                        }
                    });
                    $scope.active_people = active_people;
                    $scope.inactive_people = inactive_people;
                    customersService.getActiveGroupsByOrgId(post).then(function (response) {
                        if (response.data) {
                            $scope.msgTitle = constantService.getMessage('reassign_user');
                            $scope.group_active = response.data;
                            $scope.selectedGroup = {};
                            $scope.$uibModalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'app/modules/adminToolsModule/views/activeGroups.html',
                                controller: 'peopleCtrl',
                                scope: $scope,
                                resolve: {
                                    item: function () {
                                        $scope.selectedGroup.group_id = $scope.group_active[0].group_id;
                                    }}
                            });
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance1)) {
                $scope.$uibModalInstance1.close('cancel');
            }
        };

        $scope.assignReassignFunc = function () {

            if ($scope.selectedGroup) {
                post = [{org_id: $rootScope.org_id, updated_by_id: $rootScope.updated_by, new_group_id: $scope.selectedGroup.group_id}];
                angular.forEach($scope.active_people, function (value, key) {
                    post.push(value);
                });
                customersService.assignReassignGroup(post).then(function (response) {
//                    console.log(response);
                    $scope.$uibModalInstance.close('cancel');
                    $scope.msgBody = '';
                    if (response.data !== '' || $scope.inactive_people.length) {
                        $scope.msgTitle = constantService.getMessage('notification');
                        if ($scope.inactive_people.length) {
                            $scope.msgBody += constantService.getMessage('reactive_msg');
                            angular.forEach($scope.inactive_people, function (value, key) {
                                $scope.msgBody += '<br/>' + value;
                            });
                        }
                        if (response.data !== '') {
                            $scope.msgBody += '<br/><br/><br/>';
                            $scope.msgBody += constantService.getMessage('activate_account');
                            $scope.msgBody += '<br/>' + response.data.ret;
                        }
                        $scope.$uibModalInstance1 = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/adminToolsModule/views/help.html',
                            controller: 'peopleCtrl',
                            scope: $scope
                        });
                        $uibModalInstance.close('ok');
                    }
//                    $scope.$uibModalInstance1.close('cancel');
                    // $state.reload();
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        };

        $scope.addPeople = function () {
            $rootScope.isNewPeople = true;
            $rootScope.org_id = '';
            $rootScope.selectedRow = '';
            $state.go('addPeople');
        };

        $scope.editPeople = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length === 1) {
                $rootScope.employee_id = $scope.gridApi.selection.getSelectedRows()[0]['employee_id'];
                $rootScope.selectedRowEmployee = $scope.gridApi.selection.getSelectedRows()[0];
                if ($rootScope.selectedRowEmployee.group_id !== '') {
                    $rootScope.selectedRowEmployee.check_ques = 'yes';
                    $rootScope.selectedRowEmployee.user_account = true;
                } else {
                    $rootScope.selectedRowEmployee.check_ques = 'no';
                    $rootScope.selectedRowEmployee.user_account = false;
                }
                console.log($rootScope.selectedRowEmployee);
                $rootScope.isNewPeople = false;
                $state.go('addPeople');
            } else if ($scope.gridApi.selection.getSelectedRows().length < 1) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            } else if ($scope.gridApi.selection.getSelectedRows().length > 1) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('multibleRowNoSelect')});
            }
        };

        $scope.deletePeople = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.employee_id = $scope.gridApi.selection.getSelectedRows()[0]['employee_id'];
                $scope.$uibModalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/adminToolsModule/views/deleteEmployee.html',
                    controller: 'peopleCtrl',
                    scope: $scope,
                    resolve: {
                        item: function () {
                            $scope.deletedThirdParty = {};
                            $scope.deletedThirdParty.editing_by = coreService.getUser().employee_id;
                            $scope.deletedThirdParty.org_id = $scope.user.org_id;
                            $scope.deletedThirdParty.third_party_id = $rootScope.third_party_id;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.deleteEmpFun = function () {
            var people_data = {
                employee_id: $scope.gridApi.selection.getSelectedRows()[0]['employee_id'],
                org_id: $scope.user.org_id,
                group_id: $scope.gridApi.selection.getSelectedRows()[0]['group_id'],
                updated_by: $scope.user.employee_id
            };

            customersService.deletePeopleFunction(people_data)
                    .then(function (response) {
                        console.log(response);
                        if (response.data.hasOwnProperty('success') == true) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: "The person has been deleted successfully"});
                            $state.reload();
                        } else if (response.data.hasOwnProperty('success') == false) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'error', message: "This person cannot be deleted because he/she is referenced elsewhere in the system (e.g., he/she might have created or edited  reports)."});
                        }

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.peopleHistory = function () {
            $rootScope.org_id = null;
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
            }

            $state.go('peoplehistory');
        };

        // change organization Admin icon "set As Admin"       
        $scope.setAdmin = function () {
            console.log("ay 7aga");
            if ($scope.gridApi.selection.getSelectedRows().length) {
                console.log($scope.gridApi.selection.getSelectedRows()[0]);
                console.log($scope.gridApi.selection.getSelectedRows()[0].group_name);
                group_name = $scope.gridApi.selection.getSelectedRows()[0].group_name;
                var org_id = $rootScope.org_id;
                $scope.user_id = $scope.gridApi.selection.getSelectedRows()[0]['employee_id'];

                $scope.org_name = $scope.user.org_name;
                var isActive = $scope.gridApi.selection.getSelectedRows()[0].emp_is_active;

                if (isActive === "Active") {
                    if (group_name === "" || group_name === "No access" || group_name === "Notifications only") {
                        $msg = "Sorry, this feature is not available for members of " + group_name + " group.";
                        coreService.setAlert({type: 'error', message: $msg});
                    } else {
                        post = {org_id: org_id};
                        customersService.getAdminName(post).then(function (response) {
                            console.log(response);
                            $scope.admin_name = response.data[0].admin_name;
                            console.log("I am the admin " + $scope.admin_name);
                            checkAdminChange();

                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }
                } else {
                    $msg = "Sorry, this feature is not available for inactive members";
                    coreService.setAlert({type: 'error', message: $msg});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };


        var checkAdminChange = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'setadminconfirmation'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];
                    console.log($scope.msgTitle);
                    console.log($scope.msgBody);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/setAsAdminPopUp.html',
                        controller: 'editAdminPopUpCtrl',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };





    };

    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];
    angular.module('adminModule')
            .controller('peopleCtrl', controller);
}());
