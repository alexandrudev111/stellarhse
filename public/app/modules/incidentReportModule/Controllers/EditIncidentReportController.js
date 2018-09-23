(function () {
    var controller = function ($scope, $uibModal, $stateParams, $state, coreReportService, coreService, $q, $filter, incidentReportService, $controller, constantService) {
        $scope.reportType = 'incident';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.ABCanTrack;
        if($scope.reportPermissions.readonlywhathappened || $scope.reportPermissions.readonlyimpacts || 
            $scope.reportPermissions.readonlypeopleinvolved || $scope.reportPermissions.readonlyopservation ||
            $scope.reportPermissions.readonlycauseanalysis || $scope.reportPermissions.readonlyinvestigation ||
            $scope.reportPermissions.readonlyaction || $scope.reportPermissions.readonlydocuments)
            $scope.reportPermissions.readonlyreport = true;
        var firstLoad = true;
        var firstLoadInit = true;
        var firstLoadReportData = true;
        $scope.disabeldTrue = true;
        $scope.canUpdateDraft = false;
        $scope.editMode = false;

      //  console.log($scope.reportForm.$pristine);
        $scope.lockedReport = true;
        $scope.showCutomFields = true;

         $scope.EditMode = function (){
            
            console.log($stateParams.reportNumber);
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
                        coreService.getAlertMessageByCode(post).then(function (res) {
                            if (!res.data.hasOwnProperty('file')) {
                                $scope.msgTitle = res.data['alert_name'];
                                $scope.msgBody = res.data['alert_message_description'];
                                console.log($scope.msgTitle);

                                $scope.$uibModalInstance = $uibModal.open({
                                    animation: $scope.animationsEnabled,
                                    templateUrl: 'app/modules/adminToolsModule/views/help.html',
                                    controller: 'trainningProviderCtrl',
                                    scope: $scope
                                });
                            }
                        }, function (err) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: err.data});
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
            else{
                $scope.canUpdateDraft = true;
                $scope.disabeldTrue = false;
                $scope.lockedReport = false; 
                $scope.editMode = true;
            }
        }
        $scope.labels = {
            whatHappened: {
                reportType: 'Incident type',
                reportTime: 'Incident Time',
                reportDate: 'Incident Date',
                whoIdentified: 'Reported by',
                location: 'Incident Location',
                thirdParties: 'Third-parties involved',
                equipment: 'Equipment involved',
                reportDescription: 'Incident Description',
                riskLevels: 'Risk level',
                riskControls: 'Risk controls required'
            }
        };

        $scope.investigatorsEmployees = [];
        $scope.report.incidentImpactTypes = [];
        $scope.report.incidentCauses = [];
        $scope.report.env_conditions = [];
        $scope.report.rootCauses = [];

        $scope.status.observation = [];
        $scope.status.observParameters = [];
        $scope.status.impactType = [];
        $scope.status.incidentCauses = [];

        $scope.onSelectInternalIndividual = function (selectedItem, index, impactIndex) {
            console.log(selectedItem);
            var internalIndividualExist = $filter('filter')($scope.report.incidentImpactTypes[impactIndex].individuals, {employee_id: selectedItem.employee_id});
            console.log(internalIndividualExist);
            if(internalIndividualExist.length > 0 ){
                 coreService.resetAlert();
                 coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                 selectedItem.full_name = null;
                 selectedItem.employee_id = null;
                 $scope.report.incidentImpactTypes[impactIndex].individuals[index] = null;
                 return;
            }
            $scope.report.incidentImpactTypes[impactIndex].individuals[index] = selectedItem;
            $scope.updateDreaftReport();
        };
        $scope.onSelectPrimaryResponder = function (selectedItem, impactIndex) {
            $scope.report.incidentImpactTypes[impactIndex].primary_responser = selectedItem;
            $scope.updateDreaftReport();
        };
        $scope.onSelectPersonalAfflicted = function (selectedItem, impactObj) {
            impactObj.personal_afflicted = selectedItem;
            $scope.updateDreaftReport();
        };
        $scope.onSelectDriver = function (selectedItem, impactObj) {
            impactObj.driver = selectedItem;
            $scope.updateDreaftReport();
        };
        $scope.onSelectWhoIdentifiedHazard = function (selectedItem) {
            var invest = false;
            $scope.whoIdentified = selectedItem;
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
            var checkIfInvestigator = $filter('filter')($scope.peopleInvolved, {type: 'investigator'});
            console.log(checkIfInvestigator)
            console.log(selectedItem)
            //This to check if user select user before to replace it with the new one he selected 
            if (checkIfPeopleInvolved.length !== 0) {
                var indexOfOldWhoIdentified = $scope.peopleInvolved.indexOf(checkIfPeopleInvolved[0]);
                var investigator = $filter('filter')(checkIfInvestigator, {employee_id: selectedItem.employee_id});
                if (investigator.length !== 0) {
                    var indexOfInvestigator = $scope.peopleInvolved.indexOf(investigator);
                    var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                    $scope.peopleInvolved[indexOfInvestigator].how_he_involved += ', ' + how_he_involved;
                    invest = true;
                    $scope.peopleInvolved.splice(checkIfPeopleInvolved, 1);
                }

                if (invest === false) {
                    var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(checkIfPeopleInvolved[0]);
                    var itemSelected = selectedItem;
                    itemSelected.type = 'whoidentified';
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                    itemSelected.title = selectedItem.full_name;
                    $scope.getData(itemSelected);
                    $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
                    $scope.report.whoIdentified = itemSelected;
                }
                //This to check if who identified person exists before as investigator
            } else if (checkIfInvestigator.length !== 0) {
                angular.forEach(checkIfInvestigator, function (value) {
                    if (value.employee_id === selectedItem.employee_id) {
                        var indexOfInvestigator = $scope.peopleInvolved.indexOf(value);
                        var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                        $scope.peopleInvolved[indexOfInvestigator].how_he_involved += ', ' + how_he_involved;
                        invest = true;
                    }
                });
            }
            //This if who identified parson doesn't exist before
            if (invest === false && checkIfPeopleInvolved.length === 0) {
                if (checkIfInvestigator.length !== 0) {
                    angular.forEach(checkIfInvestigator, function (value) {
                        var indexOfInvestigator = $scope.peopleInvolved.indexOf(value);
                        if ($scope.peopleInvolved[indexOfInvestigator].how_he_involved === 'Investigator, Reported Incident')
                            $scope.peopleInvolved[indexOfInvestigator].how_he_involved = 'Investigator';

                    });
                }
                var itemSelected = selectedItem;
                itemSelected.type = 'whoidentified';
                itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                itemSelected.exp_in_current_postion = null;
                itemSelected.supervisor_name = null;
                itemSelected.exp_over_all = null;
                itemSelected.age = null;
                itemSelected.third_party_id = null;
                itemSelected.role_description = null;
                itemSelected.title = selectedItem.full_name;
                $scope.getData(itemSelected);
                var index = $scope.peopleInvolved.length - 1;
                if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
                    $scope.peopleInvolved[index] = itemSelected;
                else
                    $scope.peopleInvolved.push(itemSelected);
                $scope.report.whoIdentified = itemSelected;
            }
        };
        $scope.onSelectInvestigator = function (selectedItem, investigatorIndex) {
            $scope.report.investigators[investigatorIndex] = selectedItem;
            if ($scope.report.investigators[investigatorIndex].hasOwnProperty('full_name')) {
                var investExist = $filter('filter')($scope.report.investigators, {employee_id: selectedItem.employee_id});
                console.log(investExist);
                if(investExist.length > 1){
                     coreService.resetAlert();
                     coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                     $scope.report.investigators[investigatorIndex] = {};
                     console.log($scope.report.investigators[investigatorIndex]);
                    //  return;
                }else{
                     coreService.resetAlert();
                }
            }
            var personType = 'investigator';
            console.log(personType)
            //This to check if user select user befor to replace it with the new one he selected 
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: personType, employee_id: $scope.report.oldInvestigators[investigatorIndex].employee_id});
            console.log(checkIfPeopleInvolved)
            var whoidentified = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
            if (checkIfPeopleInvolved.length !== 0) {
                var indexOfOldInvestigator = $scope.peopleInvolved.indexOf(checkIfPeopleInvolved[0]);
                console.log(indexOfOldInvestigator)
                if (whoidentified.length !== 0 && whoidentified[0].employee_id === selectedItem.employee_id) {
                    var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                    var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    console.log($scope.peopleInvolved[indexOfWhoidentified].how_he_involved)
                    console.log($scope.peopleInvolved[indexOfWhoidentified].how_he_involved !== 'Reported Incident, Investigator')
                        if ($scope.peopleInvolved[indexOfWhoidentified].how_he_involved !== 'Reported Incident, Investigator') {
                            $scope.peopleInvolved[indexOfWhoidentified].how_he_involved += ', ' + how_he_involved;
                        }
                    $scope.peopleInvolved.splice(indexOfOldInvestigator, 1);
                } else if ($scope.peopleInvolved[indexOfOldInvestigator].how_he_involved === 'Investigator, Reported Incident') {
                    var itemSelected = $scope.whoIdentified;
                    itemSelected.type = 'whoidentified';
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                    itemSelected.exp_in_current_postion = null;
                    itemSelected.supervisor_name = null;
                    itemSelected.exp_over_all = null;
                    itemSelected.age = null;
                    itemSelected.third_party_id = null;
                    itemSelected.role_description = null;
                    itemSelected.title = itemSelected.full_name;
                    $scope.getData(itemSelected);
                    $scope.peopleInvolved.push(itemSelected);

                    var itemSelected = selectedItem;
                    itemSelected.type = personType + investigatorIndex;
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    itemSelected.title = selectedItem.full_name;
                    $scope.getData(itemSelected);
                    $scope.peopleInvolved[indexOfOldInvestigator] = itemSelected;

                } else {
                    // var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: personType, employee_id: $scope.report.oldInvestigators[investigatorIndex].employee_id});
                    var checkIfInvestigator = $filter('filter')($scope.investigators, {employee_id: checkIfPeopleInvolved[0].employee_id});
                    // console.log(checkIfInvestigator);
                    if(angular.isDefined(checkIfInvestigator) && checkIfInvestigator.length !== 0){
                        var itemSelected = selectedItem;
                        itemSelected.type = personType + investigatorIndex;
                        itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                        itemSelected.exp_in_current_postion = null;
                        itemSelected.supervisor_name = null;
                        itemSelected.exp_over_all = null;
                        itemSelected.age = null;
                        itemSelected.third_party_id = null;
                        itemSelected.role_description = null;
                        itemSelected.title = selectedItem.full_name;
                        $scope.getData(itemSelected);
                        var index = $scope.peopleInvolved.length - 1;
                        if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
                            $scope.peopleInvolved[index] = itemSelected;
                        else
                            $scope.peopleInvolved.push(itemSelected);
                    } else {
                        var itemSelected = selectedItem;
                        itemSelected.type = personType + investigatorIndex;
                        itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                        itemSelected.title = selectedItem.full_name;
                        $scope.getData(itemSelected);
                        $scope.peopleInvolved[indexOfOldInvestigator] = itemSelected;
                    }
                }
                $scope.report.oldInvestigators[investigatorIndex] = selectedItem;
                console.log($scope.report.oldInvestigators[investigatorIndex]);
            } else if (whoidentified.length !== 0 && whoidentified[0].employee_id === selectedItem.employee_id) {
                var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: personType + investigatorIndex, employee_id: $scope.report.oldInvestigators[investigatorIndex].employee_id});
                console.log(checkIfPeopleInvolved);
                if(checkIfPeopleInvolved.length > 0){
                    var indexOfOldInvestigator = $scope.peopleInvolved.indexOf(checkIfPeopleInvolved[0]);
                    console.log(indexOfOldInvestigator);
                    $scope.peopleInvolved.splice(indexOfOldInvestigator, 1);
                }
                if ($scope.report.investigators[investigatorIndex].hasOwnProperty('full_name')){
                    var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                    var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    $scope.peopleInvolved[indexOfWhoidentified].how_he_involved += ', ' + how_he_involved;
                }
            } else {
                if (whoidentified.length !== 0) {
                    var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                    var investigator = $filter('filter')($scope.report.investigators, {employee_id: whoidentified[0].employee_id});
                    if (investigator.length === 0 && $scope.peopleInvolved[indexOfWhoidentified].how_he_involved === 'Reported Incident, Investigator')
                        $scope.peopleInvolved[indexOfWhoidentified].how_he_involved = 'Reported Incident';
                }
                var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {employee_id: selectedItem.employee_id});
                console.log(checkIfPeopleInvolved)
                if(checkIfPeopleInvolved.length === 0){
                    var itemSelected = selectedItem;
                    itemSelected.type = personType + investigatorIndex;
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    itemSelected.exp_in_current_postion = null;
                    itemSelected.supervisor_name = null;
                    itemSelected.exp_over_all = null;
                    itemSelected.age = null;
                    itemSelected.third_party_id = null;
                    itemSelected.role_description = null;
                    itemSelected.title = selectedItem.full_name;
                    $scope.getData(itemSelected);
                    var index = $scope.peopleInvolved.length - 1;
                    if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
                        $scope.peopleInvolved[index] = itemSelected;
                    else
                        $scope.peopleInvolved.push(itemSelected);
                }
            }
            $scope.report.oldInvestigators[investigatorIndex] = selectedItem;
            console.log($scope.report.oldInvestigators[investigatorIndex]);
            $scope.addPeopleCustomFields();
            $scope.updateDreaftReport();
                //            $scope.report.investigators[investigatorIndex].full_name = selectedItem.full_name;
        };
        $scope.onSelectSignOffBy = function (selectedItem) {
            $scope.report.sign_off_investigator = selectedItem;
            $scope.updateDreaftReport();
        };

        $scope.removeImpact = function (impactIndex) {
            $scope.report.incidentImpactTypes.splice(impactIndex, 1);
        };
        $scope.removeCause = function (causeIndex) {
            $scope.report.incidentCauses.splice(causeIndex, 1);
        };
        $scope.calculateTotalDays = function (impactObj) {
            coreService.resetAlert();
            if ((impactObj.lost_time_start > impactObj.lost_time_end && impactObj.lost_time_end !== null
                    && impactObj.lost_time_end !== '')) {
                impactObj.lost_time_start = null;
                impactObj.lost_time_end = null;
                impactObj.adjustment_days = null;
                impactObj.total_days_off = null;
                coreService.setAlert({type: 'error', message: 'Total days off cannot be a negative value.'});
            } else if (angular.isDefined(impactObj.lost_time_end) && angular.isDefined(impactObj.lost_time_start)
                    && impactObj.lost_time_end !== '' && impactObj.lost_time_start !== ''
                    && impactObj.lost_time_end !== null && impactObj.lost_time_start !== null) {
                impactObj.total_days_off = 0;
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                impactObj.total_days_off = (moment(impactObj.lost_time_end).toDate().getTime() -
                        moment(impactObj.lost_time_start).toDate().getTime()) / oneDay + 1;
                if (impactObj.adjustment_days >= impactObj.total_days_off) {
                    impactObj.lost_time_start = null;
                    impactObj.lost_time_end = null;
                    impactObj.adjustment_days = null;
                    impactObj.total_days_off = null;
                    coreService.setAlert({type: 'error', message: 'Total days off cannot be a negative value.'});
                } else if (impactObj.adjustment_days) {
                    impactObj.total_days_off -= parseInt(impactObj.adjustment_days);
                }
            }
            $scope.updateDreaftReport();
        };
        $scope.getCorrectiveActionEmployees = function (type, employeeLetters, index) {
            if (employeeLetters !== '' && employeeLetters !== null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: employeeLetters,
                    type: type
                };
                coreReportService.getCorrectiveActionEmployees(data)
                        .then(function (response) {
                            if (type === 'assigntoname' || type === 'assigntosupervisor') {
                                $scope.report.correctiveActions[index].correctiveActionAssignedEmployees = response.data;
                                $scope.initializeReport.actionAssignTo = false;
                            } else {
                                $scope.report.correctiveActions[index].correctiveActionNotifiededEmployees = response.data;
                                $scope.initializeReport.actionNotifyTo = false;
                            }
                        }, function (error) {

                        });
            }
        };

        $scope.changeInvStatus = function (status) {
            
            if (status.field_code === 'closed') {
                // disabled actual_date & actual cost and make its color red
                $scope.report.statusDisabled = false;
                 $scope.investegationMessage = true;
                
            } else {
                $scope.report.statusDisabled = true;
                 $scope.investegationMessage = false;
                
                
            }
            $scope.updateReportStatus();
            $scope.updateDreaftReport();
        };

        $scope.addNewImpact = function () {
            var newImpact = {};
            newImpact.heading = 'New Impact';
            newImpact.individuals = [];
            newImpact.individuals[1] = null;
            newImpact.individuals[2] = null;
            newImpact.individuals[3] = null;
            newImpact.individualsEmployees = [];
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getExternalAgencies(data).then(function (response) {
                newImpact.externalAgencies = response.data;
                $scope.report.incidentImpactTypes.push(newImpact);
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: error.data});
            });
            $scope.addImpactCustomFields();
                    //            newImpact.externalAgencies = $scope.externalAgencies;
        };
        $scope.addNewCause = function () {
            var newCause = {};
            newCause.heading = 'New Cause';
            $scope.report.incidentCauses.push(newCause);
        };
        $scope.getInvestigatorsEmployees = function (employeeLetters, index) {
            if (employeeLetters !== '' && employeeLetters !== null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: employeeLetters
                };
                coreReportService.getInvestigatorsEmployees(data)
                        .then(function (response) {
                            $scope.investigatorsEmployees[index] = [];
                            $scope.investigatorsEmployees[index] = response.data;
                        }, function (error) {

                        });
            }
        };
        $scope.getIndividualsEmployees = function (employeeLetters, index, impactIndex) {
            if (employeeLetters !== '' && employeeLetters !== null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: employeeLetters
                };
                coreReportService.getInvestigatorsEmployees(data)
                        .then(function (response) {
                            $scope.report.incidentImpactTypes[impactIndex].individualsEmployees[index] = [];
                            $scope.report.incidentImpactTypes[impactIndex].individualsEmployees[index] = response.data;
                        }, function (error) {

                        });
            }
        };
        $scope.calculateInvestigationTotalCost = function () {
            $scope.report.investigation_total_cost = 0;
            if (angular.isDefined($scope.report.investigation_response_cost) && $scope.report.investigation_response_cost !== ''
                    && $scope.report.investigation_response_cost !== null) {
                                //                    $scope.report.investigation_response_cost = 0;
                $scope.report.investigation_total_cost = parseInt($scope.report.investigation_total_cost) +
                        parseInt($scope.report.investigation_response_cost);
            }
            if (angular.isDefined($scope.report.investigation_repair_cost) && $scope.report.investigation_repair_cost !== ''
                    && $scope.report.investigation_repair_cost !== null) {
                $scope.report.investigation_total_cost = parseInt($scope.report.investigation_total_cost) +
                        parseInt($scope.report.investigation_repair_cost);
            }
            if (angular.isDefined($scope.report.investigation_insurance_cost) && $scope.report.investigation_insurance_cost !== ''
                    && $scope.report.investigation_insurance_cost !== null) {
                $scope.report.investigation_total_cost = parseInt($scope.report.investigation_total_cost) +
                        parseInt($scope.report.investigation_insurance_cost);
            }
            if (angular.isDefined($scope.report.investigation_wcb_cost) && $scope.report.investigation_wcb_cost !== ''
                    && $scope.report.investigation_wcb_cost !== null) {
                $scope.report.investigation_total_cost = parseInt($scope.report.investigation_total_cost) +
                        parseInt($scope.report.investigation_wcb_cost);
            }
            if (angular.isDefined($scope.report.investigation_other_cost) && $scope.report.investigation_other_cost !== ''
                    && $scope.report.investigation_other_cost !== null) {
                $scope.report.investigation_total_cost = parseInt($scope.report.investigation_total_cost) +
                        parseInt($scope.report.investigation_other_cost);
            }
            $scope.updateDreaftReport();
        };
        
        $scope.submitIncidentReport = function (notify) {
            
            var offset = (new Date().getTimezoneOffset())/60;
            $scope.report.clientTimeZoneOffset = offset;
            
            $scope.report.clientTimeZoneOffset = offset;
            $scope.report.language_id = $scope.user.language_id;

            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            if ($scope.report.incident_number == undefined) 
                $scope.report.process_type = 'add';
            else
                $scope.report.process_type = 'edit';
            if(notify)
                $scope.report.notify = 'notify';

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

            $scope.report.observationAndAnalysis = $scope.observationAndAnalysis;
            $scope.report.oeDepartments = $scope.oeDepartments;
            $scope.report.envConditions = $scope.envConditions;
            if (angular.isDefined($scope.report.riskLevelsValues)) {
                $scope.report.riskLevels = {};
                /*if ($scope.report.riskLevelsValues.hasOwnProperty('hazard_exist') && $scope.report.riskLevelsValues.hazard_exist !== ''
                && $scope.report.riskLevelsValues.hazard_exist !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.hazard_exist, {risk_level_value: $scope.report.riskLevelsValues.hazard_exist})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('worker_exposure') && $scope.report.riskLevelsValues.worker_exposure !== ''
                && $scope.report.riskLevelsValues.worker_exposure !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.worker_exposure, {risk_level_value: $scope.report.riskLevelsValues.worker_exposure})[0].risk_level_id);
                if ($scope.report.riskLevelsValues.hasOwnProperty('potential_consequences') && $scope.report.riskLevelsValues.potential_consequences !== ''
                && $scope.report.riskLevelsValues.potential_consequences !== null)
                    $scope.report.riskLevels.push($filter('filter')($scope.riskLevels.potential_consequences, {risk_level_value: $scope.report.riskLevelsValues.potential_consequences})[0].risk_level_id);*/
                $scope.report.riskLevels.impactId =$scope.report.riskLevelsValues.impact;
                $scope.report.riskLevels.likelyhoodId =$scope.report.riskLevelsValues.likelyhood;
                $scope.report.riskLevels.result =$scope.riskLevelTotal;
            
            }
            if($scope.report.investigation_date !== "" && $scope.report.investigation_date !== null)
                $scope.report.investigation_date = $filter('date')($scope.report.investigation_date, 'yyyy-MM-dd');
            if($scope.report.investigation_sign_off_date !== "" && $scope.report.investigation_sign_off_date !== null)
                $scope.report.investigation_sign_off_date = $filter('date')($scope.report.investigation_sign_off_date, 'yyyy-MM-dd');
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
            angular.forEach($scope.report.incidentImpactTypes, function(impact){
                if(impact.illness !== "" && impact.illness !== null && impact.illness !== undefined  ){

                            if(impact.illness.lost_time_end !== "" && impact.illness.lost_time_end !== null)
                    impact.illness.lost_time_end = $filter('date')(impact.illness.lost_time_end, 'yyyy-MM-dd');
                            if(impact.illness.lost_time_start !== "" && impact.illness.lost_time_start !== null)
                    impact.illness.lost_time_start = $filter('date')(impact.illness.lost_time_start, 'yyyy-MM-dd');
                }
                if(impact.injury !== "" && impact.injury !== null && impact.injury !== undefined){

                         if(impact.injury.lost_time_end !== "" && impact.injury.lost_time_end !== null)
                impact.injury.lost_time_end = $filter('date')(impact.injury.lost_time_end, 'yyyy-MM-dd');
                        if(impact.injury.lost_time_start !== "" && impact.injury.lost_time_start !== null)
                impact.injury.lost_time_start = $filter('date')(impact.injury.lost_time_start, 'yyyy-MM-dd');
                }
            });
            if ($scope.report.draft_id  && $scope.report.draft_id != undefined )
                $scope.updateEditingBy('finish');   
            if ($stateParams.reportNumber == null) {
                $scope.report.creator_id = $scope.user.employee_id;
                $scope.deleteDraft("delete");
            }
            else
                coreService.setDraftReport(undefined);
            incidentReportService.submitIncidentReport($scope.report)
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
        var init = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            var impactData = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                potential: 0 // this for impact types
            };

            $q.all([
                coreReportService.getImpactTypes(impactData),
                incidentReportService.getIncidentTypes(data),
                incidentReportService.getEnvConditions(data),
                incidentReportService.getOEDepartments(data),
                incidentReportService.getObservationAndAnalysis(data),
                incidentReportService.getExternalAgencies(data),
                incidentReportService.getInvStatus(data),
                incidentReportService.getInvRiskOfRecurrence(data),
                incidentReportService.getInvSeverity(data),
                incidentReportService.getInvSource(data),
                incidentReportService.getInvRootCauses(data),
                incidentReportService.getSCATContactTypes(data)
            ]).then(function (queues) {
                $scope.impactTypes = queues[0].data;
                $scope.reportTypes = queues[1].data;
                $scope.envConditions = queues[2].data;
                if ($stateParams.reportNumber != null)
                    $scope.oeDepartments = queues[3].data;
                $scope.observationAndAnalysis = queues[4].data;
                $scope.externalAgencies = queues[5].data;
                $scope.invStatus = queues[6].data;
                $scope.invRiskOfRecurrence = queues[7].data;
                $scope.invSeverity = queues[8].data;
                $scope.invsources = queues[9].data;
                $scope.invRootCauses = queues[10].data;
                $scope.scatContactTypes = queues[11].data;

                $scope.status.impactType[0] = true;
                $scope.status.incidentCauses[0] = true;
                
                angular.forEach($scope.envConditions, function(cond){
                   cond.envCondRequired = 1; 
                });
                console.log($scope.report);
            }, function (errors) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
                coreService.setAlert({type: 'exception', message: errors[2].data});
                coreService.setAlert({type: 'exception', message: errors[3].data});
                coreService.setAlert({type: 'exception', message: errors[4].data});
                coreService.setAlert({type: 'exception', message: errors[5].data});
                coreService.setAlert({type: 'exception', message: errors[6].data});
                coreService.setAlert({type: 'exception', message: errors[7].data});
                coreService.setAlert({type: 'exception', message: errors[8].data});
                coreService.setAlert({type: 'exception', message: errors[9].data});
                coreService.setAlert({type: 'exception', message: errors[10].data});
                coreService.setAlert({type: 'exception', message: errors[11].data});
            });
        };

        $scope.$watch('report', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoad) {
                firstLoad = false;
                console.log("watch report");
                init();
            }
        }, true);
        $scope.$watch('observationAndAnalysis', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoadInit) {
                firstLoadInit = false;
                console.log($stateParams.reportNumber);
                // from draft on new case
                if ($stateParams.reportNumber == null) {//populate darft data
                    console.log("===== draft =======");
                    $scope.report = coreService.getDraftReport();
                    console.log(coreService.getDraftReport());
                    $scope.discardName = 'Discard draft report';
                    //test
                    $scope.getIncidentReportData();
                    $scope.retriveReportData();
                }
                else if ($stateParams.reportNumber != null && $stateParams.draftId == null){// populate data on draft on discard case
                    console.log("=====  populate OriginalReportData =======");
                    $scope.populateOriginalReportData($stateParams.reportNumber);
                }else{// normal EDit case
                    console.log("=====  Normal Edit =======");
                    $scope.getReportData($stateParams.reportNumber);
                }
            }
        }, true);
        $scope.$watch('report.observation_analysis', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoadReportData) {
                firstLoadReportData = false;
                $scope.getIncidentReportData();
            }
        }, true);
        $scope.getIncidentReportData = function () {

            console.log("getIncidentReportData");
           // console.log($scope.report.incidentImpactTypes[0].injury.lost_time_end);
                    console.log($scope.report.report_description);
            
            $scope.arrayEnvConditions = [];

            if ($stateParams.reportNumber != null) { //Edit Normal
                //env Conditions whatHappenedtab
                angular.forEach($scope.report.envConditions, function (value) {
                    $scope.arrayEnvConditions.push({'env_cond_parameter_id': value.env_condition_sub_type.split(',')});
                    angular.forEach($scope.envConditions, function (condition) {
                        angular.forEach(condition.parameters, function (param) {
                            if (angular.isDefined($filter('filter')($scope.arrayEnvConditions, {env_cond_parameter_id: param.env_cond_parameter_id})[0])) {
                                if (condition.is_multi == 0)
                                    param.parameter_choice = "true";
                                else
                                    param.parameter_choice = true;
                                condition.envCondRequired = 0;
                            }
                        });
                    });
                    $scope.arrayEnvConditions = [];
                });

                //oeDepartments whatHappenedtab
                angular.forEach($scope.oeDepartments, function (param) {
                    if (angular.isDefined($filter('filter')($scope.report.oeDepartments, {oe_department_id: param.oe_department_id})[0])) {
                        param.department_choice = true;
                    }
                });

                // Impact Part
                if ($scope.report.hasOwnProperty('incidentImpactTypes') && $scope.report.incidentImpactTypes.length > 0) {
                    angular.forEach($scope.report.incidentImpactTypes, function (impact, key) {
                        $scope.getImpactSubTypes(impact.impact_type_id, key);
                        impact.individualsEmployees = [];
                        impact.heading = impact.impact_type;
                        impact.estimated_cost = parseFloat(impact.estimated_cost);
                        impact.individuals = [];
                        impact.individuals[1] = {
                            employee_id: impact.initial_employee_id1,
                            full_name: impact.initial_employee_name1,
                            department: impact.initial_employee_dept1
                        };
                        impact.individuals[2] = {
                            employee_id: impact.initial_employee_id2,
                            full_name: impact.initial_employee_name2,
                            department: impact.initial_employee_dept2
                        };
                        impact.individuals[3] = {
                            employee_id: impact.initial_employee_id3,
                            full_name: impact.initial_employee_name3,
                            department: impact.initial_employee_dept3
                        };
                        impact.primary_responser = {
                            employee_id: impact.primary_responder_id,
                            full_name: impact.primary_responder_name
                        };

                        var external_agency = impact.external_agency.split(',');

                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id
                        };
                        incidentReportService.getExternalAgencies(data).then(function (response) {
                            impact.externalAgencies = response.data;
                            angular.forEach(impact.externalAgencies, function (agency) {
                                if (external_agency.indexOf(agency.ext_agency_id) !== -1) {
                                    agency.agency_choice = true;
                                }
                            });
                        }, function (errors) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: errors.data});
                        });
                        if (impact.impact_type_code === 'Injury') {
                            impact.injury = {};
                            impact.injury.personal_afflicted = {
                                employee_id: impact.personal_injured_id,
                                full_name: impact.personal_injured_name
                            };
                            impact.injury.initial_treatment_id = impact.initial_treatment_id;
                            impact.injury.contact_code_id = impact.contact_code_id;
                            impact.injury.contact_agency_id = impact.contact_agency_id;
                            impact.injury.recordable_id = impact.recordable_id;
                            impact.injury.restricted_work_id = impact.restricted_work_id;
                            impact.injury.injury_description = impact.injury_description;
                            console.log(impact.injury.lost_time_start);
                            if (impact.lost_time_start != undefined &&  impact.lost_time_start != "") 
                                impact.injury.lost_time_start = new Date(impact.lost_time_start);
                            else
                                impact.injury.lost_time_start = undefined;
                            if (impact.lost_time_end != undefined &&  impact.lost_time_end != "") 
                                impact.injury.lost_time_end = new Date(impact.lost_time_end);
                            else
                                impact.injury.lost_time_end = undefined;
                            console.log(impact.injury.lost_time_start);
                            impact.injury.adjustment_days = parseInt(impact.adjustment_days);
                            impact.injury.total_days_off = parseInt(impact.total_days_off);
                        } else if (impact.impact_type_code === 'SpillRelease') {
                            impact.spillRelease = {};
                            impact.spillRelease.spill_release_source_id = impact.spill_release_source_id;
                            impact.spillRelease.duration_value = parseInt(impact.duration_value);
                            impact.spillRelease.duration_unit_id = impact.duration_unit_id;
                            impact.spillRelease.quantity_value = parseInt(impact.quantity_value);
                            impact.spillRelease.quantity_unit_id = impact.quantity_unit_id;
                            impact.spillRelease.quantity_recovered_value = parseInt(impact.quantity_recovered_value);
                            impact.spillRelease.quantity_recovered_unit_id = impact.quantity_recovered_unit_id;
                            impact.spillRelease.what_was_spill_release = impact.what_was_spill_release;
                            impact.spillRelease.how_spill_release_occur = impact.how_spill_release_occur;
                            impact.spillRelease.is_reportable = impact.is_reportable;
                            impact.spillRelease.spill_release_agency_id = impact.spill_release_agency_id;
                        } else if (impact.impact_type_code === 'Illness') {
                            impact.illness = {};
                            impact.illness.personal_afflicted = {
                                employee_id: impact.personal_afflicted_id,
                                full_name: impact.personal_afflicted_name
                            };
                            impact.illness.initial_treatment_id = impact.initial_treatment_id;
                            //impact.illness.restricted_work_id = impact.restricted_work_id;
                            if (impact.lost_time_start != undefined &&  impact.lost_time_start != "") 
                                impact.illness.lost_time_start = new Date(impact.lost_time_start);
                            else
                                impact.illness.lost_time_start = undefined;
                            console.log(impact.lost_time_end);
                            if (impact.lost_time_end != undefined &&  impact.lost_time_end != "") 
                                impact.illness.lost_time_end = new Date(impact.lost_time_end);
                            else
                                impact.illness.lost_time_end = undefined;
                            console.log(impact.illness.lost_time_start);
                            impact.illness.adjustment_days = parseInt(impact.adjustment_days);
                            impact.illness.total_days_off = parseInt(impact.total_days_off);

                            impact.illness.illness_description = impact.illness_description;
                        } else if (impact.impact_type_code === 'VehicleDamage') {
                            impact.vehicleDamage = {};
                            impact.vehicleDamage.driver = {
                                employee_id: impact.driver_id,
                                full_name: impact.driver_name
                            };
                            impact.vehicleDamage.driver_licence = impact.driver_licence;
                            impact.vehicleDamage.vehicle_type_id = impact.vehicle_type_id;
                            impact.vehicleDamage.vehicle_licence = impact.vehicle_licence;
                            impact.vehicleDamage.how_did_that_occur = impact.how_did_that_occur;
                            impact.vehicleDamage.damage_description = impact.damage_description;
                        } else if (impact.impact_type_code === 'TrafficViolation') {
                            impact.trafficViolation = {};
                            impact.trafficViolation.driver = {
                                employee_id: impact.driver_id,
                                full_name: impact.driver_name
                            };
                            impact.trafficViolation.driver_licence = impact.driver_licence;
                            impact.trafficViolation.vehicle_type_id = impact.vehicle_type_id;
                            impact.trafficViolation.vehicle_licence = impact.vehicle_licence;
                            impact.trafficViolation.damage_description = impact.damage_description;
                            impact.trafficViolation.value_of_fine = parseInt(impact.value_of_fine);
                            impact.trafficViolation.ticket_number = impact.ticket_number;
                            impact.trafficViolation.how_did_that_occur = impact.how_did_that_occur;
                        }
                    });
                } else {
                    $scope.report.incidentImpactTypes[0] = {};
                    $scope.report.incidentImpactTypes[0].heading = 'First Impact';
                    $scope.report.incidentImpactTypes[0].individuals = [];
                    $scope.report.incidentImpactTypes[0].individuals[1] = null;
                    $scope.report.incidentImpactTypes[0].individuals[2] = null;
                    $scope.report.incidentImpactTypes[0].individuals[3] = null;
                    $scope.report.incidentImpactTypes[0].individualsEmployees = [];
                    $scope.report.incidentImpactTypes[0].externalAgencies = $scope.externalAgencies;
                }

                 // Observation & Analysis Part
                angular.forEach($scope.observationAndAnalysis, function (observ) {
                    if (observ.observation_and_analysis_code === 'SubActions' || observ.observation_and_analysis_code === 'SubConditions') {
                        angular.forEach(observ.parameters, function (param) {
                            if (angular.isDefined($filter('filter')($scope.report.observation_analysis, {sub_type: param.observation_and_analysis_param_id})[0])) {
                                param.paramChoice = true;
                            }
                        });
                    } else {
                        angular.forEach(observ.parameters, function (parameter) {
                            angular.forEach(parameter.parameters, function (param) {
                                if (angular.isDefined($filter('filter')($scope.report.observation_analysis, {sub_type: param.observation_and_analysis_param_id})[0])) {
                                    param.paramChoice = true;
                                }
                            });
                        });
                    }

                    if (observ.observation_and_analysis_code === 'EnergyForm')
                        observ.note = $scope.report.energy_form_note;
                    if (observ.observation_and_analysis_code === 'SubActions')
                        observ.note = $scope.report.sub_standard_action_note;
                    if (observ.observation_and_analysis_code === 'SubConditions')
                        observ.note = $scope.report.sub_standard_condition_note;
                    if (observ.observation_and_analysis_code === 'UnderLyingCauses')
                        observ.note = $scope.report.under_lying_cause_note;
                });


                $scope.report.investigators = [];
                $scope.report.investigators[1] = {};
                $scope.report.investigators[2] = {};
                $scope.report.investigators[3] = {};
                $scope.report.investigators[1].employee_id = $scope.report.investigator_id1;
                $scope.report.investigators[1].full_name = $scope.report.investigator_name1;

                $scope.report.investigators[2].employee_id = $scope.report.investigator_id2;
                $scope.report.investigators[2].full_name = $scope.report.investigator_name2;

                $scope.report.investigators[3].employee_id = $scope.report.investigator_id3;
                $scope.report.investigators[3].full_name = $scope.report.investigator_name3;
                $scope.report.oldInvestigators = angular.copy($scope.report.investigators);

                $scope.report.sign_off_investigator = {};
                $scope.report.sign_off_investigator.employee_id = $scope.report.sign_off_investigator_id;
                $scope.report.sign_off_investigator.full_name = $scope.report.sign_off_investigator_name;


                 // inv Root Causes
                $scope.arrayRootCauses = [];
                angular.forEach($scope.report.invRootCauses, function (value) {
                    if (value.hasOwnProperty('root_cause_param_ids')) {
                        $scope.arrayRootCauses.push({'sub_type': value.root_cause_param_ids.split(',')});
                        angular.forEach($scope.invRootCauses, function (cause) {
                            angular.forEach(cause.parameters, function (param) {
                                if (angular.isDefined($filter('filter')($scope.arrayRootCauses, {sub_type: param.root_cause_param_id})[0])) {
                                    param.causeChoice = true;
                                }
                            });
                        });
                        $scope.arrayRootCauses = [];
                    }
                });

                //inv sources
                $scope.invSourceId = [];
                if ($scope.report.hasOwnProperty('inv_source_id')) {
                    $scope.invSourceId.push({'inv_source_id': $scope.report.inv_source_id.split(',')});
                }
                angular.forEach($scope.invsources, function (param) {
                    if (angular.isDefined($filter('filter')($scope.invSourceId, {inv_source_id: param.inv_source_id})[0])) {
                        param.sourceChoice = true;
                    }

                    $scope.report.invsources = $scope.invsources;
                });
                $scope.report.invRootCauses = $scope.invRootCauses;

            }
            else{// Edit on draft Case 
                $scope.envConditions = $scope.report.envConditions;

                $scope.oeDepartments = $scope.report.oeDepartments;
                // Impact Part
                if ($scope.report.hasOwnProperty('incidentImpactTypes') && $scope.report.incidentImpactTypes.length > 0) {
                    angular.forEach($scope.report.incidentImpactTypes, function (impact, key) {
                        
                        $scope.getImpactSubTypesForDraft(impact.impact_type_id, key);
                      //  impact.estimated_cost = parseFloat(impact.estimated_cost);
                       /* impact.individualsEmployees = [];
                        impact.heading = impact.impact_type;
                        impact.individuals = [];
                        impact.individuals[1] = {
                            employee_id: impact.initial_employee_id1,
                            full_name: impact.initial_employee_name1,
                            department: impact.initial_employee_dept1
                        };
                        impact.individuals[2] = {
                            employee_id: impact.initial_employee_id2,
                            full_name: impact.initial_employee_name2,
                            department: impact.initial_employee_dept2
                        };
                        impact.individuals[3] = {
                            employee_id: impact.initial_employee_id3,
                            full_name: impact.initial_employee_name3,
                            department: impact.initial_employee_dept3
                        };
                        impact.primary_responser = {
                            employee_id: impact.primary_responder_id,
                            full_name: impact.primary_responder_name
                        };

                        var external_agency = impact.external_agency.split(',');

                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id
                        };
                        incidentReportService.getExternalAgencies(data).then(function (response) {
                            impact.externalAgencies = response.data;
                            angular.forEach(impact.externalAgencies, function (agency) {
                                if (external_agency.indexOf(agency.ext_agency_id) !== -1) {
                                    agency.agency_choice = true;
                                }
                            });
                        }, function (errors) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: errors.data});
                        });*/
                        if (impact.impact_type_code === 'Injury') {
                           
                            if (impact.injury.lost_time_start!= undefined &&  impact.injury.lost_time_start != "") 
                                impact.injury.lost_time_start = new Date(impact.injury.lost_time_start);
                            else
                                impact.injury.lost_time_start = undefined;
                            if (impact.injury.lost_time_end != undefined &&  impact.injury.lost_time_end != "") 
                                impact.injury.lost_time_end = new Date(impact.injury.lost_time_end);
                            else
                                impact.injury.lost_time_end = undefined;


                            console.log(impact.injury.lost_time_start);

                        } else if (impact.impact_type_code === 'Illness') {

                            if (impact.illness.lost_time_start != undefined &&  impact.illness.lost_time_start != "") 
                                impact.illness.lost_time_start = new Date(impact.illness.lost_time_start);
                            else
                                impact.illness.lost_time_start = undefined;
                            console.log(impact.lost_time_end);
                            if (impact.illness.lost_time_end  != undefined &&  impact.illness.lost_time_end  != "") 
                                impact.illness.lost_time_end = new Date(impact.illness.lost_time_end );
                            else
                                impact.illness.lost_time_end = undefined;
                            console.log(impact.illness.lost_time_start);

                        } 
                    });
                } else {
                    $scope.report.incidentImpactTypes[0] = {};
                    $scope.report.incidentImpactTypes[0].heading = 'First Impact';
                    $scope.report.incidentImpactTypes[0].individuals = [];
                    $scope.report.incidentImpactTypes[0].individuals[1] = null;
                    $scope.report.incidentImpactTypes[0].individuals[2] = null;
                    $scope.report.incidentImpactTypes[0].individuals[3] = null;
                    $scope.report.incidentImpactTypes[0].individualsEmployees = [];
                    $scope.report.incidentImpactTypes[0].externalAgencies = $scope.externalAgencies;
                }

                $scope.observationAndAnalysis = $scope.report.observationAndAnalysis ;


            }

            var inv_status = $filter('filter')($scope.invStatus, {inv_status_id: $scope.report.inv_status_id});
                if (angular.isDefined(inv_status)) {
                    if (inv_status[0] != undefined) {
                        if (inv_status[0].field_code === 'closed') {
                            // disabled actual_date & actual cost and make its color red
                            $scope.report.statusDisabled = false;
                        } else {
                            $scope.report.statusDisabled = true;
                        }
                    }
                }




            
        
            //Investigation 
                        //for convert costs
            $scope.report.investigation_response_cost = parseFloat($scope.report.investigation_response_cost);
            $scope.report.investigation_repair_cost = parseFloat($scope.report.investigation_repair_cost);
            $scope.report.investigation_insurance_cost = parseFloat($scope.report.investigation_insurance_cost);
            $scope.report.investigation_wcb_cost = parseFloat($scope.report.investigation_wcb_cost);
            $scope.report.investigation_other_cost = parseFloat($scope.report.investigation_other_cost);
            $scope.report.investigation_total_cost = parseFloat($scope.report.investigation_total_cost);

           // $scope.report.report_description = $scope.report.incident_description;

            // SCAT Analysis Part
            if ($scope.report.hasOwnProperty('incidentCauses') && $scope.report.incidentCauses.length > 0) {
                angular.forEach($scope.report.incidentCauses, function (cause, key) {
                    if (key === 0)
                        cause.heading = 'First Cause';
                    else
                        cause.heading = 'New Cause';
                    $scope.getSCATDirectCauses(cause.scat_items_params_id, cause);
                    $scope.getSCATBasicCauses(cause.scat_direct_cause_id, cause);
                    $scope.getSCATSubCauses(cause.scat_basic_cause_id, cause);
                });
            } else {
                $scope.report.incidentCauses[0] = {};
                $scope.report.incidentCauses[0].heading = 'First Cause';
            }


        };


        $scope.getImpactSubTypes = function (impact_type_id, impactIndex) {
            if(impact_type_id === null || impact_type_id === '' || impact_type_id === undefined){
                if(impactIndex === 0){
                    $scope.report.incidentImpactTypes[impactIndex].heading = 'First Impact';
                    $scope.report.incidentImpactTypes[impactIndex].impact_type_code = '';
                }else{
                    $scope.report.incidentImpactTypes[impactIndex].heading = 'New Impact';
                    $scope.report.incidentImpactTypes[impactIndex].impact_type_code = '';
                }
            }else{
                var impact_type_name =
                        $filter('filter')($scope.impactTypes, {impact_type_id: impact_type_id})[0].impact_type_name;
                $scope.report.incidentImpactTypes[impactIndex].heading = impact_type_name;
                $scope.report.incidentImpactTypes[impactIndex].impact_type_code =
                        $filter('filter')($scope.impactTypes, {impact_type_id: impact_type_id})[0].impact_type_code;
                if (impact_type_id !== '' && impact_type_id !== null) {
                    var data = {
                        impact_type_id: impact_type_id
                    };
                    coreReportService.getImpactSubTypes(data)
                            .then(function (response) {
                                $scope.report.incidentImpactTypes[impactIndex].impactSubTypes = response.data;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                }
                var data = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id
                };
                if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'SpillRelease') {
                    $q.all([
                        incidentReportService.getSpillReleaseSource(data),
                        incidentReportService.getSpillReleaseAgency(data),
                        incidentReportService.getDurationUnit(data),
                        incidentReportService.getQuantityUnit(data)
                    ]).then(function (queues) {
                        $scope.spillReleaseSources = queues[0].data;
                        $scope.spillReleaseAgencies = queues[1].data;
                        $scope.durationUnits = queues[2].data;
                        $scope.quantityUnits = queues[3].data;
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                        coreService.setAlert({type: 'exception', message: errors[3].data});
                    });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'VehicleDamage') {
                    incidentReportService.getVehicleTypes(data)
                            .then(function (response) {
                                $scope.vehicleTypes = response.data;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'Illness') {
                    $q.all([
                        incidentReportService.getInitialTreatments(data),
                        incidentReportService.getSymptoms(data),
                        incidentReportService.getRestrictedWork(data)
                    ]).then(function (queues) {
                        $scope.initialTreatments = queues[0].data;
                        $scope.symptoms = queues[1].data;
                        $scope.restrictedWork = queues[2].data;
                        if (!angular.isDefined($scope.report.incidentImpactTypes[impactIndex].illness) ||
                                $scope.report.incidentImpactTypes[impactIndex].illness === {})
                            $scope.report.incidentImpactTypes[impactIndex].illness = {};
                        $scope.report.incidentImpactTypes[impactIndex].illness.symptoms = $scope.symptoms;
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('symptoms_id')) {
                            var symptoms_id = $scope.report.incidentImpactTypes[impactIndex].symptoms_id.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].illness.symptoms, function (symptom) {
                                if (symptoms_id.indexOf(symptom.symptoms_id) !== -1) {
                                    symptom.symptom_choice = true;
                                }
                            });
                        }
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                    });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'Injury') {
                    $q.all([
                        incidentReportService.getInjuryRecordable(data),
                        incidentReportService.getInjuryBodyParts(data),
                        incidentReportService.getInjuryContactCodes(data),
                        incidentReportService.getInjuryTypes(data),
                        incidentReportService.getInjuryContactAgencies(data),
                        incidentReportService.getInjuryBodyAreas(data),
                        incidentReportService.getInitialTreatments(data),
                        incidentReportService.getRestrictedWork(data)
                    ]).then(function (queues) {
                        $scope.injuryRecordable = queues[0].data;
                        $scope.injuryBodyParts = queues[1].data;
                        $scope.injuryContactCodes = queues[2].data;
                        $scope.injuryTypes = queues[3].data;
                        $scope.injuryContactAgencies = queues[4].data;
                        $scope.injuryBodyAreas = queues[5].data;
                        $scope.initialTreatments = queues[6].data;
                        $scope.restrictedWork = queues[7].data;
                        if (!angular.isDefined($scope.report.incidentImpactTypes[impactIndex].injury) ||
                                $scope.report.incidentImpactTypes[impactIndex].injury === {})
                            $scope.report.incidentImpactTypes[impactIndex].injury = {};
                        $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyParts = $scope.injuryBodyParts;
                        $scope.report.incidentImpactTypes[impactIndex].injury.injuryTypes = $scope.injuryTypes;
                        $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyAreas = $scope.injuryBodyAreas;

                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('body_part')) {
                            var body_part = $scope.report.incidentImpactTypes[impactIndex].body_part.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyParts, function (part) {
                                if (body_part.indexOf(part.body_part_id) !== -1) {
                                    part.body_part_choice = true;
                                }
                            });
                        }
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('injury_type')) {
                            var injury_type = $scope.report.incidentImpactTypes[impactIndex].injury_type.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryTypes, function (type) {
                                if (injury_type.indexOf(type.injury_type_id) !== -1) {
                                    type.type_choice = true;
                                }
                            });
                        }
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('body_area')) {
                            var body_area = $scope.report.incidentImpactTypes[impactIndex].body_area.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyAreas, function (area) {
                                if (body_area.indexOf(area.body_area_id) !== -1) {
                                    area.body_area_choice = true;
                                }
                            });
                        }
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                        coreService.setAlert({type: 'exception', message: errors[3].data});
                        coreService.setAlert({type: 'exception', message: errors[4].data});
                        coreService.setAlert({type: 'exception', message: errors[5].data});
                        coreService.setAlert({type: 'exception', message: errors[6].data});
                        coreService.setAlert({type: 'exception', message: errors[7].data});
                    });
                }
            }
            $scope.updateDreaftReport();
        };
        $scope.getImpactSubTypesForDraft = function (impact_type_id, impactIndex) {
            if(impact_type_id === null || impact_type_id === '' || impact_type_id === undefined){
                if(impactIndex === 0){
                    $scope.report.incidentImpactTypes[impactIndex].heading = 'First Impact';
                    $scope.report.incidentImpactTypes[impactIndex].impact_type_code = '';
                }else{
                    $scope.report.incidentImpactTypes[impactIndex].heading = 'New Impact';
                    $scope.report.incidentImpactTypes[impactIndex].impact_type_code = '';
                }
            }else{
                console.log("in getImpactSubTypesForDraft");
                /*var impact_type_name =
                        $filter('filter')($scope.impactTypes, {impact_type_id: impact_type_id})[0].impact_type_name;
                $scope.report.incidentImpactTypes[impactIndex].heading = impact_type_name;
                $scope.report.incidentImpactTypes[impactIndex].impact_type_code =
                        $filter('filter')($scope.impactTypes, {impact_type_id: impact_type_id})[0].impact_type_code;*/
                if (impact_type_id !== '' && impact_type_id !== null) {
                    var data = {
                        impact_type_id: impact_type_id
                    };
                    coreReportService.getImpactSubTypes(data)
                            .then(function (response) {
                                $scope.report.incidentImpactTypes[impactIndex].impactSubTypes = response.data;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                }
                var data = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id
                };
                if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'SpillRelease') {
                    $q.all([
                        incidentReportService.getSpillReleaseSource(data),
                        incidentReportService.getSpillReleaseAgency(data),
                        incidentReportService.getDurationUnit(data),
                        incidentReportService.getQuantityUnit(data)
                    ]).then(function (queues) {
                        $scope.spillReleaseSources = queues[0].data;
                        $scope.spillReleaseAgencies = queues[1].data;
                        $scope.durationUnits = queues[2].data;
                        $scope.quantityUnits = queues[3].data;
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                        coreService.setAlert({type: 'exception', message: errors[3].data});
                    });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'VehicleDamage') {
                    incidentReportService.getVehicleTypes(data)
                            .then(function (response) {
                                $scope.vehicleTypes = response.data;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'Illness') {
                    $q.all([
                        incidentReportService.getInitialTreatments(data),
                        incidentReportService.getSymptoms(data),
                        incidentReportService.getRestrictedWork(data)
                    ]).then(function (queues) {
                        $scope.initialTreatments = queues[0].data;
                        $scope.symptoms = queues[1].data;
                        $scope.restrictedWork = queues[2].data;
                        if (!angular.isDefined($scope.report.incidentImpactTypes[impactIndex].illness) ||
                                $scope.report.incidentImpactTypes[impactIndex].illness === {})
                            $scope.report.incidentImpactTypes[impactIndex].illness = {};
                        $scope.report.incidentImpactTypes[impactIndex].illness.symptoms = $scope.symptoms;
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('symptoms_id')) {
                            var symptoms_id = $scope.report.incidentImpactTypes[impactIndex].symptoms_id.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].illness.symptoms, function (symptom) {
                                if (symptoms_id.indexOf(symptom.symptoms_id) !== -1) {
                                    symptom.symptom_choice = true;
                                }
                            });
                        }
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                    });
                } else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'Injury') {
                    $q.all([
                        incidentReportService.getInjuryRecordable(data),
                        incidentReportService.getInjuryBodyParts(data),
                        incidentReportService.getInjuryContactCodes(data),
                        incidentReportService.getInjuryTypes(data),
                        incidentReportService.getInjuryContactAgencies(data),
                        incidentReportService.getInjuryBodyAreas(data),
                        incidentReportService.getInitialTreatments(data),
                        incidentReportService.getRestrictedWork(data)
                    ]).then(function (queues) {
                        $scope.injuryRecordable = queues[0].data;
                        $scope.injuryBodyParts = queues[1].data;
                        $scope.injuryContactCodes = queues[2].data;
                        $scope.injuryTypes = queues[3].data;
                        $scope.injuryContactAgencies = queues[4].data;
                        $scope.injuryBodyAreas = queues[5].data;
                        $scope.initialTreatments= queues[6].data;
                        console.log("$scope.initialTreatments",$scope.initialTreatments);
                        $scope.restrictedWork = queues[7].data;
                        if (!angular.isDefined($scope.report.incidentImpactTypes[impactIndex].injury) ||
                                $scope.report.incidentImpactTypes[impactIndex].injury === {})
                            $scope.report.incidentImpactTypes[impactIndex].injury = {};
                        $scope.injuryBodyParts = $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyParts ;
                        $scope.injuryTypes = $scope.report.incidentImpactTypes[impactIndex].injury.injuryTypes ;
                        $scope.injuryBodyAreas = $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyAreas ;

                        /*if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('body_part')) {
                            var body_part = $scope.report.incidentImpactTypes[impactIndex].body_part.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyParts, function (part) {
                                if (body_part.indexOf(part.body_part_id) !== -1) {
                                    part.body_part_choice = true;
                                }
                            });
                        }
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('injury_type')) {
                            var injury_type = $scope.report.incidentImpactTypes[impactIndex].injury_type.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryTypes, function (type) {
                                if (injury_type.indexOf(type.injury_type_id) !== -1) {
                                    type.type_choice = true;
                                }
                            });
                        }
                        if ($scope.report.incidentImpactTypes[impactIndex].hasOwnProperty('body_area')) {
                            var body_area = $scope.report.incidentImpactTypes[impactIndex].body_area.split(',');
                            angular.forEach($scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyAreas, function (area) {
                                if (body_area.indexOf(area.body_area_id) !== -1) {
                                    area.body_area_choice = true;
                                }
                            });
                        }*/
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors[0].data});
                        coreService.setAlert({type: 'exception', message: errors[1].data});
                        coreService.setAlert({type: 'exception', message: errors[2].data});
                        coreService.setAlert({type: 'exception', message: errors[3].data});
                        coreService.setAlert({type: 'exception', message: errors[4].data});
                        coreService.setAlert({type: 'exception', message: errors[5].data});
                        coreService.setAlert({type: 'exception', message: errors[6].data});
                        coreService.setAlert({type: 'exception', message: errors[7].data});
                    });
                }
            }
            $scope.updateDreaftReport();
        };
        $scope.getSCATDirectCauses = function (scat_items_params_id, cause) {
            var data = {
                org_id: $scope.user.org_id,
                id: scat_items_params_id
            };
            incidentReportService.getSCATDirectCauses(data)
                    .then(function (response) {
                        cause.scatDirectCauses = response.data;
                        //console.log(cause.scatDirectCauses);
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                    $scope.updateDreaftReport();
        };
        $scope.getSCATBasicCauses = function (scat_items_params_id, cause) {
            var data = {
                org_id: $scope.user.org_id,
                id: scat_items_params_id
            };
            incidentReportService.getSCATBasicCauses(data)
                    .then(function (response) {
                        cause.scatBasicCauses = response.data.data;
                        cause.scatDirectCauseType = response.data.type;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                    $scope.updateDreaftReport();
        };
        $scope.getSCATSubCauses = function (scat_items_params_id, cause) {
            var data = {
                org_id: $scope.user.org_id,
                id: scat_items_params_id
            };
            incidentReportService.getSCATSubCauses(data)
                    .then(function (response) {
                        cause.scatSubCauses = response.data.data;
                        cause.scatBasicCauseType = response.data.type;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
            $scope.updateDreaftReport();
        };
        $scope.Emergencyresponse = function () {
            $scope.report.is_emergency_response = null;
        };
        $scope.clearincidentCompleteTask = function (action) {
            action.desired_results = null;
        };
        $scope.clearInvestigation = function () {
            $scope.report.inv_status_id = null;
            var status = {
                field_code: null
            }
            $scope.changeInvStatus(status);
        };
        $scope.clearEnvironmentalCondition = function (parameter_choice) {
            parameter_choice = null;
        };
        $scope.clearIIlnessInitialTreatment = function (impact) {
            impact.illness.initial_treatment_id = null;
        };
        $scope.clearIIlnessRestrictedWork = function (impact) {
            impact.illness.restricted_work_id = null;
        };
        $scope.clearInjuryInitialTreatment = function (impact) {
            impact.injury.initial_treatment_id = null;
        };
        $scope.clearInjuryContactCode = function (impact) {
            impact.injury.contact_code_id = null;
        };
        $scope.clearInjuryContactAgency = function (impact) {
            impact.injury.contact_agency_id = null;
        };
        $scope.clearInjuryRecordable = function (impact) {
            impact.injury.recordable_id = null;
        };
        $scope.clearInjuryRestrictedWork = function (impact) {
            impact.injury.restricted_work_id = null;
        };
        $scope.clearSpillReportable = function (impact) {
            impact.spillRelease.is_reportable = null;
        };
        $scope.clearIIlnessInitialTreatment = function (impact) {
            impact.illness.initial_treatment_id = null;
        };
        $scope.clearEnvCond = function(cond){
            angular.forEach(cond.parameters, function(param){
               param.parameter_choice = false; 
            });
            cond.envCondRequired = 1;
        };
        
        $scope.oeRequired = 1;
        $scope.checkOERequired = function () {
            var oeChoices = $filter('filter')($scope.oeDepartments, {department_choice: true});
            if (oeChoices.length > 0) {
                $scope.oeRequired = 0;
            } else {
                $scope.oeRequired = 1;
            }
            $scope.updateDreaftReport();
        };
        $scope.checkEnvCondRequired = function (cond) {
            cond.envCondRequired = 1;
            var envChoices = $filter('filter')(cond.parameters, {parameter_choice: true});
            if (envChoices.length > 0) {
                cond.envCondRequired = 0;
            } else {
                cond.envCondRequired = 1;
            }
            // in case of radio buttons, make any option except the selected one = false
            if(cond.is_multi == 0){
                angular.forEach(envChoices, function(choice){
                    if(choice.env_cond_parameter_id !== parameter.env_cond_parameter_id)
                        choice.parameter_choice = false;
                });
            }
            console.log(cond);
            $scope.updateDreaftReport();

        };

        //for update Draft
        $scope.incident_type_name = "";
        $scope.getReportTypeName = function () {
             $scope.incident_type_name = $filter('filter')($scope.reportTypes, {id: $scope.report.report_type_id})[0].name;
            console.log($scope.incident_type_name);
             $scope.updateDreaftReport();
        };
    };
    controller.$inject = ['$scope', '$uibModal', '$stateParams', '$state', 'coreReportService', 'coreService', '$q', '$filter', 'incidentReportService', '$controller', 'constantService'];
    angular.module("incidentReportModule").controller("EditIncidentReportController", controller);
}());