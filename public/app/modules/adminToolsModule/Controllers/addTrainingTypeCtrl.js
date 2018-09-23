(function () {
    
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm) {

        var init = function () {
            $scope.trainingTypeLabels = {};
            $scope.formlabels = constantService.getTrainingTypeLabels();
            angular.forEach($scope.formlabels, function (value, key) {
                $scope.trainingTypeLabels[key] = value;
            });
            console.log($scope.trainingTypeLabels);
            console.log($rootScope.isNew);
            $scope.disabled = true;
            
            if ($rootScope.isNew) {
                $scope.disabled = false;
                $scope.trainingType = {};
                $scope.pageTitle = "Add new training type";
            }
            else{
                $scope.trainingType = $rootScope.selectedProv ;
                $scope.trainingType.recertificate_frequency = parseInt($rootScope.selectedProv.recertificate_frequency);
                $scope.trainingType.duration_of_training = parseInt($rootScope.selectedProv.duration_of_training);
                console.log($scope.trainingType);
                $scope.pageTitle = "Edit new training type";
            }
        };
        init();
        
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) { 
              if (coreService.getPreviousState() === 'ManageTrackingHSE') {  
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();

               $scope.trainingType.language_id= $scope.user.language_id;                   
                $scope.trainingType.added_by= $scope.user.employee_id;
                
                $scope.trainingType.org_id= $scope.user.org_id;
            }
           
        }, true);
        
         $scope.addTrainingType = function () {
            $scope.name_valid = '';
            if ($scope.trainingType.recertificate_frequency && $scope.trainingType.recertificate_frequency) {
                $scope.trainingType.recertificate_frequency = parseInt($scope.trainingType.recertificate_frequency);
            }
            if ($scope.trainingType.duration_of_training && $scope.trainingType.duration_of_training) {
                $scope.trainingType.duration_of_training = parseInt($scope.trainingType.duration_of_training);
            }
            console.log($scope.trainingType);
             customersService.updateTrainingType($scope.trainingType)
                .then(function (response) {
                    if (response.data.success === 2) {
                        $scope.name_valid = 'Invalid Training Type Name';
                    }else{
                        $state.go('ManageTrackingHSE', {grid: 'trainning_provider'});
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
         };
         $scope.updateInfo = function () {
            $scope.disabled = false;
         };

        $scope.Cancel = function () {
            $state.go('ManageTrackingHSE', {grid: 'trainning_provider'});
         };

    };
   
        
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm'];
    angular.module('adminModule')
            .controller('addTrainingTypeCtrl', controller);
}());

