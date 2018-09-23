(function () {
    var controller = function ($scope, $uibModal, coreService, $state, $rootScope,$uibModalInstance, coreReportService) {

        $scope.populateDraft = function(){
            coreService.setIsMyDraft(true);
            if (coreService.getDraftReport().type == "hazard") 
                $state.go('edithazardreport', {reportNumber: null, draftId: null});
            else if (coreService.getDraftReport().type == "incident") 
                $state.go('editincidentreport', {reportNumber: null, draftId: null});
            
            $uibModalInstance.dismiss('cancel');
        }

        $scope.discardDraft = function(){
        
        	var data = {
        	 	report_id: coreService.getDraftReport().report_id,
        	 	product_code: coreService.getDraftReport().type
        	}

        	coreService.deleteDraft(data)
                .then(function (response) {
                    console.log(response);
                    if (response.data) {
                        $scope.updateEditingBy('finish', data.report_id);
                        if (coreService.getCurrentState() == 'edithazardreport')
                            $state.go('edithazardreport', {reportNumber: coreService.getDraftReport().hazard_number, draftId: null});
                        
                        
                        else if (coreService.getCurrentState() == 'editincidentreport')
                            $state.go('editincidentreport', {reportNumber: coreService.getDraftReport().incident_number, draftId: null});
                        
                        coreService.setDraftReport(undefined);
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

                $uibModalInstance.dismiss('cancel');
        }

        $scope.updateEditingBy = function(status, reportId){
            console.log('updat Editing By on ',status);
            var editing_data = {
                employeeId: $scope.user.employee_id,
                reportId: reportId,
                status: status
            };
            console.log('updat Editing By on ',status,editing_data);
            if (coreService.getCurrentState() == 'edithazardreport') 
                editing_data.productCode = "hazard";
            else if (coreService.getCurrentState() == 'editincidentreport')
                editing_data.productCode = "ABCanTrack";
            else
                return false;

            
            coreReportService.updateEditingBy(editing_data)
                .then(function (response) {
                    console.log(response);
                    
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }

        $scope.user = coreService.getUser();

        var init = function(){
            console.log("test");
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'showdraft'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];
                    console.log($scope.msgTitle);
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }

        init();

    };
    controller.$inject = ['$scope', '$uibModal', 'coreService', '$state', '$rootScope','$uibModalInstance','coreReportService'];
    angular.module("coreReportModule").controller("draftController", controller);
}());