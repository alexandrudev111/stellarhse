var myAppModule = angular.module('navModule', []);
myAppModule.controller("navController", function ($rootScope, $scope, $uibModal, coreService, userService, $state) {
    $scope.userOrgs = coreService.getUserOrgs();
    $scope.user = coreService.getUser();
    $scope.loggedonName = $scope.user.first_name + ' ' + $scope.user.last_name;
    $scope.login = coreService.getLogin();
    console.log($scope.login);

    $scope.permissions = coreService.getPermissions();
    $scope.products = coreService.getProducts();
    if($scope.products.Hazard || $scope.products.ABCanTrack || $scope.products.Inspection ||
        $scope.products.SafetyMeeting || $scope.products.Training || $scope.products.MaintenanceManagement)
        $scope.products.HSETracking = true;
        console.log($scope.products)
    coreService.setProducts($scope.products);
    if($scope.permissions.hasOwnProperty('Myaccount')){
        if($scope.permissions.Myaccount.fullmamangeprofile || $scope.permissions.Myaccount.accessloginhistory || 
            $scope.permissions.Myaccount.fullnotificationemail || $scope.permissions.Myaccount.fulltrainingrecords ||
            $scope.permissions.Myaccount.fullcorrectiveaction)
            $scope.permissions.Myaccount.myaccount = true;
        $scope.Myaccount = $scope.permissions.Myaccount;
    }
    console.log($scope.permissions)

    var org = {
        org_id: $scope.user.org_id,
        org_name: $scope.user.org_name,
        logourl: 'logo/' + $scope.user.org_id + '.gif'
    };
    $scope.currentOrg = org;
    $scope.switchUser = function (org) {
        coreService.switchUser(org).then(function (response) {
            if (!response.data.hasOwnProperty('file')) {
                console.log(response.data);
                coreService.setUser(response.data);
                userService.setUserGroups(response.data);
                $scope.currentOrg = org;
                $scope.products = coreService.getProducts();
                $scope.permissions = coreService.getPermissions();
                if($scope.products.Hazard || $scope.products.ABCanTrack || $scope.products.Inspection ||
                    $scope.products.SafetyMeeting || $scope.products.Training || $scope.products.MaintenanceManagement)
                    $scope.products.HSETracking = true;
                    console.log($scope.products)
                    coreService.setProducts($scope.products);
                if($scope.permissions.hasOwnProperty('Myaccount')){
                    if($scope.permissions.Myaccount.fullmamangeprofile || $scope.permissions.Myaccount.accessloginhistory || 
                        $scope.permissions.Myaccount.fullnotificationemail || $scope.permissions.Myaccount.fulltrainingrecords ||
                        $scope.permissions.Myaccount.fullcorrectiveaction)
                        $scope.permissions.Myaccount.myaccount = true;
                    $scope.Myaccount = $scope.permissions.Myaccount;
                }
                console.log($scope.permissions)
                $rootScope.$broadcast('switchUser', org);
                if(coreService.getCurrentState() === 'dashboard'){
                    $state.reload();
                }else{
                    $state.go('dashboard');
                }
                
            }
        }, function (error) {
            coreService.resetAlert();
            coreService.setAlert({type: 'exception', message: error.data});
        });
    }

    $scope.openInfo = function () {
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/navModule/views/navPopup.html',
            controller: 'navController'
        });
    };
    
    $scope.SupportPopup = function () {
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/navModule/views/SupportPopup.html',
            controller: 'navController'
        });
    };
    
    $scope.cancel = function () {
        $scope.$uibModalInstance.dismiss('cancel');
    };

    $(".navbar-nav li").click(function () {
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
    });
    
    $rootScope.clickDashboard = function () {
        var check = false;
        $rootScope.$broadcast('clickDashboard', check);
    }

    $rootScope.clickAnalytics = function () {
        var checkAnalytics = false;
        $rootScope.$broadcast('clickAnalytics', checkAnalytics);
    }

    $rootScope.clickHSE = function () {
        var checkHSE = false;
        $rootScope.$broadcast('clickHSE', checkHSE);
    }

    $rootScope.clickAdmin = function () {
        var checkAdmin = false;
        $rootScope.$broadcast('clickAdmin', checkAdmin);
    }
    
    
     $rootScope.clickHseProgram = function () {
        var checkHSeProgram = false;
        $rootScope.$broadcast('clickHseProgram', checkHSeProgram);
    }
    $rootScope.clickmyProfile = function () {
        var checkmyProfile = false;
        $rootScope.$broadcast('clickmyProfile', checkmyProfile);
    }
    $rootScope.showLearning = function () {
        var showLearningCenter = false;
        $rootScope.$broadcast('showLearning', showLearningCenter);
        
    }
    
    


 $scope.config = {
        autoHideScrollbar: false,
        theme: 'dark-thick',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 400,
        scrollInertia: 0
    };



    $scope.logout = function(){
        coreService.resetAlert();
        coreService.setLogin(true);
        coreService.setUser('');
        userService.setUserGroups('');
        coreService.setUserOrgs('');
        coreService.setExpiryDate();
        $state.go("login");
//        window.location.replace('https://newtemp.abcanada.com');
    };



});