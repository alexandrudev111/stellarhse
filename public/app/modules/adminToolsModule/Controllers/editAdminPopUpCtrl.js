(function () {
    var controller = function ($scope, constantService, customersService, coreService, $uibModalInstance) {
      

       
        $scope.confirmNewAdmin= function(){
            console.log("inside set as admin");
            post = {org_id: $scope.user.org_id, emp_id :$scope.user_id};
            console.log(post);
            customersService.setAsAdmin(post).then(function (response) {
                            console.log(response);
                            var res= response.data[0];
                            console.log("I am the admin "+ res);
                            $uibModalInstance.close('cancel');

            });
        };
       

        
        $scope.cancel = function () {
           
           $uibModalInstance.dismiss('cancel');
             
        };

       

       

    };

    controller.$inject = ['$scope', 'constantService', 'customersService',  'coreService', '$uibModalInstance'];
    angular.module('adminModule')
            .controller('editAdminPopUpCtrl', controller);
}());
