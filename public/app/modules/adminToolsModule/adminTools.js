(function () {
    var admin = angular.module('adminModule', [
        'manageGroupsModule',
        'manageHseProgramModule']);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("MyCompanyInfo", {
                        url: "/MyCompanyInfo",
                        templateUrl: "app/modules/adminToolsModule/views/MyCompanyInfo.html",
                        controller: "myCompanyInfoCtrls"
                    })
                    .state("customers", {
                        url: "/customers",
                        templateUrl: "app/modules/adminToolsModule/views/customers.html",
                        controller: "customersCtrl"
                    })
                    .state("customerhistory", {
                        url: "/customerhistory",
                        templateUrl: "app/modules/adminToolsModule/views/customerhistory.html",
                        controller: "customerHistoryCtrl"
                    })
                    .state("addCustomer", {
                        url: "/addCustomer",
                        templateUrl: "app/modules/adminToolsModule/views/addCustomer.html",
                        controller: "addCustomerCtrl"
                    })
                    .state("ManagePeople", {
                         url: "/ManagePeople", 
                        templateUrl: "app/modules/adminToolsModule/views/ManagePeople.html", 
                        controller: "manageHseTracking", 
                        params: { 
                            grid: null 
                        } 
                    })

                    .state("trainingProviderHistory", {
                        url: "/trainingProviderHistory",
                        templateUrl: "app/modules/adminToolsModule/views/trainingProviderHistory.html",
                        controller: "providerHistoryCtrl"
                    })
                    .state("trainingTypeHistory", {
                        url: "/trainingTypeHistory",
                        templateUrl: "app/modules/adminToolsModule/views/trainingTypeHistory.html",
                        controller: "trainingTypeHistoryCtrl"
                    })


                    .state("addPeople", {
                        url: "/addPeople",
                        templateUrl: "app/modules/adminToolsModule/views/addPerson.html",
                        controller: "addPeopleCtrl"
                    })

                    .state("peoplehistory", {
                        url: "/peoplehistory",
                        templateUrl: "app/modules/adminToolsModule/views/peoplehistory.html",
                        controller: "peopleHistoryCtrl"
                    })


                    .state("editPeople", {
                        url: "/editPeople",
                        templateUrl: "app/modules/adminToolsModule/views/editPerson.html",
                        controller: "myCompanyInfoCtrl"
                    })

                    .state("Location", {
                        url: "/Location",
                        templateUrl: "app/modules/adminToolsModule/views/location.html",
                        controller: "allLocationsCtrl"
                    })

                    .state("AddLocation", {
                        url: "/AddLocation",
                        templateUrl: "app/modules/adminToolsModule/views/AddLocation.html",
                        controller: "addLocationCtrl"
                    })

                    .state("thirdParties", {
                        url: "/thirdParties",
                        templateUrl: "app/modules/adminToolsModule/views/ThirdParties.html",
                        controller: "thirdPartiesCtrl"
                    })

                    .state("addThirdParties", {
                        url: "/addThirdParties",
                        templateUrl: "app/modules/adminToolsModule/views/addThirdParties.html",
                        controller: "addThirdPartyCtrl"
                    })

                    .state("editThirdParties", {
                        url: "/editThirdParties",
                        templateUrl: "app/modules/adminToolsModule/views/EditThirdParties.html",
                        controller: "myCompanyInfoCtrl"
                    })



                    .state("ThirdPartiesHistory", {
                        url: "/ThirdPartiesHistory",
                        templateUrl: "app/modules/adminToolsModule/views/ThirdPartiesHistory.html",
                        controller: "thirdPartiesHistoryCtrl"
                    })

                    .state("ManageCompanyProcedure", {
                        url: "/ManageCompanyProcedure",
                        templateUrl: "app/modules/adminToolsModule/views/ManageCompanyProcedures.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("addCompanyProcedure", {
                        url: "/addCompanyProcedure",
                        templateUrl: "app/modules/adminToolsModule/views/AddCompanyProcedure.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("editCompanyProcedure", {
                        url: "/editCompanyProcedure",
                        templateUrl: "app/modules/adminToolsModule/views/editCompanyProcedure.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("ManageMessagesandNotes", {
                        url: "/ManageMessagesandNotes",
                        templateUrl: "app/modules/adminToolsModule/views/ManageMessagesandNotes.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("ManageTrackingHSE", {
                        url: "/ManageTrackingHSE",
                        templateUrl: "app/modules/adminToolsModule/views/ManageTrackingHSE.html",
                        controller: "manageHseTracking", 
                        params: { 
                            grid: null 
                        } 
                    })
                    .state("ManageUserAndAccounts", {
                        url: "/ManageUserAndAccounts",
                        templateUrl: "app/modules/adminToolsModule/views/ManageUserAndAccounts.html",
                        controller: "PermissionCtrl"
                    })
                    .state("addTraining", {
                        url: "/addTraining",
                        templateUrl: "app/modules/adminToolsModule/views/addTraining.html",
                        controller: "addTrainingCtrl",
                        resolve: {
                            item: function () {
                                return null;
                            }}
                    })
                    .state("editTraining", {
                        url: "/editTraining",
                        templateUrl: "app/modules/adminToolsModule/views/editTraining.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("addTrainingType", {
                        url: "/addTrainingType",
                        templateUrl: "app/modules/adminToolsModule/views/addTrainingType.html",
                        controller: "addTrainingTypeCtrl"
                    })
                    .state("EditTrainingType", {
                        url: "/EditTrainingType",
                        templateUrl: "app/modules/adminToolsModule/views/EditTrainingType.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("addEquipment", {
                        url: "/addEquipment",
                        templateUrl: "app/modules/adminToolsModule/views/addEquipment.html",
                        controller: "addEquipmentCtrl"
                    })
                    .state("editEquipment", {
                        url: "/editEquipment",
                        templateUrl: "app/modules/adminToolsModule/views/editEquipment.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("ManageTrackingHSEProcedure", {
                        url: "/ManageTrackingHSEProcedure",
                        templateUrl: "app/modules/adminToolsModule/views/ManageTrackingHSEProcedures.html",
                        controller: "myCompanyInfoCtrl"
                    })
                    .state("addNewPermission", {
                        url: "/addNewPermission",
                        templateUrl: "app/modules/adminToolsModule/views/addNewPermission.html",
                        controller: "PermissionCtrl"

                    })
                    .state("addNewUserAccount", {
                        url: "/addNewUserAccount",
                        templateUrl: "app/modules/adminToolsModule/views/addNewUserAccount.html",
                        controller: "myCompanyInfoCtrl"
                    })

                    .state("equipmentHistory", {
                        url: "/equipmentHistory",
                        templateUrl: "app/modules/adminToolsModule/views/equipmentHistory.html",
                        controller: "equipmentHistoryCtrl"
                    })

                    .state('administrativeTools', {
                        url: '/administrativeTools',
                        templateUrl: 'app/modules/adminToolsModule/views/administrativeTools.html',
                        controller: "AddMaintenanceReportController"
                    })
        }]);
}());