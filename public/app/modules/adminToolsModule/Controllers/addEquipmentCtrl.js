(function () {
    
    var controller = function ($scope, $rootScope, constantService, customersService, $state, $filter, $q, coreService, Upload, $uibModal, $confirm) {

        var init = function () {
            $scope.equipmentLabels = {};
            $scope.formlabels = constantService.getEquipmentLabels();
            angular.forEach($scope.formlabels, function (value, key) {
                $scope.equipmentLabels[key] = value;
            });
            console.log($scope.equipmentLabels);
            console.log($rootScope.isNew);
            $scope.disabled = true;
            
            if ($rootScope.isNew) {
                $scope.disabled = false;
                $scope.equipment = {
                    equipment_name: '',
                    equipment_type: '',
                    equipment_category_name :'',
                    equipment_number:''
                };
                $scope.pageTitle = "Add new equipment";
            }
            else{
                $scope.equipment = $rootScope.selectedProv ;
                $scope.equipment.recertificate_frequency = parseInt($rootScope.selectedProv.recertificate_frequency);
                $scope.equipment.duration_of_training = parseInt($rootScope.selectedProv.duration_of_training);
                console.log($scope.equipment);
                $scope.pageTitle = "Edit equipment";
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

               $scope.equipment.language_id= $scope.user.language_id;                   
                $scope.equipment.editing_by= $scope.user.employee_id;
                
                $scope.equipment.org_id= $scope.user.org_id;
            }
           
        }, true);
        
         $scope.addEquipment = function () {
            $scope.name_valid = '';

            console.log($scope.equipment);
             customersService.updateEquipment($scope.equipment)
                .then(function (response) {
                    if (response.data.success === 2) {
                        $scope.name_valid = 'Invalid Equipment Name';
                    }else{
                        $state.go('ManageTrackingHSE', {grid: 'form_equipment'});
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
            $state.go('ManageTrackingHSE', {grid: 'form_equipment'});
         };

    };
   
        
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', '$filter', '$q', 'coreService', 'Upload', '$uibModal', '$confirm'];
    angular.module('adminModule')
            .controller('addEquipmentCtrl', controller);
}());

