(function () {
    var controller = function ($scope, $rootScope, $uibModal, testObject, msg, coreService, viewDataTablesService, $filter, $q, $state, uiGridConstants, uiGridExporterConstants, coreReportService, $uibModalInstance) {
        $scope.reportObject = testObject;
        $scope.msg = msg;
        $scope.selectedOrg = testObject.orgId;
        $scope.allorgs = [];

        viewDataTablesService.getAllOrganizations().then(function (res) {
            if (res.data) {
                $scope.allorgs = res.data;
            }
        }, function (err) {
            console.error(err);
        });

        $scope.close = function close(){
            $uibModalInstance.close('');
        };

        $scope.save = function close() {
            var menu = document.getElementById('allorgsmenu');
            var val = menu.options[menu.selectedIndex].value;
            var txt = menu.options[menu.selectedIndex].text;
            var org = {org_id: val, org_name: txt};
            $uibModalInstance.close(org);
        };

    };
    controller.$inject = ['$scope', '$rootScope', '$uibModal', 'testObject', 'msg', 'coreService', 'viewDataTablesService', '$filter', '$q', '$state', 'uiGridConstants', 'uiGridExporterConstants', 'coreReportService', '$uibModalInstance']
    angular.module('viewDataTablesModule')
            .controller('moveCtrl', controller);
}());

