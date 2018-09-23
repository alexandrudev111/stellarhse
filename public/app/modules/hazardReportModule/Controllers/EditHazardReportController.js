(function () {
    var controller = function ($scope, $uibModal, $stateParams, coreService, $state, $q, hazardReportService, $filter, $controller, coreReportService) {
        $scope.reportType = 'hazard';
        console.log($stateParams);
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.Hazard;
        if($scope.reportPermissions.readonlywhathappened || $scope.reportPermissions.readonlyhazarddetails || 
            $scope.reportPermissions.readonlypeopleinvolved || $scope.reportPermissions.readonlyaction ||
            $scope.reportPermissions.readonlydocuments)
            $scope.reportPermissions.readonlyreport = true;
        var firstLoad = true;
        $scope.disabeldTrue = true;
        $scope.canUpdateDraft = false;
        $scope.lockedReport = true;
        $scope.editMode = false;
        
        $scope.showCutomFields = true;
        $scope.EditMode = function (){

            if ($stateParams.reportNumber != null) {
                data={
                    reportNum: parseInt($stateParams.reportNumber),
                    product_code: $scope.reportType
                }

                coreReportService.checkEditingBy(data)
                .then(function (response) {
                    console.log(response);

                    if (response.data[0].editing_by !== "" && response.data[0].editing_by !== $scope.user.employee_id) {
                        $scope.disabeldTrue = true;
                        $scope.lockedReport = true;

                        coreService.resetAlert();
                        var post = {language_id: $scope.user.language_id, alert_message_code: 'lockincident'};
                        coreService.getAlertMessageByCode(post).then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.msgTitle = response.data['alert_name'];
                                $scope.msgBody = response.data['alert_message_description'];
                                console.log($scope.msgTitle);

                                $scope.$uibModalInstance = $uibModal.open({
                                    animation: $scope.animationsEnabled,
                                    templateUrl: 'app/modules/adminToolsModule/views/help.html',
                                    controller: 'trainningProviderCtrl',
                                    scope: $scope
                                });
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }
                    else{
                        $scope.canUpdateDraft = true;
                        $scope.disabeldTrue = false;
                        $scope.lockedReport = false;
                        $scope.editMode = true;
                        if ($stateParams.reportNumber != null && $stateParams.draftId != null)
                            $scope.updateEditingBy('edit'); 
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
            else{// on populate Draft case
                $scope.canUpdateDraft = true;
                $scope.disabeldTrue = false;
                $scope.lockedReport = false;
                $scope.editMode = true;
            }
        }
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
            console.log($scope.reportTypes);
            $scope.hazard_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
            $scope.report.report_type_name = $scope.hazard_type_name;
            console.log($scope.report);
             $scope.updateDreaftReport();
        };
        var init = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            hazardReportService.getHazardTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.$watch('report', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoad) {
                firstLoad = false;
                init();
                console.log($stateParams.reportNumber);
                // from draft on new case
                if ($stateParams.reportNumber == null) {//populate darft data
                    $scope.report = coreService.getDraftReport();
                    $scope.discardName = 'Discard draft report';
                    $scope.retriveReportData();
                }
                else if ($stateParams.reportNumber != null && $stateParams.draftId == null)// populate data on draft on discard case
                    $scope.populateOriginalReportData($stateParams.reportNumber);
                else// normal EDit case
                    $scope.getReportData($stateParams.reportNumber);
            }
        }, true);

        $scope.submitHazardReport = function (notify) {
             
            var offset = (new Date().getTimezoneOffset())/60;
            $scope.report.clientTimeZoneOffset = offset;
            
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            if ($scope.report.hazard_number == undefined) 
                $scope.report.process_type = 'add';
            else
                $scope.report.process_type = 'edit';
            if(notify)
                $scope.report.notify = 'notify';
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
//                $scope.report.whoIdentified.employee_id = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.full_name = $scope.whoIdentified.employee_id;
////                $scope.report.whoIdentified.emp_id = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.email = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.position = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.crew_name = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.org_name = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.primary_phone = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.alternate_phone = $scope.whoIdentified.employee_id;
//                $scope.report.whoIdentified.supervisor_name = $scope.whoIdentified.employee_id;
          /*  if (angular.isDefined($scope.report.riskLevelsValues)) {
                $scope.report.riskLevels = [];
                if ($scope.report.riskLevelsValues.hasOwnProperty('hazard_exist') && $scope.report.riskLevelsValues.hazard_exist !== ''
                && $scope.report.riskLevelsValues.hazard_exist !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.hazard_exist, {risk_level_value: $scope.report.riskLevelsValues.hazard_exist})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('worker_exposure') && $scope.report.riskLevelsValues.worker_exposure !== ''
                && $scope.report.riskLevelsValues.worker_exposure !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.worker_exposure, {risk_level_value: $scope.report.riskLevelsValues.worker_exposure})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('potential_consequences') && $scope.report.riskLevelsValues.potential_consequences !== ''
                && $scope.report.riskLevelsValues.potential_consequences !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.potential_consequences, {risk_level_value: $scope.report.riskLevelsValues.potential_consequences})[0].risk_level_id);
            }*/
            if (angular.isDefined($scope.report.riskLevelsValues)) {
                $scope.report.riskLevels = {};
/*                if ($scope.report.riskLevelsValues.hasOwnProperty('impact') && $scope.report.riskLevelsValues.impact !== ''
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
            if ($scope.report.draft_id  && $scope.report.draft_id != undefined )
                $scope.updateEditingBy('finish');  
            if ($stateParams.reportNumber == null) {
                $scope.report.creator_id = $scope.user.employee_id;
                $scope.deleteDraft("delete");
            }
            else
                coreService.setDraftReport(undefined);//delete draft if this create on spot
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
        
//        $scope.oneAtATime = true;
//
//
//        // this object is used to disable add to DB button once report open then the value changed according to user choice isn't in DB
//
//
//
//        $scope.open1 = function () {
//            $scope.popup1.opened = true;
//        };
//        $scope.popup1 = {
//            opened: false
//        };
//
//
//
//        $scope.clear1 = function () {
//            $scope.hazardReport.riskLevels.hazard_exist = false;
//        }
//
//        $scope.clear2 = function () {
//            $scope.hazardReport.riskLevels.worker_exposure = false;
//        }
//
//        $scope.clear3 = function () {
//            $scope.hazardReport.riskLevels.potential_consequences = false;
//        }
//
//        $scope.clear4 = function () {
//            $scope.hazardReport.should_work_stopped = false;
//        }
//        $scope.clearCorrective = function () {
//
//            $scope.hazardReport.are_additional_corrective_actions_required = false;
//        }
//
//        $scope.clearStatus = function () {
//
//            $scope.hazardReport.hazardStatus = false;
//        }
//
//
//        $scope.clearPriority = function () {
//
//            $scope.action.corrective_action_priority_id = false;
//        }
//
//        $scope.clearStatus = function () {
//
//            $scope.action.corrective_action_status_id = false;
//        }
//        $scope.clearPriority = function () {
//
//            $scope.action.corrective_action_priority_id = false;
//        }
//
//        $scope.clearStatus = function () {
//
//            $scope.action.corrective_action_status_id = false;
//        }
//        $scope.open1 = function () {
//            $scope.popup1.opened = true;
//        };
//
////        $scope.open1 = function () {
////            $scope.popup1.opened = true;
////        };
////        $scope.popup1 = {
////            opened: false
////        };
////
////        $scope.open1 = function () {
////            $scope.popup1.opened = true;
////        };
////
////        $scope.setDate = function (year, month, day) {
////            $scope.dt = new Date(year, month, day);
////        };
//
//
//        $scope.datePopUps = {
//            report_date: false,
//            start_date: false,
//            target_end_date: false,
//            actual_end_date: false
//        };
//
//        // this object is used to disable add to DB button once report open then the value changed according to user choice isn't in DB
//        $scope.initializeReport = {
//            whoIdentifiedEmployee: true,
//            thirdPartyContract: true,
//            thirdPartyCustomer: true,
//            location1: true,
//            location2: true,
//            location3: true,
//            location4: true,
//            equipment: true,
//            actionAssignTo: true,
//            actionNotifyTo: true
//        };
//        $scope.user = coreService.getUser();
//        if (!$scope.user)
//            $state.go('login');
//
//        $scope.hazard_type_name = false;
//        $scope.hazardData = {EmployeeId: ''};
//        $scope.whoIdentified = null;
//        $scope.employees = [];
//        $scope.whoIdentifiedEmployees = [];
//        $scope.peopleInvolved = [];
//        $scope.contractor_thirdparties = [];
//        $scope.customer_thirdparties = [];
//        $scope.equipments = [];
//        $scope.contractors_involved = [];
//        $scope.customer_involved = [];
//        $scope.equipment_involved = [];
//        var howInvolvedField = [];
//        $scope.actingAs = [];
//        $scope.certifications = [];
//        var actingAs = [];
//        var certifications = [];
//        var contractorInvolvedIndex = [];
//        var customerInvolvedIndex = [];
//
//        $scope.hazardReport = {
//            whoIdentified: {},
//            hazardStatus: {},
//            riskLevels: {},
//            contractor_thirdparty: [],
//            customer_thirdparty: [],
//            equipment_involved: [],
//            impactTypes: [],
//            riskControls: [],
//            peopleInvolved: [],
//            correctiveActions: [],
//            causeTypes: [],
//            hazard_third_party: [],
//            org_id: $scope.user.org_id
//        };
//        $scope.hazardReport.correctiveActions[0] = {};
//        $scope.hazardReport.correctiveActions[0].heading = 'First Action';
//        $scope.hazardReport.correctiveActions[0].notified_to = [];
//        $scope.hazardReport.correctiveActions[0].notified_to[0] = null;
//        $scope.status = {
//            isFirstPerson: true,
//            correctiveAction: [],
//            effectType: [],
//            causeType: []
//        };
//        $scope.status.effectType[0] = true;
//        $scope.status.correctiveAction[0] = true;
//        $scope.getHazardTypeName = function () {
//            $scope.hazard_type_name = $filter('filter')($scope.hazardTypes, {haz_type_id: $scope.hazardReport.haz_type_id})[0].haz_type_name;
//        };
//        $scope.getReportedByUser = function (query, key, index, whoidentified) {
//            if ((!query) || query.length < 1)
//                return [];
//            if (key == 'employee_name') {
//                query = " first_name LIKE '" + query + "%'";
//            } else if (key == 'emp_id') {
//                query = " emp_id LIKE '" + query + "%'";
//            } else if (key == 'position') {
//                query = " position LIKE '" + query + "%'";
//            } else if (key == 'email') {
//                query = " email LIKE '" + query + "%'";
//            } else if (key == 'org_name') {
//                query = " org_name LIKE '" + query + "%'";
//            } else if (key == 'primary_phone') {
//                query = " primary_phone LIKE '" + query + "%'";
//            } else if (key == 'alternate_phone') {
//                query = " alternate_phone LIKE '" + query + "%'";
//            } else if (key == 'supervisor_name') {
//                query = " supervisor_name LIKE '" + query + "%'";
//            } else if (key == 'crew_name') {
//                query = " crew_name LIKE '" + query + "%'";
//            }
//
//            coreReportService.getEmployees({
//                query: query,
//                org_id: $scope.user['org_id']
//            }).then(function (response) {
//                var res = response.data;
//                if (res) {
//                    $scope.employees[index] = res;
//                    if (whoidentified)
//                        $scope.whoIdentifiedEmployees = res;
//                    $scope.initializeReport.whoIdentifiedEmployee = false;
//                }
//            });
//        };
//        $scope.getThirdpartiesInvolved = function (q, key, index) {
//            if ((!q) || q.length < 1)
//                return [];
//            var query = "";
//            if (key == 'Customer') {
//                query = " third_party_type_name ='Customer' and third_party_name LIKE '" + q + "%'";
//                coreReportService.getthirdpartyinfo({
//                    query: query,
//                    org_id: $scope.user['org_id']
//                }).then(function (response) {
//                    var res = response.data;
//                    if (res.data) {
//                        $scope.customer_thirdparties[index] = res.data;
//                        $scope.initializeReport.thirdPartyCustomer = false;
//                    }
//                });
//            } else if (key == 'Contractor') {
//                query = " third_party_type_name ='Contractor' and third_party_name LIKE '" + q + "%'";
//                coreReportService.getthirdpartyinfo({
//                    query: query,
//                    org_id: $scope.user['org_id']
//                }).then(function (response) {
//                    var res = response.data;
//                    if (res.data) {
//                        $scope.contractor_thirdparties[index] = res.data;
//                        $scope.initializeReport.thirdPartyContract = false;
//                    }
//                });
//            }
//
//
//        };
//        $scope.addNewPerson = function () {
//            var newPerson = {};
//            if ($scope.peopleInvolved.length == 0)
//                newPerson.title = "First Person";
//            else
//                newPerson.title = "New Person";
//            $scope.getData(newPerson);
//            $scope.peopleInvolved.push(newPerson);
//        };
//        $scope.getData = function (newPerson) {
//            var data = {
//                org_id: $scope.user.org_id,
//                language_id: $scope.user.language_id
//            };
//
//            $q.all([coreReportService.getHazardCertificates(data),
//                coreReportService.getHazardActingAs(data)]).then(function (queues) {
//                newPerson.certifications = queues[0].data;
//                newPerson.actingAs = queues[1].data;
//            }
//            , function (errors) {
//                coreService.setAlert({type: 'exception', message: errors[0].data});
//                coreService.setAlert({type: 'exception', message: errors[1].data});
//            });
//        }
//        $scope.onSelectedPeopleInvolved = function (selectedItem) {
//            var itemSelected = selectedItem;
//            itemSelected.type = 'whoidentified';
//            itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'hazard'})[0]).how_involved_name;
//            itemSelected.exp_in_current_postion = null;
//            itemSelected.supervisor_name = null;
//            itemSelected.exp_over_all = null;
//            itemSelected.age = null;
//            itemSelected.third_party_id = null;
//            itemSelected.role_description = null;
//            itemSelected.title = selectedItem.full_name;
//            $scope.getData(itemSelected);
//            var index = $scope.peopleInvolved.length - 1;
//            $scope.peopleInvolved[index] = itemSelected;
//
//        }
//        $scope.onSelectWhoIdentifiedHazard = function (selectedItem) {
//            $scope.whoIdentified = selectedItem;
//            //This to check if user select user befor to replace it with the new one he selected
//            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
//            if (checkIfPeopleInvolved.length !== 0) {
//                var oldWhoidentified = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'})[0];
//                var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(oldWhoidentified);
//                var itemSelected = selectedItem;
//                itemSelected.type = 'whoidentified';
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'hazard'})[0]).how_involved_name;
//                itemSelected.title = selectedItem.full_name;
//                $scope.getData(itemSelected);
//                $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
//                $scope.hazardReport.whoIdentified = itemSelected;
//            } else {
//                var itemSelected = selectedItem;
//                itemSelected.type = 'whoidentified';
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'hazard'})[0]).how_involved_name;
//                itemSelected.exp_in_current_postion = null;
//                itemSelected.supervisor_name = null;
//                itemSelected.exp_over_all = null;
//                itemSelected.age = null;
//                itemSelected.third_party_id = null;
//                itemSelected.role_description = null;
//                itemSelected.title = selectedItem.full_name;
//                $scope.getData(itemSelected);
//                var index = $scope.peopleInvolved.length - 1;
//                if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
//                    $scope.peopleInvolved[index] = itemSelected;
//                else
//                    $scope.peopleInvolved.push(itemSelected);
//                $scope.hazardReport.whoIdentified = itemSelected;
//            }
//        };
//        $scope.checkEmail = function (obj, value) {
//            if (angular.isDefined(value))
//                if (!value.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/) && value !== null && value !== '') {
//                    obj['whoIdentifiedEmailError'] = 'Invalid email format!';
//                    obj.email = null;
//                } else {
//                    obj['whoIdentifiedEmailError'] = null;
//                }
//        };
//        $scope.whoIdentifiedChanged = function (value, key) {
//            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
//            if (checkIfPeopleInvolved.length !== 0) {
//                var employee = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'})[0];
//                var indexOfWhoIdentified = $scope.peopleInvolved.indexOf(employee);
//
//                if (key === "emp_id") {
//                    employee.emp_id = value;
//                } else if (key === "position") {
//                    employee.position = value;
//                } else if (key === "crew_name") {
//                    employee.crew_name = value;
//                } else if (key === "email") {
//                    employee.email = value;
//                } else if (key === "org_name") {
//                    employee.org_name = value;
//                } else if (key === "primary_phone") {
//                    employee.primary_phone = value;
//                } else if (key === "alternate_phone") {
//                    employee.alternate_phone = value;
//                } else if (key === "supervisor_name") {
//                    employee.supervisor_name = value;
//                }
//                $scope.peopleInvolved[indexOfWhoIdentified] = employee;
//                $scope.hazardReport.whoIdentified = employee;
//            }
//
//        };
//
//        $scope.onContractorThirdPartySelected = function (selectedItem, index) {
////            if (index == 0)
////                selectedItem.contractorRemove = true;
//
//            var thirdPartyInvolved = selectedItem;
//            thirdPartyInvolved.employee_id = selectedItem.third_party_id;
//            thirdPartyInvolved.full_name = selectedItem.contact_name;
//            thirdPartyInvolved.type = 'thirdparty';
//            thirdPartyInvolved.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'contractor'})[0]).how_involved_name;
//            thirdPartyInvolved.exp_in_current_postion = null;
//            thirdPartyInvolved.exp_over_all = null;
//            thirdPartyInvolved.age = null;
//            thirdPartyInvolved.org_name = selectedItem.third_party_name;
//            thirdPartyInvolved.title = selectedItem.full_name;
//            thirdPartyInvolved.third_party_id = selectedItem.third_party_id;
//            thirdPartyInvolved.role_description = null;
//            $scope.contractors_involved[index] = thirdPartyInvolved;
//            if (selectedItem.contact_name.length !== 0) {
//                thirdPartyData(thirdPartyInvolved, index, "contractor");
//            } else {
//                console.log(" ****  Empty name **** ");
//                var editThirdParty = [];
//                editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: index});
//                console.log(editThirdParty);
//                if (editThirdParty.length > 0) {
//
//                    $scope.peopleInvolved.splice(editThirdParty[0].tabIndex, 1);
//                    contractorInvolvedIndex.splice(editThirdParty[0].tabIndex, 1);
//                    if ($scope.peopleInvolved.length == 0) {
//                        $scope.addNewPerson();
//                    }
//                }
//
//
//            }
//        };
//        $scope.onCustomerThirdPartySelected = function (selectedItem, index) {
//
////            if (index == 0)
////                selectedItem.customerRemove = true;
//
//            var thirdPartyInvolved = selectedItem;
//            thirdPartyInvolved.employee_id = selectedItem.third_party_id;
//            thirdPartyInvolved.full_name = selectedItem.contact_name;
//            thirdPartyInvolved.type = 'thirdparty';
//            thirdPartyInvolved.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'customer'})[0]).how_involved_name;
//            thirdPartyInvolved.exp_in_current_postion = null;
//            thirdPartyInvolved.exp_over_all = null;
//            thirdPartyInvolved.age = null;
//            thirdPartyInvolved.title = selectedItem.full_name;
//
//            thirdPartyInvolved.org_name = selectedItem.third_party_name;
//            thirdPartyInvolved.third_party_id = selectedItem.third_party_id;
//            thirdPartyInvolved.role_description = null;
//            $scope.customer_involved[index] = thirdPartyInvolved;
//            if (selectedItem.contact_name.length !== 0) {
//                thirdPartyData(thirdPartyInvolved, index, "customer");
//            } else {
//                console.log(" ****  Empty name **** ");
//                var editThirdParty = [];
//                editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: index});
//                console.log(editThirdParty);
//                if (editThirdParty.length > 0) {
//
//                    $scope.peopleInvolved.splice(editThirdParty[0].tabIndex, 1);
//                    customerInvolvedIndex.splice(editThirdParty[0].tabIndex, 1);
//                    if ($scope.peopleInvolved.length == 0) {
//                        $scope.addNewPerson();
//                    }
//                }
//
//
//            }
//        };
//        var thirdPartyData = function (thirdPartyInvolved, thirdPartyIndex, type) {
//
//            thirdPartyInvolved.certifications = certifications;
//            thirdPartyInvolved.actingAs = actingAs;
//            var arrayLength = 0;
//            $scope.getData(thirdPartyInvolved);
//            var peopleInvolvedIndex = $scope.peopleInvolved.length - 1;
//
//            if (type === "customer") {
//                $scope.customer_involved[thirdPartyIndex] = thirdPartyInvolved;
//
//                var editThirdParty = [];
//                editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: thirdPartyIndex});
//
//                if (editThirdParty.length > 0) {
//
//                    var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
//                    if (index < 0) {
//                        $scope.peopleInvolved[editThirdParty[0].tabIndex] = thirdPartyInvolved;
//                    } else {
//                        thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
//                        thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
//                        $scope.peopleInvolved[index] = thirdPartyInvolved;
//                    }
//
//                } else {
//                    if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New Person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First Person")
//                        $scope.peopleInvolved[peopleInvolvedIndex] = thirdPartyInvolved;
//                    else {
//                        var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
//                        if (index < 0) {
//                            $scope.peopleInvolved.push(thirdPartyInvolved);
//                        } else {
//                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
//                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
//                            $scope.peopleInvolved[index] = thirdPartyInvolved;
//
//                        }
//                        $scope.hazardReport.hazard_third_party.push(thirdPartyInvolved);
//                    }
//                }
//
//                var customerObject = {};
//                customerObject.customerIndex = thirdPartyIndex;
//                customerObject.tabIndex = $scope.peopleInvolved.length - 1;
//                customerInvolvedIndex.push(customerObject);
//            } else
//            {
//                $scope.contractors_involved[thirdPartyIndex] = thirdPartyInvolved;
//
//                var editThirdParty = [];
//                editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: thirdPartyIndex});
//
//                if (editThirdParty.length > 0) {
//
//                    var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
//                    if (index < 0) {
//                        $scope.peopleInvolved[editThirdParty[0].tabIndex] = thirdPartyInvolved;
//                    } else {
//                        thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
//                        thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
//                        $scope.peopleInvolved[index] = thirdPartyInvolved;
//                    }
//
//                } else {
//                    if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New Person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First Person")
//                        $scope.peopleInvolved[peopleInvolvedIndex] = thirdPartyInvolved;
//                    else {
//                        var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
//                        if (index < 0) {
//                            $scope.peopleInvolved.push(thirdPartyInvolved);
//                        } else {
//                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
//                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
//                            $scope.peopleInvolved[index] = thirdPartyInvolved;
//
//                        }
//                        $scope.hazardReport.hazard_third_party.push(thirdPartyInvolved);
//                    }
//                }
//
//                var contractorObject = {};
//                contractorObject.contractorIndex = thirdPartyIndex;
//                contractorObject.tabIndex = $scope.peopleInvolved.length - 1;
//                $scope.contractors_involved[thirdPartyIndex] = thirdPartyInvolved;
//                contractorInvolvedIndex.push(contractorObject);
//            }
//        }
//        $scope.customerThirdPartyNameChanged = function (customerIndex) {
//            var customer = $scope.customer_involved[customerIndex];
//            if (customer.contact_name.length !== 0) {
//                thirdPartyData(customer, customerIndex, "customer");
//            }
//
//        };
//        $scope.contractorThirdPartyNameChanged = function (contractorIndex) {
//            var contractor = $scope.contractors_involved[contractorIndex];
//            if (contractor.contact_name.length !== 0) {
//                thirdPartyData(contractor, contractorIndex, "contractor");
//            }
//
//        };
//        $scope.onEquipmentSelected = function (selectedItem, index) {
////            if (index == 0)
////                selectedItem.equipmentRemove = true;
//            $scope.hazardReport.equipment_involved[index] = selectedItem;
//        };
//        $scope.removeContractor = function (index, item) {
//            $scope.contractors_involved.splice(index, 1);
//            var indexpeopleInvolved = $scope.peopleInvolved.indexOf(item);
//            $scope.peopleInvolved.splice(indexpeopleInvolved, 1);
//            var indexInhazardReport = $scope.hazardReport.hazard_third_party.indexOf(item);
//            $scope.hazardReport.hazard_third_party.splice(indexInhazardReport);
//        };
//        $scope.removeCustomer = function (index, item) {
//            $scope.customer_involved.splice(index, 1);
//            var indexpeopleInvolved = $scope.peopleInvolved.indexOf(item);
//            $scope.peopleInvolved.splice(indexpeopleInvolved, 1);
//            var indexInhazardReport = $scope.hazardReport.hazard_third_party.indexOf(item);
//            $scope.hazardReport.hazard_third_party.splice(indexInhazardReport);
//        };
//        $scope.removeEquipment = function (item, index) {
//            var equipmentInvolved = $scope.peopleInvolved.indexOf(item);
//            $scope.hazardReport.equipment_involved.splice(equipmentInvolved);
//        };
//        $scope.removeNotifyPerson = function (correctiveActionIndex, notifieIndex) {
//            $scope.hazardReport.correctiveActions[correctiveActionIndex].notified_to.splice(notifieIndex, 1);
//        };
//        $scope.removeAction = function (correctiveActionIndex) {
//            $scope.hazardReport.correctiveActions.splice(correctiveActionIndex, 1);
//        };
//        $scope.getLocations1 = function (location1Letters) {
//            var data = {
//                org_id: $scope.user.org_id,
//                letters: location1Letters
//            };
//            if (location1Letters !== '' && location1Letters !== null)
//                coreReportService.getLocations1(data)
//                        .then(function (response) {
//                            console.log(response.data)
//                            $scope.locations1 = response.data;
//                            $scope.locations2 = [];
//                            $scope.locations3 = [];
//                            $scope.locations4 = [];
//                            $scope.initializeReport.location1 = false;
//                        }, function (error) {
//
//                        });
//        };
//        $scope.getLocations2 = function (location2Letters) {
//            var data = {
//                org_id: $scope.user.org_id,
//                letters: location2Letters,
//                location1_id: $scope.hazardReport.location1_id
//            };
//            if (location2Letters !== '' && location2Letters !== null)
//                coreReportService.getLocations2(data)
//                        .then(function (response) {
//                            console.log(response.data)
//                            $scope.locations2 = response.data;
//                            $scope.locations3 = [];
//                            $scope.locations4 = [];
//                            $scope.initializeReport.location2 = false;
//                        }, function (error) {
//
//                        });
//        };
//        $scope.getLocations3 = function (location3Letters) {
//            var data = {
//                org_id: $scope.user.org_id,
//                letters: location3Letters,
//                location2_id: $scope.hazardReport.location2_id
//            };
//            if (location3Letters !== '' && location3Letters !== null)
//                coreReportService.getLocations3(data)
//                        .then(function (response) {
//                            console.log(response.data)
//                            $scope.locations3 = response.data;
//                            $scope.locations4 = [];
//                            $scope.initializeReport.location3 = false;
//                        }, function (error) {
//
//                        });
//        };
//        $scope.getLocations4 = function (location4Letters) {
//            var data = {
//                org_id: $scope.user.org_id,
//                letters: location4Letters,
//                location3_id: $scope.hazardReport.location3_id
//            };
//            if (location4Letters !== '' && location4Letters !== null)
//                coreReportService.getLocations4(data)
//                        .then(function (response) {
//                            console.log(response.data)
//                            $scope.locations4 = response.data;
//                            $scope.initializeReport.location4 = false;
//                        }, function (error) {
//
//                        });
//        };
//        $scope.onSelectLocation2 = function () {
//            var selectedLocation = $filter('filter')($scope.locations2, {location2_id: $scope.hazardReport.location2_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.hazardReport.location3_id) || $scope.hazardReport.location3_id === null) {
//            $scope.hazardReport.location1_id = selectedLocation.location1_id;
//            $scope.locations1 = $scope.locations2;
////            }
//        };
//        $scope.onSelectLocation3 = function () {
//            var selectedLocation = $filter('filter')($scope.locations3, {location3_id: $scope.hazardReport.location3_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.hazardReport.location3_id) || $scope.hazardReport.location3_id === null) {
//            $scope.hazardReport.location2_id = selectedLocation.location2_id;
//            $scope.hazardReport.location1_id = selectedLocation.location1_id;
//            $scope.locations2 = $scope.locations3;
//            $scope.locations1 = $scope.locations3;
////            }
//        };
//        $scope.onSelectLocation4 = function () {
//            var selectedLocation = $filter('filter')($scope.locations4, {location4_id: $scope.hazardReport.location4_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.hazardReport.location3_id) || $scope.hazardReport.location3_id === null) {
//            $scope.hazardReport.location3_id = selectedLocation.location3_id;
//            $scope.hazardReport.location2_id = selectedLocation.location2_id;
//            $scope.hazardReport.location1_id = selectedLocation.location1_id;
//            $scope.locations3 = $scope.locations4;
//            $scope.locations2 = $scope.locations4;
//            $scope.locations1 = $scope.locations4;
////            }
//        };
//        $scope.getEquipments = function (equipmentLetters, index) {
//            if (equipmentLetters !== '' && equipmentLetters !== null)
//                coreReportService.getEquipments($scope.user.org_id, equipmentLetters)
//                        .then(function (response) {
//                            $scope.equipments[index] = response.data;
//                            $scope.initializeReport.equipment = false;
//                        }, function (error) {
//
//                        });
//        };
//        $scope.calculateRiskLevel = function () {
//            $scope.riskLevelTotal = 0;
//            angular.forEach($scope.hazardReport.riskLevels, function (level) {
//                $scope.riskLevelTotal += parseInt(level);
//            });
//            if ($scope.riskLevelTotal >= 7)
//                $scope.hazardReport.should_work_stopped = 'Yes';
//        };
//        $scope.getAssignToName = function (index) {
//            if (angular.isDefined($scope.hazardReport.correctiveActions[index].assigned_to) &&
//                    ($scope.hazardReport.correctiveActions[index].assigned_to !== '' || $scope.hazardReport.correctiveActions[index].assigned_to !== null))
//                $scope.hazardReport.correctiveActions[index].heading = $scope.hazardReport.correctiveActions[index].assigned_to.full_name;
//            else
//            if (index === 0)
//                $scope.hazardReport.correctiveActions[index].heading = 'First Action';
//            else
//                $scope.hazardReport.correctiveActions[index].heading = 'New Action';
//        };
//        $scope.checkCorrectiveActionDates = function (action) {
//            coreService.resetAlert();
//            var actionStatus = $filter('filter')($scope.correctiveActionStatues,
//                    {corrective_action_status_id: action.corrective_action_status_id});
//            if (angular.isDefined(actionStatus) && actionStatus.length) {
//                actionStatus = actionStatus[0].field_code;
//            } else {
//                actionStatus = 'open';
//            }
//            if (action.start_date > action.target_end_date && action.target_end_date !== null) {
//                action.target_end_date = null;
//                if (actionStatus == 'open' || actionStatus == 'delayed')
//                    coreService.setAlert({type: 'error', message: 'Start Date must be before Target End Date'});
//                else
//                    coreService.setAlert({type: 'error', message: 'Start Date must be before Target End Date and Actual End Date'});
//            } else if (action.start_date > action.actual_end_date && action.actual_end_date !== null) {
//                action.actual_end_date = null;
//                if (actionStatus == 'open' || actionStatus == 'delayed')
//                    coreService.setAlert({type: 'error', message: 'Start Date must be before Target End Date'});
//                else
//                    coreService.setAlert({type: 'error', message: 'Start Date must be before Target End Date and Actual End Date'});
//            }
//        };
//        $scope.getCorrectiveActionEmployees = function (type, employeeLetters, index, notifyIndex) {
//            if (employeeLetters !== '' && employeeLetters !== null) {
//                var data = {
//                    org_id: $scope.user.org_id,
//                    letters: employeeLetters,
//                    type: type
//                };
//                coreReportService.getCorrectiveActionEmployees(data)
//                        .then(function (response) {
//                            if (type === 'assigntoname' || type === 'assigntosupervisor') {
//                                $scope.hazardReport.correctiveActions[index].correctiveActionAssignedEmployees = response.data;
//                                $scope.initializeReport.actionAssignTo = false;
//                            } else {
//                                if (!angular.isDefined($scope.hazardReport.correctiveActions[index].correctiveActionNotifiededEmployees))
//                                    $scope.hazardReport.correctiveActions[index].correctiveActionNotifiededEmployees = [];
//                                $scope.hazardReport.correctiveActions[index].correctiveActionNotifiededEmployees[notifyIndex] = response.data;
//                                $scope.initializeReport.actionNotifyTo = false;
//                            }
//                        }, function (error) {
//
//                        });
//            }
//        };
//        $scope.addNewAction = function () {
//            var newAction = {};
//            newAction.heading = 'New Action';
//            newAction.corrective_action_status_id = $filter('filter')($scope.correctiveActionStatues, {field_code: 'open'})[0].corrective_action_status_id;
//            newAction.statusDisabled = true;
//            newAction.notified_to = [];
//            newAction.notified_to[0] = null;
//            $scope.hazardReport.correctiveActions.push(newAction);
//        };
//        $scope.getCorrectiveActionStatus = function (index, status) {
//            if (status.field_code === 'closed') {
//                // disabled actual_date & actual cost and make its color red
//                $scope.hazardReport.correctiveActions[index].statusDisabled = false;
//            } else {
//                $scope.hazardReport.correctiveActions[index].statusDisabled = true;
//            }
//        };
//        $scope.addNewNotifiedTo = function (index) {
//            var newNotifiedTo = null;
//            $scope.hazardReport.correctiveActions[index].notified_to.push(newNotifiedTo);
//        };
//        $scope.getNotifyToName = function (notifyPerson, notifyPersonIndex, index) {
//            // not working yet !!
//            console.log(notifyPerson)
//            $scope.hazardReport.correctiveActions[index].notified_to[notifyPersonIndex] = notifyPerson;
//            console.log($scope.hazardReport.correctiveActions[index].notified_to)
////            if (notifyPerson.hasOwnProperty('full_name')) {
////                angular.forEach($scope.hazardReport.correctiveActions[index].notified_to, function (notify) {
////            console.log(notify)
////            console.log(notify.full_name === notifyPerson.full_name)
////                    if (notify.full_name === notifyPerson.full_name) {
////                        coreService.resetAlert();
////                        coreService.setAlert({type: 'error', message: 'This name is assigned before'});
////                    }
////                });
////            }
//        };
//        $scope.submitHazardReport = function () {
//            $scope.hazardReport.peopleInvolved = $scope.peopleInvolved;
//            $scope.hazardReport.creator_id = $scope.user.employee_id;
//            $scope.hazardReport.riskLevels = [];
//            $scope.hazardReport.riskLevels.push($filter('filter')($scope.riskLevels.hazard_exist, {risk_level_value: $scope.hazardReport.riskLevels.hazard_exist})[0].risk_level_id);
//            $scope.hazardReport.riskLevels.push($filter('filter')($scope.riskLevels.worker_exposure, {risk_level_value: $scope.hazardReport.riskLevels.hazard_exist})[0].risk_level_id);
//            $scope.hazardReport.riskLevels.push($filter('filter')($scope.riskLevels.potential_consequences, {risk_level_value: $scope.hazardReport.riskLevels.hazard_exist})[0].risk_level_id);
//            hazardReportService.submitHazardReport($scope.hazardReport)
//                    .then(function (response) {
//
//                        coreService.resetAlert();
//                        coreService.setAlert({type: 'success', message: "The report has been added successfully"});
//                    }, function (error) {
//
//                        coreService.resetAlert();
//                        coreService.setAlert({type: 'exception', message: error.data});
//                    });
//        }
//        var init = function () {
//            var data = {
//                org_id: $scope.user.org_id,
//                language_id: $scope.user.language_id
//            };
//            var impactData = {
//                org_id: $scope.user.org_id,
//                potential: 1 // this for impact types
//            };
////            var contractor = {contractorRemove: true};
//            var contractor = null;
//            $scope.contractors_involved.push(contractor);
////            var customer = {customerRemove: true};
//            var customer = null;
//            $scope.customer_involved.push(customer);
//
//            var equipment = null;
//            $scope.hazardReport.equipment_involved.push(equipment);
//
//            $q.all([
//                coreReportService.getOperationTypes(data),
//                coreReportService.getCrews(data),
//                coreReportService.getImpactTypes(impactData),
//                coreReportService.getHazardStatuses(data),
//                coreReportService.getRiskControls(data),
//                coreReportService.getRiskLevels(data),
//                coreReportService.getEffectsTypes(data),
//                coreReportService.getCauseTypes(data),
//                coreReportService.getCorrectiveActionPriorities(data),
//                coreReportService.getCorrectiveActionStatuses(data),
//                coreReportService.getHowInvolvedField(data),
////                hazardReportService.getHazardNumber(data),
//                hazardReportService.getHazardTypes(data)
//            ]).then(function (queues) {
//                $scope.operationTypes = queues[0].data;
//                $scope.crews = queues[1].data;
//                $scope.hazardReport.impactTypes = queues[2].data;
//                $scope.hazardStatuses = queues[3].data;
//                $scope.hazardReport.riskControls = queues[4].data;
//                $scope.riskLevels = queues[5].data;
//                $scope.hazardReport.effectsTypes = queues[6].data;
//                $scope.hazardReport.causeTypes = queues[7].data;
//                $scope.correctiveActionPriorities = queues[8].data;
//                $scope.correctiveActionStatues = queues[9].data;
////                $scope.hazardReport.hazard_number = queues[10].data;
//                howInvolvedField = queues[10].data;
//                $scope.hazardTypes = queues[11].data;
//                $scope.addNewPerson();
//                $scope.hazardReport.correctiveActions[0].corrective_action_status_id = $filter('filter')($scope.correctiveActionStatues, {field_code: 'open'})[0].corrective_action_status_id;
//                $scope.hazardReport.correctiveActions[0].statusDisabled = true;
////                $scope.hazardReport.riskLevels.hazard_exist = 1;
////                $scope.hazardReport.riskLevels.worker_exposure = 1;
////                $scope.hazardReport.riskLevels.potential_consequences = 1;
////                $scope.riskLevelTotal = 3;
//            }, function (errors) {
//                coreService.resetAlert();
//                coreService.setAlert({type: 'exception', message: errors[0].data});
//                coreService.setAlert({type: 'exception', message: errors[1].data});
//                coreService.setAlert({type: 'exception', message: errors[2].data});
//                coreService.setAlert({type: 'exception', message: errors[3].data});
//                coreService.setAlert({type: 'exception', message: errors[4].data});
//                coreService.setAlert({type: 'exception', message: errors[5].data});
//                coreService.setAlert({type: 'exception', message: errors[6].data});
//                coreService.setAlert({type: 'exception', message: errors[7].data});
//                coreService.setAlert({type: 'exception', message: errors[8].data});
//                coreService.setAlert({type: 'exception', message: errors[9].data});
//                coreService.setAlert({type: 'exception', message: errors[10].data});
//                coreService.setAlert({type: 'exception', message: errors[11].data});
//            });
//            /*coreReportService.getHowInvolvedField(data)
//             .then(function (response) {
//             var res = response.data;
//             if (res) {
//             howInvolvedField = res;
//             }
//
//             }, function (error) {
//             coreService.resetAlert();
//             coreService.setAlert({type: 'exception', message: error[0]});
//             });*/
//        };
//        init();
//        $scope.addItem = function () {
//            var newItemNo = $scope.items.length + 1;
//            $scope.items.push('Item ' + newItemNo);
//        };
//        $scope.openAdd = function () {
////            if (angular.isDefined($scope.whoIdentified) && $scope.whoIdentified == null)
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/hazardReportModule/views/addNamePopup.html',
////                controller: 'AddHazardReportController'
//            });
//        };
//        $scope.openLoc = function () {
////            if (angular.isDefined($scope.hazardReport.location1_id) && $scope.hazardReport.location1_id == null)
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/hazardReportModule/views/location.html',
//                controller: 'AddHazardReportController'
//            });
//        };
//        $scope.opencontractor = function () {
////            if (angular.isDefined($scope.contractors_involved[index]) && $scope.contractors_involved[index] == null)
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/hazardReportModule/views/contractor.html',
//                controller: 'AddHazardReportController'
//            });
//        };
//        $scope.opencustomer = function () {
////            if (angular.isDefined($scope.customer_involved[index]) && $scope.customer_involved[index] == null)
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/hazardReportModule/views/customer.html',
//                controller: 'AddHazardReportController'
//            });
//        };
//        $scope.openEquipment = function () {
////            if (angular.isDefined($scope.hazardReport.equipment_involved[index]) && $scope.hazardReport.equipment_involved[index] == null)
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/hazardReportModule/views/equipment.html',
//                controller: 'AddHazardReportController'
//            });
//        };
//        $scope.contractorThitrdParty = [];
//        $scope.newContract = function () {
//            var newContract = null;
//            $scope.contractors_involved.push(newContract);
//        };
//        $scope.newCustomer = function () {
//            var newCustomer = null;
//            $scope.customer_involved.push(newCustomer);
//        };
//        $scope.newEquipment = function () {
//            var newEquipment = null;
//            $scope.hazardReport.equipment_involved.push(newEquipment);
//        };

        /* $scope.cloneContract = function () {
         //         var parentEle = document.getElementById("contractorParent");
         var newContractor = document.getElementsByClassName("cloneContractor");
         //
         //         parentEle.appendChild(newContractor[0].cloneNode(true));
         
         var btn = document.createElement("button"),
         removeText = document.createTextNode("Remove");
         btn.appendChild(removeText);
         
         btn.classList.add("btn", "btn-danger");
         console.log(btn);
         for (var i = 0; i < 100; i++) {
         
         newContractor[i].appendChild(btn);
         
         }
         
         
         }*/

        /*$scope.cloneCustomer = function () {
         var ParentCustomer = document.getElementById("ParentCustomer");
         var clonecustomer = document.getElementsByClassName("clonecustomer");
         ParentCustomer.appendChild(clonecustomer[0].cloneNode(true));
         var btn = document.createElement("button"),
         removeText = document.createTextNode("Remove");
         btn.appendChild(removeText);
         btn.classList.add("btn", "btn-danger", "danger");
         console.log(btn);
         for (var i = 0; i < 100; i++) {
         
         clonecustomer[i].appendChild(btn);
         }
         
         
         }
         
         $scope.cloneEquipment = function () {
         var ParentEquipment = document.getElementById("equipmentConainer");
         var cloneEquipment = document.getElementsByClassName("equipChild");
         ParentEquipment.appendChild(cloneEquipment[0].cloneNode(true));
         var btn = document.createElement("button"),
         removeText = document.createTextNode("Remove");
         btn.appendChild(removeText);
         btn.classList.add("btn", "btn-danger", "danger");
         console.log(btn);
         for (var i = 0; i < 100; i++) {
         
         cloneEquipment[i].appendChild(btn);
         }
         
         
         }*/

//        $scope.cancel = function () {
//            $uibModalInstance.dismiss('cancel');
//        };

//        $scope.clear1 = function () {
//            $scope.hazardReport.riskLevels.hazard_exist = 0;
//            $scope.calculateRiskLevel();
//        };
//        $scope.clear2 = function () {
//            $scope.hazardReport.riskLevels.worker_exposure = 0;
//            $scope.calculateRiskLevel();
//        };
//        $scope.clear3 = function () {
//            $scope.hazardReport.riskLevels.potential_consequences = 0;
//            $scope.calculateRiskLevel();
//        };
//        $scope.clear4 = function () {
//            $scope.hazardReport.should_work_stopped = null;
//        };
//        $scope.clearCorrective = function () {
//            $scope.hazardReport.are_additional_corrective_actions_required = null;
//        };
//        $scope.clearReportStatus = function () {
//            $scope.hazardReport.hazardStatus = null;
//        };
//        $scope.open1 = function () {
//            $scope.popup1.opened = true;
//        };
//        $scope.clearStatus = function (action) {
//            action.corrective_action_status_id = null;
//        };
//        $scope.clearPriority = function (action) {
//            action.corrective_action_priority_id = null;
//        };
//        $scope.clearCompleteTask = function (action) {
//            action.desired_results = null;
//        };
        
        
        
        
    };
    controller.$inject = ['$scope', '$uibModal', '$stateParams', 'coreService', '$state', '$q', 'hazardReportService', '$filter', '$controller', 'coreReportService'];
    angular.module("hazardReportModule").controller("EditHazardReportController", controller);
}());


