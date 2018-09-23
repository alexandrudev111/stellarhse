/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {
    
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm, coreReportService) {
                $scope.sponser = {};
        var init = function () {
                $scope.thirdPartyLabels = {};
                $scope.frmlabels = constantService.getThirdPartyFormLabels();
                angular.forEach($scope.frmlabels, function (value, key) {
                    $scope.thirdPartyLabels[key] = value;
                });
                $scope.disabled = true;
                $scope.selectedThirdParty = {};
                if ($rootScope.isNew) {
                    $scope.disabled = false;
                    $scope.pageTitle = "Add a third party";
                }
                if($rootScope.selectedRowThirdParty){
                    $scope.Checker = true;
                    console.log($rootScope.selectedRowThirdParty);
                    $scope.sponser.employee_id = $rootScope.selectedRowThirdParty.sponser_id;
                    $scope.sponser.full_name = $rootScope.selectedRowThirdParty.sponser_name;
                    $scope.pageTitle = "Edit a third party";

                }
            };
        init();
        
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) { 
//            $scope.db = newVal;
//            if (coreService.getPreviousState() === 'thirdParties') { 
              if (coreService.getPreviousState() === 'ManageTrackingHSE') {  
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
//                if ($rootScope.isNew)
               var third_party_types_data = {
                    language_id: $scope.user.language_id,
                    org_id: $scope.user.org_id,
                    customer_checker: $rootScope.nocustomercheck
                };
                $q.all([
                    coreService.getcountry(),
                    customersService.statuslist($scope.user.language_id),
                    customersService.getLanguages(),
                    customersService.getThirdPartyTypes(third_party_types_data),
                    coreService.getUuid()
                ]).then(function (queues) {
                    $scope.countries = queues[0].data;
                    $scope.statuslist = queues[1].data;
                    $scope.languagelist = queues[2].data;
                    $scope.thirdpartytypes = queues[3].data;
                    $scope.selectedThirdParty.is_active = $scope.statuslist[0].item_id;
                    
                     if($scope.Checker){
                        $scope.selectedThirdParty = $rootScope.selectedRowThirdParty;
                        $scope.selectedThirdParty.org_id = $scope.user.org_id;
                       
                     }else{
                         $scope.selectedThirdParty.org_id = $scope.user.org_id;
                         $scope.selectedThirdParty.newId  = queues[4].data.success;
                     }
//                     console.log($scope.selectedThirdParty);
                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                    coreService.setAlert({type: 'exception', message: errors[3].data});
                    coreService.setAlert({type: 'exception', message: errors[4].data});
                    coreService.setAlert({type: 'exception', message: errors[5].data});
                });
            }
           
        }, true);
        
        $scope.$watch('selectedThirdParty.country_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getprovince(newVal, 'country_id');
            }
        });
        $scope.$watch('selectedThirdParty.province_id', function (newVal, oldVal) {
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
            }
        
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
        }

    
         $scope.addThirdPartyFunction = function () {
            $scope.selectedThirdParty.editing_by = coreService.getUser().employee_id;

            $scope.third_party_name_valid = '';
            if ($scope.selectedThirdParty.third_party_name) {
                console.log($scope.selectedThirdParty);
                 customersService.updateThirdParties($scope.selectedThirdParty)
                        .then(function (response) {
                            if (response.data.success === 2) {
                                $scope.third_party_name_valid = constantService.getMessage('third_party_name_exist');
                            } 
                            else{
//                                $state.go('thirdParties');
                                $state.go('ManageTrackingHSE', {grid: 'third_parties'});
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
            
         };
        
         $scope.updateInfo = function () {
            $scope.disabled = false;
         };

        $scope.getSponsers = function (query) {
            if ((!query) || query.length < 1)
                return [];
            
            query = " first_name LIKE '" + query + "%'";

            coreReportService.getEmployees({
                query: query,
                org_id: $scope.user['org_id']
            }).then(function (response) {
                var res = response.data;
                if (res) {
                    $scope.sponsers = res;
                }
            });
        };

        $scope.onSelectSponser = function (selected) {
            $scope.selectedThirdParty.sponser = selected ;
        };
        $scope.Cancel = function () {
            $state.go('ManageTrackingHSE', {grid: 'third_parties'});
         };
        
    };
   
        
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm', 'coreReportService'];
    angular.module('adminModule')
            .controller('addThirdPartyCtrl', controller);
}());

