(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $q, trainingReportService, $filter, $controller, $stateParams) {
        $scope.reportType = 'training';
        $controller('coreReportController', {$scope: $scope});
        $scope.reportPermissions = $scope.permissions.Training;
        if($scope.reportPermissions.readonlywhathappened || $scope.reportPermissions.readonlyhazarddetails || 
            $scope.reportPermissions.readonlypeopleinvolved || $scope.reportPermissions.readonlyaction ||
            $scope.reportPermissions.readonlydocuments)
            $scope.reportPermissions.readonlyreport = true;
        var firstLoad = true;
        var firstLoadInit = true;
        var firstLoadReport = true;
        $scope.disabeldTrue = true;
        $scope.showCutomFields = true;
        
         $scope.EditMode = function (){
            $scope.disabeldTrue = false;
            
        }
        $scope.labels = {
            whatHappened: {
                reportType: 'Type of training',
                reportDate: 'Training to be completed by',
                whoIdentified: 'Training assigned to'
            }
        };
                $scope.trainingProviders = [];

        $scope.trainingProvider = null;
        $scope.trainingTypes = [];
        $scope.trainingType = null;


        $scope.getTrainingTypes = function (query) {
            if ((!query) || query.length < 1)
                return [];
            
            query = " training_name LIKE '" + query + "%'";
            

            trainingReportService.getTrainingTypes({
                query: query,
                org_id: $scope.user['org_id']
            }).then(function (response) {
                var res = response.data;
                if (res) {
                    $scope.trainingTypes = res ;
                    console.log($scope.trainingTypes);

                /*
                    $scope.employees[index] = res;
                    if (whoidentified)
                        $scope.whoIdentifiedEmployees = res;
                    console.log($scope.whoIdentifiedEmployees)
                    $scope.initializeReport.whoIdentifiedEmployee = false;*/
                }
            });
        };
        
        $scope.onSelectTrainingType = function (selectedItem) {
            $scope.trainingType = selectedItem;
            console.log($scope.trainingType);
            $scope.trainingType.duration_of_training = parseInt($scope.trainingType.duration_of_training);
        };

        $scope.$watch('report.completed_date', function (newValue, oldValue) {
            $scope.CertificateInterval = parseInt($scope.trainingType.recertificate_frequency);
            console.log("report.completed_date");
            console.log($scope.report.completed_date);
          //  "2018-02-07 T22:00:00.000Z"
            console.log($scope.CertificateInterval);
            if ($scope.CertificateInterval != undefined && $scope.report.completed_date != undefined) {
   
                var years = parseInt($scope.CertificateInterval/12);
                console.log("years",years);
                var months =  ($scope.CertificateInterval%12);
                console.log("months",months);
                
                var completedDate =  $filter('date')($scope.report.completed_date, 'yyyy-MM-dd');
                
                console.log(completedDate);

                if (months > 0) {
                    var m = new Date(completedDate);
                    completedDate = m.setMonth(m.getMonth() + months);
                }

                if (years > 0) {
                    var y = new Date(completedDate);
                    completedDate = y.setFullYear(y.getFullYear() + years);
                }

                var expired = new Date(completedDate);
                 console.log(expired);
                $scope.report.expiry_date =new Date(completedDate);
            }
        });
        //provider updates
        $scope.getTrainingProviders = function (q) {
            console.log("test");
            if ((!q) || q.length < 1)
                return [];
            var query = "";
            query = " provider_name  LIKE '" + q + "%'";
            coreReportService.getTrainingProviders({
                query: query,
                org_id: $scope.user['org_id']
            }).then(function (response) {
                var res = response.data;
                if (res) {
                    $scope.trainingProviders = res;

                }
                $scope.initializeReport.provider = false;
                console.log($scope.initializeReport.provider);
            });
        };

        $scope.onTrainingProviderSelected = function (selectedItem) {
            $scope.trainingProvider = selectedItem;
            console.log($scope.trainingProvider);
            $scope.report.phone = $scope.trainingProvider.phone;
            $scope.report.website = $scope.trainingProvider.website;
            $scope.report.provider_id = $scope.trainingProvider.provider_id;
        };
        $scope.getTrainingReasons = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            trainingReportService.getTrainingReasons(data)
                    .then(function (response) {
                        $scope.trainingReasons = response.data;
                        console.log($scope.trainingReasons);
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getTrainingQuality = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            trainingReportService.getTrainingQuality(data)
                    .then(function (response) {
                        $scope.trainingQuality = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getTrainingLevelAchieved = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            trainingReportService.getTrainingLevelAchieved(data)
                    .then(function (response) {
                        $scope.trainingLevelAchieved = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var init = function () {
            $scope.getTrainingReasons();
            $scope.getTrainingQuality ();
            $scope.getTrainingAssignedByEmployees($scope.user.full_name);
            $scope.getTrainingLevelAchieved();
            console.log($scope.trainingReasons);
/*            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            $q.all([
               // trainingReportService.getTrainingTypes(data),
               // trainingReportService.getTrainingReasons(data),
               // trainingReportService.getTrainingLevelAchieved(data),
               // trainingReportService.getTrainingQuality(data)
            ]).then(function (queues) {
               // $scope.trainingTypes = queues[0].data;
              //  $scope.trainingReasons = queues[1].adata;
               // console.log($scope.trainingReasons);
               // $scope.trainingLevelAchieved = queues[2].data;
               // $scope.trainingQuality = queues[3].data;
               // $scope.getTrainingAssignedByEmployees($scope.user.full_name);
            }, function (errors) {
                coreService.resetAlert();
              //  coreService.setAlert({type: 'exception', message: errors[0].data});
               // coreService.setAlert({type: 'exception', message: errors[1].data});
              //  coreService.setAlert({type: 'exception', message: errors[2].data});
              //  coreService.setAlert({type: 'exception', message: errors[3].data});
            });*/
        };
        $scope.getTrainingReportData = function () {
            $scope.report.report_third_party = {};
            $scope.getThirdpartiesInvolved($scope.report.third_party_name);
            $scope.report.report_third_party.third_party_id = $scope.report.third_party_id;
//            $scope.report.report_third_party.third_party_name = $scope.report.third_party_name;
            $scope.report.completed_date = moment($scope.report.completed_date)['_d'];
            $scope.report.expiry_date = moment($scope.report.expiry_date)['_d'];
            $scope.report.observed_date = moment($scope.report.observed_date)['_d'];
                console.log($scope.report);
        };
        $scope.$watch('report', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoad) {
                firstLoad = false;
                init();
            }
        }, true);
        $scope.$watch('trainingReasons', function (newVal, oldVal) {
            if (newVal !== oldVal && firstLoadInit) {
                firstLoadInit = false;
                $scope.getReportData($stateParams.reportNumber);
            }
        }, true);
        $scope.$watch('report.creator_id', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getTrainingReportData();
            }
        });
        $scope.getTrainingAssignedByEmployees = function (employeeLetters) {
            if (employeeLetters !== '' && employeeLetters !== null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: employeeLetters
                };
                coreReportService.getInvestigatorsEmployees(data)
                        .then(function (response) {
                            $scope.trainingAssignedByEmployees = {};
                            $scope.trainingAssignedByEmployees = response.data;
                            if (firstLoadReport) {
                                $scope.trainingAssignedBy = $filter('filter')($scope.trainingAssignedByEmployees, {employee_id: $scope.user.employee_id})[0];
                                firstLoadReport = false;
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'error', message: error.data});
                        });
            }
        };
        $scope.getThirdpartiesInvolved = function (q) {
            if ((!q) || q.length < 1)
                return [];
            var query = "";
            query = " third_party_type_name ='Customer' or third_party_type_name ='Contractor' and third_party_name LIKE '" + q + "%'";
            coreReportService.getthirdpartyinfo({
                query: query,
                org_id: $scope.user['org_id']
            }).then(function (response) {
                var res = response.data;
                if (res.data) {
                    $scope.third_party_involved = res.data;
                    $scope.initializeReport.thirdPartyCustomer = false;
                }
            });
        };
        $scope.onThirdPartySelected = function (selectedItem) {
//            if (index == 0)
//                selectedItem.contractorRemove = true;
            console.log(selectedItem)
            $scope.report_third_party = selectedItem;
            //This to check if user select user befor to replace it with the new one he selected 
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'thirdparty'});
            if (checkIfPeopleInvolved.length !== 0) {
                var oldWhoidentified = $filter('filter')($scope.peopleInvolved, {type: 'thirdparty'})[0];
                var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(oldWhoidentified);
                var itemSelected = selectedItem;
                itemSelected.type = 'thirdparty';
                itemSelected.third_party_id = selectedItem.third_party_id;
                itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: selectedItem.third_party_type_name.toLowerCase()})[0]).how_involved_name;
                itemSelected.title = selectedItem.contact_name;
                itemSelected.full_name = selectedItem.contact_name;
                itemSelected.org_name = selectedItem.third_party_name;
                $scope.getData(itemSelected);
                $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
                $scope.report.report_third_party = itemSelected;
            } else {
                var itemSelected = selectedItem;
                itemSelected.type = 'thirdparty';
                itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: selectedItem.third_party_type_name.toLowerCase()})[0]).how_involved_name;
                itemSelected.exp_in_current_postion = null;
                itemSelected.supervisor_name = null;
                itemSelected.exp_over_all = null;
                itemSelected.age = null;
                itemSelected.org_name = selectedItem.third_party_name;
                itemSelected.third_party_id = selectedItem.third_party_id;
                itemSelected.role_description = null;
                itemSelected.full_name = selectedItem.contact_name;
                itemSelected.title = selectedItem.contact_name;
                $scope.getData(itemSelected);
                var index = $scope.peopleInvolved.length - 1;
                if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
                    $scope.peopleInvolved[index] = itemSelected;
                else
                    $scope.peopleInvolved.push(itemSelected);
                $scope.report.report_third_party = itemSelected;
            }
        };

        $scope.submitTrainingReport = function () {
            var offset = (new Date().getTimezoneOffset())/60;
            console.log(offset);
            $scope.report.clientTimeZoneOffset = offset;

            console.log("report_date test",$scope.report.report_date);
            if($scope.report.report_date !== "" && $scope.report.report_date !== null)
                $scope.report.report_date = $filter('date')($scope.report.report_date, 'yyyy-MM-dd');
            if($scope.report.completed_date !== "" && $scope.report.completed_date !== null)
                $scope.report.completed_date = $filter('date')($scope.report.completed_date, 'yyyy-MM-dd');
            if($scope.report.expiry_date !== "" && $scope.report.expiry_date !== null)
                $scope.report.expiry_date = $filter('date')($scope.report.expiry_date, 'yyyy-MM-dd');
            if($scope.report.observed_date !== "" && $scope.report.observed_date !== null)
                $scope.report.observed_date = $filter('date')($scope.report.observed_date, 'yyyy-MM-dd');
            angular.forEach($scope.report.correctiveActions, function(action){
                        if(action.start_date !== "" && action.start_date !== null)
                action.start_date = $filter('date')(action.start_date, 'yyyy-MM-dd');
                        if(action.target_end_date !== "" && action.target_end_date !== null)
                action.target_end_date = $filter('date')(action.target_end_date, 'yyyy-MM-dd');
                        if(action.actual_end_date !== "" && action.actual_end_date !== null)
                action.actual_end_date = $filter('date')(action.actual_end_date, 'yyyy-MM-dd');
            });
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
            $scope.report.process_type = 'edit';
            if($scope.trainingProvider.provider_id !== "" && $scope.trainingProvider.provider_id !== null)
                $scope.report.provider_id = $scope.trainingProvider.provider_id;
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.modifier_id = $scope.user.employee_id;
            $scope.report.org_id = $scope.user.org_id;
            $scope.report.whoIdentified = {};
            $scope.report.whoIdentified = $scope.whoIdentified;
            
            $scope.report.trainingType = $scope.trainingType;
            trainingReportService.submitTrainingReport($scope.report)
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

//        $scope.oneAtATime = true;
//        var firstLoadReport = true;
//        
//        $scope.datePopUps = {
//            report_date: false,
//            date_completed:false,
//            expiry_date:false,
//            observed_date:false,
//            start_date: false,
//            target_end_date: false,
//            actual_end_date: false,
//            lost_time_start: false,
//            lost_time_end: false
//        };
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
//        $scope.whoIdentified = null;
//        $scope.trainingAssignedBy = null;
//        $scope.employees = [];
//        $scope.whoIdentifiedEmployees = [];
//        $scope.peopleInvolved = [];
//        $scope.report_third_party = {};
//        $scope.third_party_involved = [];
//        var howInvolvedField = [];
//        $scope.actingAs = [];
//        $scope.certifications = [];
//        $scope.actingAsTest = [];
//        $scope.certificationsTest = [];
//        $scope.report = {
//            whoIdentified: {},
//            peopleInvolved: [],
//            correctiveActions: [],
//            report_third_party: {},
//            org_id: $scope.user.org_id
//        };
//        $scope.report.correctiveActions[0] = {};
//        $scope.report.correctiveActions[0].heading = 'First Action';
//        $scope.report.correctiveActions[0].notified_to = [];
//        $scope.report.correctiveActions[0].notified_to[0] = null;
//        $scope.status = {
//            isFirstPerson: true,
//            correctiveAction: []
//        };
//        $scope.status.correctiveAction[0] = true;
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
//        $scope.getTrainingAssignedByEmployees = function (employeeLetters) {
//            if (employeeLetters !== '' && employeeLetters !== null) {
//                var data = {
//                    org_id: $scope.user.org_id,
//                    letters: employeeLetters
//                };
//                coreReportService.getInvestigatorsEmployees(data)
//                        .then(function (response) {
//                            $scope.trainingAssignedByEmployees = {};
//                            $scope.trainingAssignedByEmployees = response.data;
//                            if (firstLoadReport) {
//                                $scope.trainingAssignedBy = $filter('filter')($scope.trainingAssignedByEmployees, {employee_id: $scope.user.employee_id})[0];
//                                firstLoadReport = false;
//                            }
//                        }, function (error) {
//
//                        });
//            }
//        };
//        $scope.getThirdpartiesInvolved = function (q) {
//            if ((!q) || q.length < 1)
//                return [];
//            var query = "";
//            query = " third_party_type_name ='Customer' or third_party_type_name ='Contractor' and third_party_name LIKE '" + q + "%'";
//            coreReportService.getthirdpartyinfo({
//                query: query,
//                org_id: $scope.user['org_id']
//            }).then(function (response) {
//                var res = response.data;
//                if (res.data) {
//                    $scope.third_party_involved = res.data;
//                    $scope.initializeReport.thirdPartyCustomer = false;
//                }
//            });
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
//            $q.all([coreReportService.getPeopleCertificates(data),
//                coreReportService.getPeopleActingAs(data)]).then(function (queues) {
//                newPerson.certifications = queues[0].data;
//                newPerson.actingAs = queues[1].data;
//            }
//            , function (errors) {
//                coreService.setAlert({type: 'exception', message: errors[0].data});
//                coreService.setAlert({type: 'exception', message: errors[1].data});
//            });
//        };
//
//        $scope.onSelectedPeopleInvolved = function (selectedItem) {
//            var itemSelected = selectedItem;
//            itemSelected.type = 'whoidentified';
//            itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'training'})[0]).how_involved_name;
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
//
//        $scope.onSelectWhoIdentifiedHazard = function (selectedItem) {
//            $scope.whoIdentified = selectedItem;
//            //This to check if user select user befor to replace it with the new one he selected 
//            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
//            if (checkIfPeopleInvolved.length !== 0) {
//                var oldWhoidentified = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'})[0];
//                var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(oldWhoidentified);
//                var itemSelected = selectedItem;
//                itemSelected.type = 'whoidentified';
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'training'})[0]).how_involved_name;
//                itemSelected.title = selectedItem.full_name;
//                $scope.getData(itemSelected);
//                $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
//                $scope.report.whoIdentified = itemSelected;
//            } else {
//                var itemSelected = selectedItem;
//                itemSelected.type = 'whoidentified';
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: 'training'})[0]).how_involved_name;
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
//                $scope.report.whoIdentified = itemSelected;
//            }
//        };
//
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
//                $scope.report.whoIdentified = employee;
//            }
//
//        };
//
//        $scope.onThirdPartySelected = function (selectedItem) {
////            if (index == 0)
////                selectedItem.contractorRemove = true;
//            console.log(selectedItem)
//            $scope.report_third_party = selectedItem;
//            //This to check if user select user befor to replace it with the new one he selected 
//            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'thirdparty'});
//            if (checkIfPeopleInvolved.length !== 0) {
//                var oldWhoidentified = $filter('filter')($scope.peopleInvolved, {type: 'thirdparty'})[0];
//                var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(oldWhoidentified);
//                var itemSelected = selectedItem;
//                itemSelected.type = 'thirdparty';
//                itemSelected.third_party_id = selectedItem.third_party_id;
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: selectedItem.third_party_type_name.toLowerCase()})[0]).how_involved_name;
//                itemSelected.title = selectedItem.contact_name;
//                itemSelected.full_name = selectedItem.contact_name;
//                $scope.getData(itemSelected);
//                $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
//                $scope.report.report_third_party = itemSelected;
//            } else {
//                var itemSelected = selectedItem;
//                itemSelected.type = 'thirdparty';
//                itemSelected.how_he_involved = ($filter('filter')(howInvolvedField, {key: selectedItem.third_party_type_name.toLowerCase()})[0]).how_involved_name;
//                itemSelected.exp_in_current_postion = null;
//                itemSelected.supervisor_name = null;
//                itemSelected.exp_over_all = null;
//                itemSelected.age = null;
//                itemSelected.org_name = selectedItem.third_party_name;
//                itemSelected.third_party_id = selectedItem.third_party_id;
//                itemSelected.role_description = null;
//                itemSelected.full_name = selectedItem.contact_name;
//                itemSelected.title = selectedItem.contact_name;
//                $scope.getData(itemSelected);
//                var index = $scope.peopleInvolved.length - 1;
//                if ($scope.peopleInvolved[index].title === "New Person" || $scope.peopleInvolved[index].title === "First Person")
//                    $scope.peopleInvolved[index] = itemSelected;
//                else
//                    $scope.peopleInvolved.push(itemSelected);
//                $scope.report.report_third_party = itemSelected;
//            }
//        };
//        $scope.removeNotifyPerson = function (correctiveActionIndex, notifieIndex) {
//            $scope.report.correctiveActions[correctiveActionIndex].notified_to.splice(notifieIndex, 1);
//        };
//        $scope.removeAction = function (correctiveActionIndex) {
//            $scope.report.correctiveActions.splice(correctiveActionIndex, 1);
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
//                location1_id: $scope.report.location1_id
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
//                location2_id: $scope.report.location2_id
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
//                location3_id: $scope.report.location3_id
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
//            var selectedLocation = $filter('filter')($scope.locations2, {location2_id: $scope.report.location2_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
//            $scope.report.location1_id = selectedLocation.location1_id;
//            $scope.locations1 = $scope.locations2;
////            }
//        };
//        $scope.onSelectLocation3 = function () {
//            var selectedLocation = $filter('filter')($scope.locations3, {location3_id: $scope.report.location3_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
//            $scope.report.location2_id = selectedLocation.location2_id;
//            $scope.report.location1_id = selectedLocation.location1_id;
//            $scope.locations2 = $scope.locations3;
//            $scope.locations1 = $scope.locations3;
////            }
//        };
//        $scope.onSelectLocation4 = function () {
//            var selectedLocation = $filter('filter')($scope.locations4, {location4_id: $scope.report.location4_id})[0];
//            console.log(selectedLocation)
////            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
//            $scope.report.location3_id = selectedLocation.location3_id;
//            $scope.report.location2_id = selectedLocation.location2_id;
//            $scope.report.location1_id = selectedLocation.location1_id;
//            $scope.locations3 = $scope.locations4;
//            $scope.locations2 = $scope.locations4;
//            $scope.locations1 = $scope.locations4;
////            }
//        };
//        $scope.getAssignToName = function (index) {
//            if (angular.isDefined($scope.report.correctiveActions[index].assigned_to) &&
//                    ($scope.report.correctiveActions[index].assigned_to !== '' || $scope.report.correctiveActions[index].assigned_to !== null))
//                $scope.report.correctiveActions[index].heading = $scope.report.correctiveActions[index].assigned_to.full_name;
//            else
//            if (index === 0)
//                $scope.report.correctiveActions[index].heading = 'First Action';
//            else
//                $scope.report.correctiveActions[index].heading = 'New Action';
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
//                                $scope.report.correctiveActions[index].correctiveActionAssignedEmployees = response.data;
//                                $scope.initializeReport.actionAssignTo = false;
//                            } else {
//                                if (!angular.isDefined($scope.report.correctiveActions[index].correctiveActionNotifiededEmployees))
//                                    $scope.report.correctiveActions[index].correctiveActionNotifiededEmployees = [];
//                                $scope.report.correctiveActions[index].correctiveActionNotifiededEmployees[notifyIndex] = response.data;
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
//            $scope.report.correctiveActions.push(newAction);
//        };
//        $scope.getCorrectiveActionStatus = function (index, status) {
//            if (status.field_code === 'closed') {
//                // disabled actual_date & actual cost and make its color red
//                $scope.report.correctiveActions[index].statusDisabled = false;
//            } else {
//                $scope.report.correctiveActions[index].statusDisabled = true;
//            }
//        };
//        $scope.addNewNotifiedTo = function (index) {
//            var newNotifiedTo = null;
//            $scope.report.correctiveActions[index].notified_to.push(newNotifiedTo);
//        };
//        $scope.getNotifyToName = function (notifyPerson, notifyPersonIndex, index) {
//            // not working yet !!
//            console.log(notifyPerson)
//            $scope.report.correctiveActions[index].notified_to[notifyPersonIndex] = notifyPerson;
//            console.log($scope.report.correctiveActions[index].notified_to)
////            if (notifyPerson.hasOwnProperty('full_name')) {
////                angular.forEach($scope.report.correctiveActions[index].notified_to, function (notify) {
////            console.log(notify)
////            console.log(notify.full_name === notifyPerson.full_name)
////                    if (notify.full_name === notifyPerson.full_name) {
////                        coreService.resetAlert();
////                        coreService.setAlert({type: 'error', message: 'This name is assigned before'});
////                    }
////                });
////            }
//        };
//        $scope.submitTrainingReport = function () {
//            coreService.resetAlert();
//            coreService.setAlert({type: 'wait', message: "The report is submitting, please wait ...."});
//            $scope.report.peopleInvolved = $scope.peopleInvolved;
//            $scope.report.creator_id = $scope.user.employee_id;
//            trainingReportService.submitTrainingReport($scope.report)
//                    .then(function (response) {
//                        console.log(response.data)
//                        if (response.data == 1) {
//                            coreService.resetAlert();
//                            coreService.setAlert({type: 'success', message: "The report has been added successfully"});
//                        } else {
//                            coreService.resetAlert();
//                            coreService.setAlert({type: 'error', message: response.data});
//                        }
//                    }, function (error) {
//                        coreService.resetAlert();
//                        coreService.setAlert({type: 'exception', message: error.data});
//                    });
//        }
//        var init = function () {
//            var data = {
//                org_id: $scope.user.org_id,
//                language_id: $scope.user.language_id
//            };
//            $q.all([
//                coreReportService.getCorrectiveActionPriorities(data),
//                coreReportService.getCorrectiveActionStatuses(data),
//                coreReportService.getHowInvolvedField(data),
//                coreReportService.getYesNoValuse(data),
//                coreReportService.getEmployeesByOrgId(data),
//                trainingReportService.getTrainingTypes(data),
//                trainingReportService.getTrainingReasons(data),
//                trainingReportService.getTrainingLevelAchieved(data),
//                trainingReportService.getTrainingQuality(data)
//            ]).then(function (queues) {
//                $scope.correctiveActionPriorities = queues[0].data;
//                $scope.correctiveActionStatues = queues[1].data;
//                var res = queues[2].data;
//                if (res) {
//                    howInvolvedField = res;
//                }
//                $scope.yesNoValues = queues[3].data;
//                $scope.dropDownEmployees = queues[4].data;
//                $scope.trainingTypes = queues[5].data;
//                $scope.trainingReasons = queues[6].data;
//                $scope.trainingLevelAchieved = queues[7].data;
//                $scope.trainingQuality = queues[8].data;
//                $scope.getTrainingAssignedByEmployees($scope.user.full_name);
////                $scope.safetyMeetingTypes = queues[5].data;
//                $scope.addNewPerson();
//                $scope.report.correctiveActions[0].corrective_action_status_id = $filter('filter')($scope.correctiveActionStatues, {field_code: 'open'})[0].corrective_action_status_id;
//                $scope.report.correctiveActions[0].statusDisabled = true;
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
//            });
//        };
//        init();
//        $scope.addItem = function () {
//            var newItemNo = $scope.items.length + 1;
//            $scope.items.push('Item ' + newItemNo);
//        };
//        $scope.openAdd = function () {
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/trainingReportModule/views/addNamePopup.html',
//                controller: 'AddTrainingReportController'
//            });
//        };
//        $scope.cancel = function () {
//            $uibModalInstance.dismiss('cancel');
//        };
//        $scope.removetrainingAssign = function () {
//            $scope.report.assigned_to_notify_supervisor = null;
//        };
        $scope.removeQualityTraining = function () {
            $scope.report.level_quality_id = null;
        };
        $scope.removeTraineeobserved = function () {
            $scope.report.is_trainee_observed_post = null;
        };
//        $scope.removeTraineePriority = function (action) {
//            action.corrective_action_priority_id = null;
//        };
//        $scope.removeTraineeStatus = function (action) {
//            action.corrective_action_status_id = null;
//        };
//        $scope.removecompletedtask = function (action) {
//            action.desired_results = null;
//        };
    };
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$q', 'trainingReportService', '$filter', '$controller', '$stateParams'];
    angular.module("trainingReportModule").controller("EditTrainingReportController", controller);
}());

//var createTrainingReport = angular.module('trainingReportModule');
//
//createTrainingReport.controller('createTrainingCtrl', function($scope,$uibModal) {
//    
//      $scope.oneAtATime = true;
//    
//     $scope.status = {
//    isFirstPerson: true,
//    isFirstRemidcal: true,
//    isFirstDeficiencies: true,
//    isFirstDeficiencies: true
//  };
//    
//    $scope.addItem = function() {
//    var newItemNo = $scope.items.length + 1;
//    $scope.items.push('Item ' + newItemNo);
//  };
//    
//    
//    $scope.openAdd = function (size) {
//            var modalInstance = $uibModal.open({
//                animation: $scope.animationsEnabled,
//                templateUrl: 'app/modules/newTrainingReport/views/addNamePopup.html',
//                controller: 'createTrainingCtrl'
//            });
//        };
//    
//    
//});