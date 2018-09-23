(function () {
    var controller = function ($scope, $rootScope, externalDataObj, constantService, analyticsService, uiGridConstants, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {

        $scope.externalDataObj = externalDataObj;
        if( $scope.externalDataObj.operation === 'update'){
            $scope.externalDataObj.org_year = parseInt($scope.externalDataObj.org_year);
        }
        
//        console.log($scope.externalDataObj);

    };
    controller.$inject = ['$scope', '$rootScope', 'externalDataObj', 'constantService', 'analyticsService', 'uiGridConstants', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('analyticsModule')
            .controller('analyticsDataCtrl', controller);
}());