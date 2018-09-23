
(function () {
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm) {

        var init = function () {
            $scope.customerLabels = {};
            $scope.frmlabels = constantService.getCustomerFormLabels();
            angular.forEach($scope.frmlabels, function (value, key) {
                $scope.customerLabels[key] = value;
            });
            $scope.disabled = true;


        };
        init();
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            $scope.db = newVal;
            coreService.setDB($scope.db);
            $scope.user = coreService.getUser();
            org_id = $scope.user.org_id;
            $scope.number_valid = constantService.getMessage('number_valid');
            // $scope.checkEmail = constantService.getMessage('checkEmail');
            $q.all([
                coreService.getcountry(),
                customersService.getSupervisorList({org_id: org_id}),
                customersService.statuslist($scope.user.language_id),
                customersService.getLanguages(),
                customersService.productList(),
                customersService.getCustomerData({org_id: org_id}),
            ]).then(function (queues) {
                $scope.countries = queues[0].data;
                $scope.orgemployees = queues[1].data;
                $scope.statuslist = queues[2].data;
                $scope.languagelist = queues[3].data;
                $scope.productlist = queues[4].data;
                console.log("mowafy"+$scope.countries);
                $scope.selectedCustomer = queues[5].data[0];
                customersService.orgProducts($scope.selectedCustomer.org_id)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.orgproducts = response.data;
                                angular.forEach($scope.productlist, function (product) {
                                    if (angular.isDefined($filter('filter')($scope.orgproducts, {
                                        product_id: product.product_id})[0])) {
                                        product.product_choice = true;
                                    }
                                });
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });

                $scope.orgLogo = '../logo/'+ $scope.selectedCustomer.org_id + '.gif';
            }, function (errors) {
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
                coreService.setAlert({type: 'exception', message: errors[2].data});
                coreService.setAlert({type: 'exception', message: errors[3].data});
                coreService.setAlert({type: 'exception', message: errors[4].data});
                coreService.setAlert({type: 'exception', message: errors[5].data});
            });

        }, true);
        $scope.$watch('selectedCustomer.country_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getprovince(newVal, 'country_id');
            }
        });
        $scope.$watch('selectedCustomer.province_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getcity(newVal, 'province_id');
            }
        });
        $scope.$watch('selectedCustomer.billing_country_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getprovince(newVal, 'billing_country_id');
            }
        });
        $scope.$watch('selectedCustomer.billing_province_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                getcity(newVal, 'billing_province_id');
            }
        });
        var getprovince = function (country_id, arrayFrom) {
            coreService.getprovince(country_id)
                    .then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            if (arrayFrom === 'country_id') {
                                $scope.provinces = response.data;
                                if (response.data[0].length)
                                    $scope.selectedCustomer.province_id = response.data[0].province_id;
                            } else {
                                $scope.billing_provinces = response.data;
                                if (response.data[0].length)
                                    $scope.selectedCustomer.billing_province_id = response.data[0].province_id;
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
                                    $scope.selectedCustomer.city_id = response.data[0].city_id;
                            } else {
                                $scope.billing_cities = response.data;
                                if (response.data[0].length)
                                    $scope.selectedCustomer.billing_city_id = response.data[0].city_id;
                            }
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }

        $scope.uploadOrgLogo = function () {
            var $file = $scope.selectedCustomer.logo;
            if ($file) {
                var data = {
                    filename: $file.name,
                    org_id: $scope.selectedCustomer.org_id
                }
                var url = "upload_logo.php";
                coreService.resetAlert()
                coreService.setAlert({type: 'wait', message: 'Uploading file ... Please wait'});
                var upload = Upload.upload({
                    url: url,
                    methos: "POST",
                    fields: data,
                    file: $file
                })
                upload.then(function (response) {

                    $scope.orgLogo = '../logo/' + $scope.selectedCustomer.org_id + '.gif' + "?time=" + new Date().getTime();

                    $('.img-' + $scope.selectedCustomer.org_id).attr('src', '../logo/' + $scope.selectedCustomer.org_id + '.gif' + "?time=" + new Date().getTime());

                    if (response.data.hasOwnProperty('success')) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'info', message: 'Files uploaded successfully.'});
                    }
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: response.data})
                });
            }
        }

        $scope.updateInfo = function () {
            $scope.disabled = false;
        };

        $scope.addCompany = function () {
            $scope.selectedCustomer.products = [];
            $scope.selectedCustomer.updated_by_id = $scope.user.employee_id;
            angular.forEach($scope.productlist, function (product) {
                if (product.hasOwnProperty('product_choice')) {
                    if (product.product_choice)
                        $scope.selectedCustomer.products.push(product.product_id);
                }
            })

            console.log($scope.selectedCustomer.products.length);
            if (!$scope.selectedCustomer.products.length) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('product_valid')});
            }
            else {
                customersService.updateCustomer($scope.selectedCustomer)
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('file')) {
                                $scope.org_name_valid = '';
                                if (response.data.success === 2) {
                                    $scope.org_name_valid = constantService.getMessage('org_name_valid');
                                } else {
                                    if ($rootScope.isNew)
                                        $scope.addCompanyAdmin();
                                    else
                                        $state.go('customers');
                                }
                            }
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
        }

        $scope.saveCompanyAdmin = function () {
            console.log($scope.selectedAdmin);
            customersService.addCustomerAdminEmail($scope.selectedAdmin)
                    .then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            console.log(response.data.found);
                            if (response.data.found) {
                                // email found in db                            
                                $scope.$uibModalInstance2 = $uibModal.open({
                                    animation: $scope.animationsEnabled,
                                    templateUrl: 'app/modules/adminToolsModule/views/reAssign.html',
                                    controller: 'myCompanyInfoCtrl',
                                    scope: $scope,
                                    resolve: {
                                        item: function () {
                                            $scope.selectedEmployee = response.data.employeeinfo[0];
                                        }
                                    }
                                });
                            } else {
                                $scope.$uibModalInstance2.close('cancel');
                                coreService.resetAlert();
                                coreService.setAlert({type: 'success', message: constantService.getMessage('add_admin')});
                                $state.go('customers');
                            }
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }

        $scope.assignAdminToCompany = function () {
            console.log($scope.selectedAdmin);
            var post = {
                org_id: $scope.selectedAdmin.org_id,
                group_id: $scope.selectedAdmin.group_id,
                employee_id: $scope.selectedEmployee.employee_id,
                department: $scope.selectedEmployee.department,
                company: $scope.selectedEmployee.company,
                direct_access_code: $scope.selectedEmployee.direct_access_code,
                updated_by_id: $scope.user.employee_id
            };
            customersService.assignAdminToCompany(post)
                    .then(function (response) {
                        if (!response.data.hasOwnProperty('file')) {
                            $scope.cancel();
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: constantService.getMessage('add_admin')});
                            $state.go('customers');
                        }
                    }, function (error) {
                        $scope.cancel();
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }

        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
            if (angular.isDefined($scope.$uibModalInstance2))
                $scope.$uibModalInstance2.close('cancel');
        }
        $scope.validEmail = function () {
            $scope.checkEmail = '';
            var value = $scope.selectedCustomer.email;
            if (angular.isDefined(value))
                if (!value.match(/^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/) && value !== null && value !== '') {
                    $scope.checkEmail = constantService.getMessage('checkEmail');
                }
        };

    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm'];
    angular.module('adminModule')
            .controller('myCompanyInfoCtrls', controller);
}());

