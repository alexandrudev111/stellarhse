(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $stateParams, $q, inspectionReportService, $filter, $controller) {
        $scope.reportType = 'inspection';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.Inspection;
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
        $scope.hazard_type_name = false;
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
        $scope.getHazardTypeName = function () {
            $scope.hazard_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
        };
        var init = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            $q.all([
                inspectionReportService.getInspectionTypes(data),
                //inspectionReportService.getInsData(data),
                inspectionReportService.getInspectionReason(data),
            ]).then(function (queues) {
                $scope.reportTypes = queues[0].data;
                $scope.inspectionReasons = queues[1].data;

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.$watch('report', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoad) {
                firstLoad = false;
                init();
                console.log("$stateParams.reportNumber" + $stateParams.reportNumber);
                $scope.getReportData($stateParams.reportNumber);
            }
        }, true);
        $scope.submitInspectionReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            $scope.report.clientTimeZoneOffset = offset;

            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.process_type = 'edit';
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.modifier_id = $scope.user.employee_id;
            $scope.report.org_id = $scope.user.org_id;
            $scope.report.impactTypes = $scope.impactTypes;
            $scope.report.whoIdentified = {};
            $scope.report.whoIdentified = $scope.whoIdentified;
            $scope.report.report_third_party = [];
            angular.forEach($scope.contractors_involved, function (contractor) {
                $scope.report.report_third_party.push(contractor);
            });
            angular.forEach($scope.customer_involved, function (customer) {
                $scope.report.report_third_party.push(customer);
            });
            if (angular.isDefined($scope.report.riskLevelsValues)) {
                $scope.report.riskLevels = [];
                if ($scope.report.riskLevelsValues.hasOwnProperty('hazard_exist'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.hazard_exist, {risk_level_value: $scope.report.riskLevelsValues.hazard_exist})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('worker_exposure'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.worker_exposure, {risk_level_value: $scope.report.riskLevelsValues.worker_exposure})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('potential_consequences'))
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.potential_consequences, {risk_level_value: $scope.report.riskLevelsValues.potential_consequences})[0].risk_level_id);
            }
            console.log("Submit Inspection Report");
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
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$stateParams', '$q', 'inspectionReportService', '$filter', '$controller'];
    angular.module("inspectionReportModule").controller("EditInspectionReportController", controller);
}());



/*   var init = function () {
 var data = {
 org_id: $scope.user.org_id,
 language_id: $scope.user.language_id
 };
 $q.all([
 inspectionReportService.getInspectionTypes(data),
 inspectionReportService.getInsData(data),
 inspectionReportService.getInspectionReason(data),
 ]).then(function (queues) {
 $scope.reportTypes = queues[0].data;
 $scope.report = queues[1].data;
 $scope.inspectionReasons = queues[2].data;
 $scope.report.report_date = moment($scope.report.report_date)['_d'];
 $scope.whoIdentified = {};
 $scope.whoIdentified.employee_id = $scope.report.reporter_id;
 $scope.whoIdentified.full_name = $scope.report.rep_name;
 $scope.whoIdentified.email = $scope.report.rep_email;
 $scope.whoIdentified.position = $scope.report.rep_position;
 $scope.whoIdentified.crew_name = $scope.report.rep_crew;
 $scope.whoIdentified.org_name = $scope.report.rep_company;
 $scope.whoIdentified.primary_phone = $scope.report.rep_primary_phone;
 $scope.whoIdentified.alternate_phone = $scope.report.rep_alternate_phone;
 $scope.whoIdentified.supervisor_name = $scope.report.rep_supervisor;
 
 $scope.report.location1 = {};
 $scope.report.location1.location1_id = $scope.report.location1_id;
 $scope.report.location1.location1_name = $scope.report.location1_name;
 $scope.report.location2 = {};
 $scope.report.location2.location2_id = $scope.report.location2_id;
 $scope.report.location2.location2_name = $scope.report.location2_name;
 $scope.report.location3 = {};
 $scope.report.location3.location3_id = $scope.report.location3_id;
 $scope.report.location3.location3_name = $scope.report.location3_name;
 $scope.report.location4 = {};
 $scope.report.location4.location4_id = $scope.report.location4_id;
 $scope.report.location4.location4_name = $scope.report.location4_name;
 
 $scope.contractors_involved = $filter('filter')($scope.report.report_third_party, {third_party_type_code: 'Contractor'});
 $scope.customer_involved = $filter('filter')($scope.report.report_third_party, {third_party_type_code: 'Customer'});
 
 $scope.report.impactTypes = $scope.impactTypes;
 angular.forEach($scope.report.impactTypes, function (impactType) {
 if (angular.isDefined($filter('filter')($scope.report.impact_types, {impact_type_id: impactType.impact_type_id})[0])) {
 impactType.impact_choice = true;
 }
 });
 
 $scope.report.riskLevels = {};
 $scope.report.riskLevels.hazard_exist = $filter('filter')($scope.riskLevels.hazard_exist, {risk_level_id: $scope.report.risk_levels.hazard_exist})[0].risk_level_value;
 $scope.report.riskLevels.worker_exposure = $filter('filter')($scope.riskLevels.worker_exposure, {risk_level_id: $scope.report.risk_levels.worker_exposure})[0].risk_level_value;
 $scope.report.riskLevels.potential_consequences = $filter('filter')($scope.riskLevels.potential_consequences, {risk_level_id: $scope.report.risk_levels.potential_consequences})[0].risk_level_value;
 $scope.calculateRiskLevel();
 
 $scope.report.riskControls = $scope.riskControls;
 angular.forEach($scope.report.riskControls, function (riskControl) {
 if (angular.isDefined($filter('filter')($scope.report.risk_controls, {risk_control_id: riskControl.risk_control_id})[0])) {
 riskControl.risk_control_choice = true;
 }
 });
 
 $scope.peopleInvolved = $scope.report.peopleInvolved;
 angular.forEach($scope.report.peopleInvolved, function (people, key) {
 //                    $scope.getData(people);
 if (people.people_id !== '' || people.people_id !== null)
 $scope.peopleInvolved[key].employee_id = people.people_id;
 else if (people.third_party_id !== '' || people.third_party_id !== null)
 $scope.peopleInvolved[key].employee_id = people.third_party_id;
 $scope.peopleInvolved[key].title = people.people_involved_name;
 $scope.peopleInvolved[key].full_name = people.people_involved_name;
 //                $scope.peopleInvolved[key].emp_id = people.emp_id;
 $scope.peopleInvolved[key].email = people.email;
 $scope.peopleInvolved[key].position = people.position;
 $scope.peopleInvolved[key].crew_name = people.crew;
 $scope.peopleInvolved[key].org_name = people.company;
 $scope.peopleInvolved[key].primary_phone = people.primary_phone;
 $scope.peopleInvolved[key].alternate_phone = people.alternate_phone;
 $scope.peopleInvolved[key].supervisor_name = people.supervisor;
 var certificates = people.certificate.split(',');
 var actings = people.acting.split(',');
 
 var data = {
 org_id: $scope.user.org_id,
 language_id: $scope.user.language_id
 };
 
 $q.all([coreReportService.getPeopleCertificates(data),
 coreReportService.getPeopleActingAs(data)]).then(function (queues) {
 people.certifications = queues[0].data;
 people.actingAs = queues[1].data;
 angular.forEach(people.certifications, function (certification) {
 if (certificates.indexOf(certification.certificate_id) !== -1) {
 certification.certificate_choice = true;
 }
 });
 angular.forEach(people.actingAs, function (acting) {
 if (actings.indexOf(acting.acting_id) !== -1) {
 acting.acting_choice = true;
 }
 });
 }
 , function (errors) {
 coreService.setAlert({type: 'exception', message: errors[0].data});
 coreService.setAlert({type: 'exception', message: errors[1].data});
 });
 });
 
 angular.forEach($scope.report.correctiveActions, function (action, key) {
 action.heading = action.assigned_to_name;
 action.assigned_to = {};
 action.assigned_to.employee_id = action.assigned_to_id;
 action.assigned_to.full_name = action.assigned_to_name;
 action.assigned_to.position = action.position;
 action.assigned_to.org_name = action.org_name;
 action.assigned_to.supervisor_name = action.supervisor;
 action.start_date = moment(action.start_date)['_d'];
 action.target_end_date = moment(action.target_end_date)['_d'];
 action.actual_end_date = moment(action.actual_end_date)['_d'];
 var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {hazard_corrective_action_id: action.hazard_corrective_action_id});
 console.log(notified_to);
 if (angular.isDefined(notified_to)) {
 action.notified_to = notified_to;
 } else {
 action.notified_to = [];
 action.notified_to[0] = null;
 }
 //                    var notified_to = action.notified_names.split(',');
 ////                    action.notified_to = notified_to;
 //                    angular.forEach(notified_to, function (notify) {
 //                        action.notified_to = {};
 //                        action.notified_to.employee_id = notify;
 //                    });
 });
 
 $scope.report.effectsTypes = $scope.effectsTypes;
 $scope.report.causeTypes = $scope.causeTypes;
 }, function (errors) {
 coreService.resetAlert();
 coreService.setAlert({type: 'exception', message: errors[0].data});
 coreService.setAlert({type: 'exception', message: errors[1].data});
 });
 };*/