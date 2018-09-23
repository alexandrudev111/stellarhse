(function () {
    var controller = function ($scope, $rootScope, constantService, chartService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {
        console.log($rootScope.selectedChart);

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getPreviousState() === 'chartgrid') {

                $scope.options = {
                    applyClass: 'btn-green',
                    locale: {
                        applyLabel: "Apply",
                        fromLabel: "From",
                        format: "MM-DD-YYYY", //will give you 2017-01-06
                        toLabel: "To",
                        cancelLabel: 'Cancel',
                        customRangeLabel: 'Custom range'
                    },
                    ranges: {
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()]
                    }
                }

                console.log($rootScope.selectedChart);
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $q.all([
                    chartService.getChartFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: ''}),
                    chartService.getOutputFormula($scope.user.language_id),
                    chartService.getDecimalFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id}),
                    coreService.getUuid()
                ]).then(function (queues) {
                    $scope.field1array = queues[0].data;
                    $scope.field2array = queues[0].data;
                    $scope.formulalist = queues[1].data;
                    $scope.decimalarray = queues[2].data;

                    if ($rootScope.selectedChart != null) {
                        $scope.selectedChart = $rootScope.selectedChart;
                    } else {
                        var chart = {
                            stat_table_id: queues[2].data.success,
                            stat_table_name: '',
                            creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                            field_id1: '',
                            field_id2: '',
                            field_name: '',
                            field_name2: '',
                            field_name3: '',
                            hidden_params: '',
                            operation_code: '',
                            output_code: '',
                            time_frame: '',
                            updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
                        }
                        $scope.selectedChart = chart;
                    }

                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                    coreService.setAlert({type: 'exception', message: errors[3].data});
                });
            }
        }, true);
        $scope.checkDecimalFields = function (operation_code) {
            $scope.hideCount = false;
            if (operation_code == 'count') {
                $scope.hideCount = true;
                $scope.selectedChart.field_id2 = '';
            }

        }

        $scope.$watch('selectedChart.field_id1', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: newVal};
                chartService.getChartFields(post).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.field2array = response.data;
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        });


        $scope.GenerateIncidentChart = function (chartType) {
            console.log(chartType);
            $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
            $scope.onClick = function (points, evt) {
                // console.log(points, evt);
            };
            $scope.datasetOverride = [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}];
            $scope.options = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right'
                        }
                    ]
                }
            };
        }


        $scope.addIncidentChart = function () {

        }
    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'chartService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm'];
    angular.module('chartModule')
            .controller('chartCtrl', controller);
}());

