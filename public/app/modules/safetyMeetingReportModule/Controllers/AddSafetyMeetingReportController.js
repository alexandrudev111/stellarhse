(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $q, safetyMeetingReportService, $filter, $controller) {
        $scope.reportType = 'safetymeeting';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.SafetyMeeting;
        $scope.disabeldTrue = false;
        $scope.showCutomFields = true;
        $scope.labels = {
            whatHappened: {
                reportType: 'Type of meeting',
                reportTime: 'Meeting Time',
                reportDate: 'Date of meeting',
                whoIdentified: 'Meeting chaired by',
                location: 'Location of meeting',
                thirdParties: 'Third-parties involved',
                reportDescription: 'Description of meeting'
            }
        };
        $scope.getSafetyMeetingTypes = function(){
//            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            safetyMeetingReportService.getSafetyMeetingTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var init = function () {
            $scope.getSafetyMeetingTypes();
            coreReportService.deleteTempFiles({
            }).then(function (response) {
                var res = response.data;
            });
//            $scope.user = coreService.getUser();
//            var data = {
//                org_id: $scope.user.org_id,
//                language_id: $scope.user.language_id
//            };
//            safetyMeetingReportService.getSafetyMeetingTypes(data)
//                    .then(function (response) {
//                        $scope.reportTypes = response.data;
//                    }, function (error) {
//                        coreService.resetAlert();
//                        coreService.setAlert({type: 'exception', message: error.data});
//                    });
        };
        init();
        
        
               
//        get  what Hazard Custom fields

            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                tab_name:'WhatHappened',
                report_type:'SafetyMeeting'
            };
            coreReportService.getTabCustomFields(data)
                    .then(function (response) {
                        $scope.report.whatCustomField= response.data;

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });

        $scope.submitSafetyMeetingReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            console.log(offset);
            $scope.report.clientTimeZoneOffset = offset;
            $scope.report.process_type = 'add';
            
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.creator_id = $scope.user.employee_id;
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
            safetyMeetingReportService.submitSafetyMeetingReport($scope.report)
                    .then(function (response) {
                        console.log(response.data)
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
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$q', 'safetyMeetingReportService', '$filter', '$controller'];
    angular.module("safetyMeetingReportModule").controller("AddSafetyMeetingReportController", controller);
}());
