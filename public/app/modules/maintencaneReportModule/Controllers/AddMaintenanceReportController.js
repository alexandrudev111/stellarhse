(function () {
    var controller = function ($scope, $uibModal, $controller, coreReportService, coreService, $state, $q, maintenanceReportService, $filter) {
        $scope.reportType = 'maintenance';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.MaintenanceManagement;
        $scope.disabeldTrue = false;
        $scope.showCutomFields = true;
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
        $scope.getMaintenanceTypes = function(){
            //            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            maintenanceReportService.getMaintenanceTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.getMaintenanceReason = function(){
            //            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            maintenanceReportService.getMaintenanceReason(data)
                    .then(function (response) {
                        $scope.maintenanceReason = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        
        var init = function () {
            $scope.getMaintenanceTypes();
            $scope.getMaintenanceReason();
            coreReportService.deleteTempFiles({
            }).then(function (response) {
                var res = response.data;
            });
            //            $scope.user = coreService.getUser();
            //            var data = {
            //                org_id: $scope.user.org_id,
            //                language_id: $scope.user.language_id
            //            };
            //
            //            $q.all([
            //                maintenanceReportService.getMaintenanceReason(data),
            //                maintenanceReportService.getMaintenanceTypes(data)
            //            ]).then(function (queues) {
            //                $scope.maintenanceReason = queues[0].data;
            //                $scope.maintenanceTypes = queues[1].data;
            //            }, function (errors) {
            //                coreService.resetAlert();
            //                coreService.setAlert({type: 'exception', message: errors[0].data});
            //                coreService.setAlert({type: 'exception', message: errors[1].data});
            //            });
        };
        init();
        
                      
//        get  what MaintenanceManagement Custom fields

            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                tab_name:'WhatHappened',
                report_type:'MaintenanceManagement'
            };
            coreReportService.getTabCustomFields(data)
                    .then(function (response) {
                        $scope.report.whatCustomField= response.data;

                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
    
        $scope.submitMaintenanceReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            console.log(offset);
            $scope.report.clientTimeZoneOffset = offset;
//            $scope.report.operation = 'add';
            console.log( "before submit"+$scope.report.report_date);
          /* var temp = $scope.report.report_date ;
           $scope.report.report_date = temp;*/
            console.log( "before submit",$scope.report);

            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.creator_id = $scope.user.employee_id;
            $scope.report.process_type = 'add';
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
    controller.$inject = ['$scope', '$uibModal', '$controller', 'coreReportService', 'coreService', '$state', '$q', 'maintenanceReportService', '$filter'];
    angular.module("maintenanceReportModule").controller("AddMaintenanceReportController", controller);
}());