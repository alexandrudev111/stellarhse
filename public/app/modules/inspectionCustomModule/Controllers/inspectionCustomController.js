(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, inspectionReportService, $controller, $state, $q, $filter) {
        $scope.reportType = 'inspection';
        $controller('coreReportController', {$scope: $scope});
            $scope.disabeldTrue = false;
        $scope.labels = {
            whatHappened: {
                reportType: 'Inspection type',
                reportTime: 'Time',
                reportDate: 'Date of inspection',
                whoIdentified: 'Inspection conducted by',
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
            $scope.report_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
        };

        $scope.getInspectionTypes = function(){
//            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            inspectionReportService.getInspectionTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInspectionReason = function(){
//            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            inspectionReportService.getInspectionReason(data)
                    .then(function (response) {
                        $scope.inspectionReasons = response.data;
                console.log($scope.inspectionReasons)
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var init = function () {
            $scope.getInspectionTypes();
            $scope.getInspectionReason();
            coreReportService.deleteTempFiles({
            }).then(function (response) {
                var res = response.data;
            });
        };
//        var init = function () {
//            $scope.user = coreService.getUser();
//            var data = {
//                org_id: $scope.user.org_id,
//                language_id: $scope.user.language_id
//            };
//            $q.all([
//                inspectionReportService.getInspectionTypes(data),
//                inspectionReportService.getInspectionReason(data)
//            ]).then(function (queues) {
//                $scope.reportTypes = queues[0].data;
//                $scope.inspectionReasons = queues[1].data;
//            }, function (errors) {
//                coreService.resetAlert();
//                coreService.setAlert({type: 'exception', message: errors[0].data});
//                coreService.setAlert({type: 'exception', message: errors[1].data});
//            });
//            ;
//        };
        init();

        $scope.submitInspectionReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            console.log(offset);
            $scope.report.clientTimeZoneOffset = offset;
//            $scope.report.operation = 'add';
            
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.process_type = 'add';
            $scope.report.creator_id = $scope.user.employee_id;
            $scope.report.impactTypes = $scope.impactTypes;
            $scope.report.riskLevels = [];
            if (angular.isDefined($scope.report.riskLevelsValues)) {
                if ($scope.report.riskLevelsValues.hasOwnProperty('hazard_exist'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.hazard_exist, {risk_level_value: $scope.report.riskLevelsValues.hazard_exist})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('worker_exposure'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.worker_exposure, {risk_level_value: $scope.report.riskLevelsValues.worker_exposure})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('potential_consequences'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.potential_consequences, {risk_level_value: $scope.report.riskLevelsValues.potential_consequences})[0].risk_level_id);
            }
            if($scope.report.report_date !== "" && $scope.report.report_date !== null)
                $scope.report.report_date = $filter('date')($scope.report.report_date, 'yyyy-MM-dd');
            angular.forEach($scope.report.correctiveActions, function(action){
                        if(action.start_date !== "" && action.start_date !== null)
                action.start_date = $filter('date')(action.start_date, 'yyyy-MM-dd');
                        if(action.target_end_date !== "" && action.target_end_date !== null)
                action.target_end_date = $filter('date')(action.target_end_date, 'yyyy-MM-dd');
                        if(action.actual_end_date !== "" && action.actual_end_date !== null)
                action.actual_end_date = $filter('date')(action.actual_end_date, 'yyyy-MM-dd');
            });
            inspectionReportService.submitInspectionReport($scope.report)
                    .then(function (response) {
//                        if (response.data == 1) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: "The report has been added successfully"});
                            $state.go('viewDataTables');
//                        } else {
//                            coreService.resetAlert();
//                            coreService.setAlert({type: 'error', message: response.data});
//                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.clearReportedHazard = function(){
            $scope.report.inspection_status_id = null;
        };
        $scope.clearInspectionRequired = function(){
            $scope.report.are_additional_corrective_actions_required = null;
        };

    };
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', 'inspectionReportService', '$controller', '$state', '$q', '$filter'];
    angular.module("inspectionCustomModule").controller("inspectionCustomController", controller);
}());