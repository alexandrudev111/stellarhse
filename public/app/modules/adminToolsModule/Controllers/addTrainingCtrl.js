(function () {
    
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm, item) {
console.log(item);
        var init = function () {
            $scope.trainingProviderLabels = {};
            $scope.formlabels = constantService.getTrainingProviderLabels();
            angular.forEach($scope.formlabels, function (value, key) {
                $scope.trainingProviderLabels[key] = value;
            });
            console.log($rootScope.isNew);
            $scope.disabled = true;
            
            if(item && item != null){
                $scope.trainingProvider = item;
            } 
            else if ($rootScope.isNew) {
                $scope.disabled = false;
                $scope.trainingProvider = {};
                $scope.pageTitle = "Add new training provider";
            }
            else{
                $scope.trainingProvider = $rootScope.selectedProv ;
                console.log($scope.trainingProvider);
                $scope.pageTitle = "Edit new training provider";
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

               $scope.trainingProvider.language_id= $scope.user.language_id;                   
                $scope.trainingProvider.added_by= $scope.user.employee_id;
                
                $scope.trainingProvider.org_id= $scope.user.org_id;
            }
           
        }, true);
       // $scope.trainingProvider.isPopup = false;
         $scope.addTrainingProvider = function () {
            $scope.name_valid = '';
            console.log($scope.trainingProvider);

           
             customersService.updateTrainingProvider($scope.trainingProvider)
                .then(function (response) {
                    if (response.data.success === 2) {
                        $scope.name_valid = 'Invalid Training Provider Name';
                    }else{
                        if ($scope.trainingProvider.isPopup) {
                            console.log("cancel");
                            oreService.resetAlert()
                            coreService.setAlert({type: 'wait', message: 'Provider added successfully  '});
                        }
                        else
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
   
        
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm', 'item'];
    angular.module('adminModule')
            .controller('addTrainingCtrl', controller);
}());

