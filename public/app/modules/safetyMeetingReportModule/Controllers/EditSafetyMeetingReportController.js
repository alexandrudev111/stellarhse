(function () {
    var controller = function ($scope, $uibModal, $stateParams, coreService, $state, $q, safetyMeetingReportService, $filter, $controller) {
        $scope.reportType = 'safetymeeting';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.SafetyMeeting;
        if($scope.reportPermissions.readonlywhathappened || $scope.reportPermissions.readonlyhazarddetails || 
            $scope.reportPermissions.readonlypeopleinvolved || $scope.reportPermissions.readonlyaction ||
            $scope.reportPermissions.readonlydocuments)
            $scope.reportPermissions.readonlyreport = true;
        var firstLoad = true;
        $scope.disabeldTrue = true;
        $scope.showCutomFields = true;
        
         $scope.EditMode = function (){
            $scope.disabeldTrue = false;
            
        }
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
        var init = function () {
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
        init();
        $scope.$watch('report', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoad) {
                firstLoad = false;
                init();
                $scope.getReportData($stateParams.reportNumber);
            }
        }, true);
        $scope.submitSafetyMeetingReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            $scope.report.clientTimeZoneOffset = offset;

            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.process_type = 'edit';
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.modifier_id = $scope.user.employee_id;
            $scope.report.org_id = $scope.user.org_id;
            $scope.report.whoIdentified = {};
            $scope.report.whoIdentified = $scope.whoIdentified;
            $scope.report.report_third_party = [];
            angular.forEach($scope.contractors_involved, function (contractor) {
                $scope.report.report_third_party.push(contractor);
            });
            angular.forEach($scope.customer_involved, function (customer) {
                $scope.report.report_third_party.push(customer);
            });
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
    controller.$inject = ['$scope', '$uibModal', '$stateParams', 'coreService', '$state', '$q', 'safetyMeetingReportService', '$filter', '$controller'];
    angular.module("safetyMeetingReportModule").controller("EditSafetyMeetingReportController", controller);
}());


