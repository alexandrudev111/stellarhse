(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm, appSettings) {
        $scope.show_time_frame = false;
        $scope.show_sub_impact = false;
        $scope.disabled = true;
        $scope.permissions = coreService.getPermissions();
        $scope.onSelectedPeriod = function (selectedItem) {
            if (selectedItem.field_code === 'customdate') {
                $scope.show_time_frame = true;
                $('#metrics_date').daterangepicker({
                    changeYear: true,
                    changeMonth: true,
                    applyClass: 'btn-green',
                    showDropdowns: true,
                    arrows: false,
                    locale: {
                        applyLabel: "Apply",
                        fromLabel: "From",
                        format: "YYYY/MM/DD",
                        toLabel: "To",
                        cancelLabel: 'Cancel',
                        customRangeLabel: 'Custom range'
                    }
                });
            } else {
                $scope.show_time_frame = false;
            }
        };

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            $scope.hideCount = true;
            $scope.hiddenCols = [];
            if (coreService.getPreviousState() === 'chartgrid') { 
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $scope.selectedMetric = $rootScope.selectedMetric;
                prodData = {metrics_type_id: $scope.selectedMetric.metrics_type_id, org_id: $scope.user.org_id};
                $scope.promise = $q.all([
                    analyticsService.getMetricPeriodItems($scope.user.language_id),
                    coreService.getUuid(),
                    analyticsService.getMetricProuducts(prodData),
                    analyticsService.getMetricScope($scope.user.language_id),
                    analyticsService.getMetricSubTypes(prodData),
                ]).then(function (queues) {
                    $scope.periodDates = queues[0].data;
                    if (!queues[2].data[0].hasOwnProperty('NULL')) {
                        $scope.products = queues[2].data;
                    }
                    $scope.metricsScope = [];
                    $scope.metricsScope[0] = {metrics_scope_id:'',metrics_scope_name:'Please select one.',field_code:''};
                     angular.forEach(queues[3].data, function (val, k) {
                        $scope.metricsScope.push(val);
                    });
//                    $scope.metricsScope = queues[3].data;
                    if (!queues[4].data[0].hasOwnProperty('NULL')) {
                        $scope.show_sub_impact = true;
                        $scope.subTypes = queues[4].data;
                    }

                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});

                });
            }
        }, true);

        $scope.$watch('selectedMetric.time_frame', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
//                console.log(newVal);
                $scope.checkDateVal(newVal);
            }
        });

        $scope.checkDateVal = function (value) {
            if (angular.isDefined(value) && value !== null && value !== '') {
                var pos = value.split(/-/);
                if ($.trim(pos[0]) === $.trim(pos[pos.length - 1])) {
                    $scope.selectedMetric.time_frame = $.trim(pos[0]);
                    $scope.selectedMetric.time_frame_from = $.trim(pos[0]);
                    $scope.selectedMetric.time_frame_to = '';
                } else {
                    $scope.selectedMetric.time_frame_from = $.trim(pos[0]);
                    $scope.selectedMetric.time_frame_to = $.trim(pos[pos.length - 1]);
                }
                $scope.selectedMetric.time_frame_from = $scope.selectedMetric.time_frame_from.replace(/\//g, "-");
                $scope.selectedMetric.time_frame_to = $scope.selectedMetric.time_frame_to.replace(/\//g, "-");
            }

        };

        $scope.updateFun = function () {
            $scope.disabled = false;
        };

        $scope.addMetricFunc = function () {
            console.log($scope.selectedMetric);
            if (angular.isObject($scope.selectedMetric.period_items_id)) {
                $scope.selectedMetric.period_items_name = $scope.selectedMetric.period_items_id.period_items_name;
                $scope.selectedMetric.period_field_code = $scope.selectedMetric.period_items_id['field_code'];
                $scope.selectedMetric.period_items_id = $scope.selectedMetric.period_items_id.period_items_id;
            }
            $scope.selectedMetric.employee_id = $scope.user.employee_id;
            analyticsService.addMetFunc($scope.selectedMetric).then(function (response) {
                console.log(response.data);
                if (response.data && !response.data.hasOwnProperty('file')) {
                    $state.go('chartgrid');
                    coreService.resetAlert();
                    coreService.setAlert({type: 'success', message: constantService.getMessage('metrics_edited_successfully')});
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm', 'appSettings'];
    angular.module('analyticsModule').controller('metricsCtrl', controller);
}());

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


