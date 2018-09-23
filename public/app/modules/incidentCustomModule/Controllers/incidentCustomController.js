(function () {
    var controller = function ($scope, $uibModal, $state, coreReportService, coreService, $q, $filter, incidentReportService, $controller, constantService) {
        $scope.reportType = 'incident';
        $controller('coreReportController', {$scope: $scope});
        $scope.disabeldTrue = false;
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
        $scope.report.investigators = [];

        $scope.status.observation = [];
        $scope.status.observParameters = [];
        $scope.status.impactType = [];
        $scope.status.incidentCauses = [];

        $scope.onSelectInternalIndividual = function (selectedItem, index, impactIndex) {
            $scope.report.incidentImpactTypes[impactIndex].individuals[index] = selectedItem;
        };
        $scope.onSelectPrimaryResponder = function (selectedItem, impactIndex) {
            $scope.report.incidentImpactTypes[impactIndex].primary_responser = selectedItem;
        };
        $scope.onSelectPersonalAfflicted = function (selectedItem, impactObj) {
            impactObj.personal_afflicted = selectedItem;
        };
        $scope.onSelectDriver = function (selectedItem, impactObj) {
            impactObj.driver = selectedItem;
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
//                    angular.forEach(checkIfInvestigator, function (value) {
//                        if (value.employee_id === selectedItem.employee_id) {
                    var indexOfInvestigator = $scope.peopleInvolved.indexOf(investigator);
                    var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'incident'})[0]).how_involved_name;
                    $scope.peopleInvolved[indexOfInvestigator].how_he_involved += ', ' + how_he_involved;
                    invest = true;
                    $scope.peopleInvolved.splice(checkIfPeopleInvolved, 1);
//                        }
//                    });
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
                if(investExist.length > 1){
                     coreService.resetAlert();
                     coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                     $scope.report.investigators[investigatorIndex] = {};
                     return;
                }else{
                     coreService.resetAlert();
                }
            }
            var personType = 'investigator' + investigatorIndex;
            //This to check if user select user befor to replace it with the new one he selected 
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: personType});
            var whoidentified = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
            if (checkIfPeopleInvolved.length !== 0) {
                var indexOfOldInvestigator = $scope.peopleInvolved.indexOf(checkIfPeopleInvolved[0]);
                if (whoidentified.length !== 0 && whoidentified[0].employee_id === selectedItem.employee_id) {
                    var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                    var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    $scope.peopleInvolved[indexOfWhoidentified].how_he_involved += ', ' + how_he_involved;
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
                    itemSelected.type = personType;
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    itemSelected.title = selectedItem.full_name;
                    $scope.getData(itemSelected);
                    $scope.peopleInvolved[indexOfOldInvestigator] = itemSelected;

                } else {
                    var itemSelected = selectedItem;
                    itemSelected.type = personType;
                    itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                    itemSelected.title = selectedItem.full_name;
                    $scope.getData(itemSelected);
                    $scope.peopleInvolved[indexOfOldInvestigator] = itemSelected;
                }
            } else if (whoidentified.length !== 0 && whoidentified[0].employee_id === selectedItem.employee_id) {
                var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                var how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'investigator'})[0]).how_involved_name;
                $scope.peopleInvolved[indexOfWhoidentified].how_he_involved += ', ' + how_he_involved;
            } else {
                if (whoidentified.length !== 0) {
                    var indexOfWhoidentified = $scope.peopleInvolved.indexOf(whoidentified[0]);
                    var investigator = $filter('filter')($scope.report.investigators, {employee_id: whoidentified[0].employee_id});
                    if (investigator.length === 0 && $scope.peopleInvolved[indexOfWhoidentified].how_he_involved === 'Reported Incident, Investigator')
                        $scope.peopleInvolved[indexOfWhoidentified].how_he_involved = 'Reported Incident';
                }
                var itemSelected = selectedItem;
                itemSelected.type = personType;
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
//            $scope.report.investigators[investigatorIndex].full_name = selectedItem.full_name;
        };
        $scope.onSelectSignOffBy = function (selectedItem) {
            $scope.report.sign_off_investigator = selectedItem;
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
        };

        var init = function () {
            $scope.user = coreService.getUser();
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            var impactData = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                potential: 0 // this for impact types
            };
            coreReportService.deleteTempFiles({
            }).then(function (response) {
                var res = response.data;
            });

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
                $scope.oeDepartments = queues[3].data;
                $scope.observationAndAnalysis = queues[4].data;
                $scope.externalAgencies = queues[5].data;
                $scope.invStatus = queues[6].data;
                $scope.invRiskOfRecurrence = queues[7].data;
                $scope.invSeverity = queues[8].data;
                $scope.report.invsources = queues[9].data;
                $scope.invRootCauses = queues[10].data;
                $scope.scatContactTypes = queues[11].data;

                $scope.report.incidentImpactTypes[0] = {};
                $scope.report.incidentImpactTypes[0].heading = 'First Impact';
                $scope.report.incidentImpactTypes[0].individuals = [];
                $scope.report.incidentImpactTypes[0].individuals[1] = null;
                $scope.report.incidentImpactTypes[0].individuals[2] = null;
                $scope.report.incidentImpactTypes[0].individuals[3] = null;
                $scope.report.incidentImpactTypes[0].individualsEmployees = [];
                $scope.report.incidentImpactTypes[0].externalAgencies = $scope.externalAgencies;
                $scope.report.incidentCauses[0] = {};
                $scope.report.incidentCauses[0].heading = 'First Cause';
                $scope.report.inv_status_id = $filter('filter')($scope.invStatus, {field_code: 'open'})[0].inv_status_id;
                $scope.report.invRootCauses = $scope.invRootCauses;
                $scope.report.statusDisabled = true;

                $scope.status.impactType[0] = true;
                $scope.status.incidentCauses[0] = true;

                angular.forEach($scope.envConditions, function (cond) {
                    cond.envCondRequired = 1;
                });
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
        init();
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
            }
            else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'VehicleDamage') {
                incidentReportService.getVehicleTypes(data)
                        .then(function (response) {
                            $scope.vehicleTypes = response.data;
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
            else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'TrafficViolation') {
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
                    $scope.report.incidentImpactTypes[impactIndex].illness = {};
                    $scope.report.incidentImpactTypes[impactIndex].illness.symptoms = $scope.symptoms;
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                });
            }
            else if ($scope.report.incidentImpactTypes[impactIndex].impact_type_code === 'Injury') {
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
                    $scope.report.incidentImpactTypes[impactIndex].injury = {};
                    $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyParts = $scope.injuryBodyParts;
                    $scope.report.incidentImpactTypes[impactIndex].injury.injuryTypes = $scope.injuryTypes;
                    $scope.report.incidentImpactTypes[impactIndex].injury.injuryBodyAreas = $scope.injuryBodyAreas;
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
        };
        $scope.getSCATDirectCauses = function (scat_items_params_id, cause) {
            var data = {
                org_id: $scope.user.org_id,
                id: scat_items_params_id
            };
            incidentReportService.getSCATDirectCauses(data)
                    .then(function (response) {
                        cause.scatDirectCauses = response.data;
                        console.log($scope.scatDirectCauses);
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getSCATBasicCauses = function (scat_items_params_id, cause) {
            if(scat_items_params_id === null || scat_items_params_id === '' || scat_items_params_id === undefined){
                cause.scatDirectCauseType = '';
            }else{
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
            }
        };
        $scope.getSCATSubCauses = function (scat_items_params_id, cause) {
            if(scat_items_params_id === null || scat_items_params_id === '' || scat_items_params_id === undefined){
                cause.scatBasicCauseType = '';
            }else{
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
            }
        };
        $scope.Emergencyresponse = function () {
            $scope.report.is_emergency_response = null;
        };
        $scope.clearincidentCompleteTask = function (action) {
            action.desired_results = null;
        };
        $scope.clearInvestigation = function () {
            $scope.report.inv_status_id = null;
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
        $scope.clearEnvCond = function (cond) {
            angular.forEach(cond.parameters, function (param) {
                param.parameter_choice = false;
            });
            cond.envCondRequired = 1;
        };

        $scope.getIncidentTypes = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getIncidentTypes(data)
                    .then(function (response) {
                        $scope.reportTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getOEDepartments = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getOEDepartments(data)
                    .then(function (response) {
                        $scope.oeDepartments = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getEnvConditions = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getEnvConditions(data)
                    .then(function (response) {
                        $scope.envConditions = response.data;
                        angular.forEach($scope.envConditions, function (cond) {
                            cond.envCondRequired = 1;
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getImpactTypes = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                potential: 0 // this for impact types
            };
            coreReportService.getImpactTypes(data)
                    .then(function (response) {
                        $scope.impactTypes = response.data;
                        angular.forEach($scope.report.incidentImpactTypes, function (impact) {
                            var data = {
                                impact_type_id: impact.impact_type_id
                            };
                            coreReportService.getImpactSubTypes(data)
                                    .then(function (response) {
                                        impact.impactSubTypes = response.data;
                                    }, function (error) {
                                        coreService.resetAlert();
                                        coreService.setAlert({type: 'exception', message: error.data});
                                    });
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getExternalAgencies = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getExternalAgencies(data)
                    .then(function (response) {
                        $scope.externalAgencies = response.data;
                        angular.forEach($scope.report.incidentImpactTypes, function (impact) {
                            impact.externalAgencies = response.data;
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getObservationAndAnalysis = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getObservationAndAnalysis(data)
                    .then(function (response) {
                        $scope.observationAndAnalysis = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInvStatus = function (status) {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInvStatus(data)
                    .then(function (response) {
                        $scope.observationAndAnalysis = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
            
            
            
        
        };
        $scope.getInvSource = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInvSource(data)
                    .then(function (response) {
                        $scope.report.invsources = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInvRootCauses = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInvRootCauses(data)
                    .then(function (response) {
                        $scope.invRootCauses = response.data;
                        $scope.report.invRootCauses = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInvRiskOfRecurrence = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInvRiskOfRecurrence(data)
                    .then(function (response) {
                        $scope.invRiskOfRecurrence = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInvSeverity = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInvSeverity(data)
                    .then(function (response) {
                        $scope.invSeverity = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInitialTreatments = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInitialTreatments(data)
                    .then(function (response) {
                        $scope.initialTreatments = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getSymptoms = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getSymptoms(data)
                    .then(function (response) {
                        $scope.symptoms = response.data;
                        angular.forEach($scope.report.incidentImpactTypes, function (impact) {
                            impact.illness.symptoms = $scope.symptoms;
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getVehicleTypes = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getVehicleTypes(data)
                    .then(function (response) {
                        $scope.vehicleTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getSpillReleaseSource = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getSpillReleaseSource(data)
                    .then(function (response) {
                        $scope.spillReleaseSources = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getDurationUnit = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getDurationUnit(data)
                    .then(function (response) {
                        $scope.durationUnits = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getQuantityUnit = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getQuantityUnit(data)
                    .then(function (response) {
                        $scope.quantityUnits = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getSpillReleaseAgency = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getSpillReleaseAgency(data)
                    .then(function (response) {
                        $scope.spillReleaseAgencies = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInjuryBodyParts = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInjuryBodyParts(data)
                    .then(function (response) {
                        $scope.injuryBodyParts = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInjuryContactCodes = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInjuryContactCodes(data)
                    .then(function (response) {
                        $scope.injuryContactCodes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInjuryTypes = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInjuryTypes(data)
                    .then(function (response) {
                        $scope.injuryTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInjuryContactAgencies = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInjuryContactAgencies(data)
                    .then(function (response) {
                        $scope.injuryContactAgencies = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getInjuryBodyAreas = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            incidentReportService.getInjuryBodyAreas(data)
                    .then(function (response) {
                        $scope.injuryBodyAreas = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.oeRequired = 1;
        $scope.checkOERequired = function () {
            var oeChoices = $filter('filter')($scope.oeDepartments, {department_choice: true});
            if (oeChoices.length > 0) {
                $scope.oeRequired = 0;
            } else {
                $scope.oeRequired = 1;
            }
        };
        $scope.checkEnvCondRequired = function (cond, parameter) {
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
        };
        
        
        
        

    };
    controller.$inject = ['$scope', '$uibModal', '$state', 'coreReportService', 'coreService', '$q', '$filter', 'incidentReportService', '$controller', 'constantService'];
    angular.module("incidentCustomModule").controller("incidentCustomController", controller);
}());