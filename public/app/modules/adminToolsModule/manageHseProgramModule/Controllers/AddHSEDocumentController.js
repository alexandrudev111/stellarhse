(function () {
    var controller = function ($scope, $uibModalInstance, node, item, Upload, coreService, constantService) {
        console.log(node);
        $scope.user = coreService.getUser();
        if(item !== null){
            $scope.summary = item.file_description;
        }
        $scope.ok = function () {
            console.log($scope.file);
            var url = "api/v1/addfile";
            coreService.resetAlert();
            if(angular.isDefined($scope.file) && angular.isDefined($scope.file.name)){
                var filename = $scope.file.name.split('.');
                console.log(filename);
                if(item !== null && filename[0] !== item.file_name){
                    coreService.setAlert({type: 'error', message: constantService.getMessage('wrongfile')});
                    return;
                }
            }
            // coreService.setAlert({type: 'wait', message: 'Uploading files ... Please wait'})
            var upload = Upload.upload({
                url: url,
                method: "POST",
                data:{
                    file: $scope.file,
                    summary: $scope.summary,
                    user_id: $scope.user.employee_id,
                    org_id: $scope.user.org_id,
                    node: node,
                    item: item
                }
            })
            upload.then(function (response) {
                if (response.data.hasOwnProperty('success')) {
                    if (response.data.success == 1) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'success', message: constantService.getMessage('successupload')});
                        $uibModalInstance.close('ok');
                    } else {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'error', message: response.data.reason});
                    }
                }

            }, function (response) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: response.data});
            }, function (evt) {
                coreService.resetAlert();
                coreService.setAlert({type: 'info', message: "progress: " + parseInt(100.0 * evt.loaded / evt.total) + "%"})
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
    controller.$inject = ['$scope', '$uibModalInstance', 'node', 'item', 'Upload', 'coreService', 'constantService'];
    angular.module("manageHseProgramModule").controller("AddHSEDocumentController", controller);
}());