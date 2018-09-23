(function () {
    var controller = function ($scope, $uibModalInstance, item, hseProgramService) {
        console.log(item);
        $scope.item = item;
        hseProgramService.getVersions(item).then(function(response){
            if(!response.data.hasOwnProperty('file')){
                $scope.versions = response.data;
                console.log($scope.versions);
            }else{
                coreService.resetAlert()
                coreService.setAlert({type: 'exception', message: response.data})
            }
        },function(response){
            coreService.resetAlert()
            coreService.setAlert({type: 'exception', message: response.data})
        });
        $scope.ok = function () {
            // var data = {
            //     employee_id: $scope.selectedUser.employee_id,
            //     group_id: msg.group.group_id,
            //     org_id: $scope.selectedUser.org_id
            // }
            // manageGroupsService.assignUserToGroup(data)
            // .then(function (response) {
            //     if (response.data === 1) {
            //         // $scope.ManageGroupsOptions.data.splice(index, 1);
            //         // coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
            //     }
            // }, function (error) {
            //     coreService.resetAlert();
            //     coreService.setAlert({type: 'exception', message: error.data});
            // });
            $uibModalInstance.close('ok');
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.viewFile = function(item){
            console.log(item)
            window.open('/hseprogram/'+item.file_id+'.'+item.file_extension, '_blank');
        };
    };
    controller.$inject = ['$scope', '$uibModalInstance', 'item', 'hseProgramService'];
    angular.module("hseProgramModule").controller("FileVersionsController", controller);
}());