(function () {
    var controller = function ($scope, coreService, $location) {
        coreService.setLogin(true);
        $scope.login = coreService.getLogin();
        $scope.$watch(function () {
            return coreService.getAlert();
        }, function (newValue) {
            $scope.alerts = newValue;
        });

        $scope.$watch(function () {
            return coreService.getLogin();
        }, function (newValue) {
            $scope.login = newValue;
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.$watch(function () {
            return coreService.getUser();
        }, function (newValue) {
            if (angular.isDefined(newValue) && newValue !== null && newValue.hasOwnProperty('EmployeeId')) {

            } else {

            }
        });
        



    };
    controller.$inject = ['$scope', 'coreService', '$location'];
    angular.module('coreModule')
            .controller('CoreController', controller);
}());