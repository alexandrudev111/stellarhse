(function () {
    var controller = function ($scope, coreService, $q, manageGroupsService, $filter, $uibModal, constantService, $state) {
        var firstLoad = false;
        $scope.user = coreService.getUser();
        $scope.groupInfo = {
            org_id : $scope.user.org_id,
            language_id : $scope.user.language_id,
            group_name: '',
            description: '',
            group_type_id: '',
            moduleTypes: [],
            defaultPermissions: [],
            users: []
        };
        $scope.chooseModule = function(){
            if(firstLoad){
                $scope.groupInfo.moduleTypes = $filter('filter')($scope.moduleTypes, {checked: true});
            }else{
                $scope.oldProducts = angular.copy($scope.groupInfo.moduleTypes);
                $scope.general = angular.copy($scope.groupInfo.general);
                $scope.groupInfo.moduleTypes = $filter('filter')($scope.moduleTypes, {checked: true});
            }
            console.log($scope.groupInfo.moduleTypes);
            var data = {
                language_id : $scope.user.language_id,
                products: $scope.groupInfo.moduleTypes
            };
            manageGroupsService.getProductsPermissions(data)
                .then(function(response){
                    $scope.groupInfo.general = response.data.general;
                    $scope.groupInfo.moduleTypes = response.data.products;
                    console.log($scope.groupInfo.moduleTypes);
                }, function(error){
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        var init = function(){
            var data = {
                org_id : $scope.user.org_id,
                language_id : $scope.user.language_id
            };
            $q.all([
                manageGroupsService.getGroupTypes(data),
                manageGroupsService.getModuleTypes(data),
                manageGroupsService.getDefaultPermissions(data)
            ])
            .then(function(queues){
                $scope.groupTypes = queues[0].data;
                $scope.moduleTypes = queues[1].data;
                $scope.groupInfo.defaultPermissions = queues[2].data;
                angular.forEach($scope.groupInfo.defaultPermissions, function(permission){
                    permission.checked = true;
                });
                console.log(queues);
            }, function(errors){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
                coreService.setAlert({type: 'exception', message: errors[2].data});
            });
        };
        init();

        $scope.ManageGroupUsersOptions = coreService.getGridOptions();
        $scope.ManageGroupUsersOptions.exporterCsvFilename = 'group_users.csv';
        $scope.ManageGroupUsersOptions.columnDefs = [
            {
                name: 'first_name',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'First Name',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'last_name',
                minWidth: 150,
                displayName: 'Last Name',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'user_name',
                minWidth: 150,
                categoryDisplayName: 'User Name',cellTooltip: true, headerTooltip: true
            }
            // {
            //     name: 'emp_isactive',
            //     minWidth: 150,
            //     displayName: 'Is Active'
            // }
        ];
        $scope.ManageGroupUsersOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $scope.applyCategoryCheck = function(category){
            console.log(category);
            angular.forEach(category.permissions, function(permission){
                permission.checked = category.checked;
                if(permission.hasOwnProperty('children'))
                    angular.forEach(permission.children, function(child){
                        child.checked = permission.checked;
                    });
            });
        };
        $scope.applyPermissionCheck = function(module, permission){
            console.log(permission);
            if(permission.hasOwnProperty('children'))
                angular.forEach(permission.children, function(child){
                    child.checked = permission.checked;
                });
            if(permission.permission_code === 'readonlyallreport')
                if(permission.checked){
                    angular.forEach(module.permissions_categories, function(category){
                        if(category.permission_category_code !== 'readonlyallreports' && 
                        category.permission_category_code !== 'limitdataaccess' && 
                        category.permission_category_code !== 'default_data_tables'){
                        category.disabled = true;
                            angular.forEach(category.permissions, function(permission){
                                permission.disabled = true;
                            });
                        }
                    });
                }else{
                    angular.forEach(module.permissions_categories, function(category){
                        if(category.permission_category_code !== 'readonlyallreports' && 
                        category.permission_category_code !== 'limitdataaccess' && 
                        category.permission_category_code !== 'default_data_tables'){
                        category.disabled = false;
                            angular.forEach(category.permissions, function(permission){
                                permission.disabled = false;
                            });
                        }
                    });
                }
        };
        $scope.openUsersPopUp = function(){
            coreService.resetAlert();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            manageGroupsService.getOrgEmployeesNotHaveGroup(data)
                .then(function (response) {
                    var msg = {
                        title: "Assign a user to this group:",
                        body: "Choose a user:",
                        group_name: $scope.groupInfo.group_name,
                        users: response.data
                    };
                    console.log(response.data);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/manageGroupsModule/views/assignUsers.html',
                        controller: 'AddUsersController',
                        backdrop: 'static',
                        resolve: {
                            msg: msg
                        }
                    });
                    modalInstance.result.then(function (result) {
                        console.log(result)
                        console.log($scope.ManageGroupUsersOptions.data.indexOf(result.user_name))
                        if (result !== 'cancel') {
                            var userAdded = false;
                            angular.forEach($scope.ManageGroupUsersOptions.data, function(user){
                                if(user.user_name === result.user_name){
                                    coreService.setAlert({type: 'error', message: 'This user is added before'});
                                    userAdded = true;
                                }
                            });
                            if(!userAdded)
                                $scope.ManageGroupUsersOptions.data.push(result);
                            // init();
                        }
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.removeUser = function(){
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
                        var index = $scope.ManageGroupUsersOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                        $scope.ManageGroupUsersOptions.data.splice(index, 1);
                        coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        
        $scope.submitGroup = function(){
            $scope.groupInfo.users = $scope.ManageGroupUsersOptions.data;
            manageGroupsService.submitGroup($scope.groupInfo)
            .then(function(response){
                // $scope.groupInfo.moduleTypes = response.data;
                console.log(response.data);
                $state.go('ManagePeople', {grid: 'user_groups'});
            }, function(error){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
        $scope.cancel = function(){
            $state.go('ManagePeople', {grid: 'user_groups'});
        }
        // $scope.$watch("", function(newVal, oldVal){

        // }, true);
    };
    controller.$inject = ['$scope','coreService', '$q', 'manageGroupsService', '$filter', '$uibModal', 'constantService', '$state'];
    angular.module('manageGroupsModule').controller('AddGroupController', controller);
}());