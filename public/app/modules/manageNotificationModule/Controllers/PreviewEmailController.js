(function () {
    var controller = function ($scope, $uibModalInstance, msg) {
        $scope.msgTitle = msg.title;
        $scope.msgBody = msg.body;
        console.log(msg.body);
        // $scope.ok = function () {
        //     $uibModalInstance.close('ok');
        // };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
    controller.$inject = ['$scope', '$uibModalInstance', 'msg'];
    angular.module("manageNotificationModule").controller("PreviewEmailController", controller);
}());