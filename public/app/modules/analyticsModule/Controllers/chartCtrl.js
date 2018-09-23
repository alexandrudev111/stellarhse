(function () {
    var controller = function ($scope, $rootScope, constantService, analyticsService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm, appSettings) {
        $scope.permissions = coreService.getPermissions();
        $('#incident_date').daterangepicker({
            changeYear: true,
            changeMonth: true,
            applyClass: 'btn-green',
            showDropdowns: true,
            arrows: false,
            locale: {
                applyLabel: "Apply",
                fromLabel: "From",
                format: "MM/DD/YYYY",
                toLabel: "To",
                cancelLabel: 'Cancel',
                customRangeLabel: 'Custom range'
            }
        });
        $scope.disabled = true;
        $scope.default_or_added = true;
        if ($rootScope.isNew) {
            $scope.disabled = false;
        }

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
                $scope.products = $scope.user.products;
                $scope.promise = $q.all([
                    analyticsService.getOutputFormula($scope.user.language_id),
                    analyticsService.getMetricPeriodItems($scope.user.language_id),
                    coreService.getUuid(),
                    analyticsService.getSharingOptions($scope.user.language_id),
                    analyticsService.getMetricScope($scope.user.language_id),
                    analyticsService.getChartFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: '', product_code: $scope.selectedChart.product_code}),
                    analyticsService.getDecimalFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id, product_code: $scope.selectedChart.product_code})
                ]).then(function (queues) {
                    $scope.formulalist = queues[0].data;
                    $scope.periodDates = queues[1].data;
                    $scope.share_options = queues[3].data;
                    $scope.metricsScope = queues[4].data;
                    $scope.field1array = queues[5].data;
                    $scope.field2array = queues[5].data;
                    $scope.decimalarray = queues[6].data;
                    if ($scope.selectedChart.default_chart_id) {
                        $scope.default_or_added = false;
                    }
                    if ($scope.share_options) {
                        angular.forEach($scope.share_options, function (value, key) {
                            if (angular.isDefined($filter('filter')($scope.selectedChart.sharing_boards, {shared_to_id: value.shared_to_id})[0])) {
                                value.matched_choice = true;
                            }
                            if (value.field_code === 'anotherusersdashboards') {
                                angular.forEach($scope.selectedChart.sharing_boards, function (val, k) {
                                    if (val.shared_employee_id !== "") {
                                        $scope.selectedChart.user_dashboard = val.full_name;
                                        $scope.selectedChart.specific_user_id_dashboard = val.shared_employee_id;
                                    }
                                });
                            }
                        });
                    }

                    if ($scope.selectedChart.field_id1) {
                        $scope.selectedChart.field_name = ($filter('filter')($scope.field1array, {field_id: $scope.selectedChart.field_id1})[0]).field_name;
                    }

                    if ($scope.selectedChart.field_id2) {
                        $scope.selectedChart.field_name2 = ($filter('filter')($scope.decimalarray, {field_id: $scope.selectedChart.field_id2})[0]).field_name;
                    }
                    if ($scope.selectedChart.field_id3) {
                        $scope.selectedChart.field_name3 = ($filter('filter')($scope.field1array, {field_id: $scope.selectedChart.field_id3})[0]).field_name;
                    }
                    if ($scope.selectedChart.time_frame) {
                        $scope.checkDateVal($scope.selectedChart.time_frame);
                    }
                    $scope.checkDecimalFields($scope.selectedChart.operation_code);
                    if ($scope.selectedChart.hidden_params.length) {
                        $scope.hiddenCols = $scope.selectedChart.hidden_params.split(',');
                    }

                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                    coreService.setAlert({type: 'exception', message: errors[3].data});
                    coreService.setAlert({type: 'exception', message: errors[4].data});
                });
            }
        }, true);

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

        $scope.checkDecimalFields = function (operation_code) {
            console.log(operation_code);
            $scope.selectedChart.operation_code = operation_code;
            $scope.hideCount = true;
            if (operation_code != 'count') {
                $scope.hideCount = false;
            } else {
                $scope.selectedChart.field_name2 = '';
            }
        };

        $scope.$watch('selectedChart.product_id', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                $scope.selectedChart.product_code = ($filter('filter')($scope.products, {product_id: newVal})[0]).product_code;
                $scope.selectedChart.product_name = ($filter('filter')($scope.products, {product_code: $scope.selectedChart.product_code})[0]).product_name;
                var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: '', product_code: $scope.selectedChart.product_code};
                $q.all([
                    analyticsService.getChartFields(post),
                    analyticsService.getDecimalFields(post)
                ]).then(function (queues) {
                    if (!queues[0].data.hasOwnProperty('file')) {
                        $scope.field1array = $scope.field2array = queues[0].data;
                    }
                    if (!queues[1].data.hasOwnProperty('file')) {
                        $scope.decimalarray = queues[1].data;
                    }
                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                });
            }
        });

        $scope.$watch('selectedChart.field_name', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                $scope.selectedChart.table_field_name = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).table_field_name;
                var post = {org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: newVal, product_code: $scope.selectedChart.product_code};
                analyticsService.getChartFields(post).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.field2array = response.data;
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        });

        $scope.$watch('selectedChart.time_frame', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                $scope.checkDateVal(newVal);
            } else if (newVal === '') {
                $scope.selectedChart.time_frame_from = '';
                $scope.selectedChart.time_frame_to = '';
            }
        });

        $scope.checkDateVal = function (value) {
            if (angular.isDefined(value) && value !== null && value !== '' && value !== '-') {
                if (value.indexOf('/') > -1) {
                    var pos = value.split(/-/);
                    if ($.trim(pos[0]) === $.trim(pos[pos.length - 1])) {
                        value = $.trim(pos[0]);
                        $scope.selectedChart.time_frame_from = $.trim(pos[0]);
                        $scope.selectedChart.time_frame_to = '';
                    } else {
                        $scope.selectedChart.time_frame_from = $.trim(pos[0]);
                        $scope.selectedChart.time_frame_to = $.trim(pos[pos.length - 1]);
                    }
                    var time_frame_from_array = $scope.selectedChart.time_frame_from.split('/');
                    $scope.selectedChart.time_frame_from = time_frame_from_array[2] + '-' + time_frame_from_array[0] + '-' + time_frame_from_array[1];
                    var time_frame_to_array = $scope.selectedChart.time_frame_to.split('/');
                    $scope.selectedChart.time_frame_to = time_frame_to_array[2] + '-' + time_frame_to_array[0] + '-' + time_frame_to_array[1];
                } else {
                    var index = value.length - 10;
                    $scope.selectedChart.time_frame_from = value.slice(0, index);
                    $scope.selectedChart.time_frame_from = $scope.selectedChart.time_frame_from.slice(0, -1);
                    $scope.selectedChart.time_frame_to = value.slice(index);
                }
            }
        };

        $scope.getChartOrTabletitle = function (outputFormula) {
            var cTitle = '';
            var field1_label = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).field_label;
            var field2_label = '';
            var time_frame = $scope.selectedChart.time_frame;

            if (outputFormula == 'sum' || outputFormula == 'avg') {
                field2_label = ($filter('filter')($scope.decimalarray, {field_name: field_name2})[0]).field_label;
            }
            if (outputFormula == 'sum') {
                outputFormula = 'sum';
                cTitle = 'Sum of ' + field2_label + ' per ' + field1_label;
            }
            else if (outputFormula == 'avg') {
                outputFormula = 'avg';
                cTitle = 'Average of ' + field2_label + ' per ' + field1_label;
            }
            else if (outputFormula == 'count') {
                cTitle = 'Count of ' + field1_label;
            }
            console.log($scope.selectedChart.field_name2);
            if ($scope.chartType != 'count' && angular.isDefined($scope.selectedChart.field_name3) && $scope.selectedChart.field_name3 !== null && $scope.selectedChart.field_name3 !== '') {
                var field3_label = ($filter('filter')($scope.field2array, {field_name: $scope.selectedChart.field_name3})[0]).field_label;
                cTitle += ' by ' + field3_label;
            }
            if (time_frame != '') {
                //  var IncidentDateFormula = $('#IncidentDateFormula').val();
                var dateText = time_frame;
                /* if (IncidentDateFormula !== '') {
                 switch (IncidentDateFormula) {
                 case "Today":
                 case "Last 7 days":
                 case "Month to date":
                 case "Year to date":
                 case "The previous Month":
                 dateText = IncidentDateFormula;
                 break;
                 case "Specific Date":
                 case "Date Range":
                 dateText = IncidentDateFormula + '( ' + time_frame + ' )';
                 break;
                 case "All Dates Before":
                 var pos = time_frame.split(/-/);
                 time_frame = pos[1];
                 dateText = IncidentDateFormula + '( ' + time_frame + ' )';
                 break;
                 case "All Dates After":
                 var pos = time_frame.split(/-/);
                 time_frame = pos[0];
                 dateText = IncidentDateFormula + '( ' + time_frame + ' )';
                 break;
                 }
                 }*/
                cTitle += ' ' + dateText;
            }

            return cTitle;
        };

        $scope.updateFun = function () {
            $scope.disabled = false;
        };

        $scope.getOutputCodeId = function (chartType) {
            var output_code = chartType;
            $scope.selectedChart.output_code = chartType;
            if (chartType === 'column') {
                output_code = 'verticalbar';
            } else if (chartType === 'bar') {
                output_code = 'horizontalbar';
            }
            post = {output_code: output_code, lang_id: $scope.user.language_id};
            analyticsService.getOutputcodeId(post).then(function (response) {
                $scope.selectedChart.output_type_id = response.data[0].output_type_id;
                $scope.selectedChart.output_type_name = response.data[0].output_type_name;
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.addOrgChart = function (close) {
            $scope.selectedChart.field_id2 = null;
            $scope.selectedChart.field_id3 = null;
            $scope.selectedChart.org_id = $scope.user.org_id;
            $scope.selectedChart.language_id = $scope.user.language_id;
            $scope.selectedChart.hidden_params = $scope.hiddenCols.toString();
            $scope.selectedChart.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');
            if (!$scope.selectedChart.default_chart_id || $scope.selectedChart.default_chart_id === '') {
                $scope.selectedChart.field_id1 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).field_id;
            }
            if ($scope.chartType != 'count' && angular.isDefined($scope.selectedChart.field_name2) && $scope.selectedChart.field_name2 !== null && $scope.selectedChart.field_name2 !== '') {
                $scope.selectedChart.field_id2 = ($filter('filter')($scope.decimalarray, {field_name: $scope.selectedChart.field_name2})[0]).field_id;
            }
            if (angular.isDefined($scope.selectedChart.field_name3) && $scope.selectedChart.field_name3 !== null && $scope.selectedChart.field_name3 !== '') {
                $scope.selectedChart.field_id3 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name3})[0]).field_id;
            }
            if (angular.isObject($scope.selectedChart.period_items_id)) {
                $scope.selectedChart.period_items_name = $scope.selectedChart.period_items_id.period_items_name;
                $scope.selectedChart.period_field_code = $scope.selectedChart.period_items_id['field_code'];
                $scope.selectedChart.period_items_id = $scope.selectedChart.period_items_id.period_items_id;
            }
            post = [];
            sh_emp_id = null;
            if ($scope.selectedChart.shared_to_id) {
                angular.forEach($scope.selectedChart.shared_to_id, function (value, key) {
                    if (key === $filter('filter')($scope.share_options, {field_code: 'anotherusersdashboards'})[0].shared_to_id) {
                        sh_emp_id = $scope.selectedChart.specific_user_id_dashboard;
                    }
                    post.push({
                        shared_to_id: key,
                        shared_employee_id: sh_emp_id
                    });
                });
                $scope.selectedChart.share_array = post;
            }
            var output_code = $scope.selectedChart.output_code;
            if (output_code === 'verticalbar') {
                output_code = 'column';
            } else if (output_code === 'horizontalbar') {
                output_code = 'bar';
            }
            var chart_options;
            var chart_name;

            if ($scope.selectedChart.default_chart_id) { // edit favourite chart
                if ($scope.selectedChart.stat_favorite_name) {
                    $scope.selectedChart.favorite_metrics_name = $scope.selectedChart.stat_favorite_name;
                }
                chart_name = $scope.selectedChart.favorite_metrics_name;
                chart_options = $scope.chartOptions(chart_name, 'x axis', 'y axis', output_code);
            }

            analyticsService.saveOrgChart($scope.selectedChart).then(function (response) {
                console.log(response);
                if (!response.data.hasOwnProperty('file')) {
                    $scope.stat_table_name_valid = '';
                    if (response.data.success === 2) {
                        $scope.stat_table_name_valid = constantService.getMessage('stat_table_name_valid');
                    } else if (response.data.success === 1) {
                        coreService.resetAlert();
                        if (response.data.operation === 'add') {
                            coreService.setAlert({type: 'success', message: 'Chart added successfully'});
                        } else if (response.data.operation === 'update') {
                            coreService.setAlert({type: 'success', message: 'Chart edited successfully'});
                        }

                    } else {
                        if ($scope.selectedChart.default_chart_id) { // edited fav charts
                            var chart_data = response.data;
                            if (output_code === 'pie') {
                                series11 = {type: output_code, name: '', color: '#f58220', data: []};
                            }
                            angular.forEach(chart_data, function (value, key) {
                                if (key !== 'table_field_name') {
                                    if (key == 0) {
                                        if (output_code != 'pie') {
                                            series11 = {type: output_code, name: 'Company', data: []};
                                        }
                                    } else if (key == 1 && output_code != 'pie') {
                                        series11 = {type: output_code, name: 'Contractor', data: []};
                                    } else if (key == 2 && output_code != 'pie') {
                                        series11 = {type: output_code, name: 'All', data: []};
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
                            var myChart = Highcharts.chart('myChart', chart_options);
                        }
                    }
                    if (close) {
                        $state.go('chartgrid');
                    }
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.refreshChart = function () {
            var chart_div = angular.element(document.querySelector('#chartDiv'));
            chart_div.empty();
            var table_div = angular.element(document.querySelector('#gridDiv'));
            table_div.empty();
            var table_title = angular.element(document.querySelector('#tableTitle'));
            table_title.empty();
        };

        $scope.generateChart = function (chartType, def_or_new_checker) {
            if (def_or_new_checker) {
                //add or edit user charts
                var output_code = '';
                $scope.chartType = chartType;
                if (chartType === 'column') {
                    output_code = 'verticalbar';
                } else if (chartType === 'bar') {
                    output_code = 'horizontalbar';
                } else {
                    output_code = chartType;
                }
                $scope.selectedChart.output_code = output_code;
                $scope.drawChart();
            } else {
                // edit favourit charts getting output code
                var output_code = chartType;
                $scope.selectedChart.output_code = chartType;
                if (chartType === 'column') {
                    output_code = 'verticalbar';
                } else if (chartType === 'bar') {
                    output_code = 'horizontalbar';
                }
                post = {output_code: output_code, lang_id: $scope.user.language_id};
                analyticsService.getOutputcodeId(post).then(function (response) {
                    $scope.selectedChart.output_type_id = response.data[0].output_type_id;
                    $scope.selectedChart.output_type_name = response.data[0].output_type_name;
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
        };

        $scope.drawChart = function () {
            console.log($scope.selectedChart.field_name);
            $scope.selectedChart.field_id1 = null;
            $scope.selectedChart.field_id2 = null;
            $scope.selectedChart.field_id3 = null;
            $scope.selectedChart.org_id = $scope.user.org_id;
            $scope.selectedChart.language_id = $scope.user.language_id;
            $scope.selectedChart.hidden_params = $scope.hiddenCols.toString();
            $scope.selectedChart.field_id1 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).field_id;
            if ($scope.chartType != 'count' && angular.isDefined($scope.selectedChart.field_name2) && $scope.selectedChart.field_name2 !== null && $scope.selectedChart.field_name2 !== '') {
                $scope.selectedChart.field_id2 = ($filter('filter')($scope.decimalarray, {field_name: $scope.selectedChart.field_name2})[0]).field_id;
            }
            if (angular.isDefined($scope.selectedChart.field_name3) && $scope.selectedChart.field_name3 !== null && $scope.selectedChart.field_name3 !== '') {
                $scope.selectedChart.field_id3 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name3})[0]).field_id;
            }
            if (angular.isObject($scope.selectedChart.period_items_id)) {
                $scope.selectedChart.period_items_name = $scope.selectedChart.period_items_id.period_items_name;
                $scope.selectedChart.period_field_code = $scope.selectedChart.period_items_id['field_code'];
                $scope.selectedChart.period_items_id = $scope.selectedChart.period_items_id.period_items_id;
            }
            var output_code = $scope.selectedChart.output_code;
            if (output_code === 'verticalbar') {
                output_code = 'column';
            } else if (output_code === 'horizontalbar') {
                output_code = 'bar';
            }
            var chart_options;
            var cTitle;
            var yTitle = 'Count';
            var operation_code = $scope.selectedChart.operation_code;
            var field2_label = '';

            var field1_label = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).field_label;
            var table_field_name = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).table_field_name;
            if (operation_code == 'sum' || operation_code == 'avg') {
                field2_label = ($filter('filter')($scope.decimalarray, {field_name: $scope.selectedChart.field_name2})[0]).field_label;
            }
            if ($.trim($scope.selectedChart.stat_favorite_name) !== '') {
                cTitle = $scope.selectedChart.stat_favorite_name;
            }
            else {
                cTitle = $scope.getChartOrTabletitle(operation_code);
            }
            switch (operation_code) {
                case 'count':
                    s1Name = 'Count of ' + field1_label;
                    field_name2 = '';
                    break;
                case 'sum':
                    s1Name = 'Sum of ' + field2_label;
                    yTitle = 'Sum of ' + field2_label;
                    break;
                case 'avg':
                    s1Name = 'Average of ' + field2_label;
                    yTitle = 'Average of ' + field2_label;
                    break;
            }
            chart_name = $scope.selectedChart.stat_favorite_name;
            chart_options = $scope.chartOptions(cTitle, field1_label, yTitle, output_code);
            analyticsService.drawChart($scope.selectedChart).then(function (response) {
                console.log(response);
                var chart_data = response.data.final_result;
                var period_name = response.data.period_name;
                if (output_code === 'table') {
                    $scope.generateStatisticalTable(table_field_name, field1_label, field2_label, $scope.selectedChart.field_name2, operation_code, $scope.selectedChart.field_name3);
                } else {
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
                var myChart = Highcharts.chart('myChart', chart_options);
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.chartOptions = function (cTitle, xTitle, yTitle, s1Type) {
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
        }

        var removeItemFromArray = function (arr, item) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                }
            }
            return arr;
        };


        $scope.generateStatisticalTable = function (table_field_name, field1_label, field2_label, field_name2, operation_code, field_name3) {
            console.log(operation_code);
            // $scope.ischecked = true;
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
            else {
                cTitle = $scope.getChartOrTabletitle(operation_code);
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
                console.log('titleLength: ' + json.length);
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
                    table_field_name3 = ($filter('filter')($scope.field2array, {field_name: field_name3})[0]).table_field_name;
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
        $scope.chartData = function (table_field_name, field_name2, field_name3, operation_code, field_id3) {
            var json = '';
            var post = {table_field_name: table_field_name, field_name2: field_name2, field_name3: field_name3, operation_code: operation_code, field_id3: field_id3, org_id: $scope.user.org_id, time_frame_from: $scope.selectedChart.time_frame_from, time_frame_to: $scope.selectedChart.time_frame_to, product_code: $scope.selectedChart.product_code};
            $.ajax({
                type: 'post',
                url: url + 'getchartdata',
                data: post,
                dataType: 'json',
                async: false,
                success: function (response) {
                    json = response;
                }
            });
            return json;
        }

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
        }

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
        }

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
        }

        $scope.showhideDropDown = function () {
            $scope.ischecked = $scope.ischecked === true ? false : true;
        }

        $scope.exportTableToCSV = function (type) {
            $('#TableID').tableExport({type: type, escape: 'false'});
            $scope.ischecked = false;
        }
        $scope.exportTableToPDF = function () {
            var tableTitle = $("#tableTitle").html();
            var pdf = new jsPDF('p', 'pt', 'c0');
            pdf.text(400, 70, tableTitle);

            var source = $('#gridDiv')[0]; //table Id
            specialElementHandlers = {
                '#bypassme': function (element, renderer) {
                    return true;
                }
            };
            margins = {//table margins and width
                top: 70,
                bottom: 20,
                left: 30//,
                        //width: 1024
            };
            pdf.fromHTML(
                    source,
                    margins.left,
                    margins.top, {
                        //'width': margins.width,
                        'elementHandlers': specialElementHandlers
                    },
            function (dispose) {
                pdf.save('table.pdf');
            }, margins);

            $scope.ischecked = false;
        }


    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'analyticsService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', '$confirm', 'appSettings'];
    angular.module('analyticsModule')
            .config(['ChartJsProvider', function (ChartJsProvider) {
                    // Configure all charts
                    ChartJsProvider.setOptions({
                        chartColors: // ['#3498db', '#34495e', '#e74c3c', '#16a085', '#f39c12'],
                                ['#0088cc', '#55bb33', '#ee5511', '#dddd00', '#22ccee', '#66ee77', '#ff9955', '#ffff66', '#66ffcc', '#0088cc', '#55bb33', '#ee5511', '#dddd00', '#22ccee', '#66ee77', '#ff9955', '#ffff66', '#66ffcc', '#55bb33', '#ee5511', '#dddd00', '#22ccee', '#66ee77', '#ff9955', '#ffff66', '#66ffcc'],
                        responsive: true
                    });
                    // Configure all line charts
                    ChartJsProvider.setOptions('line', {
                        showLines: true
                    });

                    $(window).scroll(function () {
                        if ($(this).scrollTop() > 180) {

                            $(".chartFixed").addClass("fixedChart");

                        } else {

                            $(".chartFixed").removeClass("fixedChart");

                        }

                    });


                    $(".RemoveBtnStyle button").click(function () {

                        $(this).addClass("activeBtn");
                    });



                }])
            .controller('chartCtrl', controller);
}());

