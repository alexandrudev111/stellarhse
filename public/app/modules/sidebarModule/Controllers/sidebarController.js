angular.module('sidebarModule', []).controller('sidebarController', function ($rootScope, $scope, coreService) {
    $scope.oneAtATime = true;
    $scope.user = coreService.getUser();
    $scope.permissions = coreService.getPermissions();
    $scope.products = coreService.getProducts();
    
    console.log($scope.permissions);
    
    $scope.status = {
        isFirstOpen: false,
        isSecondOpen: false,
        manage: false,
        isThirdOpen: false,
        isFourthOpen: false,
        isFifthOpen: false,
        isSixOpen: false,
        isSevenOpen: false,
        isEightOpen: false,
        isNineOpen: true,
        isElevenOpen: true,
        isTenOpen: true
    };
    var init = function () {
        console.log($scope.user)
        console.log($scope.permissions)
        if ($scope.permissions.hasOwnProperty('Analytics')) {
            $scope.Analytics = $scope.permissions.Analytics;
        }
        if ($scope.permissions.hasOwnProperty('Myaccount')) {
            if ($scope.permissions.Myaccount.fullmamangeprofile || $scope.permissions.Myaccount.accessloginhistory ||
                    $scope.permissions.Myaccount.fullnotificationemail || $scope.permissions.Myaccount.fulltrainingrecords ||
                    $scope.permissions.Myaccount.fullcorrectiveaction)
                $scope.permissions.Myaccount.myaccount = true;
            $scope.Myaccount = $scope.permissions.Myaccount;
        }
        if ($scope.permissions.hasOwnProperty('myadmintools')) {
            if ($scope.permissions.myadmintools.add_edit_formfields || $scope.permissions.myadmintools.add_editlocations ||
                    $scope.permissions.myadmintools.add_editthirdparty || $scope.permissions.myadmintools.add_editoperationtype ||
                    $scope.permissions.myadmintools.add_edittrainingtype || $scope.permissions.myadmintools.add_editproviders ||
                    $scope.permissions.myadmintools.add_editequipment)
                $scope.permissions.myadmintools.add_editreportforms = true;
            if ($scope.permissions.myadmintools.create_edit_deletesharedfolder || $scope.permissions.myadmintools.sharefolderanyorall ||
                    $scope.permissions.myadmintools.view_deleteprivatefolderdoc)
                $scope.permissions.myadmintools.add_edithsedocuments = true;
            if ($scope.permissions.myadmintools.peopleandgroup || $scope.permissions.myadmintools.reassignmemberstodiffgroups ||
                    $scope.permissions.myadmintools.deactivatemember || $scope.permissions.myadmintools.viewmemberloginhistory ||
                    $scope.permissions.myadmintools.createnewgrouppasedold || $scope.permissions.myadmintools.viewmembersession ||
                    $scope.permissions.myadmintools.viewmemberprofilehistory || $scope.permissions.myadmintools.exportreport)
                $scope.permissions.myadmintools.manage_people = true;
            if ($scope.permissions.myadmintools.addupdateremovehseprocedures || $scope.permissions.myadmintools.sharetutorialpage)
                $scope.permissions.myadmintools.manage_procedures = true;
            $scope.myadmintools = $scope.permissions.myadmintools;
            console.log($scope.myadmintools)
        }
    }
    init();

    $rootScope.$on('switchUser', function (event, params) {
        $scope.user = coreService.getUser();
        console.log(params);
        $scope.permissions = coreService.getPermissions();
        $scope.products = coreService.getProducts();
        console.log($scope.permissions)
        if ($scope.permissions.hasOwnProperty('Analytics')) {
            $scope.Analytics = $scope.permissions.Analytics;
        }
        if ($scope.permissions.hasOwnProperty('Myaccount')) {
            if ($scope.permissions.Myaccount.fullmamangeprofile || $scope.permissions.Myaccount.accessloginhistory ||
                    $scope.permissions.Myaccount.fullnotificationemail || $scope.permissions.Myaccount.fulltrainingrecords ||
                    $scope.permissions.Myaccount.fullcorrectiveaction)
                $scope.permissions.Myaccount.myaccount = true;
            $scope.Myaccount = $scope.permissions.Myaccount;
        }
        if ($scope.permissions.hasOwnProperty('myadmintools')) {
            if ($scope.permissions.myadmintools.add_edit_formfields || $scope.permissions.myadmintools.add_editlocations ||
                    $scope.permissions.myadmintools.add_editthirdparty || $scope.permissions.myadmintools.add_editoperationtype ||
                    $scope.permissions.myadmintools.add_edittrainingtype || $scope.permissions.myadmintools.add_editproviders ||
                    $scope.permissions.myadmintools.add_editequipment)
                $scope.permissions.myadmintools.add_editreportforms = true;
            if ($scope.permissions.myadmintools.create_edit_deletesharedfolder || $scope.permissions.myadmintools.sharefolderanyorall ||
                    $scope.permissions.myadmintools.view_deleteprivatefolderdoc)
                $scope.permissions.myadmintools.add_edithsedocuments = true;
            if ($scope.permissions.myadmintools.peopleandgroup || $scope.permissions.myadmintools.reassignmemberstodiffgroups ||
                    $scope.permissions.myadmintools.deactivatemember || $scope.permissions.myadmintools.viewmemberloginhistory ||
                    $scope.permissions.myadmintools.createnewgrouppasedold || $scope.permissions.myadmintools.viewmembersession ||
                    $scope.permissions.myadmintools.viewmemberprofilehistory || $scope.permissions.myadmintools.exportreport)
                $scope.permissions.myadmintools.manage_people = true;
            if ($scope.permissions.myadmintools.addupdateremovehseprocedures || $scope.permissions.myadmintools.sharetutorialpage)
                $scope.permissions.myadmintools.manage_procedures = true;
            $scope.myadmintools = $scope.permissions.myadmintools;
            console.log($scope.myadmintools)
        }
        $scope.check = false;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.checkAdmin = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        //  $scope.currentOrg = params;
    });

    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isFirstDisabled: false
    };

    $scope.config = {
        autoHideScrollbar: false,
        theme: 'dark-thick',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 550,
        scrollInertia: 0
    };

    $scope.check = false;
    $scope.checkAnalytics = true;
    $scope.checkHSE = true;
    $scope.checkAdmin = true;
    $scope.checkHSeProgram = true;
    $scope.checkManageHSeProgram = true;
    $scope.checkmyProfile = true;
    $scope.showLearningCenter = true;

    $rootScope.$on('clickDashboard', function (event, params) {
        $scope.check = false;
        $scope.checkAnalytics = true;
        $scope.checkAdmin = true;
        $scope.checkHSE = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = true;

    });

    $rootScope.$on('clickHSE', function (event, params) {
        $scope.checkHSE = false;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkAdmin = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = true;

    });

    $rootScope.$on('clickAnalytics', function (event, params) {
        $scope.checkAnalytics = false;
        $scope.check = true;
        $scope.checkAdmin = true;
        $scope.checkHSE = true;
        $scope.status.isElevenOpen = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = true;

    });

    $rootScope.$on('clickAdmin', function (event, params) {
        $scope.checkAdmin = false;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.status.isNineOpen = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = true;

    });

    $rootScope.$on('clickHseProgram', function (event, params) {
        $scope.checkAdmin = true;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.status.isNineOpen = true;
        $scope.checkHSeProgram = false;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = true;

    });

    $rootScope.$on('showLearning', function (event, params) {
        $scope.checkAdmin = true;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.status.isNineOpen = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = true;
        $scope.showLearningCenter = false;

    });

    $scope.clickManageHseProgram = function () {
        $scope.checkAdmin = true;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.status.isNineOpen = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = false;
        $scope.checkmyProfile = true;
        $scope.checkLearningCenter = true;
    };

   $rootScope.$on('clickmyProfile', function (event, params) {
        $scope.checkAdmin = true;
        $scope.check = true;
        $scope.checkAnalytics = true;
        $scope.checkHSE = true;
        $scope.status.isNineOpen = true;
        $scope.checkHSeProgram = true;
        $scope.checkManageHSeProgram = true;
        $scope.checkmyProfile = false;
        $scope.checkLearningCenter = true;
    });

    // popover
    $scope.dynamicPopover = {

        templateUrl: 'myPopoverTemplate.html'
    };

    $scope.dynamicPopover2 = {

        templateUrl: 'Recommendedtraining.html'
    };

    $scope.dynamicPopover3 = {

        templateUrl: 'Supervisors.html'
    };

    $scope.dynamicPopover4 = {

        templateUrl: 'GeneralUsers.html'
    };

    // tree control
    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: true,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    }

    $scope.open = true;
    $scope.OpenSub = function () {
        $scope.open = !$scope.open;
    }
    $scope.openit = false;
    $scope.OpenReport = function () {
        $scope.openit = !$scope.openit;
    }

    $scope.isActive = false;
    $scope.isActive2 = false;
    $scope.isActive3 = false;
    $scope.isActive4 = false;
    $scope.isActive5 = false;
    $scope.isActive6 = false;
    $scope.isActive7 = false;
    $scope.isActive8 = false;
    $scope.isActive9 = false;
    $scope.isActive10 = false;
    $scope.isActive11 = false;
    $scope.isActive12 = false;
    $scope.isActive13 = false;
    $scope.isActive14 = false;
    $scope.isActive15 = false;

    $scope.activeButton = function () {
        $scope.isActive = true;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;

        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton2 = function () {
        $scope.isActive = false;
        $scope.isActive2 = true;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton2 = function () {
        $scope.isActive = false;
        $scope.isActive2 = true;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton3 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = true;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton4 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = true;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton5 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = true;
        $scope.isActive6 = false;
    }

    $scope.activeButton6 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = true;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }
    
    $scope.activeButton7 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = true;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton8 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = true;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton9 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = true;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton10 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = true;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton11 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = true;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton12 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = true;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = true;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton13 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = true;
        $scope.isActive14 = false;
        $scope.isActive15 = false;
    }

    $scope.activeButton14 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = true;
        $scope.isActive15 = false;
    }

    $scope.activeButton15 = function () {
        $scope.isActive = false;
        $scope.isActive2 = false;
        $scope.isActive3 = false;
        $scope.isActive4 = false;
        $scope.isActive5 = false;
        $scope.isActive6 = false;
        $scope.isActive7 = false;
        $scope.isActive8 = false;
        $scope.isActive9 = false;
        $scope.isActive10 = false;
        $scope.isActive11 = false;
        $scope.isActive12 = false;
        $scope.isActive13 = false;
        $scope.isActive14 = false;
        $scope.isActive15 = true;

    }
});
