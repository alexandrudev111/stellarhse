(function () {
    var controller = function ($scope, node, parents, op, coreService, $uibModalInstance, $filter, hseProgramService) {
        $scope.node = node;
        $scope.op = op;
        $scope.parents = parents;
        $scope.foldername = '';
        console.log($scope.parents);
        if($scope.op !== 'add'){
            $scope.foldername = $scope.node.name;
        }
        $scope.addFolder = function () {
            if ($scope.foldername !== '') {
                if (!$scope.foldername.match(/^[0-9A-Za-z\s]+$/)) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'error',
                        message: 'folder name contains illegal characters\nOnly alphanumeric and spaces all allowed'
                    });
                    return;
                }
                var folder = {
                    name: $scope.foldername
                }
                if ($filter('lowerCaseCompare')($scope.node.children, folder, 'name')) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'error',
                        message: 'A folder with the same name exists under the same folder'
                    });
                    return;
                }

                if (op === 'add') {
                    var post = {
                        parent: $scope.node.id,
                        parents: $scope.parents,
                        name: $scope.foldername,
                        userid: coreService.getUser().employee_id,
                        org_id: coreService.getUser().org_id
                    }
                    hseProgramService.addFolder(post).then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            $uibModalInstance.close('success');
                        } else {
                            coreService.resetAlert();
                            coreService.setAlert({
                                type: 'exception',
                                message: response.data
                            });
                        }
                    }, function (response) {
                        coreService.resetAlert();
                        coreService.setAlert({
                            type: 'exception',
                            message: response.data
                        });
                    });
                } else {
                    var post = {
                        nodeid: $scope.node.id,
                        name: $scope.foldername
                    }
                    hseProgramService.renameFolder(post).then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            $uibModalInstance.close('success');
                        } else {
                            coreService.resetAlert();
                            coreService.setAlert({
                                type: 'exception',
                                message: response.data
                            });
                        }
                    }, function (response) {
                        coreService.resetAlert();
                        coreService.setAlert({
                            type: 'exception',
                            message: response.data
                        });
                    });
                }
            }
        }
        $scope.cancel = function () {
            $uibModalInstance.close('cancel');
        }
    }
    controller.$inject = ['$scope', 'node', 'parents', 'op', 'coreService', '$uibModalInstance', '$filter', 'hseProgramService']
    angular.module('manageHseProgramModule')
        .controller('NewFolderController', controller)
}())