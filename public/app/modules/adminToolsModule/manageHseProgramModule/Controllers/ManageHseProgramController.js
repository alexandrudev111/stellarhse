(function () {
    var controller = function ($scope, Upload, $timeout, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, hseProgramService, $rootScope) {
        $scope.user = coreService.getUser();
        $scope.$watch(function(){
            return coreService.getUser();
        }, function(newVal, oldVal){
            if(newVal !== oldVal){
                $scope.user = newVal;
                console.log($scope.user);
                init();
            }
        }, true);
        $rootScope.HSEDocumentsOptions = coreService.getGridOptions();
        $rootScope.HSEDocumentsOptions.exporterCsvFilename = 'hse_documents.csv';
        $rootScope.HSEDocumentsOptions.columnDefs = [
            {
                name: 'file_name',
                minWidth: 150,
                // categoryDisplayName: 'address',
                displayName: 'Document Name',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_extension',
                minWidth: 150,
                displayName: 'Document Type',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_uploadby',
                minWidth: 150,
                displayName: 'Owner Name',cellTooltip: true, headerTooltip: true
            },
            // {
            //     name: 'OwnerType',
            //     minWidth: 150,
            //     categoryDisplayName: 'address',
            //     displayName: 'Owner Type'
            // },
            {
                name: 'file_description',
                minWidth: 150,
                displayName: 'Summary Description',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_version',
                minWidth: 150,
                displayName: 'Versions Count',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_lastupdated',
                minWidth: 150,
                displayName: 'Last Update date',cellTooltip: true, headerTooltip: true
            },
            // {
            //     name: 'SummaryOflastDate',
            //     minWidth: 150,
            //     displayName: 'Summary Of last Date'
            // },
            // {
            //     name: 'Approvedby',
            //     minWidth: 150,
            //     displayName: 'Approved by'
            // },
            // {
            //     name: 'DateApproved',
            //     minWidth: 150,
            //     displayName: 'Date Approved'
            // },
            // {
            //     name: 'Datelastopenedbyuser',
            //     minWidth: 150,
            //     displayName: 'Date last opened by user'
            // }
        ];
        $rootScope.HSEDocumentsOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
        $rootScope.HSEDocumentsOptions.showGridFooter = true;
        $rootScope.HSEDocumentsOptions.showColumnFooter = true;
        var getTree = function(){
            hseProgramService.getDocumentsRoot(coreService.getUser().org_id)
            .then(function(response){
                if(!response.data.hasOwnProperty('file')){
                    $scope.treedata = response.data;
                    console.log($scope.treedata);
                    // $scope.selectedNode = $scope.treedata[0].children[0];
                    var selectedNode;
                    var parents = [];
                    console.log(angular.isDefined($scope.parents));
                    if (angular.isDefined($scope.parents) && $scope.parents.length !== 0) {
                        parents.push($scope.treedata[0]);
                        angular.forEach(parents, function ($value, $key) {
                            if ($key > 0 && angular.isDefined(parents[$key - 1]) && angular.isDefined($value))
                                parents.push($filter('filter')(parents[$key - 1].children, {'id': $value.id})[0])
                            if ($key === parents.length - 1) {
                                if (angular.isDefined(parents[parents.length - 1]))
                                    selectedNode = parents[parents.length - 1]; // in case of create new folder
                                else
                                    selectedNode = parents[parents.length - 2]; // in case of delete folder
                            }
                        })
                        console.log(parents);
                    }
                    $rootScope.selectedNode= angular.isDefined(selectedNode) ? selectedNode : $scope.treedata[0],
                    $scope.parents= angular.isDefined(parents) && parents.length ? parents : [$scope.treedata[0]]
                    console.log($scope.treedata);
                    console.log($scope.parents);
                    console.log($rootScope.selectedNode);
                    setMenuOptions()
                    // $scope.tree.menuOptions = $scope.menuOptions
                    // if ($scope.parents.length > 1) {
                        getFiles()
                    // } 
                    // else {
                    //     $scope.db.filelist = []
                    //     if (!$scope.db.hasOwnProperty('upload'))
                    //         $scope.db.upload = {}
                    //     $scope.db.upload = {
                    //         showUpload: false
                    //     }
                    // }
                }else{
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: response.data});
                }
            }, function(error){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
        var init = function(){
            getTree();
        };
        init();
        $scope.$watch('parents', function(newVal, oldVal){
            if(newVal !== oldVal){
                $rootScope.managecurrentPath = '';
                angular.forEach(newVal, function(parent, key){
                    $rootScope.managecurrentPath += parent.name;
                    if(key < newVal.length-1)
                        $rootScope.managecurrentPath += ' / ';
                });
            }
            console.log($rootScope.managecurrentPath);
        }, true);

        // $scope.$watch('filesChanged', function(newVal, oldVal){
        //     if(newVal !== oldVal){
        //         console.log($scope.selectedNode);
        //         getFiles();
        //     }
        // }, true);
        var getFiles = function () {
            var data = {
                item: $scope.selectedNode,
                org_id: $scope.user.org_id
            }
            hseProgramService.getFiles(data).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    // coreService.resetAlert()
                    $rootScope.HSEDocumentsOptions.data = response.data;
                    console.log($rootScope.HSEDocumentsOptions.data);
                    if ($rootScope.HSEDocumentsOptions.data.length)
                        $rootScope.selectedNode.hasFiles = true
                    else
                        $rootScope.selectedNode.hasFiles = false
                    // if ($scope.hasOwnProperty('filesChanged'))
                    //     delete $scope.filesChanged
                    // if ($scope.hasOwnProperty('upload') && $scope.upload.hasOwnProperty('doneUpload')) {
                    //     $scope.upload.doneUpload = false
                    // }
                } else {
                    coreService.resetAlert()
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    })
                }
            }, function (response) {
                coreService.resetAlert()
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                })
            })
        };
        $scope.viewFile = function(){
            coreService.resetAlert();
            var data = {};
            if ($scope.gridApi.selection.getSelectedRows().length) {
                    var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                    var item = $scope.gridApi.selection.getSelectedRows()[0];
                    console.log(item);
                    window.open('/hseprogram/'+item.file_id+'.'+item.file_extension, '_blank');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.getVersions = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                var item = $scope.gridApi.selection.getSelectedRows()[0];
                if (item.file_version > 1) {
                    console.log(item);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/hseProgramModule/views/fileVersions.html',
                        controller: 'FileVersionsController',
                        backdrop: 'static',
                        resolve: {
                            item: item
                        }
                    });
                    modalInstance.result.then(function (result) {
                        console.log(result);
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('fileversion')});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.deleteVersions = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                var item = $scope.gridApi.selection.getSelectedRows()[0];
                if (item.file_version > 1) {
                    console.log(item);
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
                            hseProgramService.deleteVersions(item).then(function(response){
                                if(!response.data.hasOwnProperty('file')){
                                    getFiles();
                                }else{
                                    coreService.resetAlert()
                                    coreService.setAlert({type: 'exception', message: response.data})
                                }
                            },function(response){
                                coreService.resetAlert()
                                coreService.setAlert({type: 'exception', message: response.data})
                            });
                        }
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('fileversion')});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.deleteFile = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                var item = $scope.gridApi.selection.getSelectedRows()[0];
                console.log(item);
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
                        hseProgramService.deleteFile(item.file_id).then(function(response){
                            if(!response.data.hasOwnProperty('file')){
                                getFiles();
                            }else{
                                coreService.resetAlert()
                                coreService.setAlert({type: 'exception', message: response.data})
                            }
                        },function(response){
                            coreService.resetAlert()
                            coreService.setAlert({type: 'exception', message: response.data})
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
        $scope.openAddFile = function(){
            coreService.resetAlert();
            console.log($rootScope.selectedNode);
            console.log($scope.parents);
            if ($rootScope.selectedNode.hasOwnProperty('id') && $rootScope.selectedNode.name !== 'HSE Program') {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/adminToolsModule/manageHseProgramModule/views/addHseDocument.html',
                    controller: 'AddHSEDocumentController',
                    backdrop: 'static',
                    resolve: {
                        node: $rootScope.selectedNode,
                        item: null
                    }
                });
                modalInstance.result.then(function (result) {
                    console.log(result);
                    console.log(result !== 'cancel');
                    if (result !== 'cancel') {
                        getFiles();
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectnode')});
            }
        };
        $scope.openEditFile = function(){
            coreService.resetAlert();
            if ($rootScope.selectedNode.hasOwnProperty('id')) {
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    // var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                    var item = $scope.gridApi.selection.getSelectedRows()[0];
                    console.log(item);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/manageHseProgramModule/views/addHseDocument.html',
                        controller: 'AddHSEDocumentController',
                        backdrop: 'static',
                        resolve: {
                            node: $rootScope.selectedNode,
                            item: item
                        }
                    });
                    modalInstance.result.then(function (result) {
                        if (result === 'ok') {
                            console.log(result);
                            if (result !== 'cancel') {
                                getFiles();
                            }
                        }
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectnode')});
            }
        };
        var setMenuOptions = function () {
            // if(($scope.parents.length <= 2 || ($scope.parents.length <= 3 && 
            //     $scope.parents[1].name === 'HSE Policies and Work Practices')) &&
            // $scope.user.org_code === 'Alliance' && $scope.user.group_code === 'administrator'){
            //     $scope.menuOptions = [
            //         ['New folder', function ($itemScope) {
            //                 newFolder()
            //             }],
            //         ['Rename folder', function ($itemScope) {
            //                     renameFolder()
            //                 }],
            //         ['Delete folder', function ($itemScope) {
            //                 deleteFolder()
            //             }]
            //     ];
            // } else if($scope.parents.length <= 1){
            //     $scope.menuOptions = [
            //         ['New folder', function ($itemScope) {
            //                 newFolder()
            //             }]
            //     ];
            // } else if(($scope.parents.length <= 2 || ($scope.parents.length <= 3 && 
            //     $scope.parents[1].name === 'HSE Policies and Work Practices')) &&
            // $rootScope.selectedNode.org_id === ''){
            //     $scope.menuOptions = [];
            // } else {
                $scope.menuOptions = [
                    ['New folder', function ($itemScope) {
                            newFolder()
                        }],
                    ['Rename folder', function ($itemScope) {
                                renameFolder()
                            }],
                    ['Delete folder', function ($itemScope) {
                            deleteFolder()
                        }]
                ];
            // }
        };

        var newFolder = function () {
            var uibModalInstance = $uibModal.open({
                templateUrl: 'app/modules/adminToolsModule/manageHseProgramModule/views/newFolder.html',
                controller: 'NewFolderController',
                resolve: {
                    node: function () {
                        return $rootScope.selectedNode
                    },
                    parents: function () {
                        return $scope.parents
                    },
                    op: function () {
                        return 'add'
                    }
                }
            })
            uibModalInstance.result.then(function (response) {
                if (response === 'success') {
                    getTree()
                }
            })
        };
        var deleteFolder = function () {
            if ($rootScope.selectedNode.hasFiles) {
                coreService.resetAlert()
                coreService.setAlert({
                    type: 'error',
                    message: 'This folder contains files, Please remove these files first'
                });
                return;
            }
            if ($rootScope.selectedNode.children.length) {
                coreService.resetAlert()
                coreService.setAlert({
                    type: 'error',
                    message: 'This folder has children, Please remove the children first and try again'
                });
                return;
            }
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
                    hseProgramService.deleteFolder($rootScope.selectedNode.id).then(function (response) {
                        if (!response.data.hasOwnProperty('file')) { $scope.parents.splice($scope.parents.indexOf($rootScope.selectedNode), 1);
                            console.log($scope.parents);
                            getTree();
                        } else {
                            coreService.resetAlert()
                            coreService.setAlert({
                                type: 'exception',
                                message: response.data
                            });
                        }
                    }, function (response) {
                        coreService.resetAlert()
                        coreService.setAlert({
                            type: 'exception',
                            message: response.data
                        });
                    });
                }
            }, function () {
                console.log('modal-component dismissed at: ' + new Date());
            });
        };

        var renameFolder = function () {
            var uibModalInstance = $uibModal.open({
                templateUrl: 'app/modules/adminToolsModule/manageHseProgramModule/views/newFolder.html',
                controller: 'NewFolderController',
                resolve: {
                    node: function () {
                        return $rootScope.selectedNode
                    },
                    parents: function () {
                        return $scope.parents
                    },
                    op: function () {
                        return 'rename'
                    }
                }
            })
            uibModalInstance.result.then(function (response) {
                if (response === 'success') {
                    getTree()
                }
            })
        };
        $scope.getSelected = function (node, selected, parent) {
            if (selected) {
                hseProgramService.getSelectedParents($scope.treedata, node).then(function (response) {
                    $scope.parents = response
                    $rootScope.selectedNode = node
                    console.log($scope.parents);
                    console.log($rootScope.selectedNode);
                    setMenuOptions();
                    getFiles();
                })

            }
        }
        $scope.getToggled = function (node, expanded, parent) {
            if (expanded) {
                hseProgramService.getSelectedParents($scope.treedata, node).then(function (response) {
                    $scope.parents = response
                    console.log($scope.parents);
                    console.log($rootScope.selectedNode);
                })
            }
        }
    
        // grid Code
    
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

    };
    controller.$inject = ['$scope', 'Upload', '$timeout', 'constantService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', 'hseProgramService', '$rootScope'];
    angular.module("manageHseProgramModule").controller("ManageHseProgramController", controller);
}());