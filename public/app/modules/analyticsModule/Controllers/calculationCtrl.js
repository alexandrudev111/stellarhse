(function () {
    var controller = function ($scope, constantService, analyticsService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {
        $("#fiscal_year").datepicker({
            changeMonth: true,
            changeYear: false,
            dateFormat: 'mm/dd',
            viewMode: "months",
            maxViewMode: "months"
        }).focus(function () {
            $(".ui-datepicker-year").hide();
        });
        
        $scope.permissions = coreService.getPermissions();

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === 'ManageKPIFactor') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.decimal_valid = constantService.getMessage('decimal_valid')
                $scope.user = coreService.getUser();
                analyticsService.getOrgSettings({org_id: $scope.user.org_id}).then(function (response) { 
                    $scope.selectedOrg = response.data;
                    var work_hour_array = $scope.selectedOrg.work_hour.split('.');
                    if(parseInt(work_hour_array[1]) === 0){
                        $scope.selectedOrg.work_hour = work_hour_array[0];
                    }
                    var km_driven_array = $scope.selectedOrg.km_driven.split('.');
                    if(parseInt(km_driven_array[1]) === 0){
                        $scope.selectedOrg.km_driven = km_driven_array[0];
                    }
                    
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        }, true);

        $scope.updateOrgSetting = function () {
            analyticsService.setOrgSettings($scope.selectedOrg).then(function (response) {
                coreService.resetAlert();
                coreService.setAlert({type: 'info', message: 'Setting updated successfully.'});
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }

        $scope.cancel = function () {
            $state.reload();
        };

        $scope.clearFiscalYear = function(){
            if($scope.permissions.Analytics.selectfiscalyear)
            $scope.selectedOrg.fiscal_year = ''
        };
    };
    controller.$inject = ['$scope', 'constantService', 'analyticsService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('analyticsModule')
            .controller('calculationCtrl', controller);
}());