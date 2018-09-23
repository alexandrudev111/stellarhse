(function () {
    var controller = function ($scope, $uibModal, coreReportService, coreService, $state, $q, $filter, constantService, customersService, $stateParams ) {

        $scope.discardName = 'Undo changes';
         $scope.oneAtATime = true;
        $scope.popup1 = {
            opened: false
        };
        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };
        $scope.datePopUps = {
            report_date: false,
            correctiveAction: []
        };
        $scope.isDraft = false ;
        $scope.hideLocation3 = true;
        $scope.hideLocation4 = true;

        // this object is used to disable add to DB button once report open then the value changed according to user choice isn't in DB
        $scope.initializeReport = {
            whoIdentifiedEmployee: true,
            thirdPartyContract: true,
            thirdPartyCustomer: true,
            location1: true,
            location2: true,
            location3: true,
            location4: true,
            equipment: true,
            actionAssignTo: true,
            actionNotifyTo: true,
            provider: true
        };
        
        
        $scope.user = coreService.getUser();
        $scope.permissions = coreService.getPermissions();
        if (!$scope.user)
            $state.go('login');
        $scope.reportData = {EmployeeId: ''};
        $scope.whoIdentified = null;
//        coreReportService.deleteTempFiles({
//            }).then(function (response) {
//                var res = response.data;
//                if (res) {
//                    console.log(res);
//                }
//            });
//        console.log('whoIdentified')
//        console.log($scope.whoIdentified)
        $scope.employees = [];
        $scope.whoIdentifiedEmployees = [];
        $scope.peopleInvolved = [];
        $scope.contractor_thirdparties = [];
        $scope.contractor_owners = [];
        $scope.customer_owners = [];
        $scope.customer_thirdparties = [];
        $scope.equipments = [];
        $scope.contractors_involved = [];
        $scope.customer_involved = [];
        $scope.equipment_involved = [];
        $scope.howInvolvedField = [];
        $scope.actingAs = [];
        $scope.certifications = [];
        var actingAs = [];
        var certifications = [];
        var contractorInvolvedIndex = [];
        var customerInvolvedIndex = [];


        $scope.report = {
            whoIdentified: {},
            hazardStatus: {},
            riskLevels: {},
            location1: null,
            location2: null,
            location3: null,
            location4: null,
            contractor_thirdparty: [],
            customer_thirdparty: [],
            equipment_involved: [],
            impactTypes: [],
            riskControls: [],
            peopleInvolved: [],
            correctiveActions: [],
            causeTypes: [],
            report_third_party: [],
            org_id: $scope.user.org_id
        };
        $scope.status = {
            isFirstPerson: true,
            correctiveAction: [],
            effectType: [],
            causeType: []
        };

        $scope.canDiscard = false ;

        $scope.getReportedByUser = function (query, key, index, whoidentified) {
            if ((!query) || query.length < 1)
                return [];
            if (key == 'employee_name') {
                query = " first_name LIKE '%" + query + "%'";
            } else if (key == 'emp_id') {
                query = " emp_id LIKE '%" + query + "%'";
            } else if (key == 'position') {
                query = " position LIKE '%" + query + "%'";
            } else if (key == 'email') {
                query = " email LIKE '%" + query + "%'";
            } else if (key == 'org_name') {
                query = " org_name LIKE '%" + query + "%'";
            } else if (key == 'primary_phone') {
                query = " primary_phone LIKE '%" + query + "%'";
            } else if (key == 'alternate_phone') {
                query = " alternate_phone LIKE '%" + query + "%'";
            } else if (key == 'supervisor_name') {
                query = " supervisor_name LIKE '%" + query + "%'";
            } else if (key == 'crew_name') {
                query = " crew_name LIKE '%" + query + "%'";
            }

            coreReportService.getEmployees({
                query: query,
                org_id: $scope.user['org_id']
            }).then(function (response) {
                var res = response.data;
                if (res) {
                    $scope.employees[index] = res;
                    if (whoidentified)
                        $scope.whoIdentifiedEmployees = res;
//                    console.log($scope.whoIdentifiedEmployees)
                    $scope.initializeReport.whoIdentifiedEmployee = false;
                }
            });
        };

        /*        $scope.getReportedByUser = function ($select, key, index, whoidentifiedFlag, whoIdentifiedEmployees) {
         console.log( $select.search);
         console.log( $select.search.length);
         if ((!$select.search) || $select.search.length < 2)
         return [];
         
         if (key == 'employee_name') {
         query = " first_name LIKE '" + $select.search + "%'";
         } else if (key == 'emp_id') {
         query = " emp_id LIKE '" + $select.search + "%'";
         } else if (key == 'position') {
         query = " position LIKE '" + $select.search + "%'";
         } else if (key == 'email') {
         query = " email LIKE '" + $select.search + "%'";
         } else if (key == 'org_name') {
         query = " org_name LIKE '" + $select.search + "%'";
         } else if (key == 'primary_phone') {
         query = " primary_phone LIKE '" + $select.search + "%'";
         } else if (key == 'alternate_phone') {
         query = " alternate_phone LIKE '" + $select.search + "%'";
         } else if (key == 'supervisor_name') {
         query = " supervisor_name LIKE '" + $select.search + "%'";
         } else if (key == 'crew_name') {
         query = " crew_name LIKE '" + $select.search + "%'";
         }
         
         coreReportService.getEmployees({
         query: query,
         org_id: $scope.user['org_id']
         }).then(function (response) {
         var res = response.data;
         if (res) {
         $scope.employees[index] = res;
         if (whoidentifiedFlag)
         $scope.whoIdentifiedEmployees = res;
         console.log($scope.whoIdentifiedEmployees);
         
         console.log('length!= 0  ',$scope.whoidentified);
         $scope.initializeReport.whoIdentifiedEmployee = false;
         if ($scope.whoIdentifiedEmployees.length == 0) {
         
         console.log('length== 0',$scope.whoidentified);
         var search = $select.search
         console.log(search.length);
         var list = [];
         angular.copy($select.items, list);
         var FLAG = 'NOID';
         var companiesList = [];
         angular.copy(whoIdentifiedEmployees, companiesList);
         
         if (search.length) {
         var userInputItem = {
         employee_id: FLAG,
         full_name :search,
         emp_id: ''
         };
         
         for (var i = list.length - 1; i >= 0; i--) {
         if (list[i].employee_id === FLAG)
         list.splice(i, 1)
         }
         
         list.push(userInputItem);
         $scope.whoIdentified = {};
         $scope.x.whoIdentified = userInputItem;
         console.log("LAST",userInputItem);
         console.log("LAST",$scope.whoidentified);
         } else {
         $select.items = list;
         }
         }
         }
         });
         };
         
         $scope.asyncCompanies = function ($select, companies) {
         
         if ((! $select.search) || $select.search.length < 3)
         return [];
         
         formsService.getShellSaltCompanyFilter($select.search).then(function (response) {
         var res = response.data;
         if (res.data) {
         $scope.companies = res.data.filter
         if ($scope.companies.length == 0) {
         var search = $select.search
         var list = []
         angular.copy($select.items, list)
         // var FLAG = 'NOID'
         var companiesList = []
         angular.copy(companies, companiesList)
         
         if (search.length) {
         var userInputItem = {
         company : search
         }
         
         list.push(userInputItem)
         $scope.report.Company = userInputItem
         } else {
         $select.items = list
         }
         }
         }
         });
         }*/

        $scope.getThirdpartiesInvolved = function (q, key, index) {
            if ((!q) || q.length < 1)
                return [];
            var query = "";
            if (key == 'Customer') {
                query = " third_party_type_name ='Customer' and third_party_name LIKE '%" + q + "%'";
                coreReportService.getthirdpartyinfo({
                    query: query,
                    org_id: $scope.user['org_id']
                }).then(function (response) {
                    var res = response.data;
                    if (res.data) {
                        $scope.customer_thirdparties[index] = res.data;
                        $scope.initializeReport.thirdPartyCustomer = false;
                    }
                });
            } else if (key == 'Contractor') {
                query = " third_party_type_name ='Contractor' and third_party_name LIKE '%" + q + "%'";
                coreReportService.getthirdpartyinfo({
                    query: query,
                    org_id: $scope.user['org_id']
                }).then(function (response) {
                    var res = response.data;
                    if (res.data) {
                        $scope.contractor_thirdparties[index] = res.data;
                        $scope.initializeReport.thirdPartyContract = false;
                    }
                });
            }


        };
        $scope.addNewPerson = function () {

            var newPerson = {};
            if ($scope.peopleInvolved.length == 0)
                newPerson.title = "First person";
            else
                newPerson.title = "New person";
            $scope.getData(newPerson);
            $scope.peopleInvolved.push(newPerson);
//            console.log($scope.peopleInvolved);
            $scope.addPeopleCustomFields();

        };
        $scope.getData = function (newPerson) {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };

            $q.all([coreReportService.getPeopleCertificates(data),
                coreReportService.getPeopleActingAs(data)]).then(function (queues) {
                newPerson.certifications = queues[0].data;
                newPerson.actingAs = queues[1].data;
            }
            , function (errors) {
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
            });
        };
        $scope.onSelectedPeopleInvolved = function (selectedItem, index) {
//            console.log($scope.peopleInvolved);
//            console.log(selectedItem);
//            console.log(index);
            var itemSelected = selectedItem;
            itemSelected.type = 'whoidentified';
           // itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: $scope.reportType})[0]).how_involved_name;
            itemSelected.how_he_involved = null ;
            itemSelected.supervisor_name = null;
            itemSelected.exp_over_all = null;
            itemSelected.age = null;
            itemSelected.third_party_id = null;
            itemSelected.role_description = null;
            itemSelected.title = selectedItem.full_name;
            $scope.getData(itemSelected);
            //var index = $scope.peopleInvolved.length -1;
            $scope.peopleInvolved[index] = itemSelected;
            $scope.updateDreaftReport();
            $scope.addPeopleCustomFields();
        }
        //bug
        $scope.onSelectWhoIdentified = function (selectedItem) {
//            console.log("selectedItem", selectedItem);
            $scope.whoIdentified = selectedItem;
            //This to check if user select user befor to replace it with the new one he selected 
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
            // for upate whoidentified in peopoleinvolved
            if (checkIfPeopleInvolved.length !== 0) {
                var oldWhoidentified = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'})[0];
                var indexOfOldWhoidentified = $scope.peopleInvolved.indexOf(oldWhoidentified);
//                console.log('indexOfOldWhoidentified',indexOfOldWhoidentified);
                var itemSelected = selectedItem;
                itemSelected.type = 'whoidentified';
                itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: $scope.reportType})[0]).how_involved_name;
                itemSelected.title = selectedItem.full_name;
                itemSelected.crew = selectedItem.crew_id;
                itemSelected.department = selectedItem.department_id;
                $scope.getData(itemSelected);
                
                $scope.peopleInvolved[indexOfOldWhoidentified] = itemSelected;
                $scope.report.whoIdentified = itemSelected;
            } else {
                //for first time to select whoidentified
                var itemSelected = selectedItem;
                itemSelected.type = 'whoidentified';
                itemSelected.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: $scope.reportType})[0]).how_involved_name;
                itemSelected.exp_in_current_postion = null;
                itemSelected.supervisor_name = null;
                itemSelected.crew = null;
                itemSelected.exp_over_all = null;
                itemSelected.age = null;
                itemSelected.third_party_id = null;
                itemSelected.role_description = null;
                itemSelected.title = selectedItem.full_name;
                itemSelected.department = selectedItem.department_id;
                $scope.getData(itemSelected);
                var index = $scope.peopleInvolved.length - 1;
//                console.log('first whoidentified selected index',index);
//                console.log('$scope.peopleInvolved',$scope.peopleInvolved[index].title);
                if ($scope.peopleInvolved[index].title === "New person" || $scope.peopleInvolved[index].title === "First person")
                    $scope.peopleInvolved[index] = itemSelected;
                else
                    $scope.peopleInvolved.push(itemSelected);
                $scope.report.whoIdentified = itemSelected;
            }
            
            $scope.addPeopleCustomFields();
            $scope.updateDreaftReport();
        };
        $scope.checkEmail = function (obj, value) {
            if (angular.isDefined(value))
                value = value.toLowerCase();
            if (!value.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/) && value !== null && value !== '') {
                obj['whoIdentifiedEmailError'] = 'Invalid email format!';
                obj.email = null;
            } else {
                obj['whoIdentifiedEmailError'] = null;
            }
        };
        $scope.whoIdentifiedChanged = function (value, key) {
            var checkIfPeopleInvolved = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'});
            if (checkIfPeopleInvolved.length !== 0) {
                var employee = $filter('filter')($scope.peopleInvolved, {type: 'whoidentified'})[0];
                var indexOfWhoIdentified = $scope.peopleInvolved.indexOf(employee);

                if (key === "emp_id") {
                    employee.emp_id = value;
                } else if (key === "position") {
                    employee.position = value;
                } else if (key === "crew_name") {
                    employee.crew_id = value;
                } else if (key === "department") {
                    employee.department_id = value;
                } else if (key === "email") {
                    employee.email = value;
                } else if (key === "org_name") {
                    employee.org_name = value;
                } else if (key === "primary_phone") {
                    employee.primary_phone = value;
                } else if (key === "alternate_phone") {
                    employee.alternate_phone = value;
                } else if (key === "supervisor_name") {
                    employee.supervisor_name = value;
                }
                $scope.peopleInvolved[indexOfWhoIdentified] = employee;
                $scope.peopleInvolved[indexOfWhoIdentified].crew = employee.crew_id;
                $scope.peopleInvolved[indexOfWhoIdentified].department = employee.department_id;
                $scope.report.whoIdentified = employee;
                $scope.updateDreaftReport();

            }
        };

        $scope.onContractorThirdPartySelected = function (selectedItem, index) {
//            console.log("index contacor on contractors_involved", index);
            var thirdPartyInvolved = selectedItem;
            thirdPartyInvolved.employee_id = selectedItem.third_party_id;
            thirdPartyInvolved.full_name = selectedItem.contact_name;
            thirdPartyInvolved.type = 'thirdparty';
            thirdPartyInvolved.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'contractor'})[0]).how_involved_name;
            thirdPartyInvolved.exp_in_current_postion = null;
            thirdPartyInvolved.exp_over_all = null;
            thirdPartyInvolved.age = null;
            //ask
            thirdPartyInvolved.company = selectedItem.third_party_name;
            thirdPartyInvolved.title = selectedItem.full_name;
            thirdPartyInvolved.third_party_id = selectedItem.third_party_id;
            thirdPartyInvolved.role_description = null;
            $scope.contractors_involved[index] = thirdPartyInvolved;
            // validation on select contractor twice 
            if ($scope.contractors_involved[index].hasOwnProperty('full_name')) {
                var contractorExist = $filter('filter')($scope.contractors_involved, {employee_id: selectedItem.employee_id});
                if(contractorExist.length > 1 ){
                     coreService.resetAlert();
                     coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                    $scope.contractors_involved.splice(index, 1);
                     console.log("contractors_involved", $scope.contractors_involved);
                     return;
                }else{
                    coreService.resetAlert();
                    console.log("contractors_involved", $scope.contractors_involved);
                    if (selectedItem.contact_name.length !== 0) {
                        thirdPartyData(thirdPartyInvolved, index, "contractor","notEmptyNameUpdated");
                    } else {
                        console.log(" ****  Empty name **** ");
                        var editThirdParty = [];
                        editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: index});
                        // editThirdParty for add cont with no contact name suppose length of it = 0
                        // if update for old cont =1
                        console.log('editThirdParty for contractor of empty name ',editThirdParty );
                        if (editThirdParty.length > 0) {
                            console.log("*** On update old contractor with anther one with no contact name ***")
                            $scope.peopleInvolved.splice(editThirdParty[0].tabIndex, 1);
                            console.log('$scope.peopleInvolved after splice', $scope.peopleInvolved);
                            contractorInvolvedIndex.splice(editThirdParty[0].contractorIndex, 1);
                            console.log('contractorInvolvedIndex after splice', contractorInvolvedIndex);
                            if ($scope.peopleInvolved.length == 0) {
                                $scope.addNewPerson();
                            }
                        }
                    }
                    // update report_third_party array
                    updateReportThirdPartyArr(thirdPartyInvolved, index, "Contractor");
                }
            }
            $scope.addPeopleCustomFields();
            $scope.updateDreaftReport();
        };
        $scope.onCustomerThirdPartySelected = function (selectedItem, index) {
//            console.log("index customer on customer_involved", index);
            var thirdPartyInvolved = selectedItem;
            thirdPartyInvolved.employee_id = selectedItem.third_party_id;
            thirdPartyInvolved.full_name = selectedItem.contact_name;
            thirdPartyInvolved.type = 'thirdparty';
            thirdPartyInvolved.how_he_involved = ($filter('filter')($scope.howInvolvedField, {key: 'customer'})[0]).how_involved_name;
            thirdPartyInvolved.exp_in_current_postion = null;
            thirdPartyInvolved.exp_over_all = null;
            thirdPartyInvolved.age = null;
            thirdPartyInvolved.title = selectedItem.full_name;
            //update
            thirdPartyInvolved.company = selectedItem.third_party_name;
            thirdPartyInvolved.third_party_id = selectedItem.third_party_id;
            thirdPartyInvolved.role_description = null;
            $scope.customer_involved[index] = thirdPartyInvolved;
            if ($scope.customer_involved[index].hasOwnProperty('full_name')) {
                var customerExist = $filter('filter')($scope.customer_involved, {employee_id: selectedItem.employee_id});
                if(customerExist.length > 1){
                     coreService.resetAlert();
                     coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                     $scope.customer_involved.splice(index, 1);
                     return;
                }else{
                     coreService.resetAlert();

                    if (selectedItem.contact_name.length !== 0) {
                        thirdPartyData(thirdPartyInvolved, index, "customer", "notEmptyNameUpdated");
                    } else {
//                        console.log(" ****  Empty name **** ");
                        var editThirdParty = [];
                        editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: index});
                         // editThirdParty for add customer with no contact name suppose length of it = 0
                        // if update for old customer =1
//                        console.log('editThirdParty for customer of empty name ',editThirdParty );
                        if (editThirdParty.length > 0) {
                            console.log("*** On update old customer with anther one with no contact name ***")
                            $scope.peopleInvolved.splice(editThirdParty[0].tabIndex, 1);
//                            console.log('$scope.peopleInvolved after splice', $scope.peopleInvolved);
                            customerInvolvedIndex.splice(editThirdParty[0].customerIndex, 1);
//                            console.log('customerInvolvedIndex after splice', customerInvolvedIndex);
                            if ($scope.peopleInvolved.length == 0) {
                                $scope.addNewPerson();
                            }
                        }
                    }
                    // update report_third_party array
                    updateReportThirdPartyArr(thirdPartyInvolved, index, "Customer");
                }
            }
            $scope.addPeopleCustomFields();
            $scope.updateDreaftReport();
        };  
        var thirdPartyData = function (thirdPartyInvolved, thirdPartyIndex, type, emptyNameType) {
            thirdPartyInvolved.certifications = certifications;
            thirdPartyInvolved.actingAs = actingAs;
            var arrayLength = 0;
            $scope.getData(thirdPartyInvolved);
            var peopleInvolvedIndex = $scope.peopleInvolved.length -1;
//            console.log('***** On thirdPartyData *****');
            if (type === "customer") {
                $scope.customer_involved[thirdPartyIndex] = thirdPartyInvolved;
                var editThirdParty = [];
                editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: thirdPartyIndex});
                // editThirdParty for add customer with  contact name suppose length of it = 0
                // if update for old customer =1
//                console.log("editThirdParty on thirdPartyData", editThirdParty);
                if (editThirdParty.length > 0) {
//                    console.log('***** On Update Customer *****');
                    //var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                    var index = editThirdParty[0].tabIndex;
//                    console.log("index updated on people_involved",index);
                    if (emptyNameType == "emptyNameUpdated") {
                        if (index > $scope.peopleInvolved.length) {
                            $scope.peopleInvolved.push(thirdPartyInvolved);
                            //var customerInvolvedIndexUpdated = $filter('filter')(customerInvolvedIndex, {customerIndex: thirdPartyIndex})[0];
                            //var indexUpdated = customerInvolvedIndex.indexOf(customerInvolvedIndexUpdated);
                           // var customerObject = {};
                           // customerObject.customerIndex = thirdPartyIndex;
                           // customerObject.tabIndex = $scope.peopleInvolved.length - 1;
                           // customerInvolvedIndex[indexUpdated] = customerObject;
                        } else {
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;
                        }
                    }
                    else{
                        /*if (index < 0) {
                            $scope.peopleInvolved[editThirdParty[0].tabIndex] = thirdPartyInvolved;
                        } else {*/
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;
                       // }
                    }
//                    console.log('$scope.peopleInvolved after update or add in case empty name added', $scope.peopleInvolved);
                } else {
//                    console.log('***** On Add Customer *****');
                    if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First person"){
                        $scope.peopleInvolved[peopleInvolvedIndex] = thirdPartyInvolved;
                        //$scope.peopleInvolved.push(thirdPartyInvolved);
                    }
                    else {
                        $scope.peopleInvolved.push(thirdPartyInvolved);
                        /*var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                        if (index < 0) {
                            $scope.peopleInvolved.push(thirdPartyInvolved);
                        } else {
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;

                       // }*/
                    }
                    var customerObject = {};
                    customerObject.customerIndex = thirdPartyIndex;
                    customerObject.tabIndex = $scope.peopleInvolved.length - 1;
                    customerInvolvedIndex.push(customerObject);
                    $scope.customer_involved[thirdPartyIndex] = thirdPartyInvolved;
//                    console.log('$scope.peopleInvolved after Add', $scope.peopleInvolved);
                }

            } else
            {

                $scope.contractors_involved[thirdPartyIndex] = thirdPartyInvolved;
                var editThirdParty = [];
                editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: thirdPartyIndex});
                // editThirdParty for add Contractor with  contact name suppose length of it = 0
                // if update for old Contractor =1
//                console.log("editThirdParty on thirdPartyData", editThirdParty);
                if (editThirdParty.length > 0) {
//                    console.log('***** On Update Contractor *****');
                    var index = editThirdParty[0].tabIndex;
//                    console.log("index updated on people_involved",index);
                    if (emptyNameType == "emptyNameUpdated") {
                        //var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);

                        if (index > $scope.peopleInvolved.length) {
                            $scope.peopleInvolved.push(thirdPartyInvolved);
                           /* var contractorInvolvedIndexUpdated = $filter('filter')(contractorInvolvedIndex, {contractorIndex: thirdPartyIndex})[0];
                            var indexUpdated = contractorInvolvedIndex.indexOf(contractorInvolvedIndexUpdated);
                            var contractorObject = {};
                            contractorObject.contractorIndex = thirdPartyIndex;
                            contractorObject.tabIndex = $scope.peopleInvolved.length - 1;
                            contractorInvolvedIndex[indexUpdated] = contractorObject;*/
                        } else {
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;
                        }
                    }
                    else{
                        //var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                        /*if (index < 0) {
                            $scope.peopleInvolved[editThirdParty[0].tabIndex] = thirdPartyInvolved;
                        } else {*/
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;

                        //}
                    }
//                    console.log('$scope.peopleInvolved after update or add in case empty name added', $scope.peopleInvolved);
                } else {
                    if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First person"){
                        $scope.peopleInvolved[peopleInvolvedIndex] = thirdPartyInvolved;
                    }
                    else {
                        $scope.peopleInvolved.push(thirdPartyInvolved);
                        /*var index = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                        if (index < 0) {
                             console.log("**** New push in peopleInvolved ***");
                            $scope.peopleInvolved.push(thirdPartyInvolved);
                        } else {
                            console.log("**** update in peopleInvolved on unknown case ***");
                            thirdPartyInvolved.title = thirdPartyInvolved.contact_name;
                            thirdPartyInvolved.full_name = thirdPartyInvolved.contact_name;
                            $scope.peopleInvolved[index] = thirdPartyInvolved;

                        }*/
                    }
                    var contractorObject = {};
                    contractorObject.contractorIndex = thirdPartyIndex;
                   // contractorObject.tabIndex = $scope.peopleInvolved.length - 1;
                    contractorObject.tabIndex = $scope.peopleInvolved.length -1;
                    $scope.contractors_involved[thirdPartyIndex] = thirdPartyInvolved;
                    contractorInvolvedIndex.push(contractorObject);
                    console.log('$scope.peopleInvolved after Add', $scope.peopleInvolved);
                }
            }
        }
        $scope.customerThirdPartyNameChanged = function (customerIndex) {
            var customer = $scope.customer_involved[customerIndex];
           // console.log("customerInvolvedIndex", customerInvolvedIndex);
            var editThirdParty = [];
            editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: customerIndex});
            // suppose = 0 incase of empty contact name  to add to peopleInvolved
//            console.log('editThirdParty for customer of empty name on change',editThirdParty );
            if (editThirdParty.length < 1) {
                var customerObject = {};
                customerObject.customerIndex = customerIndex;
                var peopleInvolvedIndex = $scope.peopleInvolved.length - 1;
                if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First person")
                    customerObject.tabIndex = $scope.peopleInvolved.length -1;
                else
                    customerObject.tabIndex = $scope.peopleInvolved.length  ;
                customerInvolvedIndex.push(customerObject);
//                console.log('customerInvolvedIndex on change name after new push',customerInvolvedIndex);
            }
            if (customer.contact_name.length !== 0) {
                thirdPartyData(customer, customerIndex, "customer","emptyNameUpdated");
            }
            //else handle on case remove contact name *****
            // update report_third_party array
            updateReportThirdPartyArr(customer, customerIndex, "Customer");
        };
        $scope.contractorThirdPartyNameChanged = function (contractorIndex) {
            var contractor = $scope.contractors_involved[contractorIndex];
            //console.log("contractorInvolvedIndex", contractorInvolvedIndex);
            var editThirdParty = [];
            editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: contractorIndex});
//            console.log('editThirdParty for contractor of empty name on change',editThirdParty );
            if (editThirdParty.length < 1) {
                var contractorObject = {};
                contractorObject.contractorIndex = contractorIndex;
                var peopleInvolvedIndex = $scope.peopleInvolved.length - 1;
                if ($scope.peopleInvolved[peopleInvolvedIndex].title === "New person" || $scope.peopleInvolved[peopleInvolvedIndex].title === "First person")
                    contractorObject.tabIndex = $scope.peopleInvolved.length - 1;                
                else
                    contractorObject.tabIndex = $scope.peopleInvolved.length  ;
                contractorInvolvedIndex.push(contractorObject);
//                console.log('contractorInvolvedIndex on change name after new push',contractorInvolvedIndex);
            }
            if (contractor.contact_name.length !== 0) {
                thirdPartyData(contractor, contractorIndex, "contractor","emptyNameUpdated");
            }
            //else handle on case remove contact name *****
            // update report_third_party array
            updateReportThirdPartyArr(contractor, contractorIndex, "Contractor");
        };
        var thirdPartyContractorIndexes = [];
        var thirdPartyCustomerIndexes = [];

        var updateReportThirdPartyArr = function(element, index, type){
            // element = element that pushed or update on report third party array
            //index = index on customer_involved or contractors_involved
           // type  = customert or Contractor
           console.log(element, index, type);

            if (type == "Contractor") {
                var oldThirdParty = [];
                oldThirdParty = $filter('filter')(thirdPartyContractorIndexes, {onContractorsIndex: index});
//               console.log("oldThirdParty",oldThirdParty);
                if (oldThirdParty.length > 0) {
                    $scope.report.report_third_party[oldThirdParty[0].onThirdPartyIndex] = element;
                }else{
                    var cont = {};
                    cont.onContractorsIndex = index ;
                    cont.onThirdPartyIndex = $scope.report.report_third_party.length;
                    thirdPartyContractorIndexes.push(cont);
                    $scope.report.report_third_party.push(element);
                }
            } else{
                var oldThirdParty = [];
                oldThirdParty = $filter('filter')(thirdPartyCustomerIndexes, {onCustomersIndex: index});
//               console.log("oldThirdParty",oldThirdParty);
                if (oldThirdParty.length > 0) {
                    $scope.report.report_third_party[oldThirdParty[0].onThirdPartyIndex] = element;
                }else{
                    var cust = {};
                    cust.onCustomersIndex = index ;
                    cust.onThirdPartyIndex = $scope.report.report_third_party.length;
                    thirdPartyCustomerIndexes.push(cust);
                    $scope.report.report_third_party.push(element);
                }
            }
//            console.log("thirdPartyContractorIndexes arr for third party part", thirdPartyContractorIndexes);
//            console.log("thirdPartyCustomerIndexes arr for third party part", thirdPartyCustomerIndexes);
//            console.log("updated third party array", $scope.report.report_third_party);
       }

        $scope.onEquipmentSelected = function (selectedItem, index) {
            //            if (index == 0)
            //                selectedItem.equipmentRemove = true;
//            console.log("selectedItem", selectedItem);

            $scope.report.equipment_involved[index] = selectedItem;

            /* $scope.report.equipment_involved[index].equipment_name = selectedItem.equipment_name;
             $scope.report.equipment_involved[index].equipment_id = selectedItem.equipment_id;
             */console.log("$scope.report.equipment_involved[index]", $scope.report.equipment_involved[index]);
            $scope.updateDreaftReport();
        };

        $scope.removeContractor = function (index, item) {
            $scope.contractors_involved.splice(index, 1);
            // for update peopleInvolved part
           // var indexpeopleInvolved = $scope.peopleInvolved.indexOf(item);
            var removedItemOnContractorInvolvedIndex =  $filter('filter')(contractorInvolvedIndex, {contractorIndex: index})[0];
            var indexpeopleInvolved = removedItemOnContractorInvolvedIndex.tabIndex;
//            console.log("remove index in peopleInvolved",indexpeopleInvolved);
            if (indexpeopleInvolved > -1) // in case remove for contractor of empty contact name
                $scope.peopleInvolved.splice(indexpeopleInvolved, 1);
//            console.log('$scope.peopleInvolved after splice', $scope.peopleInvolved);
            var removedIndexOnContractorInvolvedIndex = contractorInvolvedIndex.indexOf(removedItemOnContractorInvolvedIndex);
            contractorInvolvedIndex.splice(removedIndexOnContractorInvolvedIndex, 1);
//            console.log('$scope.contractors_involved after splice', $scope.contractors_involved);
//            console.log('contractorInvolvedIndex after splice', contractorInvolvedIndex);
            //for update customerInvolvedIndex
            if (item.contact_name != "" && item.contact_name != undefined) 
                updatePeopleInvolvedIndexes(index, 'Contractor');

            // for update Third Party part
            var indexInreport = $scope.report.report_third_party.indexOf(item);
            $scope.report.report_third_party.splice(indexInreport,1);
//            console.log("report_third_party after remove",$scope.report.report_third_party);
            // for update index array
            var oldThirdParty = [];
            oldThirdParty = $filter('filter')(thirdPartyContractorIndexes, {onContractorsIndex: index});
//            console.log("oldThirdParty",oldThirdParty);
            var indexOnArr = thirdPartyContractorIndexes.indexOf(oldThirdParty[0]);
            thirdPartyContractorIndexes.splice(indexOnArr,1);
//            console.log('thirdPartyContractorIndexes after remove',thirdPartyContractorIndexes);
            
            updateThirdPartyIndexes();    
        };
        $scope.removeCustomer = function (index, item) {
            $scope.customer_involved.splice(index, 1);

            var removedItemOnCustomerInvolvedIndex =  $filter('filter')(customerInvolvedIndex, {customerIndex: index})[0];
            var indexpeopleInvolved = removedItemOnCustomerInvolvedIndex.tabIndex;
            if (indexpeopleInvolved > -1) 
                $scope.peopleInvolved.splice(indexpeopleInvolved, 1);
//            console.log('$scope.peopleInvolved after splice', $scope.peopleInvolved);
            var removedIndexOnCustomerInvolvedIndex = customerInvolvedIndex.indexOf(removedItemOnCustomerInvolvedIndex);
            customerInvolvedIndex.splice(removedIndexOnCustomerInvolvedIndex, 1);
           
            if (item.contact_name != "" && item.contact_name != undefined) 
                updatePeopleInvolvedIndexes(index, 'Customer');

            // for update Third Party part
            var indexInreport = $scope.report.report_third_party.indexOf(item);
            $scope.report.report_third_party.splice(indexInreport, 1);
//             console.log("report_third_party after remove",$scope.report.report_third_party);
            // for update index array
            var oldThirdParty = [];
            oldThirdParty = $filter('filter')(thirdPartyCustomerIndexes, {onCustomersIndex: index});
//            console.log("oldThirdParty",oldThirdParty);
            var indexOnArr = thirdPartyCustomerIndexes.indexOf(oldThirdParty[0]);
            thirdPartyCustomerIndexes.splice(indexOnArr, 1);
//            console.log('thirdPartyCustomerIndexes after remove',thirdPartyCustomerIndexes);

            updateThirdPartyIndexes();
        };
        var updatePeopleInvolvedIndexes = function(index, type){//review logic for empety contact name 
            //for update customerInvolvedIndex
//            console.log("index",index);

            for (var i = 0; i < contractorInvolvedIndex.length; i++) {
//                console.log(contractorInvolvedIndex[i].contractorIndex);
                if (i >= index && type == 'Contractor') 
                    contractorInvolvedIndex[i].contractorIndex = (contractorInvolvedIndex[i].contractorIndex-1) ;
                var indexOnContractor = contractorInvolvedIndex[i].contractorIndex;
//                console.log("indexOnContractor",indexOnContractor);
                //update tabIndex
                var thirdPartyInvolvedId = $scope.contractors_involved[indexOnContractor].third_party_id;
                var thirdPartyInvolved = $filter('filter')($scope.peopleInvolved, {third_party_id: thirdPartyInvolvedId})[0];
//                console.log("thirdPartyInvolved",thirdPartyInvolved);
                var newIndex = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                contractorInvolvedIndex[i].tabIndex = newIndex ;
            }
//            console.log('contractorInvolvedIndex after splice', contractorInvolvedIndex);
            //for update customerInvolvedIndex
            for (var i = 0; i < customerInvolvedIndex.length; i++) {
                if (i >= index && type == 'Customer') 
                    customerInvolvedIndex[i].customerIndex = (customerInvolvedIndex[i].customerIndex - 1) ;
                var indexOnCustomer = customerInvolvedIndex[i].customerIndex;
                console.log("indexOnCustomer",indexOnCustomer);

                var thirdPartyInvolvedId = $scope.customer_involved[indexOnCustomer].third_party_id;
                var thirdPartyInvolved = $filter('filter')($scope.peopleInvolved, {third_party_id: thirdPartyInvolvedId})[0];
//                console.log("thirdPartyInvolved",thirdPartyInvolved);
                var newIndex = $scope.peopleInvolved.indexOf(thirdPartyInvolved);
                customerInvolvedIndex[i].tabIndex = newIndex ;
            }
//            console.log('customerInvolvedIndex after splice', customerInvolvedIndex);
        }
        var updateThirdPartyIndexes = function(){
            //for update customerInvolvedIndex
            for (var i = 0; i < thirdPartyContractorIndexes.length; i++) {
                thirdPartyContractorIndexes[i].onContractorsIndex = i ;
                var thirdPartyInvolved = $scope.contractors_involved[i];
                var newIndex = $scope.report.report_third_party.indexOf(thirdPartyInvolved);
                if (newIndex == -1) 
                    thirdPartyContractorIndexes.splice(i,1);
                else
                    thirdPartyContractorIndexes[i].onThirdPartyIndex = newIndex ;
            }
//            console.log('thirdPartyContractorIndexes after splice', thirdPartyContractorIndexes);
            //for update thirdPartyCustomerIndexes
            for (var i = 0; i < thirdPartyCustomerIndexes.length; i++) {
                thirdPartyCustomerIndexes[i].onCustomersIndex = i ;
                var thirdPartyInvolved = $scope.customer_involved[i];
                var newIndex = $scope.report.report_third_party.indexOf(thirdPartyInvolved);
                if (newIndex == -1) 
                    thirdPartyCustomerIndexes.splice(i,1);
                else
                    thirdPartyCustomerIndexes[i].onThirdPartyIndex = newIndex ;
            }
//            console.log('thirdPartyCustomerIndexes after splice', thirdPartyCustomerIndexes);
        }
        $scope.removeEquipment = function (item, index, $select, $event) {
//            console.log(item);

            //$scope.report.equipment_involved[index] = undefined ;
            item.equipment_id = null;
            item.equipment_name =  null;
            item = null;
            $scope.report.equipment_involved.splice(index, 1);
//            console.log($scope.report.equipment_involved[index]);
            if ($scope.report.equipment_involved[index] != undefined) {
                item = $scope.report.equipment_involved[index];
                item.equipment_id = $scope.report.equipment_involved[index].equipment_id;
                item.equipment_name =  $scope.report.equipment_involved[index].equipment_name;
                $event.stopPropagation(); 
                $select.search = item.equipment_name;
                $select.selected = item ;
//                console.log(item);
            }
            $scope.equipments.splice(index,1);
//            console.log($scope.equipments);
//            console.log($scope.report.equipment_involved);
            //item = null;
        };
        $scope.removeNotifyPerson = function (correctiveActionIndex, notifieIndex) {
            $scope.report.correctiveActions[correctiveActionIndex].notified_to.splice(notifieIndex, 1);
        };
        $scope.removeAction = function (correctiveActionIndex) {

            $scope.report.correctiveActions.splice(correctiveActionIndex, 1);
            if ($scope.reportType == 'incident') 
                $scope.updateReportStatus();
            $scope.datePopUps.correctiveActions.splice(correctiveActionIndex, 1);

        };
        $scope.getLocations1 = function (location1Letters) {
            var data = {
                org_id: $scope.user.org_id,
                letters: location1Letters
            };
            if (location1Letters !== '' && location1Letters !== null)
                coreReportService.getLocations1(data)
                        .then(function (response) {
//                            console.log(response.data)
                            $scope.locations1 = response.data;
                            $scope.locations2 = [];
                            $scope.locations3 = [];
                            $scope.locations4 = [];
                            $scope.initializeReport.location1 = false;
                        }, function (error) {

                        });
        };
        $scope.getLocations2 = function (location2Letters) {
            if ($scope.report.location1 === null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location2Letters,
                    location1_id: null
                };
            } else {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location2Letters,
                    location1_id: $scope.report.location1.location1_id
                };
            }
            if (location2Letters !== '' && location2Letters !== null)
                coreReportService.getLocations2(data)
                        .then(function (response) {
//                            console.log(response.data)
                            $scope.locations2 = response.data;
                            $scope.locations3 = [];
                            $scope.locations4 = [];
                            $scope.initializeReport.location2 = false;
                        }, function (error) {

                        });
        };
        $scope.getLocations3 = function (location3Letters) {
            if ($scope.report.location2 === null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location3Letters,
                    location2_id: null
                };
            } else {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location3Letters,
                    location2_id: $scope.report.location2.location2_id
                };
            }
            if (location3Letters !== '' && location3Letters !== null)
                coreReportService.getLocations3(data)
                        .then(function (response) {
//                            console.log(response.data)
                            $scope.locations3 = response.data;
                            $scope.locations4 = [];
                            $scope.initializeReport.location3 = false;
                        }, function (error) {

                        });
        };
        $scope.getLocations4 = function (location4Letters) {
            if ($scope.report.location3 === null) {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location4Letters,
                    location3_id: null
                };
            } else {
                var data = {
                    org_id: $scope.user.org_id,
                    letters: location4Letters,
                    location3_id: $scope.report.location3.location3_id
                };
            }
            if (location4Letters !== '' && location4Letters !== null)
                coreReportService.getLocations4(data)
                        .then(function (response) {
//                            console.log(response.data)
                            $scope.locations4 = response.data;
                            $scope.initializeReport.location4 = false;
                        }, function (error) {

                        });
        };
        $scope.onSelectLocation1 = function () {
//            console.log($scope.report.location1);
            $scope.updateDreaftReport();
        };
        $scope.onSelectLocation2 = function () {
            var selectedLocation = $filter('filter')($scope.locations2, {location2_id: $scope.report.location2.location2_id})[0];
//            console.log(selectedLocation)
            //            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
            $scope.report.location2 = {};
            $scope.report.location2.location2_id = selectedLocation.location2_id;
            $scope.report.location2.location2_name = selectedLocation.location2_name;
            if ($scope.report.location1 === null) {
                $scope.report.location1 = {};
            }
            $scope.report.location1.location1_id = selectedLocation.location1_id;
            $scope.report.location1.location1_name = selectedLocation.location1_name;
            $scope.locations1 = $scope.locations2;
                //            }
            $scope.updateDreaftReport();
        };
        $scope.onSelectLocation3 = function () {
            var selectedLocation = $filter('filter')($scope.locations3, {location3_id: $scope.report.location3.location3_id})[0];
//            console.log(selectedLocation)
//            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
            $scope.report.location3 = {};
            $scope.report.location3.location3_id = selectedLocation.location3_id;
            $scope.report.location3.location3_name = selectedLocation.location3_name;
            if ($scope.report.location2 === null) {
                $scope.report.location2 = {};
            }
            $scope.report.location2.location2_id = selectedLocation.location2_id;
            $scope.report.location2.location2_name = selectedLocation.location2_name;
            if ($scope.report.location1 === null) {
                $scope.report.location1 = {};
            }
            $scope.report.location1.location1_id = selectedLocation.location1_id;
            $scope.report.location1.location1_name = selectedLocation.location1_name;
            $scope.locations2 = $scope.locations3;
            $scope.locations1 = $scope.locations3;
//            }
            $scope.updateDreaftReport();
        };
        $scope.onSelectLocation4 = function () {
            var selectedLocation = $filter('filter')($scope.locations4, {location4_id: $scope.report.location4.location4_id})[0];
//            console.log(selectedLocation)
//            if (!angular.isDefined($scope.report.location3_id) || $scope.report.location3_id === null) {
            $scope.report.location4 = {};
            $scope.report.location4.location4_id = selectedLocation.location4_id;
            $scope.report.location4.location4_name = selectedLocation.location4_name;
            if ($scope.report.location3 === null) {
                $scope.report.location3 = {};
            }
            $scope.report.location3.location3_id = selectedLocation.location3_id;
            $scope.report.location3.location3_name = selectedLocation.location3_name;
            if ($scope.report.location2 === null) {
                $scope.report.location2 = {};
            }
            $scope.report.location2.location2_id = selectedLocation.location2_id;
            $scope.report.location2.location2_name = selectedLocation.location2_name;
            if ($scope.report.location1 === null) {
                $scope.report.location1 = {};
            }
            $scope.report.location1.location1_id = selectedLocation.location1_id;
            $scope.report.location1.location1_name = selectedLocation.location1_name;
            $scope.locations3 = $scope.locations4;
            $scope.locations2 = $scope.locations4;
            $scope.locations1 = $scope.locations4;
//            }
            $scope.updateDreaftReport();
        };
        $scope.getEquipments = function (equipmentLetters, index) {
//            console.log('equipmentLetters', equipmentLetters);
            if (equipmentLetters !== '' && equipmentLetters !== null)
                coreReportService.getEquipments($scope.user.org_id, equipmentLetters.search)
                        .then(function (response) {
                            $scope.equipments[index] = response.data;
                            $scope.initializeReport.equipment = false;
                        }, function (error) {

                        });
        };
        $scope.calculateRiskLevel = function (should_work_stopped) {
            $scope.riskLevelTotal = 0;
            if ($scope.report.riskLevelsValues.likelyhood != undefined && $scope.report.riskLevelsValues.impact != undefined) {
                var data = {
                    likelyhood: $filter('filter')($scope.riskLevels.likelyhood, {risk_level_sup_type_id: $scope.report.riskLevelsValues.likelyhood})[0].field_code,
                    impact: $filter('filter')($scope.riskLevels.impact, {risk_level_sup_type_id: $scope.report.riskLevelsValues.impact})[0].field_code
                }
                coreReportService.getRiskLevelTotal(data)
                .then(function (response) {
                    $scope.riskLevelTotal = parseInt(response.data.result)
//                    console.log($scope.riskLevelTotal);
                    /*  if (should_work_stopped !== null) {
                        $scope.report.should_work_stopped = should_work_stopped;
                    } else {
                        if ($scope.riskLevelTotal >= 7)
                            $scope.report.should_work_stopped = 'Yes';
                        else
                            $scope.report.should_work_stopped = null;
                    }*/
                    $scope.updateDreaftReport();
                   // console.log($scope.report.should_work_stopped);
                }, function (error) {

                });
            }


            
            /*angular.forEach($scope.report.riskLevelsValues, function (level) {
                if (level != null) 
                    $scope.riskLevelTotal += parseInt(level);
            });*/

        };
        $scope.getAssignToName = function (index) {
            if (angular.isDefined($scope.report.correctiveActions[index].assigned_to) &&
                    ($scope.report.correctiveActions[index].assigned_to !== '' || $scope.report.correctiveActions[index].assigned_to !== null))
                $scope.report.correctiveActions[index].heading = $scope.report.correctiveActions[index].assigned_to.full_name;
            else
            if (index === 0)
                $scope.report.correctiveActions[index].heading = 'First Action';
            else
                $scope.report.correctiveActions[index].heading = 'New Action';
            $scope.updateDreaftReport();

        };
        $scope.checkCorrectiveActionDates = function (action) {
            coreService.resetAlert();
            var actionStatus = $filter('filter')($scope.correctiveActionStatues,
                    {corrective_action_status_id: action.corrective_action_status_id});
            if (angular.isDefined(actionStatus) && actionStatus.length) {
                actionStatus = actionStatus[0].field_code;
            } else {
                actionStatus = 'open';
            }
            if (action.start_date > action.target_end_date && action.target_end_date !== null) {
                action.target_end_date = null;
                if (actionStatus == 'open' || actionStatus == 'delayed')
                    coreService.setAlert({type: 'error', message: 'Start date must be before Target End Date'});
                else
                    coreService.setAlert({type: 'error', message: 'Start date must be before target end eate and actual end date'});
            } else if (action.start_date > action.actual_end_date && action.actual_end_date !== null) {
                action.actual_end_date = null;
                if (actionStatus == 'open' || actionStatus == 'delayed')
                    coreService.setAlert({type: 'error', message: 'start date must be before target end date'});
                else
                    coreService.setAlert({type: 'error', message: 'start date must be before target end date and actual end date'});
            }
           // $scope.updateDreaftReport();
        };
        $scope.getCorrectiveActionEmployees = function (type, employeeLetters, index, notifyIndex) {
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
                                if (!angular.isDefined($scope.report.correctiveActions[index].correctiveActionNotifiededEmployees))
                                    $scope.report.correctiveActions[index].correctiveActionNotifiededEmployees = [];
//                                console.log($scope.report.correctiveActions[index].correctiveActionNotifiededEmployees,response.data);
                                $scope.report.correctiveActions[index].correctiveActionNotifiededEmployees[notifyIndex] = response.data;
                                $scope.initializeReport.actionNotifyTo = false;
                            }
                        }, function (error) {

                        });
            }
        };
        $scope.addNewAction = function () {
            var newAction = {};
            newAction.heading = 'New Action';
            newAction.corrective_action_status_id = $filter('filter')($scope.correctiveActionStatues, {field_code: 'open'})[0].corrective_action_status_id;
            newAction.statusDisabled = true;
            newAction.notified_to = [];
            newAction.notified_to[0] = null;
            $scope.report.correctiveActions.push(newAction);
            var newDatePopUp = {
                start_date: false,
                target_end_date: false,
                actual_end_date: false
            };
            $scope.datePopUps.correctiveAction.push(newDatePopUp);
            $scope.addActionCustomFields();
            if ($scope.reportType == 'incident') 
                $scope.updateReportStatus();

        };
        /* */
        $scope.getCorrectiveActionStatus = function (index, status, action,size) {
            if (status.field_code === 'closed') {
                // disabled actual_date & actual cost and make its color red
                $scope.report.correctiveActions[index].statusDisabled = false;
                $scope.showMessage = true;
//                console.log(action);
//                console.log(action.corrective_action_result_id);
                
                  //$scope.openStatus = function () {
                if ($scope.reportType == 'hazard' && action.corrective_action_result_id != undefined) {
                    $scope.correctieAction = action;
                    $scope.hazardStatusName = $filter('filter')($scope.relatedHazard, {effects_sub_type_id: action.related_hazard_id})[0].related_hazard;
//                    console.log($scope.hazardStatusName);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/hazardReportModule/views/hazardStatusPopup.html',
                        controller: function($uibModalInstance ,$scope){
                             $scope.updateHazardStatus = function(){
                                    var ok;
//                                    console.log($scope.correctieAction.corrective_action_result_id);
                                    var data = $scope.correctieAction.corrective_action_result_id;
                                    angular.forEach($scope.report.effectsTypes, function (effect) {
                                        var selected = $filter('filter')(effect.effects_sub_types, {effects_sub_type_id: action.related_hazard_id});
                                        if (selected.length > 0) {
                                            selected[0].effects_sub_type_status_id = data;
                                             ok = "done";
                                        }
                                    });
                                    if (!(angular.isDefined(ok) && ok != 'done')) {
                                        angular.forEach($scope.report.causeTypes, function (cause) {
                                            var selected = $filter('filter')(cause.cause_sub_types, {cause_sub_types_id: action.related_hazard_id});
                                            if (selected.length > 0) {
                                                selected[0].cause_sub_type_status_id= data;
                                                ok = "done";
                                            }
                                        });
                                    }
                                    $uibModalInstance.dismiss(data);
                                }
                             
                            $scope.cancel = function () {
                               $uibModalInstance.dismiss('cancel');
                            };
                             
                        },
                        scope: $scope,
                        size: size
                    });
                    modalInstance.result.then(function (data) {
                    }, function (data) {
//                        console.log("ok");
                        action.corrective_action_result_id = data ;
//                        console.log(action);
                    });
                }
            } else {
                $scope.report.correctiveActions[index].statusDisabled = true;
                $scope.report.correctiveActions[index].actual_end_date = undefined;
                $scope.showMessage = false;
            }
            if ($scope.reportType == 'incident') 
                $scope.updateReportStatus();
            $scope.updateDreaftReport();
        };
        $scope.updateReportStatus = function(){
            var isOneActionOpened = false;
            angular.forEach($scope.report.correctiveActions, function (action) {
                var selected = $filter('filter')($scope.correctiveActionStatues, {corrective_action_status_id: action.corrective_action_status_id});
                if (selected.length > 0) {
                    if (selected[0].field_code != 'closed') 
                        isOneActionOpened = true;
                }
            });
//            console.log('isOneActionOpened' , isOneActionOpened);
            // for investigation inv_status_id
            var inv_closed_status = $filter('filter')($scope.invStatus, {field_code: 'closed'})[0].inv_status_id;
          

            //update Report Status ddepend on correctiveStatus
            if (isOneActionOpened == false && $scope.report.inv_status_id == inv_closed_status) 
                $scope.report.report_status_id = $filter('filter')($scope.reportStatus, {report_status_code: 'close'})[0].report_status_id;
            else  
                $scope.report.report_status_id = $filter('filter')($scope.reportStatus, {report_status_code: 'open'})[0].report_status_id;
         }
        
   
        $scope.addNewNotifiedTo = function (index) {
            var newNotifiedTo = null;
            $scope.report.correctiveActions[index].notified_to.push(newNotifiedTo);
        };
        $scope.getNotifyToName = function (notifyPerson, notifyPersonIndex, index) {
//            console.log(notifyPerson)
            $scope.report.correctiveActions[index].notified_to[notifyPersonIndex] = notifyPerson;
            $scope.report.correctiveActions[index].notified_to[notifyPersonIndex].selectedValue =
                    notifyPerson.full_name + ', ' + notifyPerson.position + ', ' + notifyPerson.org_name;
//            console.log($scope.report.correctiveActions[index].notified_to)
            if (notifyPerson.hasOwnProperty('full_name')) {
                var notifiedExist = $filter('filter')($scope.report.correctiveActions[index].notified_to, {employee_id: notifyPerson.employee_id});
//                console.log(notifiedExist);
                if (notifiedExist.length > 1) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('the_name_valid')});
                    notifyPerson.selectedValue = '';
                    $scope.report.correctiveActions[index].notified_to[notifyPersonIndex] = {};
                    $scope.report.correctiveActions[index].notified_to[notifyPersonIndex].selectedValue = '';
                    // $scope.report.correctiveActions[index].notified_to.splice(notifyPersonIndex, 1);
                    // console.log($scope.report.correctiveActions[index].notified_to)
                    // $scope.addNewNotifiedTo(index);
                    // $scope.report.correctiveActions[index].notified_to[notifyPersonIndex] = null;
//                    console.log($scope.report.correctiveActions[index].notified_to)
                    // $scope.getCorrectiveActionEmployees('notifytoname', '', index, notifyPersonIndex);
                } else {
                    coreService.resetAlert();
                }
            }
            $scope.updateDreaftReport();

        };
        var init = function () {
            //console.log($scope.user);
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            var fields_data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                type: $scope.reportType
            };
            var impactData = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                potential: 1 // this for impact types
            };
            var ownerData = {
                org_name: $scope.user.org_name,
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
            };


            
            var contractor = null;
            $scope.contractors_involved.push(contractor);
            var customer = null;
            $scope.customer_involved.push(customer);
            var equipment = null;
            $scope.report.equipment_involved.push(equipment);
//            console.log('equipment_involved', $scope.report.equipment_involved);

            $q.all([
                coreReportService.getOperationTypes(data),
                coreReportService.getCrews(data),
                coreReportService.getImpactTypes(impactData),
                coreReportService.getHazardStatuses(data),
                coreReportService.getRiskControls(data),
                coreReportService.getRiskLevels(data),
                coreReportService.getEffectsTypes(data),
                coreReportService.getCauseTypes(data),
                coreReportService.getCorrectiveActionPriorities(data),
                coreReportService.getCorrectiveActionStatuses(data),
                coreReportService.getHowInvolvedField(data),
                coreReportService.getYesNoValuse(data),
                coreReportService.getEmployeesByOrgId(data),
                coreReportService.getReportFields(fields_data),
                coreReportService.getReportStatus(data),
                coreReportService.getReportDepartments(data),
                coreReportService.getCorrectiveActionsResultStatus(data),
                coreReportService.getReportOwners(ownerData),
                coreReportService.getOrgLocationLevel(data),
            ]).then(function (queues) {
                $scope.operationTypes = queues[0].data;
                $scope.crews = queues[1].data;
                $scope.impactTypes = queues[2].data;
                //  $scope.report.impactTypes = queues[2].data;
                $scope.hazardStatuses = queues[3].data;
                $scope.riskControls = queues[4].data;
                $scope.report.riskControls = queues[4].data;
                $scope.riskLevels = queues[5].data;
                $scope.effectsTypes = queues[6].data;
                $scope.report.effectsTypes = queues[6].data;
                $scope.causeTypes = queues[7].data;
                $scope.report.causeTypes = queues[7].data;
                $scope.correctiveActionPriorities = queues[8].data;
                $scope.correctiveActionStatues = queues[9].data;
                $scope.howInvolvedField = queues[10].data;
                $scope.yesNoValues = queues[11].data;
                $scope.dropDownEmployees = queues[12].data;
                $scope.reportFields = queues[13].data;
                $scope.reportStatus = queues[14].data;
                $scope.departments = queues[15].data;
                $scope.correctiveStatus = queues[16].data;
                $scope.reportOwnerstemp = queues[17].data;
                $scope.locationLevel = queues[18].data;
//                console.log($scope.locationLevel);
                switch ($scope.locationLevel) {
                    case "2":
                        $scope.hideLocation3 = true;
                        $scope.hideLocation4 = true;
                    break;
                    case "3":
                        $scope.hideLocation3 = false;
                        $scope.hideLocation4 = true;
                    break;
                    case "4":
                        $scope.hideLocation3 = false;
                        $scope.hideLocation4 = false;
                    break;
                }      
//                                console.log($scope.locationLevel);
          
                $scope.reportOwners = [];
                angular.forEach($scope.reportOwnerstemp, function (value) {
                    if (value.name !== "Customer") {
                        $scope.reportOwners.push(value);
                    }
                    if (value.name !== "Customer" && value.name !== "Contractor") {
                        $scope.report.report_owner = value.id;
                    }
                });

//                console.log('howInvolvedField',$scope.howInvolvedField);
                $scope.report_labels = [];
                angular.forEach($scope.reportFields, function (field) {
                    $scope.report_labels[field.field_name] = field;
                });
               // console.log($scope.report_labels);
                // for test issue 
                //console.log( $scope.report_labels['risk_level']['is_hidden']);
                $scope.addNewPerson();
                if (coreService.getCanCustom() == true) {
                    $scope.customize();
                }
                

                $scope.report.correctiveActions[0] = {};
                $scope.report.correctiveActions[0].heading = 'First Action';
                $scope.report.correctiveActions[0].notified_to = [];
                $scope.report.correctiveActions[0].notified_to[0] = null;
                $scope.report.correctiveActions[0].corrective_action_status_id =
                        $filter('filter')($scope.correctiveActionStatues, {field_code: 'open'})[0].corrective_action_status_id;
                $scope.report.correctiveActions[0].statusDisabled = true;


                $scope.status.effectType[0] = true;
                $scope.status.correctiveAction[0] = true;
                $scope.datePopUps.correctiveAction[0] = {
                    // start_date: false,
                    target_end_date: false,
                    actual_end_date: false
                };
                
                $scope.addActionCustomFields();
                $scope.addImpactCustomFields();
//                console.log("getDraftReport final init",coreService.getDraftReport().location1.location1_id);

//                $scope.report.riskLevels.hazard_exist = 1;
//                $scope.report.riskLevels.worker_exposure = 1;
//                $scope.report.riskLevels.potential_consequences = 1;
//                $scope.riskLevelTotal = 3;
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
                coreService.setAlert({type: 'exception', message: errors[12].data});
                coreService.setAlert({type: 'exception', message: errors[13].data});
                coreService.setAlert({type: 'exception', message: errors[14].data});
                coreService.setAlert({type: 'exception', message: errors[15].data});
                coreService.setAlert({type: 'exception', message: errors[16].data});
                coreService.setAlert({type: 'exception', message: errors[17].data});
            });

        };
        init();
        $scope.addItem = function () {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };
        $scope.openAdd = function () {
//            if (angular.isDefined($scope.whoIdentified) && $scope.whoIdentified == null)
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreReportModule/views/addNamePopup.html'
//                controller: 'AddReportController'
            });
        };
        $scope.openLoc = function () {
//            if (angular.isDefined($scope.report.location1_id) && $scope.report.location1_id == null)
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreReportModule/views/location.html',
                //controller: 'AddReportController'
            });
        };
        $scope.opencontractor = function () {
//            if (angular.isDefined($scope.contractors_involved[index]) && $scope.contractors_involved[index] == null)
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreReportModule/views/contractor.html',
                //controller: 'AddReportController'
            });
        };
        $scope.opencustomer = function () {
//            if (angular.isDefined($scope.customer_involved[index]) && $scope.customer_involved[index] == null)
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreReportModule/views/customer.html',
                //controller: 'AddReportController'
            });
        };
        $scope.openEquipment = function () {
//            if (angular.isDefined($scope.report.equipment_involved[index]) && $scope.report.equipment_involved[index] == null)
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreReportModule/views/equipment.html',
                //controller: 'AddReportController'
            });
        };
        $scope.contractorThitrdParty = [];
        $scope.newContract = function () {
            var newContract = null;
            $scope.contractors_involved.push(newContract);
        };
        $scope.newCustomer = function () {
            var newCustomer = null;
            $scope.customer_involved.push(newCustomer);
        };
        $scope.newEquipment = function () {
            var newEquipment = null;
            $scope.report.equipment_involved.push(newEquipment);
        };
        //provider updates
        $scope.OpenaddThirdParty = function (size) {

            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/trainingReportModule/views/addThirdParties.html',
                controller: 'addTrainingCtrl',
                resolve: {
                    item: function () {
                        var trainingProvider = {};
                        trainingProvider.adding_by = coreService.getUser().employee_id;
                        trainingProvider.org_id = coreService.getUser().org_id;
                        trainingProvider.isPopup = true;
//                        console.log($scope.trainingProvider);
                        return trainingProvider;
                    }
                }
            });
            modalInstance.result.then(function () {

                $scope.initializeReport.provider = true;
            }, function () {
            });

        };
        $scope.cancel = function () {
                        angular.element('.modal').addClass('hide');
                  angular.element('.modal-backdrop').addClass('hide');
            
        };
        $scope.clear1 = function () {
            $scope.report.riskLevelsValues.impact = null;
            $scope.calculateRiskLevel(null);
        };
        $scope.clear2 = function () {
            $scope.report.riskLevelsValues.likelyhood = null;
            $scope.calculateRiskLevel(null);
        };
        /*$scope.clear3 = function () {
            $scope.report.riskLevelsValues.potential_consequences = null;
            $scope.calculateRiskLevel(null);
        };*/
        $scope.clear4 = function () {
            $scope.report.should_work_stopped = null;
        };
        $scope.clearReportStatus = function () {
            $scope.report.hazard_status = null;
        };
        $scope.clearCorrective = function () {
            $scope.report.are_additional_corrective_actions_required = null;
        };
        $scope.clearPriority = function (action) {
            action.corrective_action_priority_id = null;
        };
        $scope.clearStatus = function (action, actionIndex) {
            action.corrective_action_status_id = null;
            var status = {
                field_code: null
            }
            $scope.getCorrectiveActionStatus(actionIndex, status, action);
        };
        $scope.clearCompleteTask = function (action) {
            action.desired_results = null;
        };

        $scope.clearEquipment  = function(index){
           // console.log("selectedEqp", selectedEqp);
            $scope.report.equipment_involved[index] = null;
            console.log("$scope.report.equipment_involved[index]", $scope.report.equipment_involved[index]);
            $scope.updateDreaftReport();
        }

                // getting data for edit report
        $scope.getReportData = function (reportNum) {
            if (coreService.getCurrentState() == 'edithazardreport' || coreService.getCurrentState() == 'editincidentreport'){

                coreService.setDraftReport(undefined);
                var data = {
                    org_id : coreService.getUser().org_id,
                    employee_id : coreService.getUser().employee_id,
                    product_code : $scope.reportType,
                    report_id: $stateParams.draftId
                }
                var product_code = data.product_code ;
                coreService.checkDraftExists(data)
                    .then(function (response) {
                        console.log(response);
                        if (response.data[0].result != "0" ) {
                            var report = JSON.parse(response.data[0].result);
                            report.report_id = response.data[0].id;
                            console.log(report.report_id );
                            report.type = product_code;
                            console.log(report);
                            coreService.setDraftReport(report);
                            var modalInstance = $uibModal.open({
                                backdrop: 'static',
                                keyboard: false,
                                templateUrl: 'app/modules/coreReportModule/views/draftPopup.html',
                                controller: 'draftController',
                            });
                        }
                        else{
                            coreService.setIsMyDraft(false);
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                type: $scope.reportType,
                                report_number: reportNum
                            };
                            coreReportService.getReportData(data).then(function (response) {
                                $scope.report = response.data;
                                console.log($scope.report);
                                    //console.log($scope.report.equipment_involved);
                                // What Happened Tab
                                // Who Identified Part
                                //                $scope.report.report_date = moment($scope.report.report_date)['_d'];
                                //                $scope.report.report_date = $filter('utcToLocal')($scope.report.report_date, 'date')['_d'];                               
                              $scope.retriveReportData();
                              }, function (errors) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: errors[0].data});
                                coreService.setAlert({type: 'exception', message: errors[1].data});
                            });
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                });
            }
            else{
                coreService.setIsMyDraft(false);
                $scope.populateOriginalReportData($stateParams.reportNumber);
            }
        };

        $scope.custom = false;
        // customize fields
        $scope.customize = function () {
//            $("label a i").toggle();
            $scope.custom = $scope.custom === true ? false : true;
        };

//        var commonFields = ['crew_involved', 'operation_type_id', 'certificate_id', 'acting_id', 'corrective_action_priority_id',
//            'corrective_action_status_id'];
//        var hazardInspectionFields = ['status_id', 'potential_impact_of_hazard', 'type_and_subtype', 'cause_types_and_subtypes'];
//        var hazardInspectionIncidentFields = ['probability_of_hazard', 'frequency_of_worker_exposure',
//            'severity_of_potential_consequences', 'risk_control_id'];
//        var isCommonField = commonFields.indexOf(field.field_name);
//        if (isCommonField) {
//
//        } else {
//            var isCommonField = hazardInspectionIncidentFields.indexOf(field.field_name);
//            if (isCommonField) {
//
//            } else {
//                var isCommonField = hazardInspectionFields.indexOf(field.field_name);
//                if (isCommonField) {
//
//                } else {
//
//                }
//            }
//        }
        $scope.editField = function (field, type) {
            field.reportType = $scope.reportType;
            if (angular.isDefined(type)) {
                switch (type) {
                    case 'common':
                        switch (field.reportType) {
                            case 'hazard':
                                $scope.commonModules = "Incident, Inspection, Safety Meeting, Training and Maintenance";
                                break;
                            case 'incident':
                                $scope.commonModules = "Hazard, Inspection, Safety Meeting, Training and Maintenance";
                                break;
                            case 'inspection':
                                $scope.commonModules = "Hazard, Incident, Safety Meeting, Training and Maintenance";
                                break;
                            case 'safetymeeting':
                                $scope.commonModules = "Hazard, Incident, Inspection, Training and Maintenance";
                                break;
                            case 'training':
                                $scope.commonModules = "Hazard, Incident, Inspection, Safety Meeting and Maintenance";
                                break;
                            case 'maintenance':
                                $scope.commonModules = "Hazard, Incident, Inspection, Safety Meeting and Training";
                                break;
                        }
                        break;
                    case 'exceptTraining':
                        switch (field.reportType) {
                            case 'hazard':
                                $scope.commonModules = "Incident, Inspection, Safety Meeting and Maintenance";
                                break;
                            case 'incident':
                                $scope.commonModules = "Hazard, Inspection, Safety Meeting and Maintenance";
                                break;
                            case 'inspection':
                                $scope.commonModules = "Hazard, Incident, Safety Meeting and Maintenance";
                                break;
                            case 'safetymeeting':
                                $scope.commonModules = "Hazard, Incident, Inspection and Maintenance";
                                break;
                            case 'maintenance':
                                $scope.commonModules = "Hazard, Incident, Inspection and Safety Meeting";
                                break;
                        }
                        break;
                    case 'hazInspInc':
                        switch (field.reportType) {
                            case 'hazard':
                                $scope.commonModules = "Incident and Inspection";
                                break;
                            case 'incident':
                                $scope.commonModules = "Hazard and Inspection";
                                break;
                            case 'inspection':
                                $scope.commonModules = "Hazard and Incident";
                                break;
                        }
                        break;
                    case 'hazInsp':
                        switch (field.reportType) {
                            case 'hazard':
                                $scope.commonModules = "Inspection";
                                break;
                            case 'inspection':
                                $scope.commonModules = "Hazard";
                                break;
                        }
                        break;
                }
                var msg = {
                    title: 'Caution',
                    body: 'This field is used on more than one report form. \n Any changes you make to its values here will also appear on ' + $scope.commonModules
                };
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreModule/views/confirm.html',
                    controller: 'ShowPopUpController',
                    backdrop: 'static',
                    resolve: {
                        msg: msg
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result === 'ok') {
                        var modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/coreReportModule/views/editField.html',
                            controller: 'EditFieldController',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                field: angular.copy(field)
                            }
                        });
                        modalInstance.result.then(function (selectedItem) {
                            $scope.report_labels[field.field_name] = selectedItem;
                            getFieldValues(field);
                        }, function () {
                            console.log('modal-component dismissed at: ' + new Date());
                            getFieldValues(field);
                        });
                    }
                });
            } else {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreReportModule/views/editField.html',
                    controller: 'EditFieldController',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        field: angular.copy(field)
                    }
                });
                modalInstance.result.then(function (selectedItem) {
                    $scope.report_labels[field.field_name] = selectedItem;
                    getFieldValues(field);
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                    getFieldValues(field);
                });
            }
        };
        var getFieldValues = function (field) {
            switch (field['field_name']) {
                case 'event_type_id':
                    switch (field['reportType']) {
                        case 'hazard':
                            $scope.getHazardTypes();
                            break;
                        case 'inspection':
                            $scope.getInspectionTypes();
                            break;
                        case 'safetymeeting':
                            $scope.getSafetyMeetingTypes();
                            break;
                        case 'maintenance':
                            $scope.getMaintenanceTypes();
                            break;
                        case 'incident':
                            $scope.getIncidentTypes();
                            break;
                    }
                    break;
                case 'inspection_reason_id':
                    $scope.getInspectionReason();
                    break;
                case 'maintenance_reason_id':
                    $scope.getMaintenanceReason();
                    break;
                case 'training_reason_id':
                    $scope.getTrainingReasons();
                    break;
                case 'level_achieved_id':
                    $scope.getTrainingLevelAchieved();
                    break;
                case 'report_owner':
                    reloadReportOwners();
                    break;
                case 'quality_of_training_id':
                    $scope.getTrainingQuality();
                    break;
                case 'operation_type_id':
                    reloadOperationTypes();
                    break;
                case 'department_responsible_id':
                    reloadDepartmentResponsibles();
                    break;
                case 'crew_involved':
                    reloadCrews();
                    break;
                case 'status_id':
                    reloadHazardStatuses();
                    break;
                case 'potential_impact_of_hazard':
                    reloadImpactTypes();
                    break;
                case 'risk_level_type_id':
                case 'risk_level_sup_type_id':
                    reloadRiskLevels();
                    break;
                case 'risk_control_id':
                    reloadRiskControls();
                    break;
                case 'type_and_subtype':
                    reloadEffectsTypes();
                    break;
                case 'cause_types_and_subtypes':
                    reloadCauseTypes();
                    break;
                case 'certificate_id':
                    reloadCertificates();
                    break;
                case 'acting_id':
                    reloadActingAs();
                    break;
                case 'corrective_action_status_id':
                    reloadCorrectiveActionStatus();
                    break;
                case 'corrective_action_priority_id':
                    reloadCorrectiveActionPriorities();
                    break;
                case 'oe_department_id':
                    $scope.getOEDepartments();
                    break;
                case 'env_conditions':
                    $scope.getEnvConditions();
                    break;
                case 'impact_type_id':
                    $scope.getImpactTypes();
                    break;
                case 'ext_agency_id':
                    $scope.getExternalAgencies();
                    break;
                case 'energy_form':
                case 'substandard_actions':
                case 'substandard_conditions':
                case 'underlying_causes_title':
                    $scope.getObservationAndAnalysis();
                    break;
                case 'inv_status_id':
                    $scope.getInvStatus();
                    break;
                case 'inv_source_param_id':
                    $scope.getInvSource();
                    break;
                case 'root_cause_param_id':
                    $scope.getInvRootCauses();
                    break;
                case 'investigation_risk_of_recurrence_id':
                    $scope.getInvRiskOfRecurrence();
                    break;
                case 'investigation_severity_id':
                    $scope.getInvSeverity();
                    break;
                case 'illness_initial_treatment_id':
                    $scope.getInitialTreatments();
                    break;
                case 'symptoms_id':
                    $scope.getSymptoms();
                    break;
                case 'traffic_vehicle_type_id':
                    $scope.getVehicleTypes();
                    break;
                case 'damage_vehicle_type_id':
                    $scope.getVehicleTypes();
                    break;
                case 'source_id':
                    $scope.getSpillReleaseSource();
                    break;
                case 'duration_unit_id':
                    $scope.getDurationUnit();
                    break;
                case 'quantity_unit_id':
                    $scope.getQuantityUnit();
                    break;
                case 'recovered_unit_id':
                    $scope.getQuantityUnit();
                    break;
                case 'spill_reported_to':
                    $scope.getSpillReleaseAgency();
                    break;
                case 'injury_initial_treatment_id':
                    $scope.getInitialTreatments();
                    break;
                case 'body_part_id':
                    $scope.getInjuryBodyParts();
                    break;
                case 'contact_code_id':
                    $scope.getInjuryContactCodes();
                    break;
                case 'injury_type_id':
                    $scope.getInjuryTypes();
                    break;
                case 'injury_contact_agency_id':
                    $scope.getInjuryContactAgencies();
                    break;
                case 'body_area_id':
                    $scope.getInjuryBodyAreas();
                    break;
            }
        };

        var data = {
            org_id: $scope.user.org_id,
            language_id: $scope.user.language_id,
            potential: 1 // this for impact types
        };
        var reloadOperationTypes = function () {
            coreReportService.getOperationTypes(data)
                    .then(function (response) {
                        $scope.operationTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadReportOwners = function(){
            coreReportService.getReportOwners({
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                org_name: $scope.user.org_name
            })
                    .then(function (response) {
                        $scope.reportOwners = [];
                        angular.forEach(response.data, function (value) {
                            if (value.name !== "Customer") {
                                $scope.reportOwners.push(value);
                            }
                            if (value.name !== "Customer" && value.name !== "Contractor") {
                                $scope.report.report_owner = value.id;
                            }
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }
        var reloadDepartmentResponsibles = function(){
            coreReportService.getReportDepartments(data)
                    .then(function (response) {
                        $scope.department = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }
        var reloadCrews = function () {
            coreReportService.getCrews(data)
                    .then(function (response) {
                        $scope.crews = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadHazardStatuses = function () {
            coreReportService.getHazardStatuses(data)
                    .then(function (response) {
                        $scope.hazardStatuses = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadImpactTypes = function () {
            coreReportService.getImpactTypes(data)
                    .then(function (response) {
                        $scope.impactTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadRiskLevels = function () {
            coreReportService.getRiskLevels(data)
                    .then(function (response) {
                        $scope.riskLevels = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadRiskControls = function () {
            coreReportService.getRiskControls(data)
                    .then(function (response) {
                        $scope.riskControls = response.data;
                        $scope.report.riskControls = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadEffectsTypes = function () {
            coreReportService.getEffectsTypes(data)
                    .then(function (response) {
                        $scope.effectsTypes = response.data;
                        $scope.report.effectsTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadCauseTypes = function () {
            coreReportService.getCauseTypes(data)
                    .then(function (response) {
                        $scope.causeTypes = response.data;
                        $scope.report.causeTypes = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadCertificates = function () {
                    coreReportService.getPeopleCertificates(data)
                        .then(function (response) {
                        angular.forEach($scope.peopleInvolved, function (person) {
                            person.certifications = response.data;
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadActingAs = function () {
            coreReportService.getPeopleActingAs(data)
                    .then(function (response) {
                        angular.forEach($scope.peopleInvolved, function (person) {
                            person.actingAs = response.data;
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadCorrectiveActionStatus = function () {
            coreReportService.getCorrectiveActionStatuses(data)
                    .then(function (response) {
                        $scope.correctiveActionStatues = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        var reloadCorrectiveActionPriorities = function () {
            coreReportService.getCorrectiveActionPriorities(data)
                    .then(function (response) {
                        $scope.correctiveActionPriorities = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.openHelp = function (field) {
            console.log(field);
            var title = field.help_me_name;
            var body = field.help_me_description;
            if(field.field_name=='rep_supervisor_notify'){
                title = 'Check me before you submit';
                body = 'This option is only available when a report is first submitted. If you want the supervisor to be notified by email that this event has been reported, make sure a name appears in the Supervisor fields and that you check this box +before +you submit the report. Once a report has been submitted, this field is no longer active and will not trigger emails to the supervisor. Also note that you will only see a supervisor&#39;s name here if it was added to the person&#39;s profile in the database. If this field is blank, you cannot add a name here. You must open the person&#39;s profile and add it there first. See you administrator for help with this.';
            }
            else if(field.field_name=='potential_impact_of_hazard'){
                title = 'What are these potential impacts?';
                body = 'These potential impacts are the same as the impact types under the Incident report form. By keeping them the same across both reports, it allows your company to accurately compare actual impacts to potential impacts as a way of identifying problem areas.';
            }
            var msg = {
                title: title,
                body: body
            };
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/coreModule/views/help.html',
                controller: 'ShowPopUpController',
//                backdrop: 'static',
//                keyboard: false,
                resolve: {
                    msg: msg
                }
            });
        };

        $scope.riskControlRequired = 1;
        $scope.checkRiskControlRequired = function () {
            var riskChoices = $filter('filter')($scope.report.riskControls, {risk_control_choice: true});
            if (riskChoices.length > 0) {
                $scope.riskControlRequired = 0;
            } else {
                $scope.riskControlRequired = 1;
            }
            $scope.updateDreaftReport();
        };
        $scope.observedPost = false;
        $scope.checkObservedPost = function () {

            if ($scope.report.is_trainee_observed_post == 0) {
                $scope.observedPost = true;
                $scope.report_labels['observerd_date']['is_mandatory'] = 'No';
            }
            else {
                $scope.observedPost = false;
                $scope.report_labels['observerd_date']['is_mandatory'] = 'Yes';
            }
        };
        $scope.draftReport = {
            employee_id: $scope.user.employee_id,
            org_id: $scope.user.org_id
        }


        $scope.updateDreaftReport = function(){
            console.log($scope.canUpdateDraft, $scope.lockedReport);

            if (!$scope.canUpdateDraft && $scope.lockedReport) 
                return false;
            $scope.canDiscard = true ;
            $scope.report.peopleInvolved = $scope.peopleInvolved;
            $scope.report.riskLevels = [];
            if (angular.isDefined($scope.report.riskLevelsValues)) {
              $scope.report.riskLevels = [];
                if ($scope.report.riskLevelsValues.hasOwnProperty('impact') && $scope.report.riskLevelsValues.impact !== ''
                && $scope.report.riskLevelsValues.impact !== null)
                    $scope.report.risk_level_sup_impact_id = $scope.report.riskLevelsValues.impact;
                if ($scope.report.riskLevelsValues.hasOwnProperty('likelyhood') && $scope.report.riskLevelsValues.likelyhood !== ''
                && $scope.report.riskLevelsValues.likelyhood !== null)
                    $scope.report.risk_level_sup_likelyhood_id = $scope.report.riskLevelsValues.likelyhood;
            }

            if ($scope.reportType == "hazard") {
                $scope.report.impactTypes = $scope.impactTypes;
            }
            else if ($scope.reportType == "incident") {
                if ($scope.incident_type_name != undefined) 
                    $scope.report.incident_type_name = $scope.incident_type_name;
                $scope.report.creator_id = $scope.user.employee_id;
                $scope.report.observationAndAnalysis = ($scope.observationAndAnalysis);
                $scope.report.oeDepartments = $scope.oeDepartments;
                $scope.report.envConditions = $scope.envConditions;
            }

            $scope.draftReport.report = $scope.report;
            $scope.draftReport.type = $scope.reportType;
            console.log("update Draft",$scope.report);
            coreService.setDraftReport($scope.draftReport);
        }

        //        $scope.cancel = function () {
        //            $uibModalInstance.dismiss('cancel');
        //        };
        
        $scope.addPeopleCustomFields = function () {
            if ($scope.reportType == "hazard") {
                report_type= 'Hazard';
            }else if($scope.reportType == "incident") {
                report_type ='ABCanTrack';
            }else if($scope.reportType == "inspection") {
                report_type='Inspection';
            }else if($scope.reportType == "safetymeeting") {
                report_type='SafetyMeeting';
            }else if($scope.reportType == "training") {
                report_type='Training';
            }else if($scope.reportType == "maintenance") {
                report_type='MaintenanceManagement';
            }
            var data2 = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                tab_name:'People',
                report_type:report_type
            };
            coreReportService.getTabCustomFields(data2)
                .then(function (response2) {
                    angular.forEach($scope.peopleInvolved, function (person) {
                        if(!person.hasOwnProperty('peopleCustomField')){
                            person.peopleCustomField = response2.data;
                        }
                    });

            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }
        
        
        $scope.addImpactCustomFields = function () {
             if($scope.reportType == "incident") {
                report_type ='ABCanTrack';
            }
            if(report_type =='ABCanTrack'){
                var data2 = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id,
                    tab_name:'Impacts',
                    report_type:report_type
                };
                coreReportService.getTabCustomFields(data2)
                    .then(function (response2) {
                        angular.forEach($scope.report.incidentImpactTypes, function (impact) {
                            if(!impact.hasOwnProperty('impactCustomField')){
                                impact.impactCustomField = response2.data;
                            }
                        });

                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        };
        
        $scope.addActionCustomFields = function () {
            report_type ='';
            if ($scope.reportType == "hazard") {
                report_type= 'Hazard';
                tab_name='Actions';
            }else if($scope.reportType == "incident") {
                report_type ='ABCanTrack';
                tab_name='Actions';
            }else if($scope.reportType == "inspection") {
                report_type='Inspection';
                tab_name='Actions';
            }else if($scope.reportType == "safetymeeting") {
                report_type='SafetyMeeting';
                tab_name='Actions';
            }else if($scope.reportType == "training") {
                report_type='Training';
                tab_name='Follows';
            }else if($scope.reportType == "maintenance") {
                report_type='MaintenanceManagement';
                tab_name='Follows';
            }
            if(report_type!=''){
                var data = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id,
                    tab_name:tab_name,
                    report_type:report_type
                };
                coreReportService.getTabCustomFields(data)
                    .then(function (response) {;
                        angular.forEach($scope.report.correctiveActions, function (action) {
                            if(!action.hasOwnProperty('actionCustomField')){
                                action.actionCustomField = response.data;
                            }
                        });
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
            }
            
        };
        $scope.retriveReportData = function(){
                console.log($scope.report.report_date);
                if ($scope.report.hasOwnProperty('hazard_type_name'))
                    $scope.hazard_type_name = $scope.report.hazard_type_name;
                if ($scope.report.hasOwnProperty('incident_type_name'))
                    $scope.incident_type_name = $scope.report.incident_type_name;
                
                //console.log($scope.incident_type_name);

                $scope.whoIdentified = {};
                if ($stateParams.reportNumber != null) {
                    if ($scope.report.report_date !== "" && $scope.report.report_date !== null) {
                    $scope.report.report_date = new Date($scope.report.report_date);
                    //  $scope.report.report_date.setDate($scope.report.report_date.getDate() + 1);
                   }
                    $scope.whoIdentified.employee_id = $scope.report.reporter_id;
                    $scope.whoIdentified.full_name = $scope.report.rep_name;
                    $scope.whoIdentified.emp_id = $scope.report.rep_emp_id;
                    $scope.whoIdentified.email = $scope.report.rep_email;
                    $scope.whoIdentified.position = $scope.report.rep_position;
                    $scope.whoIdentified.crew_id = $scope.report.rep_crew;
                    $scope.whoIdentified.department_id = $scope.report.rep_department;
                    $scope.whoIdentified.company = $scope.report.rep_company;
                    $scope.whoIdentified.primary_phone = $scope.report.rep_primary_phone;
                    $scope.whoIdentified.alternate_phone = $scope.report.rep_alternate_phone;
                    $scope.whoIdentified.supervisor_name = $scope.report.rep_supervisor;
                    if ($scope.report.rep_supervisor_notify === '1')
                        $scope.whoIdentified.rep_supervisor_notify = true;
                    else
                        $scope.whoIdentified.rep_supervisor_notify = false;
                    console.log($scope.whoIdentified);
                               
                               /*          if ($scope.report.hasOwnProperty('are_additional_corrective_actions_required')) {
                                            if ($scope.report.are_additional_corrective_actions_required =="Yes") 
                                                $scope.report.are_additional_corrective_actions_required ="1";
                                            else
                                                $scope.report.are_additional_corrective_actions_required = "0";
                                        }
                    */
                    // Impacts Part
                    if ($scope.report.hasOwnProperty('impact_types')) {
                        //  $scope.repoimpactTypes = $scope.impactTypes;
                        angular.forEach($scope.impactTypes, function (impactType) {
                            if (angular.isDefined($filter('filter')($scope.report.impact_types, {impact_type_id: impactType.impact_type_id})[0])) {
                                impactType.impact_choice = true;
                            }
                        });
                    }

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
                    

                    if($stateParams.draftId ==null){
                        report_id= $scope.report.draft_id;
                    }else{
                        report_id= $stateParams.draftId;
                    }
                    if($scope.reportType == "inspection") {
                        report_id = $scope.report.risk_levels.inspection_id;
                    }
                    if($scope.reportType == "maintenance") {
                        report_id = $scope.report.maintenance_id;
                    }
                    if($scope.reportType == "safetymeeting"){
                        report_id= $scope.report.safetymeeting_id;
                    }
                    if($scope.reportType == "training"){
                        report_id= $scope.report.training_id;
                    }

                    if ($scope.reportType == "hazard") {
                        report_type= 'Hazard';
                        tab_name='Actions';
                    }else if($scope.reportType == "incident") {
                        report_type ='ABCanTrack';
                        tab_name='Actions';
                    }else if($scope.reportType == "inspection") {
                           report_type='Inspection';
                        tab_name='Actions';
                    }else if($scope.reportType == "safetymeeting") {
                        report_type='SafetyMeeting';
                        tab_name='Actions';
                    }else if($scope.reportType == "training") {
                        report_type='Training';
                        tab_name='Follows';
                    }else if($scope.reportType == "maintenance") {
                        report_type='MaintenanceManagement';
                        tab_name='Follows';
                    }
                    
                   // People Involved Tab
                    if ($scope.report.hasOwnProperty('peopleInvolved') && $scope.report.peopleInvolved.length) {
                        console.log($scope.report.peopleInvolved);
                        $scope.peopleInvolved = $scope.report.peopleInvolved;
                        var customerIndex =0 ;
                        var contractorIndex = 0;
                        angular.forEach($scope.report.peopleInvolved, function (people, key) {
                            if (people.people_id !== '' && people.people_id !== null) {
                                $scope.peopleInvolved[key].employee_id = people.people_id;
                                if ($scope.whoIdentified.employee_id === people.people_id)
                                    $scope.peopleInvolved[key].type = 'whoidentified';
                                else
                                    $scope.peopleInvolved[key].type = 'investigator';
                            } else if (people.third_party_id !== '' && people.third_party_id !== null) {
                                console.log($scope.peopleInvolved[key]);
                                $scope.peopleInvolved[key].employee_id = people.third_party_id;
                                $scope.peopleInvolved[key].type = 'thirdparty';
                                if (people.how_he_involved.indexOf("Contractor") != -1) {
                                    console.log("contractor" ,people.how_he_involved.indexOf("Contractor"));
                                    var editThirdParty = [];
                                    editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: contractorIndex});
                                    console.log('editThirdParty for contractor on dit mode',editThirdParty );
                                    if (editThirdParty.length < 1) {
                                        var contractorObject = {};
                                        contractorObject.contractorIndex = contractorIndex;
                                        contractorObject.tabIndex =key ;
                                        contractorInvolvedIndex.push(contractorObject);
                                        contractorIndex = contractorIndex +1 ;
                                    }
                                }

                                if (people.how_he_involved.indexOf("Customer") != -1) {
                                    console.log("Customer");
                                    var editThirdParty = [];
                                    editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: customerIndex});
                                    console.log('editThirdParty for customer of populate data',editThirdParty );
                                    if (editThirdParty.length < 1) {
                                        var customerObject = {};
                                        customerObject.customerIndex = customerIndex;
                                        customerObject.tabIndex = key ;
                                        customerInvolvedIndex.push(customerObject);
                                        customerIndex = customerIndex +1 ;
                                    }
                                }
                            }
                            console.log('contractorInvolvedIndex on dit mode',contractorInvolvedIndex );

                            $scope.peopleInvolved[key].title = people.people_involved_name;
                            $scope.peopleInvolved[key].full_name = people.people_involved_name;
                            $scope.peopleInvolved[key].email = people.email;
                            $scope.peopleInvolved[key].position = people.position;
                            $scope.peopleInvolved[key].crew = people.crew;
                            $scope.peopleInvolved[key].department = people.department;                            
                            $scope.peopleInvolved[key].org_name = people.company;
                            $scope.peopleInvolved[key].primary_phone = people.primary_phone;
                            $scope.peopleInvolved[key].alternate_phone = people.alternate_phone;
                            $scope.peopleInvolved[key].supervisor_name = people.supervisor;
                            $scope.peopleInvolved[key].exp_in_current_postion = parseInt(people.exp_in_current_postion);
                            $scope.peopleInvolved[key].exp_over_all = parseInt(people.exp_over_all);
                            $scope.peopleInvolved[key].age = parseInt(people.age);

                            console.log($scope.report);
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
                            
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'People',
                                report_id:report_id,
                                table_key_value :people.people_involved_id,
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    people.peopleCustomField = response.data;
                                    angular.forEach(people.peopleCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        });
                    }
                    // Corrective Actions Tab
                    if ($scope.report.hasOwnProperty('correctiveActions') && $scope.report.correctiveActions.length) {
                        angular.forEach($scope.report.correctiveActions, function (action, key) {
                            action.heading = action.assigned_to_name;
                            action.assigned_to = {};
                            action.assigned_to.employee_id = action.assigned_to_id;
                            action.assigned_to.full_name = action.assigned_to_name;
                            action.assigned_to.position = action.position;
                            action.assigned_to.org_name = action.org_name;
                            action.assigned_to.supervisor_name = action.supervisor;

                            //                        action.start_date = moment(action.start_date)['_d'];
                            //                        action.target_end_date = moment(action.target_end_date)['_d'];
                            //                        action.actual_end_date = moment(action.actual_end_date)['_d'];
                            if (action.start_date !== "" && action.start_date !== null) {
                                action.start_date = new Date(action.start_date);
                                console.log(action.start_date);
                                // action.start_date.setDate(action.start_date.getDate() + 1);
                            }
                            if (action.target_end_date !== "" && action.target_end_date !== null) {
                                action.target_end_date = new Date(action.target_end_date);
                                // action.target_end_date.setDate(action.target_end_date.getDate() + 1);
                            }
                            if (action.actual_end_date !== "" && action.actual_end_date !== null) {
                                action.actual_end_date = new Date(action.actual_end_date);
                                //  action.actual_end_date.setDate(action.actual_end_date.getDate() + 1);
                            }
                            action.estimated_cost = parseFloat(action.estimated_cost);
                            action.actual_cost = parseFloat(action.actual_cost);


                            /*                        console.log("action.start_date  1 ==> " + action.start_date);
                             
                             if (action.start_date && action.start_date != null) {
                             action.start_date = moment(action.start_date)['_d'];
                             }
                             console.log("action.start_date  2 ==> " + action.start_date);
                             if (action.target_end_date && action.target_end_date != null) {
                             action.target_end_date = moment(action.target_end_date)['_d'];
                             }
                             if (action.actual_end_date && action.actual_end_date != null) {
                             action.actual_end_date = moment(action.actual_end_date)['_d'];
                             }*/

                            if (action.supervisor_notify === '1')
                                action.supervisor_notify = true;
                            else
                                action.supervisor_notify = false;
                            // if($scope.reportType === 'hazard')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {hazard_corrective_action_id: action.hazard_corrective_action_id});
                            // else if($scope.reportType === 'incident')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {incident_corrective_action_id: action.incident_corrective_action_id});
                            // else if($scope.reportType === 'safetymeeting')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {safetymeeting_followup_action_id: action.safetymeeting_followup_action_id});
                            // else if($scope.reportType === 'inspection')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {inspection_corrective_action_id: action.inspection_corrective_action_id});
                            // else if($scope.reportType === 'maintenance')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {maintenance_followup_action_id: action.maintenance_followup_action_id});
                            // else if($scope.reportType === 'training')
                            //     var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {training_followup_action_id: action.training_followup_action_id});
                            var notified_to = $filter('filter')($scope.report.correctiveActionsNotified, {corrective_action_id: action.corrective_action_id});
                            console.log(notified_to);
                            if (angular.isDefined(notified_to)) {
                                // action.notified_to = notified_to;
                                action.notified_to = [];
                                angular.forEach(notified_to, function (notify) {
                                    var n = {};
                                    n.employee_id = notify.notified_id;
                                    n.full_name = notify.full_name;
                                    n.position = notify.position;
                                    n.org_name = notify.org_name;
                                    n.selectedValue = n.full_name + ', ' + n.position + ', ' + n.org_name;
                                    action.notified_to.push(n);
                                });
                            } else {
                                action.notified_to = [];
                                action.notified_to[0] = null;
                            }

                            var action_status = $filter('filter')($scope.correctiveActionStatues, {corrective_action_status_id: action.corrective_action_status_id});
                            console.log(action_status);
                            if (angular.isDefined(action_status)) {
                            //                    $scope.report.inv_status_id = param.inv_status_id;

                                if (action_status[0].field_code === 'closed') {
                                    // disabled actual_date & actual cost and make its color red
                                    $scope.report.correctiveActions[key].statusDisabled = false;
                                } else {
                                    $scope.report.correctiveActions[key].statusDisabled = true;
                                }
                            }
                            
                            
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:tab_name,
                                report_id:report_id,
                                table_key_value :action.corrective_action_id,
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    action.actionCustomField = response.data;
                                    angular.forEach(action.actionCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        });
                    } else {
                        $scope.addNewAction();
                    }
                    if(report_type =='ABCanTrack'){
                        if ($scope.report.hasOwnProperty('incidentImpactTypes') && $scope.report.incidentImpactTypes.length){
                            angular.forEach($scope.report.incidentImpactTypes, function (impact, key) {
                                
                                if(impact.impact_type_code =='Illness'){
                                    impact_id=impact.incident_illness_id;
                                }else if(impact.impact_type_code =='Injury'){
                                    impact_id=impact.incident_injury_id;
                                }else if(impact.impact_type_code =='SpillRelease'){
                                    impact_id=impact.incident_spill_release_id;
                                }else if(impact.impact_type_code =='VehicleDamage'){
                                    impact_id=impact.incident_vehicle_damage_id;
                                }else if(impact.impact_type_code =='TrafficViolation'){
                                    impact_id=impact.incident_traffic_violation_id;
                                }else {
                                    impact_id=impact.incident_impact_id;
                                }
                                
                                var data = {
                                    org_id: $scope.user.org_id,
                                    language_id: $scope.user.language_id,
                                    report_id:report_id,
                                    table_key_value :impact_id,
                                    tab_name:'Impacts',
                                    report_type:report_type
                                };
                                coreReportService.getTabCustomFields(data)
                                    .then(function (response) {
                                        impact.impactCustomField = response.data;
                                        angular.forEach(impact.impactCustomField, function(field){
                                            if(field.component=='calendar'){
                                                if(field.choice !== "" && field.choice !== null){
                                                    field.choice = new Date(field.choice);
                                                }
                                            } 
                                        });

                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                            });
                        }else{
                            $scope.addImpactCustomFields();
                        }
                    }

                     // Hazard Details Tab
                    if ($scope.report.hasOwnProperty('hazard_details')) {
                        $scope.report.effectsTypes = $scope.effectsTypes; // main effect types
                        $scope.report.causeTypes = $scope.causeTypes;

                        var effectsTypes = $filter('filter')($scope.report.hazard_details, {classification_type: 'hazard'}); // choosed effect types
                        var causeTypes = $filter('filter')($scope.report.hazard_details, {classification_type: 'cause'});

                        angular.forEach(effectsTypes, function (effect) { // loop for the choosed effect types
                            var effType = $filter('filter')($scope.report.effectsTypes, {effects_type_id: effect.type_id}); // get the choosed type from the main one
                            if (angular.isDefined(effType)) {
                                var subTypes = effect.sub_type.split(','); // split subtypes of the choosed one
                                var subTypeStatus = effect.sub_type_status_id.split(',');
                                var i =0;
                                angular.forEach(subTypes, function (subeffect) { // loop for the choosed subtypes of the choosed type
                                    var effSubType = $filter('filter')(effType[0].effects_sub_types, {effects_sub_type_id: subeffect}); // get the choosed subtype from the main subtypes
                                    if (angular.isDefined(effSubType)) {
                                        effSubType[0].effects_sub_type_choice = true;
                                        effSubType[0].effects_sub_type_status_id = subTypeStatus[i];
                                        i++;
                                    }
                                });
                            }
                        });

                        angular.forEach(causeTypes, function (cause) { // loop for the choosed cause types
                            var cauType = $filter('filter')($scope.report.causeTypes, {cause_types_id: cause.type_id}); // get the choosed type from the main types
                            if (angular.isDefined(cauType)) {
                                var subTypes = cause.sub_type.split(','); // split subtypes of the choosed one
                                var subStatus = cause.sub_type_status_id.split(',');
                                var i = 0;
                                angular.forEach(subTypes, function (subcause) { // loop for the choosed subtypes of the choosed type
                                    var cauSubType = $filter('filter')(cauType[0].cause_sub_types, {cause_sub_types_id: subcause}); // get the choosed subtype from the main subtypes
                                    if (angular.isDefined(cauSubType)) {
                                        cauSubType[0].cause_sub_types_choice = true;
                                        cauSubType[0].cause_sub_type_status_id = subStatus[i];
                                        i++;

                                    }
                                });
                            }
                        });
                    }
                   // $scope.updateRelatedHazard();

                    $scope.updateRelatedHazard(null , 'retriveData');
                }
                else{// on draft case
                   // $scope.getReportTypeName();// to handle draft in case new 
                   if ($scope.report.hasOwnProperty('report_type_name'))
                    $scope.hazard_type_name = $scope.report.report_type_name;

                    console.log($scope.report.report_date);
                    if ($scope.report.report_date !== "" && $scope.report.report_date !== null && $scope.report.report_date !== undefined) {
                    $scope.report.report_date = new Date($scope.report.report_date);
                    //  $scope.report.report_date.setDate($scope.report.report_date.getDate() + 1);
                   }
                    console.log($scope.report.peopleInvolved[0].title);
                    //return false;
                    if ($scope.report.hasOwnProperty('version_number') ) {
                        $scope.version_number = parseInt($scope.report.version_number)+1;
                        $scope.isDraft = true ;
                    }


                    $scope.whoIdentified = $scope.report.whoIdentified ;
                    if ($scope.whoIdentified == undefined) {
                        $scope.whoIdentified = {};
                        $scope.whoIdentified.employee_id = $scope.report.reporter_id;
                        $scope.whoIdentified.full_name = $scope.report.rep_name;
                        $scope.whoIdentified.emp_id = $scope.report.rep_emp_id;
                        $scope.whoIdentified.email = $scope.report.rep_email;
                        $scope.whoIdentified.position = $scope.report.rep_position;
                        $scope.whoIdentified.crew_id = $scope.report.rep_crew;
                        $scope.whoIdentified.department_id = $scope.report.rep_department;
                        $scope.whoIdentified.company = $scope.report.rep_company;
                        $scope.whoIdentified.primary_phone = $scope.report.rep_primary_phone;
                        $scope.whoIdentified.alternate_phone = $scope.report.rep_alternate_phone;
                        $scope.whoIdentified.supervisor_name = $scope.report.rep_supervisor;
                        console.log($scope.whoIdentified);
                    }

                    //impact part
                    if ($scope.reportType !== "incident") 
                        $scope.impactTypes = $scope.report.impactTypes ;

                     // People Involved Tab
                    if ($scope.report.hasOwnProperty('peopleInvolved') && $scope.report.peopleInvolved.length) {
                        console.log($scope.report.peopleInvolved);
                        $scope.peopleInvolved = $scope.report.peopleInvolved;
                        console.log($scope.peopleInvolved);
                        var customerIndex =0 ;
                        var contractorIndex = 0;
                        angular.forEach($scope.report.peopleInvolved, function (people, key) {
                            if (people.people_id !== '' && people.people_id !== null) {
                                $scope.peopleInvolved[key].employee_id = people.people_id;
                                if ($scope.whoIdentified.employee_id === people.people_id)
                                    $scope.peopleInvolved[key].type = 'whoidentified';
                                else
                                    $scope.peopleInvolved[key].type = 'investigator';
                            } else if (people.third_party_id !== '' && people.third_party_id !== null) {
                                console.log($scope.peopleInvolved[key]);
                                $scope.peopleInvolved[key].employee_id = people.third_party_id;
                                $scope.peopleInvolved[key].type = 'thirdparty';
                                if (people.how_he_involved.indexOf("Contractor") != -1) {
                                    console.log("contractor" ,people.how_he_involved.indexOf("Contractor"));
                                    var editThirdParty = [];
                                    editThirdParty = $filter('filter')(contractorInvolvedIndex, {contractorIndex: contractorIndex});
                                    console.log('editThirdParty for contractor on dit mode',editThirdParty );
                                    if (editThirdParty.length < 1) {
                                        var contractorObject = {};
                                        contractorObject.contractorIndex = contractorIndex;
                                        contractorObject.tabIndex =key ;
                                        contractorInvolvedIndex.push(contractorObject);
                                        contractorIndex = contractorIndex +1 ;
                                    }
                                }

                                if (people.how_he_involved.indexOf("Customer") != -1) {
                                    console.log("Customer");
                                    var editThirdParty = [];
                                    editThirdParty = $filter('filter')(customerInvolvedIndex, {customerIndex: customerIndex});
                                    console.log('editThirdParty for customer of populate data',editThirdParty );
                                    if (editThirdParty.length < 1) {
                                        var customerObject = {};
                                        customerObject.customerIndex = customerIndex;
                                        customerObject.tabIndex = key ;
                                        customerInvolvedIndex.push(customerObject);
                                        customerIndex = customerIndex +1 ;
                                    }
                                }
                            }
                            $scope.peopleInvolved[key].title = people.full_name;
                            $scope.peopleInvolved[key].full_name = people.full_name;
                            $scope.peopleInvolved[key].email = people.email;
                            $scope.peopleInvolved[key].position = people.position;
                            $scope.peopleInvolved[key].crew = people.crew;
                            $scope.peopleInvolved[key].department = people.department; 
                            $scope.peopleInvolved[key].org_name = people.org_name;
                            $scope.peopleInvolved[key].primary_phone = people.primary_phone;
                            $scope.peopleInvolved[key].alternate_phone = people.alternate_phone;
                            $scope.peopleInvolved[key].supervisor_name = people.supervisor_name;
                            $scope.peopleInvolved[key].exp_in_current_postion = parseInt(people.exp_in_current_postion);
                            $scope.peopleInvolved[key].exp_over_all = parseInt(people.exp_over_all);
                            $scope.peopleInvolved[key].age = parseInt(people.age);

                            
                            $scope.peopleInvolved[key].certifications = people.certifications;

                            $scope.peopleInvolved[key].actingAs = people.actingAs;
                            angular.forEach(people.peopleCustomField, function(field){
                                if(field.component=='calendar'){
                                    if(field.choice !== "" && field.choice !== null){
                                        field.choice = new Date(field.choice);
                                    }
                                } 
                            });

                        });
                    }

                    // Corrective Actions Tab
                    if ($scope.report.hasOwnProperty('correctiveActions') && $scope.report.correctiveActions.length) {
                        angular.forEach($scope.report.correctiveActions, function (action, key) {
                           if (action.start_date !== "" && action.start_date !== null && action.start_date !== undefined) {
                                console.log(action.start_date);
                                action.start_date = new Date(action.start_date);
                            }
                            console.log(action.start_date);
                            if (action.target_end_date !== "" && action.target_end_date !== null  && action.target_end_date !== undefined) {
                                action.target_end_date = new Date(action.target_end_date);
                            }
                            if (action.actual_end_date !== "" && action.actual_end_date !== null && action.actual_end_date !== undefined) {
                                action.actual_end_date = new Date(action.actual_end_date);
                            }
                            action.estimated_cost = parseFloat(action.estimated_cost);
                            action.actual_cost = parseFloat(action.actual_cost);
                            angular.forEach(action.actionCustomField, function(field){
                                if(field.component=='calendar'){
                                    if(field.choice !== "" && field.choice !== null){
                                        field.choice = new Date(field.choice);
                                    }
                                } 
                            });
                        });
                    } else {
                        $scope.addNewAction();
                    }
                    
                    // Impact Tab
                    if ($scope.reportType == "incident") {
                        if ($scope.report.hasOwnProperty('incidentImpactTypes') && $scope.report.incidentImpactTypes.length){
                                angular.forEach($scope.report.incidentImpactTypes, function (impact, key) {
                                    angular.forEach(impact.impactCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                            });
                        }
                    }
                    if ($scope.report.hasOwnProperty('whatCustomField') && $scope.report.whatCustomField.length){
                        angular.forEach($scope.report.whatCustomField, function(field){
                            if(field.component=='calendar'){
                                if(field.choice !== "" && field.choice !== null){
                                    field.choice = new Date(field.choice);
                                }
                            } 
                        });
                    }else{
                        report_type ='';
                        if ($scope.reportType == "hazard") {
                            report_type= 'Hazard';
                        }else if($scope.reportType == "incident") {
                            report_type='ABCanTrack';
                        }else if($scope.reportType == "inspection") {
                            report_type='Inspection';
                        }else if($scope.reportType == "safetymeeting") {
                            report_type='SafetyMeeting';
                        }else if($scope.reportType == "training") {
                            report_type='Training';
                        }else if($scope.reportType == "maintenance") {
                            report_type='MaintenanceManagement';
                        }
                        if(report_type){
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'WhatHappened',
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                    .then(function (response) {
                                        $scope.report.whatCustomField = response.data;
                                        angular.forEach($scope.report.whatCustomField, function(field){
                                            if(field.component=='calendar'){
                                                if(field.choice !== "" && field.choice !== null){
                                                    field.choice = new Date(field.choice);
                                                }
                                            } 
                        //                                            if(field.component=='checkbox'){
                        //                                                $('.'+field.name).click(function() {
                        //                                                    aler('ddddddddddddd');
                        //                                                    console.log($('.'+field.name+':checkbox:checked'));
                        //                                                });
                        //                                            }
                                                                });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        }
                    }
                    if ($scope.report.hasOwnProperty('detailCustomField') && $scope.report.detailCustomField.length){
                        angular.forEach($scope.report.detailCustomField, function(field){
                            if(field.component=='calendar'){
                                if(field.choice !== "" && field.choice !== null){
                                    field.choice = new Date(field.choice);
                                }
                            } 
                        });
                    }else{
                        report_type ='';
                        if ($scope.reportType == "hazard") {
                            report_type= 'Hazard';
                        }else if($scope.reportType == "inspection") {
                            report_type='Inspection';
                        }

                        if(report_type!=''){
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'HazardDetails',
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    $scope.report.detailCustomField = response.data;
                                    angular.forEach($scope.report.detailCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        }
                    }
                    if ($scope.report.hasOwnProperty('observationCustomField') && $scope.report.observationCustomField.length){
                        angular.forEach($scope.report.observationCustomField, function(field){
                            if(field.component=='calendar'){
                                if(field.choice !== "" && field.choice !== null){
                                    field.choice = new Date(field.choice);
                                }
                            } 
                        });
                    }else{
                        
                        report_type ='';
                        if($scope.reportType == "incident") {
                            report_type ='ABCanTrack';
                        }
                        if(report_type!=''){
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'Observation',
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    $scope.report.observationCustomField = response.data;
                                    angular.forEach($scope.report.observationCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        }
                    }
                    if ($scope.report.hasOwnProperty('analysisCustomField') && $scope.report.analysisCustomField.length){
                        angular.forEach($scope.report.analysisCustomField, function(field){
                            if(field.component=='calendar'){
                                if(field.choice !== "" && field.choice !== null){
                                    field.choice = new Date(field.choice);
                                }
                            } 
                        });
                    }else{
                        report_type ='';
                        if($scope.reportType == "incident") {
                            report_type ='ABCanTrack';
                        }
                        if(report_type!=''){
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'SCATAnalysis',
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    $scope.report.analysisCustomField = response.data;
                                    angular.forEach($scope.report.analysisCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        }
                    }
                    if ($scope.report.hasOwnProperty('investigationCustomField') && $scope.report.investigationCustomField.length){
                        angular.forEach($scope.report.investigationCustomField, function(field){
                            if(field.component=='calendar'){
                                if(field.choice !== "" && field.choice !== null){
                                    field.choice = new Date(field.choice);
                                }
                            } 
                        });
                    }else{
                        report_type ='';
                        if($scope.reportType == "incident") {
                            report_type ='ABCanTrack';
                        }
                        if(report_type!=''){
                            var data = {
                                org_id: $scope.user.org_id,
                                language_id: $scope.user.language_id,
                                tab_name:'Investigation',
                                report_type:report_type
                            };
                            coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    $scope.report.investigationCustomField = response.data;
                                    angular.forEach($scope.report.investigationCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });

                                }, function (error) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'exception', message: error.data});
                                });
                        }
                    }
                    
                }
                //report owner
                $scope.checkReportOwner();
                if ($scope.contractorOwner) {
                    $scope.contractorReportOwner = {
                        third_party_id: $scope.report.cont_cust_id,
                        third_party_name: $scope.report.third_party_name,
                        sponser_name: $scope.report.sponser_name,
                        sponser_id: $scope.report.sponser_id
                    };
                    console.log('contractorOwner',$scope.contractorReportOwner);
                }

                else if ($scope.customerOwner) {
                    $scope.customerReportOwner = {
                        third_party_id: $scope.report.cont_cust_id,
                        third_party_name: $scope.report.third_party_name,
                        sponser_name: $scope.report.sponser_name,
                        sponser_id: $scope.report.sponser_id
                    };
                    console.log('customerOwner',$scope.customerReportOwner);

                }

                if ($scope.report.equipment_involved != undefined) {
                    if ($scope.report.equipment_involved.length == 0) {
                        $scope.newEquipment();
                    }
                }

                if ($scope.report.hasOwnProperty('assigned_to_alternate_phone')) {
                    // training report
                    console.log("yes it is training ");
                    // $scope.whoIdentified = {};
                    $scope.whoIdentified.employee_id = $scope.report.creator_id;
                    $scope.whoIdentified.full_name = $scope.report.assigned_to_name;
                    $scope.whoIdentified.emp_id = $scope.report.assigned_to_emp_id;
                    $scope.whoIdentified.email = $scope.report.assigned_to_email;
                    $scope.whoIdentified.position = $scope.report.assigned_to_position;
                    $scope.whoIdentified.crew_name = $scope.report.assigned_to_crew;
                    $scope.whoIdentified.org_name = $scope.report.assigned_to_company;
                    $scope.whoIdentified.primary_phone = $scope.report.assigned_to_primary_phone;
                    $scope.whoIdentified.alternate_phone = $scope.report.assigned_to_alternate_phone;
                    $scope.whoIdentified.supervisor_name = $scope.report.assigned_to_supervisor;
                    $scope.report.report_date = moment($scope.report.traininy_completed_by)['_d'];

                    $scope.trainingType = {};
                    $scope.trainingType.training_type_id = $scope.report.training_type_id;
                    $scope.trainingType.training_name = $scope.report.training_type_name;
                    console.log($scope.trainingType);
                    console.log($scope.report.training_reason_id);
                    $scope.trainingType.evidence_of_completion_required = $scope.report.evidence_of_completion;
                    $scope.trainingType.duration_of_training = parseInt($scope.report.training_duration);
                    // get training type interval 
                    customersService.getTrainingTypeData($scope.trainingType)
                            .then(function (response) {
                                console.log(response);
                                if (response.data) {
                                    $scope.trainingType.recertificate_frequency = response.data[0].recertificate_frequency;
                                    console.log($scope.trainingType.recertificate_frequency);
                                }
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    $scope.trainingProvider = {};
                    $scope.trainingProvider.provider_id = $scope.report.third_party_id;
                    // get provider name 
                    customersService.getProviderData($scope.trainingProvider)
                            .then(function (response) {
                                console.log(response);
                                if (response.data) {
                                    $scope.trainingProvider.provider_name = response.data[0].provider_name;
                                    console.log($scope.trainingProvider);
                                }
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });

                    $scope.report.level_quality_id = $scope.report.quality_of_training_id;
                    console.log($scope.report.level_quality_id);
                }

                if ($scope.report.hasOwnProperty('maintenance_type_id')) {
                    console.log("yes it is maintenance ", $scope.report.hasOwnProperty('maintenance_type_id'));
                    $scope.report.report_type_id = $scope.report.maintenance_type_id;
                    $scope.report.report_hour = $scope.report.maintenance_hour;
                    $scope.report.report_min = $scope.report.maintenance_minute;
                    $scope.report.report_date = moment($scope.report.maintenance_date)['_d'];
                    $scope.report.report_description = $scope.report.maintenance_description;
                    $scope.report.recommended_corrective_actions_summary = $scope.report.summary_of_recommended_followup_actions;

                    $scope.report.are_additional_corrective_actions_required = $scope.report.are_additional_followup_actions_required;
                }
                // console.log("datae of report",$scope.report.report_date);
                // Location Part


                // Third Party Part
                console.log($scope.report.hasOwnProperty('report_third_party') , $scope.report.report_third_party.length);
                if ($scope.report.hasOwnProperty('report_third_party') && $scope.report.report_third_party.length) {
                    $scope.contractors_involved = $filter('filter')($scope.report.report_third_party, {third_party_type_code: 'Contractor'});
                    if ($scope.contractors_involved != undefined) {
                        if ($scope.contractors_involved.length == 0) {
                            $scope.newContract();
                        }
                    }
                    $scope.customer_involved = $filter('filter')($scope.report.report_third_party, {third_party_type_code: 'Customer'});
                    if ($scope.customer_involved != undefined) {
                        if ($scope.customer_involved.length == 0) {
                            $scope.newCustomer();
                        }
                    }
                }
                console.log('$scope.contractors_involved ',$scope.contractors_involved )


                /*
                 console.log($scope.report.risk_levels);
                 console.log($scope.report.risk_levels.hazard_exist_id !== '');
                 console.log($scope.report.risk_levels.hazard_exist_id !== null);*/
                // Risk Levels Part
                /*if ($scope.report.hasOwnProperty('risk_levels')) {
                    $scope.report.riskLevelsValues = {};
                    if ($scope.report.risk_levels.hasOwnProperty('hazard_exist_id') && $scope.report.risk_levels.hazard_exist_id !== ''
                            && $scope.report.risk_levels.hazard_exist_id !== null) {
                        console.log($scope.report.risk_levels)
                        $scope.report.riskLevelsValues.hazard_exist = $filter('filter')($scope.riskLevels.hazard_exist, {risk_level_id: $scope.report.risk_levels.hazard_exist_id})[0].risk_level_value;
                    }
                    if ($scope.report.risk_levels.hasOwnProperty('worker_exposure_id') && $scope.report.risk_levels.worker_exposure_id !== ''
                            && $scope.report.risk_levels.worker_exposure_id !== null)
                        $scope.report.riskLevelsValues.worker_exposure = $filter('filter')($scope.riskLevels.worker_exposure, {risk_level_id: $scope.report.risk_levels.worker_exposure_id})[0].risk_level_value;
                    if ($scope.report.risk_levels.hasOwnProperty('potential_consequences_id') && $scope.report.risk_levels.potential_consequences_id !== ''
                            && $scope.report.risk_levels.potential_consequences_id !== null)
                        $scope.report.riskLevelsValues.potential_consequences = $filter('filter')($scope.riskLevels.potential_consequences, {risk_level_id: $scope.report.risk_levels.potential_consequences_id})[0].risk_level_value;
                    $scope.calculateRiskLevel($scope.report.should_work_stopped);
                }*/
                // Risk Levels Part
                if ($scope.report.hasOwnProperty('risk_level_sup_impact_id')) {
                    $scope.report.riskLevelsValues = {};
                    if ($scope.report.hasOwnProperty('risk_level_sup_impact_id') && $scope.report.risk_level_sup_impact_id !== ''
                            && $scope.report.risk_level_sup_impact_id !== null) {
                        console.log($scope.report.risk_level_sup_impact_id)
                        $scope.report.riskLevelsValues.impact = $scope.report.risk_level_sup_impact_id;
                    }
                    if ($scope.report.hasOwnProperty('risk_level_sup_likelyhood_id') && $scope.report.risk_level_sup_likelyhood_id !== ''
                            && $scope.report.risk_level_sup_likelyhood_id !== null) {
                        console.log($scope.report.risk_level_sup_likelyhood_id)
                        $scope.report.riskLevelsValues.likelyhood = $scope.report.risk_level_sup_likelyhood_id;
                    }
                    $scope.calculateRiskLevel($scope.report.should_work_stopped);
                }





                //console.log($scope.report.riskLevelsValues);

                // Risk Controls Part
                if ($scope.report.hasOwnProperty('risk_controls')) {
                    $scope.report.riskControls = $scope.riskControls;
                    angular.forEach($scope.report.riskControls, function (riskControl) {
                        if (angular.isDefined($filter('filter')($scope.report.risk_controls, {risk_control_id: riskControl.risk_control_id})[0])) {
                            riskControl.risk_control_choice = true;
                        }
                    });
                }

                if ($scope.report.hasOwnProperty('inspection_description')) {

                    $scope.report.hazard_description = $scope.report.inspection_description;
                }

                if ($scope.report.hasOwnProperty('inspection_description') && $scope.report.hasOwnProperty('inspection_number')) {

                    $scope.report.report_description = $scope.report.inspection_description;
                }

                if ($scope.report.hasOwnProperty('investigation_date')) {
                    console.log("$scope.report.investigation_date ---1" + $scope.report.investigation_date);
                    if ($scope.report.investigation_date == "")
                        $scope.report.investigation_date = null;

                    else if ($scope.report.investigation_date && $scope.report.investigation_date != null && $scope.report.investigation_date != "") {
                        $scope.report.investigation_date = moment($scope.report.investigation_date)['_d'];
                    }
                    console.log("$scope.report.investigation_date ---2" + $scope.report.investigation_date);
                    console.log("$scope.report.investigation_sign_off_date ---1" + $scope.report.investigation_sign_off_date);
                    if ($scope.report.investigation_sign_off_date == "")
                        $scope.report.investigation_sign_off_date = null;

                    else if ($scope.report.investigation_sign_off_date && $scope.report.investigation_sign_off_date != null) {
                        $scope.report.investigation_sign_off_date = moment($scope.report.investigation_sign_off_date)['_d'];
                    }
                    console.log("$scope.report.investigation_sign_off_date ---2" + $scope.report.investigation_sign_off_date);

                }
                if($stateParams.draftId ==null){
                    report_id= $scope.report.draft_id;
                }else{
                    report_id= $stateParams.draftId;
                }
                if($scope.reportType == "inspection") {
                    report_id = $scope.report.risk_levels.inspection_id;
                }
                if($scope.reportType == "maintenance") {
                    report_id = $scope.report.maintenance_id;
                }
                if($scope.reportType == "safetymeeting"){
                    report_id= $scope.report.safetymeeting_id;
                }
                if($scope.reportType == "training"){
                    report_id= $scope.report.training_id;
                }
                
                if (!$scope.report.hasOwnProperty('whatCustomField')) {
                    report_type ='';
                    if ($scope.reportType == "hazard") {
                        report_type= 'Hazard';
                    }else if($scope.reportType == "incident") {
                        report_type='ABCanTrack';
                    }else if($scope.reportType == "inspection") {
                        report_type='Inspection';
                    }else if($scope.reportType == "safetymeeting") {
                        report_type='SafetyMeeting';
                    }else if($scope.reportType == "training") {
                        report_type='Training';
                    }else if($scope.reportType == "maintenance") {
                        report_type='MaintenanceManagement';
                    }
                    if(report_type!=''){
                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id,
                            tab_name:'WhatHappened',
                            report_id:report_id,
                            report_type:report_type
                        };
                        coreReportService.getTabCustomFields(data)
                                .then(function (response) {
                                    $scope.report.whatCustomField = response.data;
                                    angular.forEach($scope.report.whatCustomField, function(field){
                                        if(field.component=='calendar'){
                                            if(field.choice !== "" && field.choice !== null){
                                                field.choice = new Date(field.choice);
                                            }
                                        } 
                                    });
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    }
                }
                if (!$scope.report.hasOwnProperty('detailCustomField')) {
                    report_type ='';
                    if ($scope.reportType == "hazard") {
                        report_type= 'Hazard';
                    }else if($scope.reportType == "inspection") {
                        report_type='Inspection';
                    }
                    
                    if(report_type!=''){
                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id,
                            tab_name:'HazardDetails',
                            report_id:report_id,
                            report_type:report_type
                        };
                        coreReportService.getTabCustomFields(data)
                            .then(function (response) {
                                $scope.report.detailCustomField = response.data;
                                angular.forEach($scope.report.detailCustomField, function(field){
                                    if(field.component=='calendar'){
                                        if(field.choice !== "" && field.choice !== null){
                                            field.choice = new Date(field.choice);
                                        }
                                    } 
                                });
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    }
                }
//                if (!$scope.report.hasOwnProperty('actionCustomField')) {
//                    report_type ='';
//                    if ($scope.reportType == "hazard") {
//                        report_type= 'Hazard';
//                        tab_name='Actions';
//                    }else if($scope.reportType == "incident") {
//                        report_type ='ABCanTrack';
//                        tab_name='Actions';
//                    }else if($scope.reportType == "inspection") {
//                        report_type='Inspection';
//                        tab_name='Actions';
//                    }else if($scope.reportType == "safetymeeting") {
//                        report_type='SafetyMeeting';
//                        tab_name='Actions';
//                    }else if($scope.reportType == "training") {
//                        report_type='Training';
//                        tab_name='Follows';
//                    }else if($scope.reportType == "maintenance") {
//                        report_type='MaintenanceManagement';
//                        tab_name='Follows';
//                    }
//                    if(report_type!=''){
//                        var data = {
//                            org_id: $scope.user.org_id,
//                            language_id: $scope.user.language_id,
//                            tab_name:tab_name,
//                            report_id:report_id,
//                            report_type:report_type
//                        };
//                        coreReportService.getTabCustomFields(data)
//                            .then(function (response) {
//                                $scope.report.actionCustomField = response.data;
//                                angular.forEach($scope.report.actionCustomField, function(field){
//                                    if(field.component=='calendar'){
//                                        if(field.choice !== "" && field.choice !== null){
//                                            field.choice = new Date(field.choice);
//                                        }
//                                    } 
//                                });
//                            }, function (error) {
//                                coreService.resetAlert();
//                                coreService.setAlert({type: 'exception', message: error.data});
//                            });
//                    }
//                }
//                if (!$scope.report.hasOwnProperty('impactCustomField')) {
//                    report_type ='';
//                    if($scope.reportType == "incident") {
//                        report_type ='ABCanTrack';
//                    }
//                    if(report_type!=''){
//                        var data = {
//                            org_id: $scope.user.org_id,
//                            language_id: $scope.user.language_id,
//                            tab_name:'Impacts',
//                            report_id:report_id,
//                            report_type:report_type
//                        };
//                        coreReportService.getTabCustomFields(data)
//                            .then(function (response) {
//                                $scope.report.impactCustomField = response.data;
//                                angular.forEach($scope.report.impactCustomField, function(field){
//                                    if(field.component=='calendar'){
//                                        if(field.choice !== "" && field.choice !== null){
//                                            field.choice = new Date(field.choice);
//                                        }
//                                    } 
//                                });
//                            }, function (error) {
//                                coreService.resetAlert();
//                                coreService.setAlert({type: 'exception', message: error.data});
//                            });
//                    }
//                }
                if (!$scope.report.hasOwnProperty('observationCustomField')) {
                    report_type ='';
                    if($scope.reportType == "incident") {
                        report_type ='ABCanTrack';
                    }
                    if(report_type!=''){
                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id,
                            tab_name:'Observation',
                            report_id:report_id,
                            report_type:report_type
                        };
                        coreReportService.getTabCustomFields(data)
                            .then(function (response) {
                                $scope.report.observationCustomField = response.data;
                                angular.forEach($scope.report.observationCustomField, function(field){
                                    if(field.component=='calendar'){
                                        if(field.choice !== "" && field.choice !== null){
                                            field.choice = new Date(field.choice);
                                        }
                                    } 
                                });
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    }
                }
                if (!$scope.report.hasOwnProperty('analysisCustomField')) {
                    report_type ='';
                    if($scope.reportType == "incident") {
                        report_type ='ABCanTrack';
                    }
                    if(report_type!=''){
                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id,
                            tab_name:'SCATAnalysis',
                            report_id:report_id,
                            report_type:report_type
                        };
                        coreReportService.getTabCustomFields(data)
                            .then(function (response) {
                                $scope.report.analysisCustomField = response.data;
                                angular.forEach($scope.report.analysisCustomField, function(field){
                                    if(field.component=='calendar'){
                                        if(field.choice !== "" && field.choice !== null){
                                            field.choice = new Date(field.choice);
                                        }
                                    } 
                                });
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    }
                }
                if (!$scope.report.hasOwnProperty('investigationCustomField')) {
                    report_type ='';
                    if($scope.reportType == "incident") {
                        report_type ='ABCanTrack';
                    }
                    if(report_type!=''){
                        var data = {
                            org_id: $scope.user.org_id,
                            language_id: $scope.user.language_id,
                            tab_name:'Investigation',
                            report_id:report_id,
                            report_type:report_type
                        };
                        coreReportService.getTabCustomFields(data)
                            .then(function (response) {
                                $scope.report.investigationCustomField = response.data;
                                angular.forEach($scope.report.investigationCustomField, function(field){
                                    if(field.component=='calendar'){
                                        if(field.choice !== "" && field.choice !== null){
                                            field.choice = new Date(field.choice);
                                        }
                                    } 
                                });

                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                    }
                }
                 
                $scope.checkRiskControlRequired(); 
                if (coreService.getIsMyDraft() == true) {
                    $scope.EditMode();
                    $scope.updateDreaftReport();/// for case from edit on draft to state create new with any changes 
                }
                if ($scope.reportType == 'incident') {
                    var inv_closed_status = $filter('filter')($scope.invStatus, {field_code: 'closed'})[0].inv_status_id;
                    console.log('inv_closed_status',inv_closed_status)
                    if ($scope.report.inv_status_id == inv_closed_status) {
                        var data = {
                            lableType : 'investigation',
                            report_id : ($scope.report.report_id)? $scope.report.report_id: $scope.report.draft_id
                        }
                        coreReportService.getStatusLable(data)
                        .then(function (response) {
                            console.log(response);
                            $scope.invMesssage = response.data[0].staus_label;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }

                    var report_closed_status = $filter('filter')($scope.reportStatus, {report_status_code: 'close'})[0].report_status_id;
                    console.log('report_closed_status', report_closed_status);
                    if ($scope.report.report_status_id == report_closed_status) {
                        var data = {
                            lableType : 'report',
                            report_id : ($scope.report.report_id)? $scope.report.report_id: $scope.report.draft_id
                        }
                        coreReportService.getStatusLable(data)
                        .then(function (response) {
                            console.log(response);
                            $scope.reportStatusMesssage = response.data[0].staus_label;
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }
                }
        }

        $scope.deleteDraft = function(type){
            console.log('$scope.lockedReport',$scope.lockedReport);
            if ( $scope.lockedReport && type == "discard") // in case of report locked by anther user to redirect only and not delet draft
                $state.go('viewDataTables');
            console.log(type);
            console.log($scope.report.report_id);
         //   $scope.updateEditingBy('finish'); 

            $scope.report.report_id = ($scope.report.report_id)? $scope.report.report_id: $scope.report.draft_id;

            
            if ($scope.report.report_id != undefined) {
                var data = {
                    report_id: $scope.report.report_id,
                    product_code: $scope.reportType ///$scope.reportType
                }
                console.log(coreService.getDraftReport());

                coreService.deleteDraft(data)
                    .then(function (response) {
                        console.log(response);
                        if (response.data) {
                            coreService.setDraftReport(undefined);
                            if (type == "discard") {
                                $scope.updateEditingBy('finish');  
                                $state.go('viewDataTables');
                            }
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                });
            }
            else{
                if (type == "discard") {
                    coreService.setDraftReport(undefined);
                    $state.go('viewDataTables');
                }
            }
        }

        $scope.updateEditingBy = function(status){
            if ( $scope.lockedReport) 
                return false;
            console.log('updat Editing By on ',status);
            var editing_data = {
                employeeId: $scope.user.employee_id,
                reportId: $scope.report.draft_id ,
                status: status
            };
            console.log('updat Editing By on ',status,editing_data);
            switch ($scope.reportType) {
                case "hazard":
                editing_data.productCode = "hazard";
                break;
                case "incident":
                editing_data.productCode = "ABCanTrack";
                break;
                /*case "incident":
                editing_data.productCode = "ABCanTrack";
                break;
                case "incident":
                editing_data.productCode = "ABCanTrack";
                break;
                case "incident":
                editing_data.productCode = "ABCanTrack";
                break;
                case "incident":
                editing_data.productCode = "ABCanTrack";
                break;*/    
            }
            coreReportService.updateEditingBy(editing_data)
                .then(function (response) {
                    console.log(response);
                    
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }

        $scope.populateOriginalReportData = function(reportNum){

                var data = {
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id,
                    type: $scope.reportType,
                    report_number: reportNum
                };
                coreReportService.getReportData(data).then(function (response) {
                    $scope.report = response.data;
                    console.log($scope.report);
                    //console.log($scope.report.equipment_involved);
                    // What Happened Tab
                    // Who Identified Part
                    //                $scope.report.report_date = moment($scope.report.report_date)['_d'];
                    //                $scope.report.report_date = $filter('utcToLocal')($scope.report.report_date, 'date')['_d'];                               
                  $scope.retriveReportData();
                  }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                });
        }



        $scope.closeReport = function(){
            if (!$scope.lockedReport)
                $scope.updateDreaftReport();
            $state.go('viewDataTables');
        }
        $scope.checkReportStatus = function(){
            $scope.report_status_name = $filter('filter')($scope.reportStatus, {report_status_id: $scope.report.report_status_id})[0].report_status_name;
            if ($scope.report_status_name == "Closed") {
                /*coreService.resetAlert();
                var post = {language_id: $scope.user.language_id, alert_message_code: 'lockincident'};
                coreService.getAlertMessageByCode(post).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.msgTitle = response.data['alert_name'];
                        $scope.msgBody = response.data['alert_message_description'];
                        console.log($scope.msgTitle);*/
                       

                        $scope.$uibModalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/incidentReportModule/views/reportStatusAlert.html',
                            controller: function($uibModalInstance ,$scope){
                             
                            $scope.cancel = function () {
                               $uibModalInstance.dismiss('cancel');
                            };
                             
                            }
                        });
                /*    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });*/
            }
             $scope.updateDreaftReport();
        }
        $scope.relatedHazard =[];

        $scope.updateRelatedHazard = function(selectedType, type){
            var hazardDetalsIDs = "" ; 
            angular.forEach($scope.report.effectsTypes, function (effect) {
                angular.forEach(effect.effects_sub_types, function (subEffect) {
                    if (subEffect.effects_sub_type_choice && subEffect.effects_sub_type_choice != undefined &&
                        subEffect.effects_sub_type_choice === true) {
                        hazardDetalsIDs += subEffect.effects_sub_type_id+"," ;
                    }
                });
            });
            angular.forEach($scope.report.causeTypes, function (cause) {
                angular.forEach(cause.cause_sub_types, function (causeSubType) {
                    if (causeSubType.cause_sub_types_choice && causeSubType.cause_sub_types_choice != undefined &&
                        causeSubType.cause_sub_types_choice === true) {
                        hazardDetalsIDs += causeSubType.cause_sub_types_id+"," ;
                    }
                });
            });
            var data = {
                org_id: $scope.user.org_id,
                hazardDetalsIDs: hazardDetalsIDs
            }
            coreReportService.getRelatedHazard(data).then(function (response) {
                    $scope.relatedHazard = response.data;
                }, function (error) {
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            if (type == 'updateEffect') {
                var effectsSubType = selectedType;
                if (effectsSubType.effects_sub_type_choice == true && type == 'updateEffect') 
                    effectsSubType.effects_sub_type_status_id = $filter('filter')($scope.correctiveStatus, {status_Name: 'Present'})[0].status_id;
                else if (effectsSubType.effects_sub_type_choice == false && type == 'updateEffect') 
                    effectsSubType.effects_sub_type_status_id = null;
            }

            if (type == 'updateCause') {
                var causeSubType = selectedType ;
                if (causeSubType.cause_sub_types_choice == true && type == 'updateCause') 
                    causeSubType.cause_sub_type_status_id = $filter('filter')($scope.correctiveStatus, {status_Name: 'Present'})[0].status_id;
                else if (causeSubType.cause_sub_types_choice == false && type == 'updateCause') 
                    causeSubType.cause_sub_type_status_id = null;
            }
            $scope.updateDreaftReport();
        }

        $scope.updateResultStatusId = function(selectedAction){
            console.log(selectedAction);
            angular.forEach($scope.report.effectsTypes, function (effect) {
                var selectedSubEffect = $filter('filter')(effect.effects_sub_types, {effects_sub_type_id: selectedAction.related_hazard_id});
                if(selectedSubEffect.length > 0)
                    selectedAction.corrective_action_result_id = selectedSubEffect[0].effects_sub_type_status_id;
            });
            if (selectedAction.corrective_action_result_id == undefined) {
                angular.forEach($scope.report.causeTypes, function (cause) {
                    var selectedSubCause = $filter('filter')(cause.cause_sub_types, {cause_sub_types_id: selectedAction.related_hazard_id});
                    if(selectedSubCause.length > 0)
                        selectedAction.corrective_action_result_id = selectedSubCause[0].cause_sub_type_status_id;
                });
            }
            console.log(selectedAction.corrective_action_result_id);

            $scope.updateDreaftReport();
        }
        
        $scope.contractorOwner = false;
        $scope.customerOwner = false ;
        $scope.checkReportOwner = function(){
            $scope.report_owner_name = $filter('filter')($scope.reportOwners, {id: $scope.report.report_owner})[0].name;
            console.log($scope.report_owner_name);
            if ($scope.report_owner_name == "Contractor" ) {
                console.log("=== contractor =====");
                $scope.contractorOwner = true ;
                $scope.customerOwner = false ;
            }
            else if( $scope.report_owner_name == "Customer") {
                $scope.customerOwner = true ;
                $scope.contractorOwner = false ;
            }
            else{
                $scope.report.cont_cust_id = "";
                $scope.report.sponser_id = "";
                $scope.contractorOwner = $scope.customerOwner =  false ;
            }
            $scope.updateDreaftReport();
        }

        $scope.getReportOwnerInvolved = function (q, key) {
            if ((!q) || q.length < 1)
                return [];
            var query = "";
            if (key == 'Customer') {
                query = " third_party_type_name ='Customer' and third_party_name LIKE '" + q + "%'";
                coreReportService.getthirdpartyinfo({
                    query: query,
                    org_id: $scope.user['org_id']
                }).then(function (response) {
                    var res = response.data;
                    if (res.data) {
                        $scope.customer_owners = res.data;
                    }
                });
            } else if (key == 'Contractor') {
                query = " third_party_type_name ='Contractor' and third_party_name LIKE '" + q + "%'";
                coreReportService.getthirdpartyinfo({
                    query: query,
                    org_id: $scope.user['org_id']
                }).then(function (response) {
                    var res = response.data;
                    if (res.data) {
                        $scope.contractor_owners = res.data;
                        console.log($scope.contractor_owners);
                    }
                });
            }
        }
        $scope.contractorReportOwner = null;
        $scope.customerReportOwner = null;
        $scope.onContractorOwnerSelected = function(selected){
            $scope.contractorReportOwner = selected;
            console.log($scope.contractorReportOwner);
            $scope.report.cont_cust_id = $scope.contractorReportOwner.third_party_id;
            $scope.report.third_party_name = $scope.contractorReportOwner.third_party_name;
            $scope.report.sponser_id = $scope.contractorReportOwner.sponser_id;
            $scope.report.sponser_name = $scope.contractorReportOwner.sponser_name;
            $scope.updateDreaftReport();
        }

        $scope.onCustomerOwnerSelected = function(selected){
            $scope.customerReportOwner = selected;
            console.log($scope.customerReportOwner);
            $scope.report.cont_cust_id = $scope.customerReportOwner.third_party_id;
            $scope.report.third_party_name = $scope.customerReportOwner.third_party_name;
            $scope.report.sponser_id = $scope.customerReportOwner.sponser_id;
            $scope.report.sponser_name = $scope.customerReportOwner.sponser_name;
            $scope.updateDreaftReport();
        }

        // HSE Tracking landing page 
        $scope.allRescentReportOptions = coreService.getAllRecentReport();

        $scope.contactToReportedBy = function(){

        }



    };
    controller.$inject = ['$scope', '$uibModal', 'coreReportService', 'coreService', '$state', '$q', '$filter', 'constantService', 'customersService', '$stateParams'];
    angular.module("coreReportModule").controller("coreReportController", controller);
}());