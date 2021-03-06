(function () {
    var controller = function ($scope, $uibModal, $stateParams, coreService, $state, $q, maintenanceReportService, $filter, $controller) {
        $scope.reportType = 'maintenance';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.MaintenanceManagement;
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
                reportType: 'Type of maintenance',
                reportTime: 'Time',
                reportDate: 'Date of Training',
                whoIdentified: 'Maintenance reported by',
                location: 'Facility/location undergoing maintenance',
                thirdParties: 'Third-parties involved',
                reportDescription: 'Description of maintenance'
            }
        };
        var init = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            $q.all([
                maintenanceReportService.getMaintenanceReason(data),
                maintenanceReportService.getMaintenanceTypes(data)
            ]).then(function (queues) {
                $scope.maintenanceReason = queues[0].data;
                $scope.maintenanceTypes = queues[1].data;
                $scope.reportTypes = queues[1].data;
            }, function (errors) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
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

        $scope.$watch('report.creator_id', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getMaintenanceReportData();
            }
        });

        $scope.getMaintenanceReportData = function () {
            console.log("1 ==> " + $scope.report.Facility_location_last_maintenance);
            if ($scope.report.Facility_location_last_maintenance && $scope.report.Facility_location_last_maintenance != null) {
         
                $scope.report.Facility_location_last_maintenance = moment($scope.report.Facility_location_last_maintenance)['_d'];
            }
            console.log("2 ==> " + $scope.report.Facility_location_last_maintenance);

        };

        $scope.submitMaintenanceReport = function () {
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
            if($scope.report.Facility_location_last_maintenance !== "" && $scope.report.Facility_location_last_maintenance !== null)
                $scope.report.Facility_location_last_maintenance = $filter('date')($scope.report.Facility_location_last_maintenance, 'yyyy-MM-dd');
            angular.forEach($scope.report.correctiveActions, function(action){
                        if(action.start_date !== "" && action.start_date !== null)
                action.start_date = $filter('date')(action.start_date, 'yyyy-MM-dd');
                        if(action.target_end_date !== "" && action.target_end_date !== null)
                action.target_end_date = $filter('date')(action.target_end_date, 'yyyy-MM-dd');
                        if(action.actual_end_date !== "" && action.actual_end_date !== null)
                action.actual_end_date = $filter('date')(action.actual_end_date, 'yyyy-MM-dd');
            });
            maintenanceReportService.submitMaintenanceReport($scope.report)
                    .then(function (response) {
                        console.log(response.data)
//                        if (response.data == 1) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: "The report has been added successly"});
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
    controller.$inject = ['$scope', '$uibModal', '$stateParams', 'coreService', '$state', '$q', 'maintenanceReportService', '$filter', '$controller'];
    angular.module("maintenanceReportModule").controller("EditMaintenanceReportController", controller);
}());


