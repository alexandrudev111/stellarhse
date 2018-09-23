(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, uiGridConstants, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm, $q, $location, $anchorScroll, appSettings) {
        $scope.user = coreService.getUser();
        $scope.products = $scope.user.products;
        $scope.product_code = $scope.products[0].product_code;
        $scope.permissions = coreService.getPermissions();
        $rootScope.selectedMetric = {};
        $scope.showChart = false;
        $scope.showChartFav = false;
        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'Charts.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApiFav = gridApi;
        };
        $scope.gridOptionsMenu = coreService.getGridOptions();
        $scope.gridOptionsMenu.exporterCsvFilename = 'defaultKpi.csv';
        $scope.gridOptionsMenu.onRegisterApi = function (gridApiDefault) {
            $scope.gridApi = gridApiDefault;
        };
        $scope.gridOptionsMenu.multiSelect = true;
        $scope.downloadCSV = function () {
            $scope.gridApiFav.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };
        $scope.downloadCSVKPI = function(){
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };
        $scope.setFilter = function () {
            var columns = $scope.gridOptions.columnDefs;
            for (var i = 0; i < columns.length; i++) {
                $scope.gridOptions.columnDefs[i].filter = {
                    condition: uiGridConstants.filter.CONTAINS
                };
            }
        };
        $scope.addToFavourit = function () {
            coreService.resetAlert();
            metrics_id = '';
            chart_ids = '';
//            console.log($scope.gridApi.selection.getSelectedRows());
            if ($scope.gridApi.selection.getSelectedRows().length) {
                if ($scope.gridApi.selection.getSelectedRows().length > 1) {
                    angular.forEach($scope.gridApi.selection.getSelectedRows(), function (value, key) {
                        if (value.type === 'KPI') {
                            metrics_id += value.metrics_stat_id + ',';
                        } else {
                            chart_ids += value.metrics_stat_id + ',';
                        }
                    });
                    metrics_id = metrics_id.slice(0, -1);
                    chart_ids = chart_ids.slice(0, -1);
                } else {
                    if ($scope.gridApi.selection.getSelectedRows()[0]['type'] === 'KPI') {
                        metrics_id = $scope.gridApi.selection.getSelectedRows()[0]['metrics_stat_id'];
                    } else {
                        chart_ids = $scope.gridApi.selection.getSelectedRows()[0]['metrics_stat_id'];
                    }
                }

                if (metrics_id && metrics_id !== '') {
                    post = {metrics_ids: metrics_id, org_id: $scope.user.org_id, employee_id: $scope.user.employee_id};
                    analyticsService.assignToFavourit(post).then(function (response) {
                        console.log(response);
                        var resp_length = response.data.length;
                        coreService.resetAlert();
                        if (resp_length === 1) { //only assigned to fav or only already assigned
                            if (response.data[0][0].indexOf('already assigned before') >= 0) {
                                coreService.setAlert({type: 'error', message: response.data[0][0]});
                            } else if (response.data[0][0].indexOf('added successfully') >= 0) {
                                coreService.setAlert({type: 'success', message: response.data[0][0]});
                            }
                        } else { //some assigned and some not
                            coreService.setAlert({type: 'success', message: response.data[0][0]});
                            coreService.setAlert({type: 'error', message: response.data[1][0]});
                        }
                        $state.reload();
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors.data});
                    });
                }

                if (chart_ids && chart_ids !== '') {
                    post_charts = {chart_ids: chart_ids, org_id: $scope.user.org_id, employee_id: $scope.user.employee_id};
                    analyticsService.assignToFavouritCharts(post_charts).then(function (resp) {
                        if (resp.data && !resp.data.hasOwnProperty('file')) {
                            $state.reload();
                            coreService.resetAlert();
                            if (resp.data[0].inserted_successfully !== '') {
                                coreService.setAlert({type: 'success', message: constantService.getMessage('addToFavourit')});
                            }
                            if (resp.data[0].already_assigned_before !== '') {
                                coreService.setAlert({type: 'error', message: resp.data[0].already_assigned_before + ' already assigned to favourite'});
                            }
                        }

                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors.data});
                    });
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.previewKPI = function (id) {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length === 1) {
                if ($scope.gridApi.selection.getSelectedRows()[0]['type'] === 'KPI') {
                    $scope.msgTitle = $scope.gridApi.selection.getSelectedRows()[0]['metrics_name'];
                    $scope.msgBody = $scope.gridApi.selection.getSelectedRows()[0]['formula_calc'];
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        scope: $scope
                    });
                } else {
                    $scope.showChart = true;
                    $location.hash(id);
                    $anchorScroll();
//                    console.log($scope.gridApi.selection.getSelectedRows()[0]);
                    var table_field_name = $scope.gridApi.selection.getSelectedRows()[0]['table_field_name'];
                    var output_code = $scope.gridApi.selection.getSelectedRows()[0]['output_code'];
                    if (output_code === 'verticalbar') {
                        output_code = 'column';
                    } else if (output_code === 'horizontalbar') {
                        output_code = 'bar';
                    }
                    var chart_name = $scope.gridApi.selection.getSelectedRows()[0]['name'];
                    // to draw - data static arrays
                    var vertical_bar = [[{name: "Electrical contact", count: "6"}, {name: "Equipment Failure", count: "2"},
                            {name: "Explosion", count: "1"}, {name: "Fire", count: "1"}, {name: "Seismic Event", count: "4"}
                        ]];
                    var impact_type_name = [[{name: "Animal strick", count: "76"}, {name: "Damage/Loss", count: "466"},
                            {name: "Injury", count: "587"}, {name: "Spill/Release", count: "143"}, {name: "Vehicle Damage", count: "469"}
                        ]];
                    var horizontal_series = [[{name: "Company", count: "1244"}], [{name: "Contractor", count: "206"}]];
//                    var unresolved_hazard = [
//                        [{A_Low: 44, B_Medium: 87, C_High: 102}, {A_Low: 60, B_Medium: 112, C_High: 160}],
//                        [{A_Low: 44, B_Medium: 87, C_High: 102}, {A_Low: 60, B_Medium: 112, C_High: 160}]
//                    ];

                    var unresolved_hazard = [
                        [//hazard_array
                            [{name: "Contractor", count: "44"}],
                            [{name: "Contractor", count: "60"}],
                            [{name: "Contractor", count: "70"}],
                            [{name: "Company", count: "34"}],
                            [{name: "Company", count: "50"}],
                            [{name: "Company", count: "90"}]
                        ],
                        [// Incident
                            [{name: "Contractor", count: "46"}],
                            [{name: "Contractor", count: "61"}],
                            [{name: "Contractor", count: "74"}],
                            [{name: "Company", count: "39"}],
                            [{name: "Company", count: "55"}],
                            [{name: "Company", count: "80"}]
                        ]
                    ];
//                    var unresolved_hazard = [[//hazard_array
//                            [{name: "A-Low", count: "44"}, {name: "A-Low", count: "60"}, {name: "A-Low", count: "44"},{name: "A-Low", count: "60"}],
//                            [{name: "B-Medium", count: "87"}, {name: "B-Medium", count: "112"}, {name: "B-Medium", count: "87"}, {name: "B-Medium", count: "112"}]
//                        ],
//                        [//insepections_array
//                            [{name: "C-High", count: "102"}, {name: "C-High", count: "160"}, {name: "C-High", count: "102"}, {name: "C-High", count: "160"}],
//                           // [{name: "A-Low", count: "60"}, {name: "B-Medium", count: "112"}, {name: "C-High", count: "160"}]
//                        ]
//                    ];
                    var corrective_array = [
                        [{name: "Hazard IDs", count: "4"}, {name: "Incidents", count: "2"}, {name: "Inspections", count: "8"}, {name: "Maintenance", count: "9"}, {name: "Trainning", count: "4"}],
                        [{name: "Hazard IDs", count: "2"}, {name: "Incidents", count: "0"}, {name: "Inspections", count: "4"}, {name: "Maintenance", count: "5"}, {name: "Trainning", count: "7"}]
                    ];
                    var chart_options = $scope.chartOptionsFun(chart_name, 'x axis', 'y axis', output_code);
                    var scope_series = ['Company', 'Contractor', 'All'];
                    var level_series = ['A-Low', 'B-Medium', 'C-High'];
                    var pie_series = [{name: "Company", count: "12"}, {name: "Contractor", count: "6"}, {name: "All", count: "18"}];
                    var pie_ser = [{name: "High", count: "22"}, {name: "Medium", count: "16"}, {name: "Low", count: "8"}];
                    var line_series = [
                        [{name: "January", count: "12"}, {name: "February", count: "6"}, {name: "March", count: "18"}, {name: "April", count: "4"}, {name: "May", count: "10"}, {name: "June", count: "3"}
                            , {name: "July", count: "8"}, {name: "August", count: "6"}, {name: "September", count: "8"}, {name: "October", count: "12"}, {name: "November", count: "6"}, {name: "December", count: "7"}],
                        [{name: "January", count: "7"}, {name: "February", count: "9"}, {name: "March", count: "12"}, {name: "April", count: "6"}, {name: "May", count: "7"}, {name: "June", count: "10"}
                            , {name: "July", count: "5"}, {name: "August", count: "4"}, {name: "September", count: "6"}, {name: "October", count: "9"}, {name: "November", count: "5"}, {name: "December", count: "9"}],
                        [{name: "January", count: "19"}, {name: "February", count: "15"}, {name: "March", count: "30"}, {name: "April", count: "10"}, {name: "May", count: "17"}, {name: "June", count: "13"}
                            , {name: "July", count: "13"}, {name: "August", count: "10"}, {name: "September", count: "14"}, {name: "October", count: "17"}, {name: "November", count: "11"}, {name: "December", count: "16"}]
                    ];
                    var bar_series = [
                        [{name: "2013", count: "120"}, {name: "2014", count: "86"}, {name: "2015", count: "55"}, {name: "2016", count: "70"}, {name: "2017", count: "46"}],
                        [{name: "2013", count: "31"}, {name: "2014", count: "20"}, {name: "2015", count: "36"}, {name: "2016", count: "48"}, {name: "2017", count: "17"}],
                        [{name: "2013", count: "151"}, {name: "2014", count: "106"}, {name: "2015", count: "91"}, {name: "2016", count: "118"}, {name: "2017", count: "63"}]
                    ];
                    ////
                    if (output_code === 'pie') {
                        series11 = {type: output_code, name: chart_name, color: '#f58220', data: []};
                        var pie_array;
                        if (table_field_name === 'incident_risk_level_degree' || table_field_name === 'hazard_risk_level_degree' || table_field_name === 'inspection_risk_level_degree') {
                            pie_array = pie_ser;
                        } else if (table_field_name === 'investigation_scope') {
                            pie_array = pie_series;
                        }
                        angular.forEach(pie_array, function (value, key) {
                            if (table_field_name === 'investigation_scope' && key === 2) {
                                return;
                            } else {
                                series11.data.push([value['name'], parseInt(value["count"])]);
                            }
                        });
                        chart_options.series.push(series11);
                    } else if (table_field_name === 'unresolved_hazard') {
                        foreach_array = unresolved_hazard;
                        angular.forEach(foreach_array, function (valh, keyh) {
                            angular.forEach(valh, function (vh, kh) {
                                if (kh === 0 || kh === 3) {
                                    series11 = {type: output_code, name: level_series[0], data: []};
                                } else if (kh === 1 || kh === 4) {
                                    series11 = {type: output_code, name: level_series[1], data: []};
                                } else if (kh === 2 || kh === 5) {
                                    series11 = {type: output_code, name: level_series[2], data: []};
                                }
                                chart_options.xAxis.categories.push(vh[0]['name']);
                                series11.data.push(parseInt(vh[0]["count"]));
                                chart_options.series.push(series11);
                                //console.log(chart_options.series[kh].name);
                            });
                        });
                    } else {
                        var foreach_array;
                        if (table_field_name === 'event_type') {
                            foreach_array = vertical_bar;
                        } else if (table_field_name === 'medical_aid_injury_frequency' || table_field_name === 'lost_time_injury' || table_field_name === 'fatal_injury' || table_field_name === 'first_aid_injury' || table_field_name === 'near_miss_frequency' || table_field_name === 'restricted_work_injury' || table_field_name === 'reportable_injury_frequency' || table_field_name === 'property_damage_frequency') {
                            foreach_array = bar_series;
                        } else if (table_field_name === 'workdays_lost_from_rwi_and_lti' || table_field_name === 'lost_time_incident_severity' || table_field_name === 'incident' || table_field_name === 'lost_time_severity' || table_field_name === 'motor_vehicle_incident_frequency') {
                            foreach_array = line_series;
                        } else if (table_field_name === 'hazard_scope' || table_field_name === 'inspection_scope' || table_field_name === 'safetymeeting_scope' || table_field_name === 'maintenance_scope' || table_field_name === 'training_scope') {
                            foreach_array = horizontal_series;
                        } else if (table_field_name === 'impact_type_name') {
                            foreach_array = impact_type_name;
                        } else if (table_field_name === 'corrective_action') {
                            foreach_array = corrective_array;
                        }
//                        var trend_line = fitData(bar_series).data;
//                        console.log(trend_line);
                        angular.forEach(foreach_array, function (val, k) {
                            if (k === 0) {
                                series11 = {type: output_code, name: scope_series[k], data: []};
                            } else if (k === 1) {
                                series11 = {type: output_code, name: scope_series[k], data: []};
                            } else if (k === 2) {
                                series11 = {type: output_code, name: scope_series[k], data: []};
                            }
                            for (var i = 0; i < val.length; i++) {
                                chart_options.xAxis.categories.push(val[i]['name']);
                                series11.data.push(parseInt(val[i]["count"]));
                            }
//                            if (table_field_name === 'first_aid_injury') {
//                                chart_options.series.push({type: 'line', marker: {enabled: false}, data: trend_line});
//                            }
                            chart_options.series.push(series11);
                        });
                    }
//                    console.log(chart_options);
                    var myChart = Highcharts.chart('myChart', chart_options);
                }
            } else if ($scope.gridApi.selection.getSelectedRows().length < 1) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            } else if ($scope.gridApi.selection.getSelectedRows().length > 1) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('multibleRowNoSelect')});
            }
        };
        $scope.clearSearchDef = function () {
            $scope.gridApi.selection.clearSelectedRows(); // clear selected rows
            var columns = $scope.gridApi.grid.columns;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        };
        $scope.chartOptionsFun = function (cTitle, xTitle, yTitle, s1Type) {
            var options = '';
            if (s1Type == 'pie') {
                options = {
                    chart: {
                        renderTo: 'containerChart',
                        type: s1Type,
                        events: {
                            load: function (event) {
                                console.log(' $scope.hiddenCols: ' + $scope.hiddenCols);
                                for (var i = 0; i < this.series[0].data.length; i++) {
                                    //console.log('this.series[0].data[i].name: ' + this.series[0].data[i].name);
                                    if (jQuery.inArray(this.series[0].data[i].name, $scope.hiddenCols) !== -1) {
                                        this.series[0].data[i].setVisible(false);
                                    }
                                }
                            }
                        }
                    },
                    title: {
                        text: cTitle,
                        x: -20 //center
                    },
                    subtitle: {
                        text: '8. Choose your print option.',
                        floating: true,
                        align: 'right',
                        x: -25,
                        y: 10
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>'
                    },
                    plotOptions: {
                        pie: {
                            showInLegend: true,
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        },
                        series: {
                            point: {
                                events: {
                                    legendItemClick: function (event) {
                                        var visibility = this.visible;
                                        if (visibility == true) {
                                            if (jQuery.inArray(this.name, $scope.hiddenCols) == -1) {
                                                $scope.hiddenCols.push(this.name);
                                            }
                                        }
                                        else {
                                            removeItemFromArray($scope.hiddenCols, this.name);
                                        }
                                        console.log(' $scope.hiddenCols: ' + $scope.hiddenCols);
                                        return true;
                                    }
                                }
                            }
                        }
                    },
                    series: [],
                    legend: {
                        align: 'right',
                        layout: 'vertical',
                        verticalAlign: 'middle',
                        itemMarginBottom: 4,
                        itemMarginTop: 4,
                        x: -40
                    },
                    exporting: {
                        chartOptions: {
                            chart: {
                                width: 1417.32,
                                height: 1024
                            }
                        }
                    }
                };
            }
            else {
                options = {
                    chart: {
                        renderTo: 'containerChart',
                        events: {
                            load: function (event) {
                                this.series.forEach(function (d, i) {
                                    if (jQuery.inArray(d.options.name, $scope.hiddenCols) !== -1) {
                                        d.hide();
                                    }
                                });
                            }
                        }
                    },
                    title: {
                        text: cTitle,
                        x: -20 //center
                    },
                    subtitle: {
                        text: '8. Choose your print option.',
                        floating: true,
                        align: 'right',
                        x: -25,
                        y: 10
                    },
                    xAxis: {
                        title: {
                            text: xTitle
                        },
                        categories: []
                    },
                    yAxis: {
                        title: {
                            text: yTitle
                        },
                        plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                    },
                    tooltip: {
                        // pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>'
                        valueSuffix: ''
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    series: [],
                    plotOptions: {
                        series: {
                            events: {
                                legendItemClick: function (event) {
                                    var selected = this.index;
                                    var allSeries = this.chart.series;
                                    $.each(allSeries, function (index, series) {
                                        if (selected == index) {
                                            if (series.visible == true) {
                                                series.hide();
                                                if (jQuery.inArray(series.name, $scope.hiddenCols) == -1) {
                                                    $scope.hiddenCols.push(series.name);
                                                }
                                            }
                                            else {
                                                series.show();
                                                removeItemFromArray($scope.hiddenCols, series.name);
                                            }
                                        }
                                    });
                                    // console.log(' $scope.hiddenCols: ' +  $scope.hiddenCols);
                                    return false;
                                }
                            }
                        }
                    },
                    exporting: {
                        chartOptions: {
                            chart: {
                                width: 1417.32,
                                height: 1024
                            }
                        }
                    }

                };
            }
            return options;
        };
        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            if (coreService.getCurrentState() === 'chartgrid') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id};
                var prod_cod_string = {org_id: $scope.user.org_id};
                $scope.promise = $q.all([
                    analyticsService.getFavouritKPI(post), // here we  will handel favourite charts & metrics
                    analyticsService.getDefaultKPI(prod_cod_string) // here we call default view for charts and metrics 
                ]).then(function (queues) {
                    //favourit
                    $scope.gridOptions.columnDefs = [
                        {name: 'product_name', displayName: 'Report type', cellTooltip: true, headerTooltip: true},
                        {name: 'favorite_metrics_name', displayName: 'KPI name', cellTooltip: true, headerTooltip: true},
                        {name: 'formula_calc', displayName: 'Formula', cellTooltip: true, headerTooltip: true},
                        {name: 'period_items_name', displayName: 'Period', cellTooltip: true, headerTooltip: true},
                        {name: 'output_type_name', displayName: 'Output', cellTooltip: true, headerTooltip: true},
                        {name: 'metrics_value', displayName: 'Metrics value', cellTooltip: true, headerTooltip: true},
                        {name: 'shared_to', displayName: 'Shared to', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.girdData = queues[0].data;
                    $scope.gridOptions.data = $scope.girdData;
                    $scope.setFilter();
                    //default
                    $scope.gridOptionsMenu.columnDefs = [
                        {name: 'product_name', displayName: 'Report type', cellTooltip: true, headerTooltip: true},
                        {name: 'name', displayName: 'KPI name', cellTooltip: true, headerTooltip: true},
                        {name: 'formula_calc', displayName: 'Formula', cellTooltip: true, headerTooltip: true},
                        {name: 'period_items_name', displayName: 'Period', cellTooltip: true, headerTooltip: true},
                        {name: 'type', displayName: 'Output', cellTooltip: true, headerTooltip: true}
                    ];
                    $scope.girdDataMenu = queues[1].data;
                    $scope.gridOptionsMenu.data = $scope.girdDataMenu;
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                });
            }
        }, true);
        $scope.$watch('product_code', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                var post = {employee_id: $scope.user.employee_id, org_id: $scope.user.org_id, product_code: newVal, output_code: 'table'};
                analyticsService.getOrgCharts(post).then(function (response) {
                    $scope.girdData = response.data;
                    $scope.gridOptions.data = $scope.girdData;
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        });
        $scope.editChart = function () {
            coreService.resetAlert();
            console.log($scope.gridApiFav.selection.getSelectedRows()[0]);
            if ($scope.gridApiFav.selection.getSelectedRows().length) {
                if ($scope.gridApiFav.selection.getSelectedRows()[0]['output_type_name'] === 'KPI') {
                    $rootScope.selectedMetric = $scope.gridApiFav.selection.getSelectedRows()[0];
                    $state.go('metricsGenerate');
                } else {
                    $rootScope.selectedChart = $scope.gridApiFav.selection.getSelectedRows()[0];
                    $rootScope.selectedChart.stat_favorite_name = $scope.gridApiFav.selection.getSelectedRows()[0]['favorite_metrics_name'];
                    $rootScope.selectedChart.product_code = ($filter('filter')($scope.products, {product_id: $rootScope.selectedChart.product_id})[0]).product_code;
                    post = {favorite_metrics_id: $rootScope.selectedChart.favorite_metrics_id, output_type_name: $rootScope.selectedChart.output_type_name, product_code: $rootScope.selectedChart.product_code};
                    analyticsService.getChartOrMetricsSharingBoards(post).then(function (response) {
                        $rootScope.selectedChart.sharing_boards = response.data;
                    }, function (errors) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: errors.data});
                    });
                    $state.go('generatechart');
                }

            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.addChart = function () {
            $rootScope.selectedChart = {};
            var chart = {
                stat_favorite_id: '',
                favorite_table_name: '',
                employee_id: $scope.user.employee_id,
                org_id: $scope.user.org_id,
                creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                field_id1: '',
                field_id2: '',
//                field_name: '',
//                field_name2: '',
//                field_name3: '',
                hidden_params: '',
                operation_code: '',
                output_code: '',
                time_frame: '',
                product_code: $scope.product_code,
                product_name: ($filter('filter')($scope.products, {product_code: $scope.product_code})[0]).product_name,
                updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
            };
            $rootScope.selectedChart = chart;
            $rootScope.isNew = true;
            $state.go('generatechart');
        };
        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'charts'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    var msg = {
                        title: response.data['alert_name'],
                        body: response.data['alert_message_description']
                    };
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/coreModule/views/help.html',
                        controller: 'ShowPopUpController',
                        resolve: {
                            msg: msg
                        }
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
        $scope.deleteChart = function () {
            coreService.resetAlert();
            console.log($scope.gridApiFav.selection.getSelectedRows()[0]);
            if ($scope.gridApiFav.selection.getSelectedRows().length) {
                $scope.selectedChart = $scope.gridApiFav.selection.getSelectedRows()[0];
                var msg = {
                    title: constantService.getMessage('delete_confirm_title'),
                    body: constantService.getMessage('delete_confirm_msg')
                };
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreModule/views/confirm.html',
                    controller: 'ShowPopUpController',
                    backdrop: 'static',
                    resolve: {
                        msg: msg
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result === 'ok') {
                        if ($scope.selectedChart.output_type_name === 'KPI') {
                            var post = {favorite_metrics_id : $scope.selectedChart.favorite_metrics_id};
                            analyticsService.deleteMetric(post).then(function (response) {
                                if (!response.data.hasOwnProperty('file')) {
                                    $state.reload();
                                }
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                        } else {
                            var post = {favorite_metrics_id : $scope.selectedChart.favorite_metrics_id , product_id : $scope.selectedChart.product_id};
                            analyticsService.deleteChart(post).then(function (response) {
                                if (!response.data.hasOwnProperty('file')) {
                                    $state.reload();
                                }
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                        }
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.clearSearch = function () {
            $scope.gridApiFav.selection.clearSelectedRows(); // clear selected rows
            var columns = $scope.gridApiFav.grid.columns;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        };
        $scope.cancel = function () {
            $scope.$uibModalInstance.close('cancel');
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
        $scope.getActiveEmployees = function (empLetters) {
            if (empLetters !== '' && empLetters !== null) {
                userData = {org_id: $scope.user.org_id, keyWord: empLetters};
                analyticsService.getMatchedActiveUsers(userData).
                        then(function (response) {
                            $scope.activeEmployees = response.data;
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
            }
        };
        $scope.shareChart = function () {
            coreService.resetAlert();
            if ($scope.gridApiFav.selection.getSelectedRows().length) {
                $scope.selectedChart = $scope.gridApiFav.selection.getSelectedRows()[0];
                post = {favorite_metrics_id: $scope.selectedChart.favorite_metrics_id, output_type_name: $scope.selectedChart.output_type_name, product_code: $scope.selectedChart.product_code};
                $q.all([
                    analyticsService.getSharingOptions($scope.user.language_id), //where to share
                    analyticsService.getChartOrMetricsSharingBoards(post) //where chart or metrics already shared
                ]).then(function (queues) {
                    $scope.selectedChart.sharing_boards = queues[1].data;
                    $scope.selectedMetric.shared_to_id = {};
                    angular.forEach($scope.selectedChart.sharing_boards, function (val, k) {
                        $scope.selectedMetric.shared_to_id[val.shared_to_id] = true;
                    });
                    if (queues[0].data) {
                        $scope.share_options = queues[0].data;
                        angular.forEach($scope.share_options, function (value, key) {
                            if (angular.isDefined($filter('filter')($scope.selectedChart.sharing_boards, {shared_to_id: value.shared_to_id})[0])) {
                                value.matched_choice = true;
                            }
                            if (value.field_code === 'anotherusersdashboards') {
                                angular.forEach($scope.selectedChart.sharing_boards, function (val, k) {
                                    if (val.shared_employee_id !== "") {
//                                       // here i am writing selectedMetric because i am using the same html for metrics and chart
                                        $scope.selectedMetric.user_dashboard = val.full_name;
                                        $scope.selectedMetric.specific_user_id_dashboard = val.shared_employee_id;
                                    }
                                });
                            }
                        });
                        $scope.$uibModalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/analyticsModule/views/sharePopup.html',
                            backdrop: 'static',
                            scope: $scope,
                            resolve: {
                                item: function () {
                                    return $scope.selectedChart.shared_to_id;
                                }}
                        });
                    }
                    console.log($scope.selectedChart);
                }, function (errors) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
        $scope.shareFunc = function () {
            post = [];
            sh_emp_id = null;
            if ($scope.selectedMetric.shared_to_id) {
                angular.forEach($scope.selectedMetric.shared_to_id, function (value, key) {
                    if (value) {
                        if (key === $filter('filter')($scope.share_options, {field_code: 'anotherusersdashboards'})[0].shared_to_id) {
                            sh_emp_id = $scope.selectedMetric.specific_user_id_dashboard;
                        }
                        post.push({
                            shared_to_id: key,
                            shared_employee_id: sh_emp_id
                        });
                    }
                });
                $scope.selectedChart.share_array = post;
                analyticsService.shareFunc($scope.selectedChart).then(function (response) {
                    if (response.data === 1) {
                        $scope.cancel();
                        $state.reload();
                        coreService.resetAlert();
                        coreService.setAlert({type: 'success', message: constantService.getMessage('shareSuccessfull')});
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('shareSelection')});
            }

        };
        $scope.checkDateVal = function (value) {
            if (angular.isDefined(value) && value !== null && value !== '' && value !== '-') {
                if (value.indexOf('/') > -1) {
                    var pos = value.split(/-/);
                    if ($.trim(pos[0]) === $.trim(pos[pos.length - 1])) {
                        value = $.trim(pos[0]);
                        $scope.time_frame_from = $.trim(pos[0]);
                        $scope.time_frame_to = '';
                    } else {
                        $scope.time_frame_from = $.trim(pos[0]);
                        $scope.time_frame_to = $.trim(pos[pos.length - 1]);
                    }
                    var time_frame_from_array = $scope.time_frame_from.split('/');
                    $scope.time_frame_from = time_frame_from_array[2] + '-' + time_frame_from_array[0] + '-' + time_frame_from_array[1];
                    var time_frame_to_array = $scope.time_frame_to.split('/');
                    $scope.time_frame_to = time_frame_to_array[2] + '-' + time_frame_to_array[0] + '-' + time_frame_to_array[1];
                } else {
                    var index = value.length - 10;
                    $scope.time_frame_from = value.slice(0, index);
                    $scope.time_frame_from = $scope.time_frame_from.slice(0, -1);
                    $scope.time_frame_to = value.slice(index);
                }
            }
        };
        $scope.replaceTitle = function (str) {
            if (str != '') {
                if (str.indexOf('/') != -1) {
                    str = str.replace('/', '/<br>');
                }
                else if (str.indexOf('(') != -1) {
                    str = str.replace('(', '<br>(');
                }
                else {
                    str = str.replace(' ', '<br>');
                }
            }

            return str;
        };
        $scope.generateStatisticalTable = function (table_field_name, field1_label, field2_label, field_name2, operation_code, field_name3) {
            var root = $("#gridDiv");
            $(root).empty();
            var tab = document.createElement('table');
            $(tab).attr('class', 'Generatetable');
            $(tab).attr('id', 'TableID');
            var colLable;
            if (operation_code == 'sum') {
                colLable = 'Sum of ' + field2_label;
            }
            else if (operation_code == 'avg') {
                colLable = 'Average of ' + field2_label;
            }
            else {
                colLable = 'Count';
            }

            var tr;
            var td;
            var td1;
            var td2;
            var cTitle = '';
            var table_field_name3 = '';
            var title = $scope.selectedChart.stat_favorite_name;
            if ($.trim(title) !== '') {
                cTitle = title;
            }

            $('#tableTitle').html(cTitle);
            //tab.createCaption().innerHTML = " <b style='font-size: 14px !important;' id='TableIDCaption'>" + cTitle + "</b>";

            if (angular.isDefined(field_name3) && field_name3 !== null && field_name3 !== '') { // 2fields 
                tr = document.createElement('tr');
                td = document.createElement('td');
                td2 = document.createElement('td');
                $(td).addClass('leftpanelchart');
                var message = 'Count of ' + field1_label + '<br> Row Labels';
                $(td).html(message);
                $(tr).append(td);
                var json = $scope.tableChartData(table_field_name, field_name2, field_name3, operation_code, null);
                var titleLength = 0;
                if (json != null) {
                    titleLength = json.length;
                    var title = '';
                    for (var i = 0; i < json.length; i++) {

                        title = $scope.replaceTitle(json[i]['name']);
                        td = document.createElement('td');
                        $(td).addClass('leftpanelchart');
                        $(td).html(title);
                        $(tr).append(td);
                    }
                }
                td2 = document.createElement('td');
                $(td2).addClass('leftpanelchart');
                var message = 'Grand Total';
                $(td2).append(message);
                $(tr).append(td2);
                $(tab).append(tr);
                var FieldId3 = null;
                if (angular.isDefined(field_name3) && field_name3 !== null && field_name3 !== '') {
                    var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: '', product_code: $scope.selectedChart.product_code};
                    analyticsService.getChartFields(post).then(function (response) {
                        $scope.field2array = response.data;
                        table_field_name3 = ($filter('filter')($scope.field2array, {field_name: field_name3})[0]).table_field_name;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
                }
                var sJson = $scope.tableData(field_name3);
                var valueName = '';
                if (sJson != '' && sJson != null) {
                    var newRowCount = [];
                    var oldRowCount = [];
                    for (var x = 0; x < sJson.length; x++) {
                        tr = document.createElement('tr');
                        td = document.createElement('td');
                        $(td).attr('nowrap', true);
                        td2 = document.createElement('td');
                        $(td).addClass('leftpanelchart');
                        valueName = sJson[x][table_field_name3];
                        if (table_field_name3 === 'IsEmerRP') {
                            if (valueName == '0') {
                                valueName = 'No';
                            }
                            else {
                                valueName = 'Yes';
                            }
                        }
                        $(td).append(valueName);
                        $(tr).css('vertical-align', 'top');
                        $(tr).append(td);
                        FieldId3 = sJson[x][field_name3];
                        var json = $scope.tableChartData(table_field_name, field_name2, field_name3, operation_code, FieldId3);
                        var count = 0;
                        if (json != null) {
                            oldRowCount = [];
                            for (var i = 0; i < json.length; i++) {
                                if (i < titleLength) {
                                    oldRowCount.push(parseInt(json[i]["total_count"]));
                                    td = document.createElement('td');
                                    $(td).addClass('leftpanelchartiner2');
                                    $(td).html(json[i]["total_count"]);
                                    count = count + parseInt(json[i]["total_count"]);
                                    $(tr).append(td);
                                }
                            }
                            if (titleLength > json.length) {
                                var diff = titleLength - json.length;
                                // console.log('diff: ' + diff);
                                for (var i = 0; i < diff; i++) {
                                    td = document.createElement('td');
                                    $(td).addClass('leftpanelchartiner2');
                                    $(td).html('0');
                                    $(tr).append(td);
                                    oldRowCount.push(0);
                                }
                            }
                        }

                        td2 = document.createElement('td');
                        $(td2).addClass('leftpanelchartiner2');
                        $(td2).html(count);
                        $(tr).append(td2);
                        $(tab).append(tr);
                        if (newRowCount.length > 0) {
                            var results = [];
                            for (var i = 0; i < oldRowCount.length; i++) {
                                for (var n = 0; n < newRowCount.length; n++) {
                                    if (i === n) {
                                        var val = parseInt(oldRowCount[i]) + parseInt(newRowCount[n]);
                                        results.push(val);
                                    }
                                }
                            }
                            newRowCount = results;
                        }

                        if (x === 0) {
                            newRowCount = oldRowCount;
                        }
                    }
                    tr = document.createElement('tr');
                    td2 = document.createElement('td');
                    $(td2).addClass('leftpanelchart');
                    var message = 'Grand Total';
                    $(td2).append(message);
                    $(tr).append(td2);
                    if (newRowCount.length > 0) {
                        var gCount = 0;
                        for (var y = 0; y < newRowCount.length; y++) {
                            td = document.createElement('td');
                            $(td).html(newRowCount[y]);
                            $(td).addClass('leftpanelchartiner2');
                            gCount = gCount + newRowCount[y];
                            $(tr).append(td);
                        }
                    }
                    td = document.createElement('td');
                    $(td).html(gCount);
                    $(td).addClass('leftpanelchartiner2');
                    $(tr).append(td);
                    $(tab).append(tr);
                    $(root).append(tab);
                }
                else {
                    $(root).append(tab);
                }
                console.log(tab);
            }
            else {
                tr = document.createElement('tr');
                td = document.createElement('td');
                td1 = document.createElement('td');
                td2 = document.createElement('td');
                $(td).addClass('leftpanelchart');
                $(td1).addClass('rightpanelchart');
//                $(td2).addClass('rightpanelchart');
                $(td).html(field1_label);
                $(td1).html('Period');
                $(td2).html(colLable);
                $(tr).append(td);
                $(tr).append(td1);
                $(tr).append(td2);
                $(tab).append(tr);
                var gCount = 0;
                var tCount = 0;
                var json = $scope.tableChartData(table_field_name, field_name2, field_name3, operation_code, null);
                if (json != '' && json != 'null' && json != null) {
                    for (i = 0; i < json.length; i++) {

                        if (operation_code != 'count') {
                            tCount = parseFloat(json[i]["total_count"]);
                        }
                        else {
                            tCount = parseInt(json[i]["total_count"]);
                        }
                        tr = document.createElement('tr');
                        td = document.createElement('td');
                        td1 = document.createElement('td');
                        td2 = document.createElement('td');
                        $(td).addClass('leftpanelchartiner');
                        $(td1).addClass('rightpanelchartiner');
                        $(td).append(json[i]['name']);
                        $(td1).append(json[i]['period']);
                        $(td2).append(tCount);
                        $(tr).css('vertical-align', 'top');
                        $(tr).append(td);
                        $(tr).append(td1);
                        $(tr).append(td2);
                        gCount = gCount + tCount;
                        $(tab).append(tr);
                    }

                    tr = document.createElement('tr');
                    td = document.createElement('td');
                    td2 = document.createElement('td');
                    $(td).addClass('leftpanelchart');
                    $(td2).addClass('rightpanelchartiner');
                    $(td).html('Grand Total');
                    $(td2).attr('colspan', 2);
                    $(td2).html(gCount);
                    $(tr).append(td);
                    $(tr).append(td2);
                    $(tab).append(tr);
                }
                $(root).append(tab);
            }
        };
        var url = appSettings.api + appSettings.version + '/';
        $scope.tableChartData = function (table_field_name, field_name2, field_name3, operation_code, field_id3) {
            var json = '';
            var post = {table_field_name: table_field_name, field_name2: field_name2, field_name3: field_name3, operation_code: operation_code, field_id3: field_id3, org_id: $scope.user.org_id, time_frame_from: $scope.selectedChart.time_frame_from, time_frame_to: $scope.selectedChart.time_frame_to,
                product_code: $scope.selectedChart.product_code, employee_id: $scope.user.employee_id, scope_id: $scope.selectedChart.scope_id, period_items_id: $scope.selectedChart.period_items_id,
                trend_line: $scope.selectedChart.trend_line};
            $.ajax({
                type: 'post',
                url: url + 'gettablechartdata',
                data: post,
                dataType: 'json',
                async: false,
                success: function (response) {
                    json = response;
                }
            });
            return json;
        };
        $scope.tableData = function (field_name3) {
            var json = '';
            var post = {org_id: $scope.user.org_id, field_name: field_name3, product_code: $scope.selectedChart.product_code};
            $.ajax({
                type: 'post',
                url: url + 'gettabledata',
                data: post,
                dataType: 'json',
                async: false,
                success: function (response) {
                    json = response;
                }
            });
            return json;
        };
        $scope.view = function (id) {
            coreService.resetAlert();
            console.log($scope.gridApiFav.selection.getSelectedRows());
            if ($scope.gridApiFav.selection.getSelectedRows().length === 1) {
                if ($scope.gridApiFav.selection.getSelectedRows()[0]['output_type_name'] === 'KPI') {
                    $scope.msgTitle = $scope.gridApiFav.selection.getSelectedRows()[0]['favorite_metrics_name'];
                    var msg_body = $scope.gridApiFav.selection.getSelectedRows()[0]['favorite_metrics_name'] + ' in '
                            + $scope.gridApiFav.selection.getSelectedRows()[0]['product_name'] +
                            ' report = ' + $scope.gridApiFav.selection.getSelectedRows()[0]['metrics_value'];
                    $scope.msgBody = msg_body;
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        scope: $scope
                    });
                } else {
                    $scope.checkDateVal($scope.gridApiFav.selection.getSelectedRows()[0]['time_frame']);
                    $scope.selectedChart = $scope.gridApiFav.selection.getSelectedRows()[0];
                    var output_code = $scope.selectedChart['output_code'];
                    if (output_code === 'verticalbar') {
                        output_code = 'column';
                    } else if (output_code === 'horizontalbar') {
                        output_code = 'bar';
                    }
                    var operation_code = $scope.selectedChart['operation_code'];
                    var chart_name = $scope.selectedChart['favorite_metrics_name'];
                    var chart_options;
                    $scope.selectedChart['time_frame_from'] = $scope.time_frame_from;
                    $scope.selectedChart['time_frame_to'] = $scope.time_frame_to;
                    $scope.selectedChart.stat_favorite_name = chart_name;
                    post = $scope.selectedChart;
                    if ($scope.gridApiFav.selection.getSelectedRows()[0]['default_chart_id'] === '') {
                        var ytitle;
                        if ($scope.selectedChart.field2_label !== '') {
                            ytitle = $scope.selectedChart.operation_code + ' of ' + $scope.selectedChart.field2_label;
                        } else {
                            ytitle = $scope.selectedChart.field2_label;
                        }
                        var xtitle = $scope.selectedChart.field1_label;
                        chart_options = $scope.chartOptionsFun(chart_name, xtitle, ytitle, output_code);
                        analyticsService.drawChart(post).then(function (response) {
                            var chart_data = response.data.final_result;
                            var period_name = response.data.period_name;
                            if (output_code === 'table') {
                                $scope.showTable = true;
                                $scope.showChartFav = false;
                                var table_field_name = $scope.selectedChart['table_field_name'];
                                var field1_label = $scope.selectedChart['field1_label'];
                                var field2_label = $scope.selectedChart['field2_label'];
                                var field_name2 = $scope.selectedChart['field_name2'];
                                var field_name3 = $scope.selectedChart['field_name3'];
                                $scope.generateStatisticalTable(table_field_name, field1_label, field2_label, field_name2, operation_code, field_name3);
                            } else {
                                $scope.showChartFav = true;
                                $scope.showTable = false;
                                if (output_code === 'pie') {
                                    series11 = {type: output_code, name: '', color: '#f58220', data: []};
                                }
                                angular.forEach(chart_data, function (value, key) {
                                    if (value.length) {
                                        if (output_code !== 'pie') {
                                            series11 = {type: output_code, name: period_name[key]['date'], data: []};
                                        }
                                        for (var i = 0; i < value.length; i++) {
                                            if (output_code === 'pie') {
                                                series11.data.push([value[i]["name"] + ' ' + value[i]['period'], parseInt(value[i]["total_count"])]);
                                            } else {
                                                var index = chart_options.xAxis.categories.indexOf(value[i]['name']);
                                                if (index === -1) {
                                                    chart_options.xAxis.categories.push(value[i]['name']);
                                                    index = chart_options.xAxis.categories.indexOf(value[i]['name']);
                                                }
                                                if (operation_code !== 'count') {
                                                    series11.data[index] = parseFloat(value[i]["total_count"]);
                                                }
                                                else {
                                                    series11.data[index] = parseInt(value[i]["total_count"]);
                                                }
                                            }
                                        }
                                        if (output_code != 'pie') {
                                            for (var i = 0; i < chart_options.xAxis.categories.length; i++) {
                                                if (series11.data[i] === undefined)
                                                    series11.data[i] = 0;
                                            }
                                            chart_options.series.push(series11); //for other charts
                                        } else {
                                            chart_options.series.push(series11);
                                        }
                                    }
                                });
                            }
                            var myChart = Highcharts.chart('myChartFav', chart_options);
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                    } else {
                        chart_options = $scope.chartOptionsFun(chart_name, 'x axis', 'y axis', output_code);
                        analyticsService.viewFavChartFun(post).then(function (response) {
                            console.log(response);
                            var chart_data = response.data;
                            $scope.showChartFav = true;
                            $scope.showTable = false;
                            $location.hash(id);
                            $anchorScroll();
                            if (output_code === 'pie') {
                                series11 = {type: output_code, name: chart_name, color: '#f58220', data: []};
                            }
                            angular.forEach(chart_data, function (value, key) {
                                if (key !== 'table_field_name') {
                                    if (key == 0) {
                                        if (output_code != 'pie') {
                                            series11 = {type: output_code, name: 'Company', data: []};
                                        }
                                    } else if (key == 1) {
                                        if (output_code != 'pie') {
                                            series11 = {type: output_code, name: 'Contractor', data: []};
                                        }
                                    } else if (key == 2) {
                                        if (output_code != 'pie') {
                                            series11 = {type: output_code, name: 'All', data: []};
                                        }
                                    }
                                    for (var i = 0; i < value.length; i++) {
                                        if (output_code === 'pie') {
                                            series11.data.push([value[i][chart_data['table_field_name']], parseInt(value[i]["count"])]);
                                        } else {
                                            chart_options.xAxis.categories.push(value[i][chart_data['table_field_name']]);
                                            series11.data.push(parseInt(value[i]["count"]));
                                        }
                                    }
                                    chart_options.series.push(series11);
                                }
                            });
                            var myChart = Highcharts.chart('myChartFav', chart_options);
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                    }

                }
            } else if ($scope.gridApi.selection.getSelectedRows().length < 1) {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };
    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', 'uiGridConstants', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm', '$q', '$location', '$anchorScroll', 'appSettings'];
    angular.module('analyticsModule')
            .controller('chartGridCtrl', controller);
}());

