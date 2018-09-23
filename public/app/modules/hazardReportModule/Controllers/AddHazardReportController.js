(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $q, hazardReportService, $filter, $controller) {
        $scope.reportType = 'hazard';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.Hazard;
        $scope.disabeldTrue = false;
        $scope.hazard_type_name = false;
        
        $scope.canUpdateDraft = true;

        $scope.lockedReport = false;
        $scope.showCutomFields = true;

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
            console.log($scope.reportTypes);
            $scope.hazard_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
            $scope.report.report_type_name = $scope.hazard_type_name;
            console.log($scope.report.report_type_name);
            console.log($scope.report);
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
            coreReportService.setDraftFiles({report_type:'Hazard',org_id:$scope.user.org_id,user_id:$scope.user.employee_id,report:'new'}).then(function (response) {
                var res = response.data;
            });
            $scope.getHazardTypes();
        };
        init();
        
//        get  what Hazard Custom fields

            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                tab_name:'WhatHappened',
                report_type:'Hazard'
            };
            coreReportService.getTabCustomFields(data)
                    .then(function (response) {
                        $scope.report.whatCustomField= response.data;

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
//        get  details Hazard Custom fields

            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                tab_name:'HazardDetails',
                report_type:'Hazard'
            };
            coreReportService.getTabCustomFields(data)
                    .then(function (response) {
                        $scope.report.detailCustomField = response.data;

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });

        $scope.submitHazardReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            console.log(offset);
            $scope.report.clientTimeZoneOffset = offset;
            $scope.report.process_type = 'add';

            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.creator_id = $scope.user.employee_id;
            $scope.report.org_id = $scope.user.org_id;
            $scope.report.impactTypes = $scope.impactTypes;
            if (angular.isDefined($scope.report.riskLevelsValues)) {
                $scope.report.riskLevels = {};
               /* if ($scope.report.riskLevelsValues.hasOwnProperty('impact') && $scope.report.riskLevelsValues.impact !== ''
                && $scope.report.riskLevelsValues.impact !== null){
                    var risk_level_sup_type_id = $filter('filter')($scope.riskLevels.impact, {field_code: $scope.report.riskLevelsValues.impact})[0].risk_level_sup_type_id;
                    $scope.report.riskLevels.impactId = risk_level_sup_type_id;
                }
                if ($scope.report.riskLevelsValues.hasOwnProperty('likelyhood') && $scope.report.riskLevelsValues.likelyhood !== ''
                && $scope.report.riskLevelsValues.likelyhood !== null){
                    var risk_level_sup_type_id = $filter('filter')($scope.riskLevels.likelyhood, {field_code: $scope.report.riskLevelsValues.likelyhood})[0].risk_level_sup_type_id;
                    $scope.report.riskLevels.likelyhoodId = risk_level_sup_type_id;
                }*/
                $scope.report.riskLevels.impactId =$scope.report.riskLevelsValues.impact;
                $scope.report.riskLevels.likelyhoodId =$scope.report.riskLevelsValues.likelyhood;
                 $scope.report.riskLevels.result =$scope.riskLevelTotal;
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
            console.log("Report", $scope.report);
            coreService.setDraftReport(undefined);
           hazardReportService.submitHazardReport($scope.report)
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

    };
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$q', 'hazardReportService', '$filter', '$controller'];
    angular.module("hazardReportModule").controller("AddHazardReportController", controller);
}());


