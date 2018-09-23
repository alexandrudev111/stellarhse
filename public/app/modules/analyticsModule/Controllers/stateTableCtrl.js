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


        /*    $('#period_date').daterangepicker({
         showCustomRangeLabel: false,
         locale: {
         format: "MM/DD/YYYY",
         applyLabel: '',
         cancelLabel: ''
         //                customRangeLabel: ''
         },
         ranges: {
         'Today': [moment(), moment()],
         'Last 7 Days': [moment().subtract(6, 'days'), moment()],
         'Last 30 Days': [moment().subtract(29, 'days'), moment()],
         'This Month': [moment().startOf('month'), moment().endOf('month')],
         'The previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
         'Year to date': [moment().startOf('year')]
         }
         });*/

        $scope.$watch(function () {
            return coreService.getDB();
        }, function (newVal) {
            $scope.db = newVal;
            $scope.hideCount = true;
            $scope.hiddenCols = [];
            if (coreService.getPreviousState() === 'stateTableGrid') {
                $scope.db = newVal;
                coreService.setDB($scope.db);
                $scope.user = coreService.getUser();
                $scope.promise = $q.all([
                    analyticsService.getChartFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id, field_name: '', product_code: $rootScope.selectedChart.product_code}),
                    analyticsService.getOutputFormula($scope.user.language_id),
                    analyticsService.getDecimalFields({org_id: $scope.user.org_id, language_id: $scope.user.language_id, product_code: $rootScope.selectedChart.product_code}),
                    analyticsService.getTimeFrame({org_id: $scope.user.org_id, language_id: $scope.user.language_id}),
                    coreService.getUuid()
                ]).then(function (queues) {
                    $scope.field1array = queues[0].data;
                    $scope.field2array = queues[0].data;
                    $scope.formulalist = queues[1].data;
                    $scope.decimalarray = queues[2].data;
                    $scope.periodDates = queues[3].data;
                    $scope.selectedChart = $rootScope.selectedChart;
                    $scope.checkDecimalFields($scope.selectedChart.operation_code);
                    $scope.selectedChart.time_frame_to = '';
                    $scope.selectedChart.time_frame_from = '';

                    if ($scope.selectedChart.hidden_params.length) {
                        $scope.hiddenCols = $scope.selectedChart.hidden_params.split(',');
                    }
                    if ($rootScope.selectedChart.stat_table_id == null || $rootScope.selectedChart.stat_table_id == '') {
                        $scope.selectedChart.stat_table_id = queues[3].data.success;
                        $scope.selectedChart.operation_id = $scope.formulalist[0].operation_id;
                    } else {
                        $scope.generateChart($scope.selectedChart.output_code);
                    }
                    console.log($scope.selectedChart);
                }, function (errors) {
                    coreService.setAlert({type: 'exception', message: errors[0].data});
                    coreService.setAlert({type: 'exception', message: errors[1].data});
                    coreService.setAlert({type: 'exception', message: errors[2].data});
                    coreService.setAlert({type: 'exception', message: errors[3].data});
                });
            }
        }, true);


        $scope.checkDecimalFields = function (operation_code) {
            console.log(operation_code);
            $scope.selectedChart.operation_code = operation_code;
            $scope.hideCount = true;
            if (operation_code != 'count') {
                $scope.hideCount = false;
                // $scope.selectedChart.field_name2 = '';
            }
        }

        $scope.$watch('selectedChart.field_name', function (newVal, oldVal) {
            if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
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
                console.log(newVal);
                $scope.checkDateVal(newVal);
            }
        });

        $scope.checkDateVal = function (value) {
            if (angular.isDefined(value) && value !== null && value !== '') {
                var pos = value.split(/-/);
                if ($.trim(pos[0]) === $.trim(pos[pos.length - 1])) {
                    $scope.selectedChart.time_frame = $.trim(pos[0]);
                    $scope.selectedChart.time_frame_from = $.trim(pos[0]);
                    $scope.selectedChart.time_frame_to = '';
                } else {
                    $scope.selectedChart.time_frame_from = $.trim(pos[0]);
                    $scope.selectedChart.time_frame_to = $.trim(pos[pos.length - 1]);
                }
            }

        }

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
        }

        $scope.addOrgChart = function (close) {
            $scope.selectedChart.field_id2 = null;
            $scope.selectedChart.field_id3 = null;
            $scope.selectedChart.org_id = $scope.user.org_id;
            $scope.selectedChart.language_id = $scope.user.language_id;
            $scope.selectedChart.hidden_params = $scope.hiddenCols.toString();
            $scope.selectedChart.output_code = $scope.chartType;
            $scope.selectedChart.field_id1 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name})[0]).field_id;
            if ($scope.chartType != 'count' && angular.isDefined($scope.selectedChart.field_name2) && $scope.selectedChart.field_name2 !== null && $scope.selectedChart.field_name2 !== '') {
                $scope.selectedChart.field_id2 = ($filter('filter')($scope.decimalarray, {field_name: $scope.selectedChart.field_name2})[0]).field_id;
            }
            if (angular.isDefined($scope.selectedChart.field_name3) && $scope.selectedChart.field_name3 !== null && $scope.selectedChart.field_name3 !== '') {
                $scope.selectedChart.field_id3 = ($filter('filter')($scope.field1array, {field_name: $scope.selectedChart.field_name3})[0]).field_id;
            }
            $scope.selectedChart.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');

            console.log($scope.selectedChart);
            analyticsService.saveOrgChart($scope.selectedChart).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.stat_table_name_valid = '';
                    if (response.data.success === 2) {
                        $scope.stat_table_name_valid = constantService.getMessage('stat_table_name_valid');
                    } else {
                        if (close) {
                            $state.go('stateTableGrid');
                        }
                    }
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        }

        $scope.generateChart = function (chartType) {
            $scope.chartType = chartType;
            $scope.selectedChart.output_code = chartType;
            console.log('chartType:' + $scope.chartType);

            var s1Name = 'Count';
            var cTitle = '';
            var yTitle = 'Count';
            var operation_code = $scope.selectedChart.operation_code;
            var field_name = $scope.selectedChart.field_name;
            var field_name2 = $scope.selectedChart.field_name2;
            var field_name3 = $scope.selectedChart.field_name3;
            var field1_label = ($filter('filter')($scope.field1array, {field_name: field_name})[0]).field_label;
            var field2_label = '';
            var table_field_name = ($filter('filter')($scope.field1array, {field_name: field_name})[0]).table_field_name;
            var valueName = '';
            var field_id3 = null;
            var sJson;
            var json;
            if (operation_code == 'sum' || operation_code == 'avg') {
                field2_label = ($filter('filter')($scope.decimalarray, {field_name: field_name2})[0]).field_label;
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
            if ($.trim($scope.selectedChart.stat_table_name) !== '') {
                cTitle = $scope.selectedChart.stat_table_name;
            }
            else {
                cTitle = $scope.getChartOrTabletitle(operation_code);
            }

            if (chartType == 'table') {
                $scope.generateStatisticalTable(table_field_name, field1_label, field2_label, field_name2, operation_code, field_name3);
            }
        }


        var removeItemFromArray = function (arr, item) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                }
            }
            return arr;
        }


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
            var td2;
            var cTitle = '';
            var table_field_name3 = '';
            var title = $scope.selectedChart.stat_table_name;
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

                        title = $scope.replaceTitle(json[i][table_field_name]);
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
                                    oldRowCount.push(parseInt(json[i]["TotalCount"]));
                                    td = document.createElement('td');
                                    $(td).addClass('leftpanelchartiner2');
                                    $(td).html(json[i]["TotalCount"]);
                                    count = count + parseInt(json[i]["TotalCount"]);
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
                td2 = document.createElement('td');
                $(td).addClass('leftpanelchart');
                $(td2).addClass('rightpanelchart');
                $(td).html(field1_label);
                $(td2).html(colLable);
                $(tr).append(td);
                $(tr).append(td2);
                $(tab).append(tr);
                var gCount = 0;
                var tCount = 0;
                var json = $scope.tableChartData(table_field_name, field_name2, field_name3, operation_code, null);
                if (json != '' && json != 'null' && json != null) {
                    for (i = 0; i < json.length; i++) {

                        if (operation_code != 'count') {
                            tCount = parseFloat(json[i]["TotalCount"]);
                        }
                        else {
                            tCount = parseInt(json[i]["TotalCount"]);
                        }
                        tr = document.createElement('tr');
                        td = document.createElement('td');
                        td2 = document.createElement('td');
                        $(td).addClass('leftpanelchartiner');
                        $(td2).addClass('rightpanelchartiner');
                        $(td).append(json[i][table_field_name]);
                        $(td2).append(tCount);
                        $(tr).css('vertical-align', 'top');
                        $(tr).append(td);
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
                    $(td2).html(gCount);
                    $(tr).append(td);
                    $(tr).append(td2);
                    $(tab).append(tr);
                }
                $(root).append(tab);
            }
        }

        var url = appSettings.api + appSettings.version + '/';
        $scope.tableChartData = function (table_field_name, field_name2, field_name3, operation_code, field_id3) {
            var json = '';
            var post = {table_field_name: table_field_name, field_name2: field_name2, field_name3: field_name3, operation_code: operation_code, field_id3: field_id3, org_id: $scope.user.org_id, time_frame_from: $scope.selectedChart.time_frame_from, time_frame_to: $scope.selectedChart.time_frame_to, product_code: $scope.selectedChart.product_code};
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
            var post = {org_id: $scope.user.org_id, field_name: field_name3};
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
            .controller('stateTableCtrl', controller);
}());

