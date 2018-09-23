/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {
    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants,$filter, $uibModal, coreService, uiGridExporterConstants, $q) {

        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'Customers.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $rootScope.org_id = '';
        $rootScope.selectedRow = '';
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
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
            if (coreService.getCurrentState() === "customers") {
                $scope.module = coreService.getCurrentState();
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                var post = {language_code: $scope.user.language_code, org_id: $scope.user.org_id};
                customersService.getCustomers(post).then(function (response) {
                    $scope.gridOptions.columnDefs = [
                        {name: 'org_name', displayName: 'Name', cellTooltip: true, headerTooltip: true},
                        {name: 'address', displayName: 'Address', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'city_name', displayName: 'City', cellTooltip: true, headerTooltip: true},
                        {name: 'postal_code', displayName: 'Postal/Zip Code', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'mailing_address', displayName: 'Mailing Address', cellTooltip: true, headerTooltip: true},
                        {name: 'email', displayName: 'Email Address', cellTooltip: true, headerTooltip: true},
                        {name: 'billing_city_name', displayName: 'Billing City', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'billing_postal_code', displayName: 'Postal/Zip Code', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'isactive', displayName: 'Status', cellTooltip: true, headerTooltip: true},
                        {name: 'showcustomer', displayName: 'Show Customer', cellTooltip: true, headerTooltip: true, visible: false},
                        {name: 'system_admin_name', displayName: 'System Administrator', cellTooltip: true, headerTooltip: true},
                        {name: 'last_update_date', displayName: 'Updated Date', cellTooltip: true, headerTooltip: true}
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

            $scope.openAddCustomer = function () {
                $rootScope.isNew = true;
                $rootScope.org_id = '';
                $rootScope.selectedRow = '';
                $state.go('addCustomer');
            }

            $scope.editCustomer = function () {
                coreService.resetAlert();
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                    $rootScope.selectedRow = $scope.gridApi.selection.getSelectedRows()[0];
                    $rootScope.isNew = false;
                    $state.go('addCustomer');
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            }

            $scope.openHelp = function () {
                coreService.resetAlert();
                var post = {language_id: $scope.user.language_id, alert_message_code: 'customer'};
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

            $scope.setupCustomerAdmin = function () {
                coreService.resetAlert();
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                    $rootScope.system_admin_id = $scope.gridApi.selection.getSelectedRows()[0]['system_admin_id'];
                    console.log('$rootScope.system_admin_id : ' + $rootScope.system_admin_id);
                    customersService.checkSystemAdmin($rootScope.org_id).then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            console.log(response.data);
                            if (response.data == 'AdminForm') {
                                $scope.addCompanyAdmin();
                            }
                            else if (response.data == 'UserForm') {
                                $scope.AddNewOrgUser();
                            }
                            else {
                                $scope.changeCompanyAdmin();
                            }

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
            $scope.AddNewOrgUser = function () {
                $q.all([
                    customersService.getActiveEmployees($rootScope.org_id),
                    customersService.getOrgGroups($rootScope.org_id),
                    customersService.statuslist($scope.user.language_id)
                ]).then(function (queues) {
                    $scope.orgemployees = queues[0].data;
                    $scope.grouplist = queues[1].data;
                    $scope.statuslist = queues[2].data;
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/addUser.html',
                        controller: 'customersCtrl',
                        scope: $scope,
                        resolve: {
                            item: function () {
                                $scope.selectedAdmin = {};
                                var admin = {
                                    employee_id: '',
                                    org_id: $rootScope.org_id,
                                    creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    created_by: $scope.user.employee_id,
                                    updated_by_id: $scope.user.employee_id,
                                    direct_access_code: '',
                                    group_id: $scope.grouplist[0].group_id,
                                    is_active: '1'
                                };
                                $scope.selectedAdmin = admin;
                            }
                        }
                    });
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                });
            }

            $scope.addCompanyUser = function () {
                console.log($scope.selectedAdmin);
                customersService.addOrgUser($scope.selectedAdmin).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.cancel();
                        $state.reload();
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }

            $scope.changeCompanyAdmin = function () {
                customersService.getActiveUsers($rootScope.org_id).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.orgemployees = response.data;
                        $scope.$uibModalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/adminToolsModule/views/addCompanyAdmin.html',
                            controller: 'customersCtrl',
                            scope: $scope,
                            resolve: {
                                item: function () {
                                    $scope.selectedAdmin = {};
                                    var admin = {
                                        employee_id: $rootScope.system_admin_id,
                                        org_id: $rootScope.org_id,
                                        creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                        created_by: $scope.user.employee_id,
                                        updated_by_id: $scope.user.employee_id
                                    };
                                    $scope.selectedAdmin = admin;
                                }
                            }
                        });
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }

            $scope.setupCompanyAdmin = function () {
                console.log($scope.selectedAdmin);
                customersService.setupCompanyAdmin($scope.selectedAdmin).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.cancel();
                        $state.reload();
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }

            $scope.addCompanyAdmin = function () {
                $q.all([
                    coreService.getUuid(),
                    coreService.getcountry(),
                    customersService.getOrgGroups($rootScope.org_id),
                    customersService.statuslist($scope.user.language_id)
                ]).then(function (queues) {
                    $scope.countries = queues[1].data;
                    $scope.grouplist = queues[2].data;
                    $scope.statuslist = queues[3].data;
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/companyadmin.html',
                        controller: 'addCustomerCtrl',
                        scope: $scope,
                        resolve: {
                            item: function () {
                                $scope.selectedAdmin = {};
                                var admin = {
                                    employee_id: queues[0].data.success,
                                    group_id: $scope.grouplist[0].group_id,
                                    first_name: '',
                                    last_name: '',
                                    org_id: $rootScope.org_id,
                                    country_id: $scope.countries[0].country_id,
                                    province_id: '',
                                    city_id: '',
                                    address: '',
                                    postal_code: '',
                                    creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    email: '',
                                    created_by: $scope.user.employee_id,
                                    is_active: '1',
                                    area: '',
                                    primary_phone: '',
                                    alternate_phone: '',
                                    position: '',
                                    department: '',
                                    company: '',
                                    updated_by_id: $scope.user.employee_id
                                };
                                $scope.selectedAdmin = admin;
                            }
                        }
                    });
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                });
            }

            $scope.saveCompanyAdmin = function () {
                console.log($scope.selectedAdmin);
                customersService.addCustomerAdminEmail($scope.selectedAdmin)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                console.log(response.data.found);
                                if (response.data.found) {
                                    // email found in db                            
                                    $scope.$uibModalInstance2 = $uibModal.open({
                                        animation: $scope.animationsEnabled,
                                        templateUrl: 'app/modules/adminToolsModule/views/reAssign.html',
                                        controller: 'addCustomerCtrl',
                                        scope: $scope,
                                        resolve: {
                                            item: function () {
                                                $scope.selectedEmployee = response.data.employeeinfo[0];
                                            }
                                        }
                                    });
                                } else {
                                    $scope.cancel();
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: constantService.getMessage('add_admin')});
                                    $state.go('customers');
                                }
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }

            $scope.assignAdminToCompany = function () {
                console.log($scope.selectedAdmin);
                var post = {
                    org_id: $scope.selectedAdmin.org_id,
                    group_id: $scope.selectedAdmin.group_id,
                    employee_id: $scope.selectedEmployee.employee_id,
                    department: $scope.selectedEmployee.department,
                    company: $scope.selectedEmployee.company,
                    direct_access_code: $scope.selectedEmployee.direct_access_code,
                    updated_by_id: $scope.user.employee_id
                };
                customersService.assignAdminToCompany(post)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.cancel();
                                coreService.resetAlert();
                                coreService.setAlert({type: 'success', message: constantService.getMessage('add_admin')});
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }

            $scope.$watch('selectedAdmin.country_id', function (newVal, oldVal) {
                if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                    getprovince(newVal);
                }
            });
            $scope.$watch('selectedAdmin.province_id', function (newVal, oldVal) {
                if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                    getcity(newVal);
                }
            });
            var getprovince = function (country_id, arrayFrom) {
                coreService.getprovince(country_id)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.provinces = response.data;
                                if (response.data[0].length)
                                    $scope.selectedAdmin.province_id = response.data[0].province_id;
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }

            var getcity = function (province_id, arrayFrom) {
                coreService.getcity(province_id)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.cities = response.data;
                                if (response.data[0].length)
                                    $scope.selectedAdmin.city_id = response.data[0].city_id;
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }

            $scope.editCustomerAdmin = function () {
                coreService.resetAlert();
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                    $rootScope.system_admin_id = $scope.gridApi.selection.getSelectedRows()[0]['system_admin_id'];
                    if ($rootScope.system_admin_id != '' && $rootScope.system_admin_id != null) {
                        $scope.number_valid = constantService.getMessage('number_valid');
                        $scope.checkEmail = constantService.getMessage('checkEmail');
                        var post = {org_id: $rootScope.org_id, employee_id: $rootScope.system_admin_id};
                        $q.all([
                            customersService.getOrgAdminInfo(post),
                            coreService.getcountry(),
                            customersService.getOrgGroups($rootScope.org_id),
                            customersService.statuslist($scope.user.language_id)
                        ]).then(function (queues) {
                            $scope.countries = queues[1].data;
                            $scope.grouplist = queues[2].data;
                            $scope.statuslist = queues[3].data;
                            $scope.$uibModalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'app/modules/adminToolsModule/views/editCustomerAdmin.html',
                                controller: 'addCustomerCtrl',
                                scope: $scope,
                                resolve: {
                                    item: function () {
                                        $scope.selectedAdmin = queues[0].data;
                                    }
                                }
                            });
                        }, function (errors) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: errors[0].data});
                            coreService.setAlert({type: 'exception', message: errors[1].data});
                            coreService.setAlert({type: 'exception', message: errors[2].data});
                        });
                    } else {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'info', message: constantService.getMessage('orgadmin_valid')});
                    }
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            };
            $scope.updateCompanyAdmin = function () {
                $scope.selectedAdmin.updated_by_id = $scope.user.employee_id;
                customersService.updateCompanyAdmin($scope.selectedAdmin).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        if (response.data.success == 2 || response.data.success == '2') {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'error', message: constantService.getMessage('duplicate_email')});
                        } else {
                            $scope.cancel();
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: constantService.getMessage('update_admin')});
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }

            $scope.deleteCustomer = function () {
                coreService.resetAlert();
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                    var msg = {
                        title: constantService.getMessage('delete_confirm_title'),
                        body: constantService.getMessage('delete_company')
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
                            $scope.selectedAdmin = {};
                            var org = {
                                org_id: $rootScope.org_id,
                                updated_by_id: $scope.user.employee_id
                            };
                            $scope.selectedOrg = org;
                            $scope.deleteCompany();
                        }
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            };
            $scope.deleteCompany = function () {
                customersService.deleteCustomer($scope.selectedOrg).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $state.reload();
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
            $scope.openCustomerHistory = function () {
                $rootScope.org_id = null;
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                }

                $state.go('customerhistory');
            };
        };
    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q'];

    angular.module('adminModule')
            .controller('customersCtrl', controller);
}());

