/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




(function () {
    var controller = function ($scope, report, dashboardService, coreService) {

//            $scope.report_id= report.report_id;
//            $scope. report_code= report.report_code;


        $scope.user = coreService.getUser();


        var data = {
            org_id: $scope.user.org_id,
            report_id: report.report_id,
            report_code: report.report_code
        };

        dashboardService.getMyRecentReport(data)
                .then(function (response) {

                    $scope.selectedReport = response.data;

//                    $scope.string = 'gfgf,kk';
//                    $scope.arrString = $scope.string.split(',');
//                    console.log("mowafffft" + $scope.arrString);
                    $scope.selectedReport.Report_five.forEach(function (arrayItem)
                    {
                        if (arrayItem.env_condition_type == "Indoor Lighting"){
                           $scope.indoor_lighting_condition_sub_type = arrayItem.env_condition_sub_type; 
                        }
                        
                        if (arrayItem.env_condition_type == "Outdoor Lighting"){
                           $scope.outdoor_lighting_condition_sub_type = arrayItem.env_condition_sub_type; 
                        }
                        
                        if (arrayItem.env_condition_type == "Outdoor Temperature"){
                           $scope.outdoor_temp_condition_sub_type = arrayItem.env_condition_sub_type; 
                        }
                        
                        if (arrayItem.env_condition_type == "Weather"){
                           $scope.weather_condition_sub_type = arrayItem.env_condition_sub_type;
                           $scope.weatherString = $scope.weather_condition_sub_type.split(',');
                           
                        }
                        
                        if (arrayItem.env_condition_type == "Road Conditions"){
                           $scope.road_condition_sub_type = arrayItem.env_condition_sub_type;
                           $scope.roadString = $scope.road_condition_sub_type.split(',');
                           
                        }
                        
                        if (arrayItem.env_condition_type == "Wind Direction"){
                           $scope.windDir_condition_sub_type = arrayItem.env_condition_sub_type; 
                        }
                        
                        if (arrayItem.env_condition_type == "Wind Speed"){
                           $scope.windSP_condition_sub_type = arrayItem.env_condition_sub_type; 
                        }
                       
                        
                    });
                    
                     $scope.selectedReport.Report_six.forEach( function (value, key)
                    {
                       
                           $scope.report = value.reported_to;
                           $scope.reported_to = $scope.report.split(',');
                           
                          
                    });
                

                    $scope.selectedReport.ReportType = report.report_code;

                    if ($scope.selectedReport.Report_one.should_work_stopped == 'Yes' || $scope.selectedReport.Report_one.should_work_stopped == 'yes') {
                        $scope.selectedReport.should_work_stopped_yes = true;
                    } else if ($scope.selectedReport.Report_one.should_work_stopped == 'No' || $scope.selectedReport.Report_one.should_work_stopped == 'no') {
                        $scope.selectedReport.should_work_stopped_no = true;
                    }


                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });

    };

    controller.$inject = ['$scope', 'report', 'dashboardService', 'coreService'];
    angular.module("dashboardModule").controller("RecentReportCtrl", controller);
}());



