(function () {
    var controller = function ($scope, $uibModalInstance, msg, manageGroupsService) {
        $scope.msgTitle = msg.title+' '+msg.group_name;
        $scope.msgBody = msg.body;
        $scope.users = msg.users;
        console.log(msg);
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
            $uibModalInstance.close($scope.selectedUser);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
    controller.$inject = ['$scope', '$uibModalInstance', 'msg', 'manageGroupsService'];
    angular.module("manageGroupsModule").controller("AddUsersController", controller);
}());