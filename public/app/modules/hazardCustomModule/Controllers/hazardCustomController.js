
(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $q, hazardReportService, $filter, $controller) {
        $scope.reportType = 'hazard';
        $controller('coreReportController', {$scope: $scope});
        $scope.disabeldTrue = false;
        $scope.hazard_type_name = false;
        $scope.labels = {
            whatHappened: {
                reportType: 'Type of hazard ID process',
                reportTime: 'Hazard Time',
                reportDate: 'Hazard Date',
                whoIdentified: 'Who identified the hazard(s)',
                location: 'Location of hazard(s)',
                thirdParties: 'Third-parties involved',
                equipment: 'Equipment involved',
                reportDescription: 'Description of hazard(s) found',
                suspectedCause: 'Suspected cause(s) of hazard(s)',
                riskLevels: 'Risk level',
                riskControls: 'Risk controls required'
            }
        };
        $scope.getReportTypeName = function () {
            $scope.hazard_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
            $scope.report.report_type_name = $scope.hazard_type_name;
             $scope.updateDreaftReport();
        };
        $scope.getHazardTypes = function(){
//            $scope.user = coreService.getUser();
        console.log("getDraftReport draft add hazard 3",coreService.getDraftReport());

            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            hazardReportService.getHazardTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                        console.log("getDraftReport draft add hazard 4",coreService.getDraftReport());

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var init = function () {
        console.log("getDraftReport draft add hazard",coreService.getDraftReport());

            coreReportService.deleteTempFiles({
            }).then(function (response) {
                var res = response.data;
                        console.log("getDraftReport draft add hazard2",coreService.getDraftReport());

            });
            $scope.getHazardTypes();
        };
        init();

        

    };
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$q', 'hazardReportService', '$filter', '$controller'];
    angular.module("hazardCustomModule").controller("hazardCustomController", controller);
}());





