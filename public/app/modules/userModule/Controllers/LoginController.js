(function () {
    var controller = function ($scope, userService, $state, coreService, activationCode, customersService, constantService) {
        $scope.invalid = true;
        var LocationLevel3 = true;
        var LocationLevel4 = true;

        $scope.activeUser = {
            password: '',
            confirm_password: '',
            activationCode: activationCode
        };

        $scope.user = {
            user_name: '',
            password: ''
        };
        
        $scope.$watch('user', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                var user_name = newVal.user_name;
                var password = newVal.password;
                if (user_name !== '' && password !== '') {
                } else {
                    $scope.invalid = true;
                    $scope.somewrong = true;
                    $scope.errorMessage = "Please enter your user name and password"
                }
            }
        }, true);

        function populateAllAlertMsgs() {
            var ret = '';
            var body = {
                LanguageId : $scope.userData.language_id
            };

            userService.getAllAlertMsgs(body).then(
                function(res){
                    var data = res.data;
                    if (data != null && data != '' && data != 'null' && data != '[]') {
                        localStorage.setItem('AllAlertMsgs', JSON.stringify(data));
                    }
                },
                function(err){
                    console.error(err);
                }
            );
            return ret;
        }

        function getUserPermissions(OrgId, EmployeeId){
            var data = {
                OrgId: $scope.userData.org_id,
                EmployeeId: $scope.userData.employee_id
            };
            userService.getUserPermissions(data)
                .then(function(res){
                    var data = res.data;
                    if (data !== null)
                    {
                        localStorage.setItem('UserPrivileges', JSON.stringify(data) );
                    }
                }, function(err){
                    console.error(err);
                    localStorage.removeItem('UserPrivileges');
                });
        }

        function getOrgSetting() {
            var oid = $scope.userData.org_id;
            localStorage.setItem('OrgId', oid);
            var body = {OrgId: oid };
            userService.getOrgnizationSetting(body)
                .then(function(res){
                    var data = res.data;
                    console.log(data);
                    if (data != null && data != '' && data != 'null' && data != '[]') {
                        localStorage.setItem('LocationLevel', data[0].LocationLevel);
                        localStorage.setItem('ShowCustomer', data[0].ShowCustomer);
                        if (data[0].LocationLevel == '3') {
                            $("#ManageLocation3History").css('display', 'inline-block');
                        }
                        else if (data[0].LocationLevel == '4') {
                            $("#ManageLocation3History").css('display', 'inline-block');
                            $("#ManageLocation4History").css('display', 'inline-block');
                        }
                        console.log('LocationLevel: ' + localStorage.getItem('LocationLevel'));
                    }
                },
                function (err) {
                    console.error(err);
                });
        }

        function FilterArray(res, searchValue, searchField) {
            //    console.table(res);
            var ret = '';
            if (res !== '' && res !== null) {
                
                var out = [];
                if (searchValue !== null) {
                    res.some(function (elm) {
                        if (elm[searchField] == searchValue) {
                            out.push(elm);
                        }
                    });
                    res = out;
                    ret = res;
                }
                return ret;
            }
        }

        function GetFieldLabel(fName) {
            var ret = '';
            var IncParams = new Object();
            IncParams.param = {"LanguageCode": localStorage.getItem("LanguageCode"), "OrgId": OrgId, "TabName": ''};
            $.ajax({
                type: "POST",
                url: "/abcantrackV2/api/index.php/GetColumnsLabels/",
                dataType: 'json',
                data: JSON.stringify(IncParams),
                async: false,
                success: function (data) {
                    if (data != null && data != '' && data != 'null' && data != '[]') {
                        var json = JSON.parse(data);
                        $.each(json, function (i, item) {
                            if (item.FieldName == fName) {
                                if (item.FieldLabel != '') {
                                    ret = item.FieldLabel.replace(/:/gi, '');
                                }
                            }
                        });
                    }
                },
                error: function (xr, status, exception) {
                    SaveUserException(xr.responseText, 'GetColumnsLabels', IncParams.param);
                    //OpenErrorDialog(xr.responseText, 'GetColumnsLabels', IncParams.param);
                    return false;
                }
            });
            return ret;
        }

          $scope.login = function () {
            userService.login($scope.user)
                    .then(function (response) {
                        console.log(response.data);
                        if (!response.data.hasOwnProperty('file')) {
                            if (response.data.hasOwnProperty('permissions')) {
                                coreService.resetAlert();
                                coreService.setLogin(false);
                                coreService.setUser(response.data);
                                $scope.userData = response.data;
                                userService.setUserGroups(response.data);
                                coreService.setUserOrgs(response.data.userOrganizations);
                                coreService.setExpiryDate();
                                localStorage.setItem('OrgName', response.data.org_name);
                                localStorage.setItem('LanguageCode', response.data.language_code);
                                getUserPermissions(response.data.org_id, response.data.employee_id);
                                $state.go("dashboard");
                            } else {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'error', message: 'User name or password not correct'});
                            }
                        } else {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: response.data});
                        }

                        getOrgSetting();
                        populateAllAlertMsgs();
                    }, function (response) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: response.data});
                    });
        };
        
        $scope.forgetPassword = function () {
        };
        
        $scope.$watch(activationCode, function (newVal) {
            console.log(coreService.getCurrentState());
            console.log(newVal);
            if (coreService.getCurrentState() === "sitelogin") {
                if (newVal != '') {
                    userService.siteuserlogin(activationCode)
                        .then(function (response) {
                            console.log(response.data);
                            if (!response.data.hasOwnProperty('file')) {
                                if (response.data.hasOwnProperty('permissions')) {
                                    coreService.resetAlert();
                                    coreService.setLogin(false);
                                    coreService.setUser(response.data);
                                    $scope.userData = response.data;
                                    userService.setUserGroups(response.data);
                                    coreService.setUserOrgs(response.data.userOrganizations);
                                    coreService.setExpiryDate();
                                    localStorage.setItem('OrgName', response.data.org_name);
                                    localStorage.setItem('LanguageCode', response.data.language_code);
                                    getUserPermissions(response.data.org_id, response.data.employee_id);
                                    $state.go("dashboard");
                                } else {
//                                                        coreService.resetAlert();
//                                                        coreService.setAlert({type: 'error', message: 'User name or password not correct'});
//                                                        $state.go("login");
                                    window.location.replace('https://newtemp.abcanada.com');
                                }
                            } else {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: response.data});
                            }

                            getOrgSetting();
                            populateAllAlertMsgs();
                        }, function (response) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: response.data});
                        });
                }
            }
        }, true);

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === "accountactiviation") {

                if (activationCode != '') {
                    customersService.checkActivation(activationCode)
                            .then(function (response) {
                                console.log(response.data);
                                if (!response.data.hasOwnProperty('file')) {
                                    if (response.data !== '1')
                                        window.location = coreService.getBaseUrl();
                                }
                            }, function (response) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: response.data});
                            });
                }
            }
        }, true);

        $scope.activateAccount = function () {
            console.log($scope.activeUser);
            if (activationCode != '') {
                customersService.activateAccount($scope.activeUser)
                        .then(function (response) {
                            console.log(response.data);
                            if (!response.data.hasOwnProperty('file')) {
                                console.log(response.data.success);
                                if (response.data.success == '1' || response.data.success == 1) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: constantService.getMessage('success_activation')});
                                    window.location = coreService.getBaseUrl();
                                } else {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'error', message: constantService.getMessage('activation_valid')});
                                }
                            }
                        }, function (response) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: response.data});
                        });
            }
        };
    };
    controller.$inject = ['$scope', 'userService', '$state', 'coreService', 'activationCode', 'customersService', 'constantService'];
    angular.module("userModule").controller("LoginController", controller);
}());