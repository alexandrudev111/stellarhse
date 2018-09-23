(function () {
    var module = angular.module('userModule', ['ui.router']);
    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state("login", {
                        url: "/login",
                        templateUrl: "app/modules/userModule/views/login.html",
                        controller: "LoginController",
                        resolve: {
                            activationCode: function ($stateParams) {
                                return '';
                            }
                        }
                    })

                    .state("sitelogin", {
                        url: "/sitelogin/:act_code",
                        controller: "LoginController",
                        resolve: {
                            activationCode: function ($stateParams) {
                                return $stateParams.act_code;
                            }
                        }
                    })
                    .state("forgetpassword", {
                        url: "/forgetpassword",
                        templateUrl: "app/modules/userModule/views/forgetpassword.html",
                        controller: "LoginController"
                    })
                    .state("accountactiviation", {
                        url: "/accountactiviation/:act_code",
                        templateUrl: "app/modules/userModule/views/accountactivation.html",
                        controller: "LoginController",
                        resolve: {
                            activationCode: function ($stateParams) {
                                return $stateParams.act_code;
                            }
                        }
                    })
                 .state("tutorials", {
                        url: "/tutorials",
                        templateUrl: "app/modules/userModule/views/tutorial.html",
                        controller: "tutorialController",
                      
                    })
                 
        }]);
}());