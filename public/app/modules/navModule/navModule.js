

(function () {
    var module = angular.module('navModule', []);

    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
            $stateProvider.state('nav',
                    {
                        url: '/nav',
                        templateUrl: 'app/modules/sidebarModule/views/sidebar.html',
                        controller: 'navController'
                    })
            
        }]);
}());