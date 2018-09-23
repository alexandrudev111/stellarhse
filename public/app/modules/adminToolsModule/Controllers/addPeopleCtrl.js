/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm) {
        var init = function () {
            $scope.peopleLabels = {};
            $scope.frmlabels = constantService.getManagePeopleFormLabels();
            angular.forEach($scope.frmlabels, function (value, key) {
                $scope.peopleLabels[key] = value;
            });
            $scope.disabled = true;
            $scope.user_required = false;
            $scope.user_account = false;
            $scope.selectedPerson = {};
            if ($rootScope.isNewPeople) {
                $scope.disabled = false;
                // $scope.selectedPerson.check_ques = 'no';
            }
            if ($rootScope.selectedRowEmployee) {
                $scope.Checker = true;
            }

        };
        init();

        $scope.validEmail = function () {
            $scope.checkEmail = '';
            $scope.checkEmailUser = '';
            var value = $scope.selectedPerson.email;
            if (angular.isDefined(value)) {
                if (!value.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/) && value !== null && value !== '') {
                    $scope.checkEmail = constantService.getMessage('checkEmail');
                }
                customersService.CheckEmail({email: $scope.selectedPerson.email, employee_id: $scope.selectedPerson.employee_id})
                        .then(function (response) {
                            result = response.data;
                            if (result[0].count > 0) {
                                $scope.checkEmailUser = constantService.getMessage('checkEmailUser');
                            }
                        });
            }
        };


        $scope.groupChange = function () {
            $scope.selectedPerson.group_name = $filter('filter')($scope.groupList, {group_id: $scope.selectedPerson.group_id})[0].group_name;

            if($scope.selectedPerson.group_id !==''){
                customersService.getGroupProducts($scope.selectedPerson.group_id)
                        .then(function (response) {
                            $scope.groupproducts = response.data;
                            angular.forEach($scope.productlist, function (product) {
                                if (angular.isDefined($filter('filter')($scope.groupproducts, {
                                    product_id: product.product_id})[0])) {
                                    product.product_choice = true;
                                } else {
                                    product.product_choice = false;
                                }
                            });

                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
        };

        $scope.accountTypeChecker = function () {
            if ($scope.selectedPerson.group_name === 'No access'|| $scope.selectedPerson.group_name==='Notifications only') {
                $scope.user_account = false;
                $scope.user_required = false;
                
            } else  {
                $scope.user_account = true;
                $scope.user_required = true;
            }
        };

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getPreviousState() === 'ManagePeople') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $scope.org_id = $scope.user.org_id;
                $scope.language_id = $scope.user.language_id;
                var crew_data = {
                    lang_id: $scope.user.language_id,
                    org_id: $scope.user.org_id
                };
                $q.all([
                    coreService.getcountry(),
                    customersService.statuslist($scope.user.language_id),
                    customersService.getLanguages(),
                    customersService.getCrews(crew_data),
                    customersService.getClassifications($scope.language_id),
                    customersService.getActiveGroupsByOrgId(crew_data),
                    customersService.productListByOrgId($scope.org_id),
                    coreService.getUuid(),
                    coreService.getSecurityQuestion()
                ]).then(function (queues) {
                    $scope.countries = queues[0].data;
                    $scope.statuslist = queues[1].data;
                    $scope.languagelist = queues[2].data;
                    $scope.crewList = queues[3].data;
                    $scope.classificationList = queues[4].data;
                    $scope.groupList = queues[5].data;
                    $scope.productlist = queues[6].data;
                    $scope.securityquestion = queues[8].data;
                    if ($scope.Checker) {
                        $scope.selectedPerson = $rootScope.selectedRowEmployee;
                        $scope.selectedPerson.operation = 'update';
                        $scope.user_account = $rootScope.selectedRowEmployee.user_account;
                        $scope.selectedPerson.org_id = $scope.user.org_id;
                        $scope.selectedPerson.old_group = $scope.selectedPerson.group_id;
                        $rootScope.selectedRowEmployee = false;
                        $scope.groupChange();
                    } else {
                        $scope.selectedPerson.org_id = $scope.user.org_id;
                        $scope.selectedPerson.newId = queues[7].data.success;
                        $scope.selectedPerson.updated_by = $scope.user.employee_id;
                        $scope.selectedPerson.operation = 'add';
                    }
                    
                    $scope.selectedPerson.language_id = $scope.user.language_id;
                    $scope.selectedPerson.editing_by = $scope.user.employee_id;
                    


                }, function (errors) {
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

        }, true);

        $scope.$watch('selectedPerson.country_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getprovince(newVal, 'country_id');
            }
        });
        $scope.$watch('selectedPerson.province_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getcity(newVal, 'province_id');
            }
        });

        var getprovince = function (country_id, arrayFrom) {
            coreService.getprovince(country_id)
                    .then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            if (arrayFrom === 'country_id') {
                                $scope.provinces = response.data;
                                if (response.data[0].length)
                                    $scope.selectedThirdParty.province_id = response.data[0].province_id;
                            } else {
                                $scope.billing_provinces = response.data;
                                if (response.data[0].length)
                                    $scope.selectedThirdParty.billing_province_id = response.data[0].province_id;
                            }
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        var getcity = function (province_id, arrayFrom) {
            coreService.getcity(province_id)
                    .then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            if (arrayFrom === 'province_id') {
                                $scope.cities = response.data;
                                if (response.data[0].length)
                                    $scope.selectedThirdParty.city_id = response.data[0].city_id;
                            } else {
                                $scope.billing_cities = response.data;
                                if (response.data[0].length)
                                    $scope.selectedThirdParty.billing_city_id = response.data[0].city_id;
                            }
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };

        $scope.getActiveEmployees = function (empLetters) {
            if (empLetters !== '' && empLetters !== null) {
                userData = {org_id: $scope.user.org_id, keyWord: empLetters};
                customersService.getMatchedActiveUsers(userData).
                        then(function (response) {
                            $scope.activeEmployees = response.data;
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
        };

        $scope.updateInfo = function () {
            $scope.disabled = false;
        };

        $scope.addPeopleFunction = function () {
            $scope.selectedPerson.language_id=$scope.user.language_id;
            if(!$scope.selectedPerson.group_name === 'No access')
            {
                customersService.CheckEmail({email: $scope.selectedPerson.email, employee_id: $scope.selectedPerson.employee_id})
                    .then(function (response) {
                        result = response.data;
                        if (result[0].count > 0) {
                            $scope.checkEmailUser = constantService.getMessage('checkEmailUser');
                        } else {
                            if ($scope.selectedPerson.first_name && $scope.selectedPerson.last_name && $scope.selectedPerson.email) {
                                customersService.submitPeopleFunction($scope.selectedPerson)
                                        .then(function (response) {
                                            if(response.data.hasOwnProperty('success_add') == 1){
                                                coreService.resetAlert();
                                                coreService.setAlert({type: 'success', message: "The user has been added successfully"});
                                                // $state.go('ManagePeople');
                                                $state.go('ManagePeople', {grid: 'people'});
                                            }
                                            else if(response.data.hasOwnProperty('success_edit') == 1){
                                                coreService.resetAlert();
                                                coreService.setAlert({type: 'success', message: "The person has been updated successfully"});
                                                // $state.go('ManagePeople');
                                                $state.go('ManagePeople', {grid: 'people'});
                                            }
                                            
                                            
                                        }, function (error) {
                                            coreService.resetAlert();
                                            coreService.setAlert({type: 'exception', message: error.data});
                                        });
                                        $state.go('ManagePeople', {grid: 'people'});
                            }
                        }
                    });
                    // $state.go('ManagePeople', {grid: 'people'});

            } else {
                console.log("I am person");
                if ($scope.selectedPerson.first_name && $scope.selectedPerson.last_name ) {
                    customersService.submitPeopleFunction($scope.selectedPerson)
                            .then(function (response) {
                                if(response.data.hasOwnProperty('success_add') == 1){
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: "The person has been added successfully"});
                                    // $state.go('ManagePeople');
                                    $state.go('ManagePeople', {grid: 'people'});
                                }
                                else if(response.data.hasOwnProperty('success_edit') == 1){
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: "The person has been updated successfully"});
                                    // $state.go('ManagePeople');
                                    $state.go('ManagePeople', {grid: 'people'});
                                }
                                
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                            // $state.go('ManagePeople', {grid: 'people'});
                            
                }
            
            }

            
            

        };


    };

    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm'];
    angular.module('adminModule')
            .controller('addPeopleCtrl', controller);
}());


