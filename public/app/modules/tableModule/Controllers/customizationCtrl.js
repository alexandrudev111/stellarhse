(function () {
    var controller = function ($scope, $rootScope, $uibModal,constantService , coreService, $filter, $state, uiGridConstants, uiGridExporterConstants, coreReportService, $uibModalInstance, viewDataTablesService) {
        $scope.user = coreService.getUser();
        $scope.status = {
            tab: [],
            section: []
        };
        $scope.allCustomColums = [];
      /* angular.forEach($scope.tabsArr, function (tab) {
           $scope.allCustomColums = $scope.allCustomColums.concat(tab.fields);
       });
        console.log($scope.allCustomColums);*/
        console.log($scope.tabsArr);
        var data = {};

        /// for feture work on sections of grouping 
        /*angular.forEach($scope.tabsArr, function (tab) {
            var tabFields = $filter('filter')($scope.allCustomColums, {tabName: tab.name});
            tab.fields = tabFields ;
        });*/
            /*        var init= function(){
            console.log($scope.tabsArr);
            angular.forEach($scope.tabsArr, function (tab) {
                angular.forEach(tab.sections, function (section) {
                    if (section.is_section == "0") {
                        var field = $filter('filter')($scope.allCustomColums, {id: section.field_id});
                        console.log(section);
                        console.log(field);
                        if (field.length != 0) {
                            section.visible = field[0].visible ;
                        }
                    }
                });
            });
            console.log($scope.tabsArr);
        }
        init();*/


        $scope.cancel = function(){
            /*console.log($scope.allColumns[0].visible);
            console.log($scope.allCustomColums[0].visible);*/
            data.submit = false ;
            $uibModalInstance.dismiss(data);
        }
        $scope.changeItem = function (item) {
            console.log(item.visible);
            if (item.visible == 1) {
                item.visible = 0;
            }
            else if (item.visible == 0) {
                item.visible = 1;
            }
            console.log(item.visible);
        };

        $scope.changeHeaders = function () {
            angular.forEach($scope.tabsArr, function (tab) {
                $scope.allCustomColums = $scope.allCustomColums.concat(tab.fields);
            });
            console.log($scope.allCustomColums);
            $scope.sXmlData = "";
            $scope.sXmlData += '<org_id>' +$scope.db.org_id+ '</org_id>\n';
            if ($scope.db.selectedView == 611 || $scope.db.selectedView == 811
                || $scope.db.selectedView == 212 || $scope.db.selectedView == 412
                || $scope.db.selectedView == 513 || $scope.db.selectedView == 613
                || $scope.db.selectedView == 214 || $scope.db.selectedView == 414) {
                $scope.sXmlData += '<creator_id>' +$scope.user.employee_id+ '</creator_id>\n';
                $scope.sXmlData += '<Mine>true</Mine>\n';
            }

            //$scope.sXmlData += '<search>' +$scope.db.search+ '</search>\n';

            $scope.sXmlData += '<start>' +($scope.db.currentPage - 1) * $scope.db.limit+ '</start>\n';
            $scope.sXmlData += '<limit>' +2000+ '</limit>\n';
            var customXmlData = "";
            angular.forEach($scope.allCustomColums, function (value, key) {
                if (value.visible == 1 && value.tabName != "Custom Fields") {
                    $scope.sXmlData += '<' + value.name + '></' + value.name + '>\n';
                }
                else if (value.visible == 1 && value.tabName == "Custom Fields") {
                    customXmlData += value.name +',';
                }
            });
            if (customXmlData != "") {
              //  customXmlData = customXmlData.substring(0, customXmlData.length - 1);
                $scope.sXmlData += '<custom_fields>'+ customXmlData +'</custom_fields>\n';
            }
            console.log($scope.allColumns[0].visible);
            console.log($scope.allCustomColums[0].visible);
                var data = {
                    sXmlData : $scope.sXmlData,
                    allColumns: $scope.allCustomColums,
                    submit: true 
                }
                    
            $uibModalInstance.dismiss(data);
        };

    $scope.config = {
        autoHideScrollbar: false,
        theme: 'dark-thick',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 350,
        scrollInertia: 0
    };


   

    $scope.getFieldes = function(section){
        if (!section.is_check) 
            return false;
        console.log(section.field_id);
        viewDataTablesService.getFisledsBySection({sectionId: section.field_id, org_id: $scope.db.org_id, product_code: $scope.reportType}).then(function (response) {
            console.log(response);
            section.fields = response.data ;
            console.log(section);

            console.log($scope.tabsArr);
        }, function (err) {
            console.error(err);
        });
    };
        
        $scope.config = {
            autoHideScrollbar: false,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 150,
            scrollInertia: 0
        };
            
     

    };
    controller.$inject = ['$scope', '$rootScope', '$uibModal','constantService', 'coreService', '$filter', '$state', 'uiGridConstants', 'uiGridExporterConstants', 'coreReportService', '$uibModalInstance', 'viewDataTablesService']
    angular.module('customizationModule', ['ui.grid', 'ui.grid.selection', 'ui.grid.cellNav', 'ngAria'])
            .controller('customizationCtrl', controller)
}());