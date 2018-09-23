(function () {
    var controller = function ($scope, $rootScope, $uibModal, reportObject, coreService, viewDataTablesService, $filter, $q, $state, uiGridConstants, uiGridExporterConstants, coreReportService) {
        $scope.isOpenArr = [{
            isOpen: 'status.Default'
        }];
        $scope.user = coreService.getUser();
        $scope.company_name = $scope.user.org_name;
        $scope.templateObject = {};
        $scope.oneAtATime = true;
        $scope.selectedOrg = null;
        $scope.report_tabs = {};
        $scope.disableEmail =false;
        var currentTab = '';
        var tempParamObj = '';
        var userPermission = null;
        var OrgId = null;
        var temp_name = null;
        var EmployeeId = null;
        $scope.allTemplateTypes = [];
        var dbName = $scope.reportObject.dbname;
        var Temp_body = null;
        $scope.defaultTempType='MyTemplate';
        viewDataTablesService.getTemplateTypes({language_id:$scope.user.language_id}).then(function (res) {
            if (res.data) {
                $scope.allTemplateTypes = res.data;
            }
        }, function (err) {
            console.error(err);
        });
        $scope.tinymceOptions = {
            selector: 'textarea',
            height: 350,
            // min_height: 390,
            // max_height: 390,
            // fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
            plugins: "lists",
            menubar: false,
            toolbar: "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify bullist numlist | undo redo | fontselect | fontsizeselect"
        };
        $scope.products = [];
        $scope.reportObject = reportObject;
        console.log(reportObject);
        $scope.products = $scope.user.products;
        $scope.default_field = {};
        $scope.config = {
            autoHideScrollbar: false,
            theme: 'dark-thick',
            advanced: {
                updateOnContentResize: true
            },
            setHeight: 150,
            scrollInertia: 0
        };

        var openOrgsMenu = function (action) {
            TemplateTypeId = $("#TemplateTypeId").val(); 
            viewDataTablesService.checkTemplateType({language_id:$scope.user.language_id,template_type_id:TemplateTypeId}).then(function (res) {
                if (res.data) {
                    if(res.data[0].template_type_code =="MyTemplate"){
                            if (action == 'new') {
                                OrgId = $scope.user.org_id;
                            }
                            var body = {
                                orgId: OrgId
                            };
                            var modalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'app/modules/viewDataTablesModule/views/move.html',
                                controller: 'moveCtrl',
                                resolve: {
                                    testObject: function () {
                                        return body;
                                    },
                                    msg: function () {
                                        return {};
                                    }
                                }
                            });

                            modalInstance.result.then(function (data) {
                                if (data) {
                                    OrgId = data.org_id;
                                    $scope.selectedOrg = data;
                                    if (!document.getElementById(OrgId)) {
                                        console.log("new accordion");
                //                        $scope.reportObject.templatesTypes.push(val);

                                        // $("#accordions").accordion("refresh");
                                    }
                                    console.log(data);
                                    if (action == 'update') {
                                        CheckTemplateBeforSave('update');
                                    } else if (action == 'new') {
                                        CheckTemplateBeforSave('new');
                                    }

                                }
                            }, function (err) {});
                    }else if(res.data[0].template_type_code == "DefaultTemplate"){
                        OrgId ='';
                       if (action == 'update') {
                           CheckTemplateBeforSave('update');
                       } else if (action == 'new') {
                           CheckTemplateBeforSave('new');
                       }
                   }
               }
            }, function (err) {
                console.error(err);
            });
            
        };

        var sortOn = function (arr, prop, reverse, numeric) {
            // Ensure there's a property
            if (!prop || !arr) {
                return arr;
            }
            // Set up sort function
            var sort_by = function (field, rev, primer) {
                // Return the required a,b function
                return function (a, b) {
                    // Reset a, b to the field
                    a = primer(a[field]), b = primer(b[field]);
                    // Do actual sorting, reverse as needed
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (rev ? -1 : 1);
                };
            };
            // Distinguish between numeric and string to prevent 100's from coming before smaller
            // e.g.
            // 1
            // 20
            // 3
            // 4000
            // 50
            if (numeric) {
                // Do sort "in place" with sort_by function
                arr.sort(sort_by(prop, reverse, function (a) {
                    // - Force value to a string.
                    // - Replace any non numeric characters.
                    // - Parse as float to allow 0.02 values.
                    return parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
                }));
            } else {
                // Do sort "in place" with sort_by function
                arr.sort(sort_by(prop, reverse, function (a) {
                    // - Force value to string.
                    return String(a).toUpperCase();
                }));
            }

            return arr;
        };

        $scope.isOpen = function (key) {
            if (key == 0) {
                return 'status.Default';
            }

            return 'status.Compant';
        }

        function populateAlertMsg(msgCode) {
            var ret = '';
            var AllAlertMsgs = JSON.parse(localStorage.getItem('AllAlertMsgs'));
            var p = FilterArray(AllAlertMsgs, msgCode, 'AlertMessageCode');
            $.each(p, function (i, item) {
                if (item.AlertMessageCode == msgCode) {
                    ret = item.AlertMessageDescription;
                }
            });
            return ret;
        }

        function PopulateTemplates(p, Span, parent, item) {
            if (item.template_type_code !== "DefaultTemplate") {
                parent = $("#" + item.org_id + "");
            }
            $(Span).css("cursor", "pointer");

            $(Span).addClass('LabelSpan');
            var text = item.template_name;
            if (item.template_type_code == "SharedTemplate") {
                var imageTitle = '';
                if (item.employee_id == localStorage.getItem('EmployeeId')) {
                    imageTitle = populateAlertMsg('sharedbyyou');
                } else {
                    var sharedByMsg = populateAlertMsg('sharedby');
                    imageTitle = sharedByMsg + ' (' + item.FullName + ' )';
                }

                var _img = document.createElement('img');
                _img.src = "resources/images/document_share.png";
                $(_img).attr('title', imageTitle);
                text += '   ';
                $(Span).html(text);
                $(Span).append(_img);
            } else {
                $(Span).html(text);
            }
            $(Span).click(function () {
                $("#TemplateTypeCode").val(item.template_type_code);
                $("#Old_TemplateTypeCode").val(item.template_type_code);
                OpenUserTemplate(item.template_id, item.template_name);
                $(this).addClass('active');
                $('.LabelSpan').not($(this)).removeClass('active');
            });
            
            $(Span).attr('id', item.template_id);
            $(p).append(Span);
            $(parent).append(p);
        }

        function setUpEvents() {
            var id = $scope.reportObject.incident_id;
            $("#btnDeleteUserTemplate")
                .click(function () {
                    if (confirm("Are you sure you want to delete this template?")) {
                        DeleteUserTemplateReport(id);
                    }
                });
            $("#btnSaveUserTemplate")
                .click(function () {
                    openOrgsMenu('update');
                });
            $("#btnAddNewUserTemplate")
                .click(function () {
                    openOrgsMenu('new');
                });

            $("#btnOpenInWord")
                .click(function () {
                    if($('#TemplateId').val() == 0){
                        alert('Please Select Template');
                        return false;
                    }
                    var report_data ={
                        dbname: dbName,
                        report_id:$scope.reportObject.report_id,
                        report_type:$scope.reportObject.report_type,
                        template_id:$('#TemplateId').val(),
                        language_id:$scope.user.language_id,
                        report_number:$scope.reportObject.report_number,
                        org_id:$scope.reportObject.org_id,
                        base_url : window.location.origin,
                        created_by :$scope.user.full_name

                    };
                    viewDataTablesService.printReportTemplate(report_data).then(
                        function (res) {
                            var path = res.data;
                            path = path.replace(/\0+$/, ''); //for Safari exception
                           window.open(path);
                        },
                        function (err) {
                            console.error(err);
                        }
                    );
            
                });

            $("#btnAttachToEmail")
                .click(function () {
                    EmailReportToUser(id);
                });

            localStorage.setItem('reportnamerequired', populateAlertMsg("reportnamerequired"));
            localStorage.setItem('reportnameexist', populateAlertMsg("reportnameexist"));
            localStorage.setItem('deletereport', populateAlertMsg("deletereport"));
        }

        function populateAlertName(msgCode) {
            var ret = '';
            var AllAlertMsgs = JSON.parse(localStorage.getItem('AllAlertMsgsABCan'));
            //    console.log('AllAlertMsgs: '+ AllAlertMsgs);
            var p = FilterArray(AllAlertMsgs, msgCode, 'AlertMessageCode');
            $.each(p, function (i, item) {
                if (item.AlertMessageCode == msgCode) {
                    ret = item.AlertName;
                }
            });
            return ret;
        }

        function CheckTemplateBeforSave(action) {
            var TemplateName = $('#allorgstempName').val();
            var TemplateId = $('#TemplateId').val();
            if ($.trim(TemplateName) == '') {
                alert("Template Name required!");
                return false;
            } else {
                if (($("#TemplateTypeCode").val() == "DefaultTemplate")) {
                    var message = populateAlertMsg('savetemplatedefault');
                    var title = populateAlertName('savetemplatedefault');
                    OpenNotificationDialog(message, title);
                    return false;
                } else {
                   
                    if (action == 'new') {
                        TemplateId = '0';
                    }
                    
                    var body = {
                        "TemplateId": TemplateId,
                        "OrgId": OrgId,
                        "EmployeeId": EmployeeId,
                        "TemplateName": TemplateName,
                        "dbname": $scope.reportObject.dbname
                    };
                    viewDataTablesService.checkUserTemplateName(body).then(
                        function (res) {
                            if(res.data == 0){
                                SaveTemplateParamters(action);
                                GetTemplates();
                            }else{
                                alert("Template Name Already Exists");
                            }
                        },
                        function (err) {
                            console.error(err);
                        }
                    );
                }
            }
        }

        function SaveTemplateParamters(action) {
            var TemplateName = $('#allorgstempName').val();
            var TemplateId = $('#TemplateId').val();
            var TemplateTypeId = 'null';
            $("div[id$=TemplateTypeId] input:radio").each(function (i, x) {
                if ($(x).is(":checked")) {
                    TemplateTypeId = $(x).val();
                }
            });
            var Operation = 'add';
            if (TemplateId != '' && TemplateId != '0') {
                Operation = 'update';
            }
            if (action == 'new') {
                TemplateId = '0';
                Operation = 'add';
            }
            var postedJson = new Array();
            var paramsJson = new Array();
            var json = GetUserReportParamtersArray();
            if(json ==''){
                alert(" Template Body is Empty");
                return false;
            }
            TemplateTypeId = $("#TemplateTypeId").val();
            var body = {
                "LanguageId": $scope.user.language_id,
                "TemplateId": TemplateId,
                "OrgId": OrgId,
                "user_org": $scope.user.org_id,
                "TemplateTypeId": TemplateTypeId,
                "postedJson": postedJson,
                "paramsJson": paramsJson,
                "EmployeeId": EmployeeId,
                "TemplateName": TemplateName,
//                "TemplateName": temp_name,
                "TemplateBody": json,
                "Operation": action,
                "dbname": dbName
            };
            viewDataTablesService.setTemplateParamters(body).then(
                function (res) {
                    var data = res.data;
                    if (data != null && data != 'null' && data != '[]') {
                        var json = JSON.parse(data);
                        console.log('TemplateId: ' + json[0]['TemplateId']);
                        $('#TemplateId').val(json[0]['TemplateId']);
                        fillTemplateBody(json);
                        GetTemplates();
                        $('#populateTemp').val('false');
                    }
                },
                function (err) {
                    console.error(err);
                    return false;
                }
            );
        }

        function CheckUserTemplateName(TemplateId, TemplateName) {
            var ret = false;
            var body = {
                "TemplateId": TemplateId,
                "OrgId": OrgId,
                "EmployeeId": EmployeeId,
                "TemplateName": TemplateName,
                "dbname": $scope.reportObject.dbname
            };
            viewDataTablesService.checkUserTemplateName(body).then(
                function (res) {
                    if (res.data > 0) {
                       ret = true;
                   }
                },
                function (err) {
                    console.error(err);
                    return false;
                }
            );

            return ret;
        }

        function DeleteUserTemplateReport(id) {

            var TemplateId = $('#TemplateId').val();
            if (TemplateId == '0') {
                $("#Title-ast").html(localStorage.getItem('deletereport'));
                $("#Title-ast").css('display', 'block');
                return false;
            } else {
                if ($("#TemplateTypeCode").val() == "DefaultTemplate") {
                    var message = populateAlertMsg('deletetemplatedefault');
                    var title = populateAlertName('deletetemplatedefault');
                    OpenNotificationDialog(message, title);
                } else {
                    var TemplateId = $('#TemplateId').val();
                    if (TemplateId != '0') {
                        var body = {
                            "TemplateId": TemplateId,
                            "OrgId": OrgId,
                            "EmployeeId": EmployeeId,
                            "dbname": $scope.reportObject.dbname
                        };
                        viewDataTablesService.deleteUserTemplateReport(body).then(
                            function (res) {
                                GetTemplates();
                                ResetFormVariables();
                            },
                            function (err) {
                                console.error(err);
                            }
                        );
                    } else {
                        $("#Title-ast").html(localStorage.getItem('deletereport'));
                    }
                }
            }

        }
        function ResetFormVariables(){
            $('#TemplateId').val('0');
            $('#allorgstempName').val('');
            tinyMCE.activeEditor.setContent('');
        }

        function GetUserReportParamtersArray() {
            var postedJson = new Array();
            var paramsJson = new Array();
            var temp = {};
            var FieldName = '';
            var newString = '';
            var arry1 = '';
            var arry2 = '';
            // Get the raw contents of the currently active editor
            var TemplateBody = tinyMCE.activeEditor.getContent();
            console.log(TemplateBody);
            {
//            arry1 = TemplateBody.split(/table__/);
//            for (var i = 1; i < arry1.length; ++i) {
//                newString = arry1[i];
//                // console.log('newString: ' + newString);
//
//                arry2 = newString.split('class="classTempParam"');
//                // console.log(FieldName);
//                FieldName = $.trim(arry2[0]).replace('"', "");
//                if (FieldName == 'CreatorName' || FieldName == 'UpdatedByName' ||
//                    FieldName == 'IncidentNumber' || FieldName == 'VersionNumber' || FieldName == 'IncidentDate' || FieldName == 'EventTypeId' ||
//                    FieldName == 'RepName' || FieldName == 'RepPosition' || FieldName == 'RepEmail' || FieldName == 'RepCompany' ||
//                    FieldName == 'RepPrimaryPhone' || FieldName == 'Location1Id' || FieldName == 'Location2Id' || FieldName == 'Location3Id' ||
//                    FieldName == 'Location4Id' || FieldName == 'OtherLocation') {} else {
//                    var index = $.inArray(FieldName, postedJson);
//                    if (index == -1) {
//                        postedJson.push(FieldName);
//                    }
//
//                    var ret = '';
//                    var xx = 0;
//                    $(newString + "  input:label").each(function (i, x) {
//                        if ($.trim(x.id) != '' && x.id != undefined) {
//                            if (xx != 0) {
//                                ret += ',';
//                            }
//                            ret += x.id;
//                            xx++;
//                        }
//                    });
//                    temp = {};
//                    temp['FieldName'] = FieldName;
//                    temp['FieldParamName'] = ret;
//                    paramsJson.push(temp);
//                }
//            }
//            var WhatHappenedCustomFieldsArr = [];
//            var ImpactCustomFieldsArr = [];
//            var PeopleCustomFieldsArr = [];
//            var ObservationCustomFieldsArr = [];
//            var InvestigationCustomFieldsArr = [];
//            var ActionsCustomFieldsArr = [];
//            var json = [];
//            var wJson = [];
//            var iJson = [];
//            var pJson = [];
//            var oJson = [];
//            var invJson = [];
//            var aJson = [];
//            var uJson = [];
//            var FieldName;
//
//            // sortOn(tempParamObj, 'FieldOrder', false, true);
//            $.each(tempParamObj, function (index, item) {
//                FieldName = item.FieldName;
//                for (var i = 0; i < postedJson.length; i++) {
//                    console.log(item.TabName);
//
//                    if (item.TabName == 'WhatHappened') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//                                WhatHappenedCustomFieldsArr.push(item);
//                            } else {
//                                if (FieldName !== 'SequenceOfEvents') {
//
//                                    wJson.push(item);
//                                    //wJson.push(FieldName);
//                                }
//                            }
//                        }
//                    } else if (item.TabName == 'Impacts') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//
//                                ImpactCustomFieldsArr.push(item);
//                            } else {
//                                iJson.push(item);
//                                // iJson.push(FieldName);
//                            }
//                        }
//                    } else if (item.TabName == 'People') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//                                PeopleCustomFieldsArr.push(item);
//                            } else {
//                                pJson.push(item);
//                                //pJson.push(FieldName);
//                            }
//                        }
//                    } else if (item.TabName == 'Observation') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//                                ObservationCustomFieldsArr.push(item);
//                            } else {
//                                oJson.push(item);
//                                //oJson.push(FieldName);
//                            }
//                        }
//                    } else if (item.TabName == 'Investigation') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//                                InvestigationCustomFieldsArr.push(item);
//                            } else {
//                                invJson.push(item);
//                                //invJson.push(FieldName);
//                            }
//                        }
//                    } else if (item.TabName == 'Actions') {
//                        if (FieldName == postedJson[i]) {
//                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
//                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
//                                (FieldName.indexOf('select') !== -1)) {
//                                ActionsCustomFieldsArr.push(item);
//                            } else {
//                                aJson.push(item);
//                                //aJson.push(FieldName);
//                            }
//                        }
//                    }
//                }
//            });
//
//            sortOn(wJson, 'FieldOrder', false, true);
//            sortOn(iJson, 'FieldOrder', false, true);
//            sortOn(pJson, 'FieldOrder', false, true);
//            sortOn(oJson, 'FieldOrder', false, true);
//            sortOn(invJson, 'FieldOrder', false, true);
//            // sortOn(uJson, 'FieldOrder', false, true);
//            sortOn(aJson, 'FieldOrder', false, true);
//
//            sortOn(WhatHappenedCustomFieldsArr, 'FieldOrder', false, true);
//            sortOn(ImpactCustomFieldsArr, 'FieldOrder', false, true);
//            sortOn(PeopleCustomFieldsArr, 'FieldOrder', false, true);
//            sortOn(ObservationCustomFieldsArr, 'FieldOrder', false, true);
//            sortOn(InvestigationCustomFieldsArr, 'FieldOrder', false, true);
//            sortOn(ActionsCustomFieldsArr, 'FieldOrder', false, true);
//
//            json = [];
//            var index = 0;
//            if (wJson.length > 0) {
//                $.each(wJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//
//            if (WhatHappenedCustomFieldsArr.length > 0) {
//                $.each(WhatHappenedCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (iJson.length > 0) {
//                $.each(iJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (ImpactCustomFieldsArr.length > 0) {
//                $.each(ImpactCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (pJson.length > 0) {
//                $.each(pJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (PeopleCustomFieldsArr.length > 0) {
//                $.each(PeopleCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (oJson.length > 0) {
//                $.each(oJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (ObservationCustomFieldsArr.length > 0) {
//                $.each(ObservationCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//
//            if (invJson.length > 0) {
//                $.each(invJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (InvestigationCustomFieldsArr.length > 0) {
//                $.each(InvestigationCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//
//            if (postedJson.indexOf('AttachmentName') != -1) {
//                json.push('AttachmentName');
//            }
//
//            if (aJson.length > 0) {
//                $.each(aJson, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//            if (ActionsCustomFieldsArr.length > 0) {
//                $.each(ActionsCustomFieldsArr, function (i, item) {
//                    index = $.inArray(item.FieldName, json);
//                    if (index == -1) {
//                        json.push(item.FieldName);
//                    }
//                });
//            }
//
//            var json1 = new Array();
//            json1.push(json);
//            json1.push(paramsJson);
            }
            return TemplateBody;
        }
        
        function PrintTempReport(id) {
            var postedJson = new Array();
            var paramsJson = new Array();
            var json = GetUserReportParamtersArray();
            postedJson = json[0];
            paramsJson = json[1];
            var TemplateName = $('#allorgstempName').val();
            var IncParams = new Object();
            var body = {
                "OrgId": OrgId,
                "postedJson": postedJson,
                "paramsJson": paramsJson,
                "EmployeeId": EmployeeId,
                "TemplateName": TemplateName,
                "dbname": $scope.reportObject.dbname
            };
            viewDataTablesService.setTempTemplateParamters(body).then(
                function (res) {
                    var data = res.data;
                    if (data != null && data != 'null' && data != '[]') {
                        var json = data;
                        fillTemplateBody(json);

                        printIncidentReport(id);
                    }
                },
                function (err) {
                    console.error(err);
                    return false;
                }
            );
        }

        function printIncidentReport(id) {

            //   console.log('printIncidentReport');
            openAjaxLoaderReport();
            var postedJson = new Array();
            var paramsJson = new Array();
            var json = GetUserReportParamtersArray();

            postedJson = json[0];
            paramsJson = json[1];
            var OrgName = localStorage.getItem('OrgName');
            var LanguageCode = localStorage.getItem('LanguageCode');

            var filename = 'IncidentReport_' + uniqid() + '.docx';
            var path = "../../../../../../temp/download/" + filename;

            var body = {
                "Path": path,
                "LanguageCode": LanguageCode,
                "IncidentId": id,
                "OrgId": OrgId,
                "EmployeeId": $scope.reportObject.employee_id,
                "paramsJson": paramsJson,
                "OrgName": OrgName,
                "postedJson": postedJson
            };
            viewDataTablesService.printIncidentReport(body).then(
                function (res) {
                    closeAjaxLoaderReport();
                    path = path.replace(/\0+$/, ''); //for Safari exception
                    window.open(exportPath + path);
                },
                function (err) {
                    console.error(err);
                    if (err.indexOf('Gateway Time-out') !== -1) {
                        printAgain(id);
                    }
                }
            );

        }

        function printAgain(id) {

            //   console.log('printIncidentReport');
            openAjaxLoaderReport();
            var postedJson = new Array();
            var paramsJson = new Array();
            var json = GetUserReportParamtersArray();

            postedJson = json[0];
            paramsJson = json[1];
            var OrgName = localStorage.getItem('OrgName');
            var LanguageCode = localStorage.getItem('LanguageCode');

            var filename = 'IncidentReport_' + uniqid() + '.docx';
            var path = "../../../../../../temp/download/" + filename;

            var body = {
                "Path": path,
                "LanguageCode": LanguageCode,
                "IncidentId": id,
                "OrgId": OrgId,
                "EmployeeId": $scope.reportObject.employee_id,
                "paramsJson": paramsJson,
                "OrgName": OrgName,
                "postedJson": postedJson
            };
            viewDataTablesService.printIncidentReport(body).then(
                function (res) {
                    closeAjaxLoaderReport();
                    path = path.replace(/\0+$/, ''); //for Safari exception
                    window.open(exportPath + path);
                },
                function (err) {
                    console.error(err);
                }
            );

        }

        function OpenUserTemplate(id) {
            $('#TemplateId').val(id);
        }

        function GetDefaultData() {
            var allLabels = getAllFieldLabels();
            var LocationLevel = localStorage.getItem('LocationLevel');
            var defaultData = '<p>' + GetItemLabel('ReportEnteredBy') + ': $CreatorName<br />';
            defaultData += GetItemLabel('LastModified') + ': $UpdatedByName<br />';
            defaultData += GetFieldLabel('incident_number') + ': $IncidentNumber.$VersionNumber<br />';
            defaultData += GetFieldLabel('date') + ': $IncidentDate<br />';
            defaultData += GetFieldLabel('event_type_id') + ': $EventTypeId<br />';
            defaultData += GetItemLabel('IncidentReportedBy') + ': $RepName , $RepPosition , $RepEmail , $RepCompany , $RepPrimaryPhone , $RepAlternatePhone<br />';
            defaultData += GetFieldLabel('location') + ': $Location1Id , $Location2Id';

            if (LocationLevel == '2') {} else if (LocationLevel == '3') {
                defaultData += ' , $Location3Id';
            } else {
                defaultData += ', $Location3Id, $Location4Id';
            }
            defaultData += ' , $OtherLocation<br />';
            defaultData += GetFieldLabel('description') + ': $IncDescription</p>';
            return defaultData;
        }

        function fillTemplateBody(json) {
            $('#populateTemp').val('false');
            tinyMCE.activeEditor.setContent('');
            var defaultData = GetDefaultData();
            tinyMCE.execCommand('mceInsertContent', false, defaultData);
            var WhatHappenedCustomFieldsArr = [];
            var ImpactCustomFieldsArr = [];
            var PeopleCustomFieldsArr = [];
            var ObservationCustomFieldsArr = [];
            var InvestigationCustomFieldsArr = [];
            var ActionsCustomFieldsArr = [];
            var customFieldLabel;
            var currentTab;
            $.each(json, function (i, item) {
                var FieldName = item.FieldName;
                var FieldParam = item.FieldParam;
                var value = item.FieldLabel.replace(/:/gi, "");
                if (item.TabName == 'WhatHappened') {
                    currentTab = 'WhatHappened';
                    if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                        (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                        (FieldName.indexOf('select') !== -1)) {

                        WhatHappenedCustomFieldsArr.push(item);
                    } else {
                        DropTemplateParams(FieldName, value, FieldParam);
                    }
                } else {
                    if (WhatHappenedCustomFieldsArr.length > 0) {
                        $.each(WhatHappenedCustomFieldsArr, function (i, item) {
                            customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                            DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                        });
                    }
                    currentTab = '';
                    WhatHappenedCustomFieldsArr = [];
                    if (item.TabName == 'Impacts') {
                        currentTab = 'Impacts';
                        if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                            (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                            (FieldName.indexOf('select') !== -1)) {

                            ImpactCustomFieldsArr.push(item);
                        } else {
                            DropTemplateParams(FieldName, value, FieldParam);
                        }
                    } else {
                        if (ImpactCustomFieldsArr.length > 0) {
                            $.each(ImpactCustomFieldsArr, function (i, item) {

                                customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                                DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                            });
                        }
                        currentTab = '';
                        ImpactCustomFieldsArr = [];
                        if (item.TabName == 'People') {
                            currentTab = 'People';
                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                (FieldName.indexOf('select') !== -1)) {

                                PeopleCustomFieldsArr.push(item);
                            } else {
                                DropTemplateParams(FieldName, value, FieldParam);
                            }
                        } else {
                            if (PeopleCustomFieldsArr.length > 0) {
                                $.each(PeopleCustomFieldsArr, function (i, item) {
                                    customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                                    DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                                });
                            }
                            currentTab = '';
                            PeopleCustomFieldsArr = [];
                            if (item.TabName == 'Observation') {
                                currentTab = 'Observation';
                                if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                    (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                    (FieldName.indexOf('select') !== -1)) {

                                    ObservationCustomFieldsArr.push(item);
                                } else {
                                    DropTemplateParams(FieldName, value, FieldParam);
                                }
                            } else {
                                if (ObservationCustomFieldsArr.length > 0) {
                                    $.each(ObservationCustomFieldsArr, function (i, item) {
                                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                                    });
                                }
                                currentTab = '';
                                ObservationCustomFieldsArr = [];
                                if (item.TabName == 'Investigation') {
                                    currentTab = 'Investigation';
                                    if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                        (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                        (FieldName.indexOf('select') !== -1)) {

                                        InvestigationCustomFieldsArr.push(item);
                                    } else {
                                        DropTemplateParams(FieldName, value, FieldParam);
                                    }
                                } else {
                                    if (InvestigationCustomFieldsArr.length > 0) {
                                        $.each(InvestigationCustomFieldsArr, function (i, item) {
                                            customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                                            DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                                        });
                                    }
                                    currentTab = '';
                                    InvestigationCustomFieldsArr = []
                                    if (item.TabName == 'Upload') {
                                        DropTemplateParams(FieldName, value, FieldParam);

                                    } else {
                                        if (item.TabName == 'Actions') {
                                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                                (FieldName.indexOf('select') !== -1)) {

                                                ActionsCustomFieldsArr.push(item);
                                            } else {
                                                DropTemplateParams(FieldName, value, FieldParam);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                //DropTemplateParams(item.FieldName, value, item.FieldParam);
            });
            if (currentTab == 'WhatHappened') {
                if (WhatHappenedCustomFieldsArr.length > 0) {
                    $.each(WhatHappenedCustomFieldsArr, function (i, item) {
                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                    });
                }
                currentTab = '';
                WhatHappenedCustomFieldsArr = [];
            } else if (currentTab == 'Impacts') {
                if (ImpactCustomFieldsArr.length > 0) {
                    $.each(ImpactCustomFieldsArr, function (i, item) {
                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                    });
                }
                currentTab = '';
                ImpactCustomFieldsArr = [];
            } else if (currentTab == 'People') {
                if (PeopleCustomFieldsArr.length > 0) {
                    $.each(PeopleCustomFieldsArr, function (i, item) {
                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                    });
                }
                currentTab = '';
                PeopleCustomFieldsArr = [];
            } else if (currentTab == 'Observation') {
                if (ObservationCustomFieldsArr.length > 0) {
                    $.each(ObservationCustomFieldsArr, function (i, item) {
                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                    });
                }
                currentTab = '';
                ObservationCustomFieldsArr = []
            } else if (currentTab == 'Investigation') {
                if (InvestigationCustomFieldsArr.length > 0) {
                    $.each(InvestigationCustomFieldsArr, function (i, item) {
                        customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                        DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                    });
                }
                currentTab = '';
                InvestigationCustomFieldsArr = []
            }
            if (ActionsCustomFieldsArr.length > 0) {
                $.each(ActionsCustomFieldsArr, function (i, item) {
                    customFieldLabel = item.FieldLabel.replace(/:/gi, "");
                    DropTemplateParams(item.FieldName, customFieldLabel, item.FieldParam);
                });
            }

        }

        function GetFieldLabel(fName) {
            var ret = '';
            var data = localStorage.getItem('AllFieldLabels');
            if (data != null && data != '' && data != 'null' && data != '[]') {
                var json = JSON.parse(data);
                $.each(json, function (i, item) {
                    if (item.FieldName == fName) {
                        if (item.FieldLabel != '') {
                            ret = item.FieldLabel.replace(/:/gi, '');
                        }
                    }
                });
            }
            return ret;
        }

        function getAllFieldLabels() {
            var ret = '';
            var user = $scope.user;
            var body = {
                dbname: $scope.reportObject.dbname,
                LanguageId: user.language_id,
                OrgId: OrgId,
                TabName: ''
            };
            viewDataTablesService.getColumnsLabels(body).then(
                function (res) {
                    var data = res.data;
                    if (data != null && data != '' && data != 'null' && data != '[]') {
                        localStorage.setItem('AllFieldLabels', JSON.stringify(data));
                        return ret;
                    }
                },
                function (err) {
                    console.error(err);
                }
            );

        }

        function FilterArray(res, searchValue, searchField) {
            //  console.table(res);
            var ret = '';
            if (res !== '' && res != null) {
                if (res !== null) {
                    var out = [];
                    if (searchValue !== null) {
                        res.some(function (elm) {
                            if (elm[searchField] == searchValue) {
                                out.push(elm);
                            }
                        });
                        res = out;
                        ret = res;
                    }
                }
                return ret;
            }
        }

        function GetItemLabel(FieldName) { // get field label where iscustom =1
            var ret = '';
            var AllLabels = JSON.parse(localStorage.getItem('AllLabels'));
            var p = FilterArray(AllLabels, FieldName, 'FieldName');
            $.each(p, function (i, item) {
                if (item.FieldName == FieldName) {
                    ret = item.DefaultFieldLabel;
                }
            });
            return ret;
        }

        function getUserGroupPermissions() {
            var userPermission = JSON.parse(localStorage.getItem('permissions'));
            return userPermission;
        }

        function DropTemplateParams(FieldName, FieldLabel, FieldParam) {
            var td1 = '';
            var custTd = '';
            //console.log('FieldParam: ' + FieldParam);
            //console.log(tempParamObj);
            var tabName;
            if (FieldName == 'customer_id') {
                var value = '';
                if (FieldParam != '') {
                    var arry = FieldParam.split(/,/);
                    td1 = " <label  style='font-weight: bold' >$CustomerInvolved_Start</label> <br>";
                    for (var i = 0; i < arry.length; ++i) {
                        if (arry[i] == 'CustomerId') {
                            value = GetFieldLabel('contractor_id');
                            td1 += "<label>" + value + ":</label> <label  id='CustomerId'  title=" + value + ">$CustomerId</Label> <br>";
                        }
                        if (arry[i] == 'CustomerJobNumber') {
                            value = GetFieldLabel('customer_job_number');
                            td1 += "<label>" + value + ": </label><label  id='CustomerJobNumber'  title='" + value + "'>$CustomerJobNumber</Label> <br>";
                        }
                        if (arry[i] == 'CustName') {
                            value = GetFieldLabel('customer_contact_name');
                            td1 += "<label>" + value + ": </label><label  id='CustName'  title=" + value + ">$CustName</Label> <br>";
                        }
                    }
                    td1 += "<label  style='font-weight: bold'>$CustomerInvolved_End</label>";
                } else {
                    value = GetFieldLabel('contractor_id');
                    var value1 = GetFieldLabel('customer_job_number');
                    var value2 = GetFieldLabel('customer_contact_name');

                    td1 = " <label  style='font-weight: bold' >$CustomerInvolved_Start</label> <br>\
                                <label>" + value + ":</label> <label  id='CustomerId'  title=" + value + ">$CustomerId</Label> <br>\
                                <label>" + value1 + ": </label><label  id='CustomerJobNumber'  title=" + value1 + ">$CustomerJobNumber</Label> <br>\
                                <label>" + value2 + ": </label><label  id='CustName'  title=" + value2 + ">$CustName</Label> <br>\n\
                                <label  style='font-weight: bold'>$CustomerInvolved_End</label>";
                }

            } else if (FieldName == 'contractor_id') {
                var value = '';
                if (FieldParam != '') {
                    var arry = FieldParam.split(/,/);
                    td1 = " <label  style='font-weight: bold'>$ContractorInvolved_Start</label> <br>";
                    for (var i = 0; i < arry.length; ++i) {
                        if (arry[i] == 'ContractorId') {
                            value = GetFieldLabel('contractor_id');
                            td1 += "<label" + value + ": </label> <label  id='ContractorId' title=" + value + ">$ContractorId</Label> <br>";
                        }
                        if (arry[i] == 'ContractorJobNumber') {
                            value = GetFieldLabel("contractor_jop_number");
                            td1 += "<label>" + value + ": </label><label  id='ContractorJobNumber' title=" + value + " >$ContractorJobNumber</Label> <br>";
                        }
                        if (arry[i] == 'ContName') {
                            value = GetFieldLabel('contractor_contact_name');
                            td1 += "<label>" + value + ": </label><label  id='ContName' title=" + value + ">$ContName</Label> <br>";
                        }
                    }
                    td1 += "<label  style='font-weight: bold'>$ContractorInvolved_End</label> </td>";
                } else {
                    value = GetFieldLabel('contractor_id');
                    var value1 = GetFieldLabel('contractor_jop_number');
                    var value2 = GetFieldLabel('contractor_contact_name');

                    td1 = " <label  style='font-weight: bold'>$ContractorInvolved_Start</label> <br>\n\
                                <label>" + value + ": </label> <label  id='ContractorId' title=" + value + ">$ContractorId</Label> <br>\n\
                                <label>" + value1 + ": </label><label  id='ContractorJobNumber' title=" + value1 + " >$ContractorJobNumber</Label> <br>\n\
                                <label>" + value2 + ": </label><label  id='ContName' title=" + value2 + ">$ContName</Label> <br>\n\
                                <label  style='font-weight: bold'>$ContractorInvolved_End</label> </td>";
                }
            } else if (FieldName == 'attachment_name') {
                if ($.inArray('alldocuments', userPermission) != -1) {
                    var value = '';
                    if (FieldParam != '') {
                        var arry = FieldParam.split(/,/);
                        td1 = "<td style='width: 80%'>  <label  style='font-weight: bold'>$SupportingDocuments_Start</label> <br>";
                        for (var i = 0; i < arry.length; ++i) {
                            if (arry[i] == 'AttachmentName') {
                                value = GetFieldLabel('attachment_name');
                                td1 += "<label>" + value + ": </label><label  id='AttachmentName' title=" + value + ">$AttachmentName</Label> <br>";
                            }
                            if (arry[i] == 'AttachmentSize') {
                                value = GetFieldLabel('attachment_size');
                                td1 += "<label>" + value + ": </label> <label  id='AttachmentSize' title=" + value + " >$AttachmentSize</Label> <br>";
                            }
                        }
                        td1 += "<label  style='font-weight: bold'>$SupportingDocuments_End</label> ";

                    } else {
                        value = GetFieldLabel('attachment_name');
                        var value1 = GetFieldLabel('attachment_size');
                        td1 = "<td style='width: 80%'>  <label  style='font-weight: bold'>$SupportingDocuments_Start</label> <br>\n\
                                  <label>" + value + ": </label><label  id='AttachmentName' title=" + value + ">$AttachmentName</Label> <br>\n\
                                  <label>" + value1 + ": </label> <label  id='AttachmentSize' title=" + value1 + " >$AttachmentSize</Label> <br>\n\
                                  <label  style='font-weight: bold'>$SupportingDocuments_End</label> ";
                    }
                }
            } else if (FieldName == 'people_involved_name') {
                if ($.inArray('allpeopleinvolved', userPermission) != -1) {
                    custTd = '';
                    //sortOn(tempParamObj, 'Order', false, true);
                    if (tempParamObj.length > 0) {
                        td1 = "<label  style='font-weight: bold'>$PersonInvolved_Start</label> <br>";
                        if (FieldParam != '') {
                            var arry = FieldParam.split(/,/);
                            $.each(tempParamObj, function (i, item) {
                                if (item.TabName == 'People') {
                                    var value = item.FieldLabel.replace(/:/gi, "");
                                    var fId = item.FieldName;
                                    var index = $.inArray(fId, arry);
                                    if (index !== -1) {
                                        if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                            (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                            (fId.indexOf('select') !== -1)) {
                                            custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                        } else {
                                            td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                        }
                                    }
                                }
                            });
                        } else {
                            $.each(tempParamObj, function (i, item) {
                                if (item.TabName == 'People') {
                                    var value = item.FieldLabel.replace(/:/gi, "");
                                    var fId = item.FieldName;
                                    if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                        (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                        (fId.indexOf('select') !== -1)) {
                                        custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                    } else {
                                        td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                    }
                                }
                            });
                        }
                        if (custTd != '') {
                            td1 += custTd;
                        }
                        td1 += " <label  style='font-weight: bold'>$PersonInvolved_End</label>";
                    }
                }
            } else if (FieldName == 'assigned_to_id') {
                if ($.inArray('allaction', userPermission) != -1) {
                    custTd = '';
                    sortOn(tempParamObj, 'FieldOrder', false, true);
                    if (tempParamObj.length > 0) {
                        td1 = "<label  style='font-weight: bold'>$Action_Start</label> <br>";
                        if (FieldParam != '') {
                            var arry = FieldParam.split(/,/);
                            $.each(tempParamObj, function (i, item) {
                                if (item.TabName == 'Actions') {
                                    var fId = item.FieldName;
                                    var index = $.inArray(fId, arry);
                                    if (index !== -1) {
                                        var value = item.FieldLabel.replace(/:/gi, "");
                                        if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                            (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                            (fId.indexOf('select') !== -1)) {
                                            custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                        } else {
                                            if (fId != 'DurationUnitId' && fId != 'QuantityUnitId' && fId != 'RecoveredUnitId') {
                                                td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            $.each(tempParamObj, function (i, item) {
                                if (item.TabName == 'Actions') {
                                    var value = item.FieldLabel.replace(/:/gi, "");
                                    var fId = item.FieldName;
                                    if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                        (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                        (fId.indexOf('select') !== -1)) {
                                        custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                    } else {
                                        td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                    }
                                }
                            });
                        }
                        if (custTd != '') {
                            td1 += custTd;
                        }
                        td1 += " <label  style='font-weight: bold'>$Action_End</label> </td>";
                    }
                }
            } else if (FieldName == 'impact_sub_type_id' || FieldName == 'personal_injured' || FieldName == 'illness_personal_injured' || FieldName == 'source_id' ||
                FieldName == 'traffic_driver_name' || FieldName == 'damage_driver_name') {

                if ($.inArray('allimpacts', userPermission) != -1) {
                    var subTabName = 'Impacts';
                    custTd = '';
                    sortOn(tempParamObj, 'FieldOrder', false, true);


                    if (tempParamObj.length > 0) {
                        if (FieldName == 'impact_sub_type_id') {
                            td1 = "<label  style='font-weight: bold'>$IncidentImpact_Start</label> <br>";
                            subTabName = 'Impacts';
                        } else if (FieldName == 'personal_injured') {
                            subTabName = 'Injury';
                            td1 = "<label  style='font-weight: bold'>$IncidentInjury_Start</label> <br>";
                        } else if (FieldName == 'illness_personal_injured') {
                            subTabName = 'Illness';
                            td1 = "<label  style='font-weight: bold'>$IncidentIllness_Start</label> <br>";
                        } else if (FieldName == 'source_id') {
                            subTabName = 'SpillRelease';
                            td1 = "<label  style='font-weight: bold'>$IncidentSpillRelease_Start</label> <br>";
                        } else if (FieldName == 'traffic_driver_name') {
                            subTabName = 'TrafficViolation';
                            td1 = "<label  style='font-weight: bold'>$IncidentTrafficViolation_Start</label> <br>";
                        } else if (FieldName == 'damage_driver_name') {
                            subTabName = 'VehicleDamage';
                            td1 = "<label  style='font-weight: bold'>$IncidentVehicleDamage_Start</label> <br>";
                        }

                        if (FieldParam != '') {
                            var arry = FieldParam.split(/,/);
                            $.each(tempParamObj, function (i, item) {
                                if (item.SubTabName == subTabName) {
                                    var fId = item.FieldName;

                                    var index = $.inArray(fId, arry);
                                    //                            console.log('index: ' + index + '    ----------    fId: ' + fId);

                                    if (index !== -1) {
                                        if (fId == 'initial_department_id1' || fId == 'initial_employee_name2' || fId == 'initial_department_id2' || fId == 'initial_employee_name3' || fId == 'initial_department_id3') {

                                        } else {
                                            var value = item.FieldLabel.replace(/:/gi, "");
                                            if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                                (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                                (fId.indexOf('select') !== -1)) {
                                                custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                            } else {
                                                if (fId == 'initial_employee_name1') {
                                                    value = GetFieldLabel('internal_individuals'); // 'Internal individuals contacted';
                                                    fId = 'IntEmployeeName1, $IntEmployeeDept1; $IntEmployeeName2, $IntEmployeeDept2; $IntEmployeeName3, $IntEmployeeDept3';
                                                }
                                                if (fId != 'duration_value' && fId != 'quantity_value' && fId != 'quantity_recovered_value') {
                                                    td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            $.each(tempParamObj, function (i, item) {
                                if (item.SubTabName == subTabName) {
                                    var fId = item.FieldName;
                                    if (fId == 'initial_department_id1' || fId == 'initial_employee_name2' || fId == 'initial_department_id2' || fId == 'initial_employee_name3' || fId == 'initial_department_id3') {

                                    } else {
                                        var value = item.FieldLabel.replace(/:/gi, "");
                                        if ((fId.indexOf('calendar') !== -1) || (fId.indexOf('textarea') !== -1) || (fId.indexOf('textbox') !== -1) ||
                                            (fId.indexOf('radiobutton') !== -1) || (fId.indexOf('checkbox') !== -1) || (fId.indexOf('multiselect') !== -1) ||
                                            (fId.indexOf('select') !== -1)) {
                                            custTd += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                        } else {
                                            if (fId == 'initial_employee_name1') {
                                                value = GetFieldLabel('InternalIndividuals'); // 'Internal individuals contacted';
                                                fId = 'IntEmployeeName1, $IntEmployeeDept1; $IntEmployeeName2, $IntEmployeeDept2; $IntEmployeeName3, $IntEmployeeDept3';
                                            }
                                            if (fId != 'duration_value' && fId != 'quantity_value' && fId != 'quantity_recovered_value') {
                                                td1 += " <label>" + value + ": </label><label  title='" + value + "'  id='" + fId + "' >$" + fId + "</Label>  <br>";
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        if (custTd != '') {
                            td1 += custTd;
                        }
                        if (FieldName == 'impact_sub_type_id') {
                            td1 += " <label  style='font-weight: bold'>$IncidentImpact_End</label>";
                        } else if (FieldName == 'personal_injured') {
                            td1 += "<label  style='font-weight: bold'>$IncidentInjury_End</label> <br>";
                        } else if (FieldName == 'illness_personal_injured') {
                            td1 += "<label  style='font-weight: bold'>$IncidentIllness_End</label> <br>";
                        } else if (FieldName == 'source_id') {
                            td1 += "<label  style='font-weight: bold'>$IncidentSpillRelease_End</label> <br>";
                        } else if (FieldName == 'traffic_driver_name') {
                            td1 += "<label  style='font-weight: bold'>$IncidentTrafficViolation_End</label> <br>";
                        } else if (FieldName == 'damage_driver_name') {
                            td1 += "<label  style='font-weight: bold'>$IncidentVehicleDamage_End</label> <br>";
                        }
                    }
                }
            } else {
                if (FieldName !== 'sequence_of_events') {
                    $.each(tempParamObj, function (i, item) {
                        if (item.FieldName == FieldName) {
                            tabName = item.TabName;
                            //                console.log('tabName: ' + tabName)
                        }
                    });

                    if (tabName == 'Observation') {
                        if ($.inArray('allopservation', userPermission) != -1) {
                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                (FieldName.indexOf('select') !== -1)) {
                                td1 += " <label>" + FieldLabel + ": </label><label  title='" + FieldLabel + "' >$" + FieldName + "</Label>  <br>";
                            } else {
                                td1 = "<label>" + FieldLabel + ": </label><label title='" + FieldLabel + "' >$" + FieldName + "</label> ";
                            }
                        }
                    } else if (tabName == 'Investigation') {
                        if ($.inArray('allinvestigation', userPermission) != -1) {
                            if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                                (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                                (FieldName.indexOf('select') !== -1)) {
                                td1 += " <label>" + FieldLabel + ": </label><label  title='" + FieldLabel + "' >$" + FieldName + "</Label>  <br>";
                            } else {
                                var newFieldLabel = FieldLabel;
                                if (FieldName == 'investigator_id1') {
                                    //newFieldLabel = 'Investigator 1';
                                    newFieldLabel = FieldLabel;
                                } else if (FieldName == 'investigator_id2') {
                                    //newFieldLabel = 'Investigator 2';
                                    newFieldLabel = FieldLabel;
                                } else if (FieldName == 'investigator_id3') {
                                    // newFieldLabel = 'Investigator 3';
                                    newFieldLabel = FieldLabel;
                                }
                                td1 = "<label>" + newFieldLabel + ": </label><label title='" + newFieldLabel + "' >$" + FieldName + "</label> ";
                            }
                        }
                    } else if (tabName == 'WhatHappened') {
                        if ((FieldName.indexOf('calendar') !== -1) || (FieldName.indexOf('textarea') !== -1) || (FieldName.indexOf('textbox') !== -1) ||
                            (FieldName.indexOf('radiobutton') !== -1) || (FieldName.indexOf('checkbox') !== -1) || (FieldName.indexOf('multiselect') !== -1) ||
                            (FieldName.indexOf('select') !== -1)) {
                            td1 += " <label>" + FieldLabel + ": </label><label  title='" + FieldLabel + "' >$" + FieldName + "</Label>  <br>";
                        } else {
                            var newFieldName = FieldName;
                            var newFieldLabel = FieldLabel;
                            if (newFieldName == 'creator_name') {
                                newFieldLabel = GetItemLabel('ReportEnteredBy'); //'Report entered by';
                            } else if (newFieldName == 'updated_by_name') {
                                newFieldLabel = GetItemLabel('LastModified'); //'Report last modified by';
                            } else if (newFieldName == 'inc_description') {
                                newFieldLabel = GetFieldLabel('description'); // 'Incident Description';
                            }
                            if (FieldName == 'rep_name') {
                                newFieldName = 'RepName, $RepPosition, $RepEmail, $RepCompany, $RepPrimaryPhone, $RepAlternatePhone';
                            } else
                            if (FieldName == 'location1_id') {
                                var LocationLevel = localStorage.getItem('LocationLevel');
                                newFieldName = 'Location1Id, $Location2Id';
                                if (LocationLevel == '3') {
                                    newFieldName += ', $Location3Id';
                                } else if (LocationLevel == '4') {
                                    newFieldName += ', $Location3Id, $Location4Id';
                                }
                                newFieldName += ', $OtherLocation';
                            }
                            td1 = "<label>" + newFieldLabel + ": </label><label title='" + newFieldLabel + "' >$" + newFieldName + "</label> ";
                        }
                    }
                }
            }
            var tblId = 'table__' + FieldName;
            var newdiv = "<div  id='" + tblId + "'   class ='classTempParam'  >" + td1 + '</div>';
            // tinyMCE.execCommand('mceInsertContent', false, newdiv);

            // Adds a new paragraph to the end of the active editor
            tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.getBody(), 'div', {
                title: ''
            }, newdiv);
        }

        $scope.resetFormVariables = function () {
            console.log('Cancel');
            $('#TemplateId').val('0');
            $('#allorgstempName').val('');
            var defaultData = GetDefaultData();
            tinyMCE.activeEditor.setContent('');
            $('#populateTemp').val('false');
        }

        $scope.status = {
            fieldStatus: {}
        };

        $scope.closeOtherFieldAccordions = function (sub_tab_name) {
            angular.forEach($scope.status.fieldStatus, function (acc, key) {
                if (key === sub_tab_name) {
                    $scope.status.fieldStatus[key] = true;
                } else {
                    $scope.status.fieldStatus[key] = false;
                }

            });
        };

        $scope.getFilterFields = function () {
            var report_type = '';
            switch ($scope.reportObject.report_type) {
                case 'Hazard':
                    report_type = 'hazard';
                    dbName = "stellarhse_hazard";
                    break;
                case 'ABCanTrack':
                    report_type = 'incident';
                    dbName = "stellarhse_incident";
                    break;
                case 'Inspection':
                    report_type = 'inspection';
                    dbName = "stellarhse_inspection";
                    break;
                case 'SafetyMeeting':
                    report_type = 'safetymeeting';
                    dbName = "stellarhse_safetymeeting";
                    break;
                case 'MaintenanceManagement':
                    report_type = 'maintenance';
                    dbName = "stellarhse_maintenance";
                    break;
                case 'Training':
                    report_type = 'training';
                    dbName = "stellarhse_training";
                    break;
            }
            
            
            viewDataTablesService.CheckReportId({report_type:report_type,report_id:$scope.reportObject.report_id,dbName:dbName}).then(function (res) {
                    $scope.reportObject.org_id = res.data;
                    if(res.data == "" || res.data== null){
                        $scope.disableEmail = true;
                    }else{
                         $scope.disableEmail = false;
                    }
            }, function (err) {
                console.error(err);
            });

            var fields_data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                employee_id: EmployeeId,
                type: report_type
            };

            $q.all([
                coreReportService.getReportFields(fields_data),
                viewDataTablesService.getDefaulTemplatesByReportType(fields_data),
                coreReportService.getDataTablesReportFields(fields_data)
            ]).then(function (queues) {
                $scope.reportFields = queues[0].data;
                console.log($scope.reportFields);
//                $scope.default_templates = queues[1].data;
                $scope.fieldLabels = queues[2].data;
                console.log($scope.fieldLabels);
                $scope.report_tabs = {};
                angular.forEach($scope.reportFields, function (field) {
                    field.field_label = field.field_label.split(':')[0];
                    if(field.sub_tab_name === 'Impacts' || field.sub_tab_name === 'Illness' || field.sub_tab_name === 'Injury'
                    || field.sub_tab_name === 'VehicleDamage' || field.sub_tab_name === 'SpillRelease'|| field.sub_tab_name === 'TrafficViolation'){
                        if($scope.report_tabs.hasOwnProperty('Impacts')){
                            $scope.report_tabs['Impacts']['field_block'] += field.field_label+': $'+
                            field.table_field_name+'<br/>';
                        }else {
                            $scope.report_tabs[field.sub_tab_name] = {};
                            $scope.report_tabs[field.sub_tab_name]['sub_tab_label'] = field.sub_tab_label;
                            $scope.report_tabs[field.sub_tab_name]['field_block'] = '$IncidentImpact_Start  <br/>';
                            $scope.report_tabs[field.sub_tab_name]['field_block_end'] = '$IncidentImpact_End <br/>';
                            $scope.report_tabs['Impacts']['field_block'] += field.field_label+': $'+
                            field.table_field_name+'<br/>';
                        }
                    }
                    else if(!$scope.report_tabs.hasOwnProperty(field.sub_tab_name)){
                            $scope.report_tabs[field.sub_tab_name] = {};
                            $scope.report_tabs[field.sub_tab_name]['sub_tab_label'] = field.sub_tab_label;
                            if(field.sub_tab_name === 'Actions' || field.sub_tab_name === 'Follows'){
                                $scope.report_tabs[field.sub_tab_name]['field_block'] = '$Action_Start <br/>';
                                $scope.report_tabs[field.sub_tab_name]['field_block_end'] = '$Action_End <br/>';
                            } else if(field.sub_tab_name === 'People'){
                                $scope.report_tabs[field.sub_tab_name]['field_block'] = '$PersonInvolved_Start <br/>';
                                $scope.report_tabs[field.sub_tab_name]['field_block_end'] = '$PersonInvolved_End <br/>';
                            } else if(field.sub_tab_name === 'SCATAnalysis'){
                                $scope.report_tabs[field.sub_tab_name]['field_block'] = '$Cause_Start <br/>'+ field.field_label+': $'+
                                field.table_field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['field_block_end'] = '$Cause_End <br/>';
                            } else if(field.sub_tab_name === 'Upload'){
                                if(field.field_name === 'attachment_name' || field.field_name === 'attachment_size'){
                                    $scope.report_tabs[field.sub_tab_name]['field_block'] = '$SupportingDocuments_Start <br/>'+ field.field_label+': $'+
                                    field.table_field_name+'<br/>';
                                    $scope.report_tabs[field.sub_tab_name]['field_block_end'] = '$SupportingDocuments_End <br/>';
                                }
                            } else {
                                $scope.report_tabs[field.sub_tab_name]['report_labels'] = {};
                                if(field.field_name === 'identified_by'){
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                                    field.field_label+': $rep_name, $rep_emp_id, $rep_position, $rep_email, $rep_company,'+ 
                                    '$rep_primary_phone, $rep_alternate_phone, $rep_crew, $rep_department, $rep_supervisor, $rep_supervisor_notify';
                                }else if(field.field_name === 'rep_name' || field.field_name === 'rep_id' || field.field_name === 'rep_position' || field.field_name === 'rep_email' ||
                                    field.field_name === 'rep_company' || field.field_name === 'rep_primary_phone' || field.field_name === 'rep_alternate_phone' ||
                                    field.field_name === 'rep_crew' ||
                                    field.field_name === 'rep_department' || field.field_name === 'rep_supervisor' || field.field_name === 'rep_supervisor_notify'){
                                }else if(field.field_name === 'location'){
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                                    field.field_label+': $location1_name, $location2_name, $location3_name, $location4_name, $other_location';
                                }else if(field.field_name === 'location1_id' || field.field_name === 'location2_id' ||
                                    field.field_name === 'location3_id' || field.field_name === 'location4_id' ||
                                    field.field_name === 'other_location'){
                                }else if(field.field_name === 'time'){
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                                    field.field_label+': $hour:$min';
                                }else if(field.field_name === 'hour' || field.field_name === 'min'){
                                }else if(field.field_name === 'equipment_id'){
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = '$Equipment_Start '+
                                    field.field_label+': $equipment_name, $equipment_number, $equipment_type, $equipment_category_name $Equipment_End';
                                }else if(field.field_name === 'equipment_name' || field.field_name === 'equipment_number' || 
                                    field.field_name === 'equipment_type' || field.field_name === 'equipment_category_name'){
                                }else if(field.field_name === 'contractor_id'){
                                    if($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']){
                                        var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block']);
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = field;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = block;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] +=
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                                    }else{
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = field;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = '$Contractor_Start<br/>'+ 
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                                    }
                                }else if(field.field_name === 'contractor_contact_name' || field.field_name === 'contractor_jop_number'){
                                    if($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']){
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] +=
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                                    }else{
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = {};
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = '$Contractor_Start<br/>'+
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                                    }
                                }else if(field.field_name === 'customer_id'){
                                    if($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']){
                                        var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block']);
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = field;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = block;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] +=
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                                    }else{
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = field;
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = '$Customer_Start<br/>'+ 
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                                    }
                                }else if(field.field_name === 'customer_contact_name' || field.field_name === 'customer_job_number'){
                                    if($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']){
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] +=
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                                    }else{
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = {};
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = '$Customer_Start<br/>'+ 
                                        field.field_label+': $'+field.field_name+'<br/>';
                                        $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                                    }
                                }else if(field.field_name === 'third_parties_involved' || field.field_name === 'risk_level_type_id' || field.field_name === 'risk_level_sup_type_id'){
                                }else if(field.field_name === 'training_provided_by'){
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                                    field.field_label+': $staff_member_id, $third_party_id, $address, $city, $state, $contact_name, $phone, $website';
                                }else if(field.field_name === 'staff_member_id' || field.field_name === 'third_party_id' || 
                                    field.field_name === 'address' || field.field_name === 'city' || field.field_name === 'state'
                                    || field.field_name === 'contact_name' || field.field_name === 'phone' || field.field_name === 'website'){
                                // }else if(field.field_name === 'risk_level'){
                                //     if($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']){
                                //         var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block']);
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = field;
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] = block;
                                //     }else{
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = field;
                                //     }
                                // }else if(field.field_name === 'should_work_stopped' || field.field_name === 'severity_of_potential_consequences' || 
                                // field.field_name === 'probability_of_hazard' || field.field_name === 'frequency_of_worker_exposure'){
                                //     if($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']){
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] +=
                                //         field.field_label+': $'+field.field_name+'<br/>';
                                //     }else{
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = {};
                                //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] = 
                                //         field.field_label+': $'+field.field_name+'<br/>';
                                //     }
                                }else
                                    $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            }
                    }else {
                        if(field.sub_tab_name === 'Actions' || field.sub_tab_name === 'Follows' || 
                        field.sub_tab_name === 'People' || field.sub_tab_name === 'SCATAnalysis'){
                             if(field.is_custom === 'Yes'){
                                $scope.report_tabs[field.sub_tab_name]['field_block'] += field.field_label+': $'+
                                field.field_name+'<br/>';
                            }else
                                $scope.report_tabs[field.sub_tab_name]['field_block'] += field.field_label+': $'+
                                field.table_field_name+'<br/>';
                        } else if(field.sub_tab_name === 'Upload'){
                            if(field.field_name === 'attachment_name' || field.field_name === 'attachment_size'){
                                $scope.report_tabs[field.sub_tab_name]['field_block'] += field.field_label+': $'+
                                field.table_field_name+'<br/>';
                            }
                        }else if(field.field_name === 'identified_by'){
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                            field.field_label+': $rep_name, $rep_emp_id, $rep_position, $rep_email, $rep_company,'+ 
                            '$rep_primary_phone, $rep_alternate_phone, $rep_crew, $rep_department, $rep_supervisor, $rep_supervisor_notify';
                        }else if(field.field_name === 'rep_name' || field.field_name === 'rep_id' || field.field_name === 'rep_position' || field.field_name === 'rep_email' ||
                        field.field_name === 'rep_company' || field.field_name === 'rep_primary_phone' || field.field_name === 'rep_alternate_phone' ||
                        field.field_name === 'rep_crew' ||
                        field.field_name === 'rep_department' || field.field_name === 'rep_supervisor' || field.field_name === 'rep_supervisor_notify'){
                        }else if(field.field_name === 'location'){
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                            field.field_label+': $location1_name, $location2_name, $location3_name, $location4_name, $other_location';
                        }else if(field.field_name === 'location1_id' || field.field_name === 'location2_id' ||
                            field.field_name === 'location3_id' || field.field_name === 'location4_id' ||
                            field.field_name === 'other_location'){
                        }else if(field.field_name === 'time'){
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                            field.field_label+': $hour:$min';
                        }else if(field.field_name === 'hour' || field.field_name === 'min'){
                        }else if(field.field_name === 'equipment_id'){
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = '$Equipment_Start '+
                            field.field_label+': $equipment_name, $equipment_number, $equipment_type, $equipment_category_name $Equipment_End';
                        }else if(field.field_name === 'equipment_name' || field.field_name === 'equipment_number' || 
                            field.field_name === 'equipment_type' || field.field_name === 'equipment_category_name'){
                        }else if(field.field_name === 'contractor_id'){
                            if($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']){
                                var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block']);
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = field;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = block;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] +=
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                            }else{
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = field;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = '$Contractor_Start<br/>'+ 
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                            }
                        }else if(field.field_name === 'contractor_contact_name' || field.field_name === 'contractor_jop_number'){
                            if($scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']){
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] +=
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                            }else{
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id'] = {};
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block'] = '$Contractor_Start<br/>'+ 
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['contractor_id']['field_block_end'] = '$Contractor_End <br/>';
                            }
                        }else if(field.field_name === 'customer_id'){
                            if($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']){
                                var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block']);
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = field;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = block;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] +=
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                            }else{
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = field;
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = '$Customer_Start<br/>'+ 
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                            }
                        }else if(field.field_name === 'customer_contact_name' || field.field_name === 'customer_job_number'){
                            if($scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']){
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] +=
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                            }else{
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id'] = {};
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block'] = '$Customer_Start<br/>'+ 
                                field.field_label+': $'+field.field_name+'<br/>';
                                $scope.report_tabs[field.sub_tab_name]['report_labels']['customer_id']['field_block_end'] = '$Customer_End <br/>';
                            }
                        }else if(field.field_name === 'third_parties_involved' || field.field_name === 'risk_level_type_id' || field.field_name === 'risk_level_sup_type_id'){
                        }else if(field.field_name === 'training_provided_by'){
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name]['field_block'] = 
                            field.field_label+': $staff_member_id, $third_party_id, $address, $city, $state, $contact_name, $phone, $website';
                        }else if(field.field_name === 'staff_member_id' || field.field_name === 'third_party_id' || 
                            field.field_name === 'address' || field.field_name === 'city' || field.field_name === 'state'
                            || field.field_name === 'contact_name' || field.field_name === 'phone' || field.field_name === 'website'){
                        // }else if(field.field_name === 'risk_level'){
                        //     if($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']){
                        //         var block = angular.copy($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block']);
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = field;
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] = block;
                        //     }else{
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = field;
                        //     }
                        // }else if(field.field_name === 'should_work_stopped' || field.field_name === 'severity_of_potential_consequences' || 
                        // field.field_name === 'probability_of_hazard' || field.field_name === 'frequency_of_worker_exposure'){
                        //     if($scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']){
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] +=
                        //         field.field_label+': $'+field.field_name+'<br/>';
                        //     }else{
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level'] = {};
                        //         $scope.report_tabs[field.sub_tab_name]['report_labels']['risk_level']['field_block'] = 
                        //         field.field_label+': $'+field.field_name+'<br/>';
                        //     }
                        }else
                            $scope.report_tabs[field.sub_tab_name]['report_labels'][field.field_name] = field;
                    }
                });
                console.log($scope.report_tabs);
                GetTemplates();
            }, function (errors) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: errors[0].data
                });
            });
        };

        $scope.status = {
            openTheBigOne: true
        };

        $scope.closeIt = function () {
            $scope.status = {
                openTheBigOne: false
            };
        };
        
        $scope.applyFields = function(){
            // console.log(tinymce.activeEditor.selection.getCursorLocation());
            var checkedFields = '';
            angular.forEach($scope.report_tabs, function(tab, key){
                console.log(key);
                if(key === 'Actions' || key === 'Follows' || key === 'People' || 
                key === 'Impacts' || key === 'SCATAnalysis' || key === 'Upload'){
                    if(angular.isDefined(tab.checked) && tab.checked){
                        console.log(tab.field_block);
                        checkedFields += tab.field_block+tab.field_block_end+" <br/>";
                    }
                }
                angular.forEach(tab.report_labels, function(field, key2){
                    if(angular.isDefined(field.checked) && field.checked){
                        console.log(field.field_label);
                        if(field.hasOwnProperty('field_block')){
                            if(field.field_name === 'contractor_id' || field.field_name === 'customer_id')
                                checkedFields += field.field_block+field.field_block_end+" <br/>";
                            else
                                checkedFields += field.field_block+" <br/><br/>";
                        } else if(field.field_name === 'risk_level'){
                            checkedFields += field.field_label+":$risk_level_value <br/><br/>"; 
                        } else if(field.is_custom === 'Yes'){
                            checkedFields += field.field_label+':$'+field.field_name+" <br/><br/>"; 
                        } else
                            checkedFields += field.field_label+':$'+field.table_field_name+" <br/><br/>";
                    }
                });
            });
            // var checkedFields = $filter('filter')($scope.report_tabs, {checked: true});
            console.log(checkedFields);
            angular.forEach($scope.report_tabs, function(tab, key){
                if(angular.isDefined(tab.checked) && tab.checked){
                    tab.checked = false;
                }
                angular.forEach(tab.report_labels, function(field, key2){
                    if(angular.isDefined(field.checked) && field.checked){
                        field.checked = false;
                    }
                });
            });
            // var endId = tinyMCE.DOM.uniqueId();
            // var text = '<span id="' + endId + '">'+checkedFields+'</span>';
            // console.log(text);
            // // var notes = $scope.currentItem.Comments;
            // $scope.emailtemplates[0].body = text + $scope.emailtemplates[0].body;

            //add an empty span with a unique id
            // var endId = tinyMCE.DOM.uniqueId();
            // var ed = tinyMCE.activeEditor;
            // ed.dom.add(ed.getBody(), 'span', {'id': endId}, '');

            //select that span
            // var newNode = ed.dom.select('span#' + endId);
            // ed.selection.select(newNode[0]);
            // ed.focus();
            //ed.selection.setNode(newNode[0]);
            // ed.selection.setCursorLocation(newNode[0]);

            var editor = tinyMCE.activeEditor;
			// var content = editor.getContent();
			
			var cursorIndex = getCursorPosition(editor);
			console.log(cursorIndex);
            // console.log($scope.emailtemplates[0].body[cursorIndex]);
            if(cursorIndex === 3 || cursorIndex === -1)
                $scope.templateObject.body = checkedFields + $scope.templateObject.body;
            else
			    setCursorPosition(editor, cursorIndex, checkedFields);
        };

        function setCursorPosition(editor, index, checkedFields) {
            //get the content in the editor before we add the bookmark... 
            //use the format: html to strip out any existing meta tags
            var content = editor.getContent({
                format: "html"
            });
            //split the content at the given index
            // var ind=content.indexOf("-");
            // if (ind>-1)
            // {
            //     index=ind+1;
            // }
            //alert(index);
            var part1 = content.substr(0, index);
            console.log(part1);
            var part2 = content.substr(index);
            console.log(part2);

            //create a bookmark... bookmark is an object with the id of the bookmark
            var bookmark = editor.selection.getBookmark(0);

            //this is a meta span tag that looks like the one the bookmark added... just make sure the ID is the same
            var positionString = '<span id="' + bookmark.id + '_start" data-mce-type="bookmark" data-mce-style="overflow:hidden;line-height:0px"></span>';
            //cram the position string inbetween the two parts of the content we got earlier
            $scope.templateObject.body = part1 + checkedFields + positionString + part2;

            //replace the content of the editor with the content with the special span
            //use format: raw so that the bookmark meta tag will remain in the content
            editor.setContent($scope.templateObject.body, ({
                format: "raw"
            }));

            //move the cursor back to the bookmark
            //this will also strip out the bookmark metatag from the html
            editor.selection.moveToBookmark(bookmark);
            // editor.selection.focus();
            //return the bookmark just because
            return bookmark;
        }

        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };

        $scope.previewEmail = function () {
            var msg = {
                title: $scope.templateObject.name,
                body: $scope.templateObject.body
            };
            // msg.title = msg.title.replaceAll("$Location1Id", "Canada");

            //Common Parts 
            msg.body = msg.body.replaceAll("$PersonInvolved_Start", "");
            msg.body = msg.body.replaceAll("$PersonInvolved_End", "");
            msg.body = msg.body.replaceAll("$people_involved_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$company", "Alliance Borealis Canada Corp.");
            msg.body = msg.body.replaceAll("$position", "Developer");
            msg.body = msg.body.replaceAll("$email", "Reprasha.atta@sphinxinfotech.net");
            msg.body = msg.body.replaceAll("$primary_phone", "Rep0121831835");
            msg.body = msg.body.replaceAll("$alternate_phone", "Rep01280828002");
            msg.body = msg.body.replaceAll("$exp_in_current_postion", "5");
            msg.body = msg.body.replaceAll("$exp_over_all", "10");
            msg.body = msg.body.replaceAll("$age", "35");
            msg.body = msg.body.replaceAll("$certificate_name", "Emergency responder");
            msg.body = msg.body.replaceAll("$how_he_involved", "Identified Hazard");
            msg.body = msg.body.replaceAll("$role_description", "description");
            msg.body = msg.body.replaceAll("$supervisor", "Eman");
            msg.body = msg.body.replaceAll("$crew", "Managers Crew");
            msg.body = msg.body.replaceAll("$acting_name", "Joint worksite health and safety committee representative");

            msg.body = msg.body.replaceAll("$Action_Start", "");
            msg.body = msg.body.replaceAll("$Action_End", "");
            msg.body = msg.body.replaceAll("$actual_cost", "55");
            msg.body = msg.body.replaceAll("$supervisor_notify", "Eman");
            msg.body = msg.body.replaceAll("$corrective_action_status_name", "Closed");
            msg.body = msg.body.replaceAll("$corrective_action_priority_name", "High");
            msg.body = msg.body.replaceAll("$assigned_to_id", "Rasha Atta");
            msg.body = msg.body.replaceAll("$notified_id", "Rasha Atta");
            msg.body = msg.body.replaceAll("$start_date", "28-1-2015");
            msg.body = msg.body.replaceAll("$target_end_date", "28-1-2015");
            msg.body = msg.body.replaceAll("$actual_end_date", "28-1-2015");
            msg.body = msg.body.replaceAll("$estimated_cost", "55");
            msg.body = msg.body.replaceAll("$task_description", "description");
            msg.body = msg.body.replaceAll("$out_come_follow_up", "task outcome");
            msg.body = msg.body.replaceAll("$desired_results", "yes");
            msg.body = msg.body.replaceAll("$comments", "comments");

            msg.body = msg.body.replaceAll("$equipment_name", "Lazer eyes adf");
            msg.body = msg.body.replaceAll("$equipment_category_name", "medical");
            msg.body = msg.body.replaceAll("$equipment_type", "medical");
            msg.body = msg.body.replaceAll("$equipment_number", "278787811111");

            msg.body = msg.body.replaceAll("$identified_by", "Rasha Atta");
            msg.body = msg.body.replaceAll("$rep_id", "Rasha Atta");
            msg.body = msg.body.replaceAll("$rep_emp_id", "123");
            msg.body = msg.body.replaceAll("$rep_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$rep_crew", "Managers Crew");
            msg.body = msg.body.replaceAll("$rep_supervisor", "Eman");
            msg.body = msg.body.replaceAll("$rep_primary_phone", "Rep0121831835");
            msg.body = msg.body.replaceAll("$rep_alternate_phone", "Rep01280828002");
            msg.body = msg.body.replaceAll("$rep_position", "Developer");
            msg.body = msg.body.replaceAll("$rep_email", "Reprasha.atta@sphinxinfotech.net");
            msg.body = msg.body.replaceAll("$rep_company", "Alliance Borealis Canada Corp.");

            msg.body = msg.body.replaceAll("$location1_name", "Canada");
            msg.body = msg.body.replaceAll("$location2_name", "Calgary");
            msg.body = msg.body.replaceAll("$location3_name", "Alberta");
            msg.body = msg.body.replaceAll("$location4_name", "8-24-18-18-W3M");

            msg.body = msg.body.replaceAll("$risk_control_name", "Engineering control");
            msg.body = msg.body.replaceAll("$risk_level_degree", "High");
            msg.body = msg.body.replaceAll("$risk_level_value", "5/9");
            msg.body = msg.body.replaceAll("$should_work_stopped", "Yes");
            msg.body = msg.body.replaceAll("$crew_name", "Managers Crew");
            msg.body = msg.body.replaceAll("$operation_type_name", "Pipeline or Facilities Construction");

            msg.body = msg.body.replaceAll("$third_parties_involved", "");
            msg.body = msg.body.replaceAll("$cont_name", "Eman");
            msg.body = msg.body.replaceAll("$cust_name", "Rasha");
            msg.body = msg.body.replaceAll("$customer_name", "Progress Energy");
            msg.body = msg.body.replaceAll("$contractor_name", "SPHINX");
            msg.body = msg.body.replaceAll("$customer_job_number", "123");
            msg.body = msg.body.replaceAll("$contractor_job_number", "123");

            // msg.body = msg.body.replaceAll("$metrics_scope_name", "Severe Weather");
            msg.body = msg.body.replaceAll("$modifier_id", "Eman");

            // Hazard Report
            msg.body = msg.body.replaceAll("$hazard_number", "4580");
            msg.body = msg.body.replaceAll("$haz_type_name", "Severe Weather");
            msg.body = msg.body.replaceAll("$hazard_date", "1/27/2014 10:30");

            msg.body = msg.body.replaceAll("$time", "10:10");
            msg.body = msg.body.replaceAll("$hour", "10");
            msg.body = msg.body.replaceAll("$min", "10");
            msg.body = msg.body.replaceAll("$hazard_other_location", "Machine Shop");

            msg.body = msg.body.replaceAll("$hazard_desc", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");
            msg.body = msg.body.replaceAll("$hazard_suspected_cause", "Cause");

            // Inspection Report
            msg.body = msg.body.replaceAll("$inspection_number", "4580");
            msg.body = msg.body.replaceAll("$inspection_type_name", "Severe Weather");
            msg.body = msg.body.replaceAll("$inspection_reason_name", "Audit");
            msg.body = msg.body.replaceAll("$inspection_date", "1/27/2014 10:30");

            msg.body = msg.body.replaceAll("$Inspection_time", "10:10");
            msg.body = msg.body.replaceAll("$inspection_hour", "10");
            msg.body = msg.body.replaceAll("$inspection_min", "10");
            msg.body = msg.body.replaceAll("$inspection_other_location", "Machine Shop");

            msg.body = msg.body.replaceAll("$inspection_description", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");
            msg.body = msg.body.replaceAll("$hazard_description", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");

            // Common for Hazard & Inspection
            msg.body = msg.body.replaceAll("$effects_type_name", "Musculoskeletal Hazards: Force requirements");
            msg.body = msg.body.replaceAll("$hazard_note", "hazard note");
            msg.body = msg.body.replaceAll("$cause_types_name", "Job Content Factors: Ambiguity in the level of responsibility");
            msg.body = msg.body.replaceAll("$hazard_cause_note", "cause note");
            msg.body = msg.body.replaceAll("$recommended_corrective_actions_summary", "Summary");
            msg.body = msg.body.replaceAll("$status_name", "Eliminated");
            msg.body = msg.body.replaceAll("$initial_action_token", "action");
            msg.body = msg.body.replaceAll("$are_additional_corrective_actions_required", "Yes");
            msg.body = msg.body.replaceAll("$potential_impacts_desc", "description");
            msg.body = msg.body.replaceAll("$impact_type_name", "Injury");

            // Maintenance Report
            msg.body = msg.body.replaceAll("$maintenance_number", "4580");
            msg.body = msg.body.replaceAll("$maintenance_type_name", "Equipment");
            msg.body = msg.body.replaceAll("$maintenance_reason_name", "Scheduled");
            msg.body = msg.body.replaceAll("$maintenance_date", "1/27/2014 10:30");

            msg.body = msg.body.replaceAll("$time", "10:10");
            msg.body = msg.body.replaceAll("$maintenance_hour", "10");
            msg.body = msg.body.replaceAll("$maintenance_min", "10");
            msg.body = msg.body.replaceAll("$other_location", "Machine Shop");

            msg.body = msg.body.replaceAll("$maintenance_description", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");
            msg.body = msg.body.replaceAll("$summary_of_recommended_followup_actions", "Summary");

            // Safety Meeting Report
            msg.body = msg.body.replaceAll("$safetymeeting_number", "4580");
            msg.body = msg.body.replaceAll("$safetymeeting_type_name", "pre-job");
            msg.body = msg.body.replaceAll("$safetymeeting_date", "1/27/2014 10:30");
            msg.body = msg.body.replaceAll("$crew_involved", "Managers Crew");

            msg.body = msg.body.replaceAll("$time", "10:10");
            msg.body = msg.body.replaceAll("$safetymeeting_hour", "10");
            msg.body = msg.body.replaceAll("$safetymeeting_min", "10");
            msg.body = msg.body.replaceAll("$safetymeeting_other_location", "Machine Shop");

            msg.body = msg.body.replaceAll("$safetymeeting_description", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");
            msg.body = msg.body.replaceAll("$summary_of_recommended_followup_actions", "Summary");

            // Training Report
            msg.body = msg.body.replaceAll("$training_number", "4580");
            msg.body = msg.body.replaceAll("$training_type_name", "pre-job");
            msg.body = msg.body.replaceAll("$training_reason_name", "Recertification");
            msg.body = msg.body.replaceAll("$traininy_completed_by", "1/27/2014 10:30");
            msg.body = msg.body.replaceAll("$assigned_to_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$assigned_to_emp_id", "123");
            msg.body = msg.body.replaceAll("$assigned_to_crew", "Managers Crew");
            msg.body = msg.body.replaceAll("$assigned_to_supervisor", "Eman");
            msg.body = msg.body.replaceAll("$assigned_to_primary_phone", "Rep0121831835");
            msg.body = msg.body.replaceAll("$assigned_to_alternate_phone", "Rep01280828002");
            msg.body = msg.body.replaceAll("$assigned_to_position", "Developer");
            msg.body = msg.body.replaceAll("$assigned_to_email", "Reprasha.atta@sphinxinfotech.net");
            msg.body = msg.body.replaceAll("$assigned_to_company", "Alliance Borealis Canada Corp.");
            msg.body = msg.body.replaceAll("$staff_member_id", "Rasha Atta");
            msg.body = msg.body.replaceAll("$third_party_id", "Sphinx");
            msg.body = msg.body.replaceAll("$address", "20 st.");
            msg.body = msg.body.replaceAll("$city", "Calgary");
            msg.body = msg.body.replaceAll("$state", "Alberta");
            msg.body = msg.body.replaceAll("$contact_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$phone", "Rep0121831835");
            msg.body = msg.body.replaceAll("$website", "xxxx");
            msg.body = msg.body.replaceAll("$evidence_of_completion", "evidence");
            msg.body = msg.body.replaceAll("$training_duration", "2 weeks");
            msg.body = msg.body.replaceAll("$completed_date", "1/27/2014");
            msg.body = msg.body.replaceAll("$level_achieved_name", "certification");
            msg.body = msg.body.replaceAll("$course_mark", "10");
            msg.body = msg.body.replaceAll("$expiry_date", "1/27/2014");
            msg.body = msg.body.replaceAll("$level_quality_name", "Excellent");
            msg.body = msg.body.replaceAll("$is_trainee_observed_post", "Yes");
            msg.body = msg.body.replaceAll("$observed_date", "1/27/2014");
            msg.body = msg.body.replaceAll("$observed_by_id", "Eman");
            msg.body = msg.body.replaceAll("$observations", "observations");
            msg.body = msg.body.replaceAll("$comments", "comments");

            // Incident Report
            msg.body = msg.body.replaceAll("$incident_number", "4580");
            msg.body = msg.body.replaceAll("$incident_event_type_name", "Severe Weather");
            msg.body = msg.body.replaceAll("$incident_date", "1/27/2014 10:30");

            msg.body = msg.body.replaceAll("$time", "10:10");
            msg.body = msg.body.replaceAll("$incident_hour", "10");
            msg.body = msg.body.replaceAll("$incident_minute", "10");
            msg.body = msg.body.replaceAll("$other_location", "Machine Shop");

            msg.body = msg.body.replaceAll("$incident_description", "At 7.50 am on march 20 lester gauthier was stopped at the intersection of rr 63 and secondary hwy 723 at a tee intersection with a loaded n2 transport waiting to make a left turn (south) ");
            msg.body = msg.body.replaceAll("$is_emergency_response", "Yes");
            msg.body = msg.body.replaceAll("$event_sequence", "event sequence");
            msg.body = msg.body.replaceAll("$env_condition_note", "condition note");
            msg.body = msg.body.replaceAll("$oe_department_name", "Fisheries and Oceans Agency");
            msg.body = msg.body.replaceAll("$env_condition_name", "Indoor Lighting: Dark");
            msg.body = msg.body.replaceAll("$scat_items_params_name", "Abnormal Operations");
            msg.body = msg.body.replaceAll("$immdeiate_cause_type", "Substandard act");
            msg.body = msg.body.replaceAll("$basic_cause_type", "Personal factor ");
            msg.body = msg.body.replaceAll("$observation_and_analysis_param_name", "Unwanted Energy Form: Electrical: Electrical Burns");
            msg.body = msg.body.replaceAll("$sub_standard_condition_note", "notes");
            msg.body = msg.body.replaceAll("$under_lying_cause_note", "notes");
            msg.body = msg.body.replaceAll("$energy_form_note", "notes");
            msg.body = msg.body.replaceAll("$sub_standard_action_note", "notes");

            msg.body = msg.body.replaceAll("$investigation_date", "1/27/2014");
            msg.body = msg.body.replaceAll("$investigation_summary", "summary");
            msg.body = msg.body.replaceAll("$investigation_follow_up_note", "note");
            msg.body = msg.body.replaceAll("$investigation_response_cost", "23");
            msg.body = msg.body.replaceAll("$investigation_repair_cost", "33");
            msg.body = msg.body.replaceAll("$investigation_insurance_cost", "34");
            msg.body = msg.body.replaceAll("$investigation_wcb_cost", "45");
            msg.body = msg.body.replaceAll("$investigation_other_cost", "35");
            msg.body = msg.body.replaceAll("$investigation_total_cost", "170");
            msg.body = msg.body.replaceAll("$inv_source_name", "External experts");
            msg.body = msg.body.replaceAll("$investigation_source_details", "details");
            msg.body = msg.body.replaceAll("$investigation_root_cause_note", "note");
            msg.body = msg.body.replaceAll("$investigation_sign_off_date", "1/27/2014");
            msg.body = msg.body.replaceAll("$inv_status_name", "Open");
            msg.body = msg.body.replaceAll("$severity_name", "Critical");
            msg.body = msg.body.replaceAll("$risk_of_recurrence_name", "Unlikely");
            msg.body = msg.body.replaceAll("$root_cause_name", "Behaviours: Response to unsafe/inappropriate behaviours is inconsistent");
            msg.body = msg.body.replaceAll("$full_name", "Rasha Atta"); //sign_off_investigator_id
            msg.body = msg.body.replaceAll("$investigator_id1", "Rasha Atta");
            msg.body = msg.body.replaceAll("$investigator_id2", "Eman");
            msg.body = msg.body.replaceAll("$investigator_id3", "Cari");

            msg.body = msg.body.replaceAll("$IncidentImpact_Start", "");
            msg.body = msg.body.replaceAll("$IncidentImpact_End", "");
            msg.body = msg.body.replaceAll("$impact_type_name", "Injury");
            msg.body = msg.body.replaceAll("$impact_sub_type_name", "First aid");
            msg.body = msg.body.replaceAll("$ext_agency_name", "Ambulance");
            msg.body = msg.body.replaceAll("$impact_description", "description");
            msg.body = msg.body.replaceAll("$initial_employee_name1", "Rasha Atta");
            msg.body = msg.body.replaceAll("$initial_employee_name2", "Rasha Atta");
            msg.body = msg.body.replaceAll("$initial_employee_name3", "Rasha Atta");
            msg.body = msg.body.replaceAll("$initial_employee_dept1", "Occupational Health and Safety");
            msg.body = msg.body.replaceAll("$initial_employee_dept2", "Occupational Health and Safety");
            msg.body = msg.body.replaceAll("$initial_employee_dept3", "Occupational Health and Safety");
            msg.body = msg.body.replaceAll("$primary_responder_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$estimated_cost", "55");
            // injury
            msg.body = msg.body.replaceAll("$personal_injured_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$body_part_name", "Arm");
            msg.body = msg.body.replaceAll("$body_area_name", "Front");
            msg.body = msg.body.replaceAll("$contact_code_name", "Fall to lower level");
            msg.body = msg.body.replaceAll("$injury_type_name", "Abrasion");
            msg.body = msg.body.replaceAll("$contact_agency_name", "Cold");
            msg.body = msg.body.replaceAll("$recordable_name", "Yes");
            msg.body = msg.body.replaceAll("$injury_description", "description");
            // illness
            msg.body = msg.body.replaceAll("$personal_afflicted_name", "Rasha Atta");
            msg.body = msg.body.replaceAll("$description", "symptom"); // illness symptoms
            //common in injury & illness
            msg.body = msg.body.replaceAll("$initial_treatment_name", "First aid on site");
            msg.body = msg.body.replaceAll("$restricted_work_name", "Yes");
            msg.body = msg.body.replaceAll("$lost_time_start", "1/27/2014");
            msg.body = msg.body.replaceAll("$lost_time_end", "2/2/2014");
            msg.body = msg.body.replaceAll("$adjustment_days", "2");
            msg.body = msg.body.replaceAll("$total_days_off", "3");
            // spill & release
            msg.body = msg.body.replaceAll("$spill_release_source_name", "Pipe");
            msg.body = msg.body.replaceAll("$duration_value", "4");
            msg.body = msg.body.replaceAll("$duration_unit_name", "hour");
            msg.body = msg.body.replaceAll("$quantity_value", "4");
            msg.body = msg.body.replaceAll("$quantity_recovered_value", "4");
            msg.body = msg.body.replaceAll("$quantity_unit_name", "Litres");
            msg.body = msg.body.replaceAll("$is_reportable", "Yes");
            msg.body = msg.body.replaceAll("$what_was_spill_release", "description");
            msg.body = msg.body.replaceAll("$how_spill_release_occur", "description");
            msg.body = msg.body.replaceAll("$spill_release_agency_name", "DOT");
            // Traffic Violation & Vehicle Damage
            msg.body = msg.body.replaceAll("$driver_name", "Eman");
            msg.body = msg.body.replaceAll("$driver_licence", "2443534");
            msg.body = msg.body.replaceAll("$vehicle_type_name", "company vehicle");
            msg.body = msg.body.replaceAll("$traffic_vehicle_licence", "35635");
            msg.body = msg.body.replaceAll("$damage_description", "description");
            msg.body = msg.body.replaceAll("$how_did_that_occur", "description");
            msg.body = msg.body.replaceAll("$value_of_fine", "44");
            msg.body = msg.body.replaceAll("$ticket_number  ", "4564");

            // msg.body = msg.body.replaceAll("$ContractorInvolved_Start", "");
            // msg.body = msg.body.replaceAll("$ContractorInvolved_End", "");
            console.log(msg);
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/viewDataTablesModule/views/previewReport.html',
                controller: 'moveCtrl',
                backdrop: 'static',
                resolve: {
                    msg: function () {
                        return msg;
                    },
                    testObject: function () {
                        return {};
                    }
                }
            });

            // modalInstance.result.then(function (result) {
            //     if (result === 'ok') {
            //                     var index = $scope.gridOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
            //                     data.fieldValue = $scope.gridApi.selection.getSelectedRows()[0];
            //                     console.log(data)
            //                     if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add') {
            //                         $scope.gridOptions.data.splice(index, 1);
            //                         coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
            //                     } else
            //                         coreReportService.deleteFieldValue(data)
            //                                 .then(function (response) {
            // //                    $scope.columns = response.data.columns;
            // //                            $scope.getFieldValues();
            //                                     if (response.data === 1) {
            //                                         $scope.gridOptions.data.splice(index, 1);
            //                                         coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
            // //                                            if ($scope.field.field_name === 'type_and_subtype' || $scope.field.field_name === 'cause_types_and_subtypes') {
            // //                                                $scope.getFieldSubValues();
            // //                                            }
            //                                     }
            //                                 }, function (error) {
            //                                     coreService.resetAlert();
            //                                     coreService.setAlert({type: 'exception', message: error.data});
            //                                 });
            //     }
            // }, function () {
            //     console.log('modal-component dismissed at: ' + new Date());
            // });
        };

        $scope.saveNotification = function () {
            $scope.assignedNotification.templateObject = $scope.templateObject;
            console.log($scope.assignedNotification);
            manageNotificationService.saveNotification($scope.assignedNotification)
                .then(function (response) {
                    console.log(response.data);
                    $state.go('manageNotification');
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: error.data
                    });
                });


        };

        $scope.getDefaultData = function () {
            var location_level = $scope.user.location_level;
            var defaultData = '';
            switch ($scope.reportObject.report_type) {
                case 'ABCanTrack':
                    defaultData += '<p>' + ($filter('filter')($scope.fieldLabels, {
                        field_name: 'incident_number'
                    })[0]).FieldLabel + ' $incident_number.$version_number<br />';
                    defaultData += ($filter('filter')($scope.fieldLabels, {
                        field_name: 'date'
                    })[0]).FieldLabel + ' $incident_date<br />';
                    defaultData += ($filter('filter')($scope.fieldLabels, {
                        field_name: 'event_type_id'
                    })[0]).FieldLabel + ' $event_type_id<br />';
                    defaultData += ($filter('filter')($scope.fieldLabels, {
                        field_name: 'identified_by'
                    })[0]).FieldLabel + ' $rep_name , $rep_position , $rep_email , $rep_company , $rep_primary_phone , $rep_alternate_phone<br />';
                    defaultData += ($filter('filter')($scope.fieldLabels, {
                        field_name: 'location'
                    })[0]).FieldLabel + ' $location1_id , $location2_id';
                    break;
            }

            if (location_level == '2') {} else if (location_level == '3') {
                defaultData += ' , $location3_id';
            } else {
                defaultData += ', $location3_id, $location4_id';
            }
            switch ($scope.reportObject.report_type) {
                case 'ABCanTrack':
                    defaultData += ' , $other_location<br />';
                    //                    defaultData += ($filter('filter')($scope.fieldLabels, {field_name: 'inc_description_titile'})[0]).FieldLabel/*GetFieldLabel('inc_description_titile')*/ + ' $inc_description</p>';
                    break;
            }
            console.log(defaultData);
            return defaultData;
        };

        $scope.applyDefaultFields = function (default_temp_id) {
            console.log(default_temp_id);
            var data = {
                default_template_id: default_temp_id,
                org_id: $scope.user.org_id,
                report_type: $scope.reportObject.report_type
            };
            viewDataTablesService.getDefTempDetails(data).then(function (response) { //response.data = fields in each default temp
                if (!response.data.hasOwnProperty('file')) {
                    console.log(response.data);
                    //added whether he choosed default template or not
                    var default_data = $scope.getDefaultData();
                    angular.forEach(response.data, function (field, key) {
                        field.field_label = field.field_label.split(':')[0];
                        //default template data
                        var default_temp_data = $scope.templateParams(field.field_name, field.field_label, field.field_param);
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: error.data
                });
            });
        };

        $scope.templateParams = function (field_name, field_label, field_param) {
            if (field_name == 'customer_id') {
                if (field_param != '') {
                    var arry = field_param.split(/,/);
                } else {

                }
            }
        };

        function setCursorPosition(editor, index, checkedFields) {
            //get the content in the editor before we add the bookmark... 
            //use the format: html to strip out any existing meta tags
            var content = editor.getContent({
                format: "html"
            });
            //split the content at the given index
            // var ind=content.indexOf("-");
            // if (ind>-1)
            // {
            //     index=ind+1;
            // }
            //alert(index);
            var part1 = content.substr(0, index);
            console.log(part1);
            var part2 = content.substr(index);
            console.log(part2);

            //create a bookmark... bookmark is an object with the id of the bookmark
            var bookmark = editor.selection.getBookmark(0);

            //this is a meta span tag that looks like the one the bookmark added... just make sure the ID is the same
            var positionString = '<span id="' + bookmark.id + '_start" data-mce-type="bookmark" data-mce-style="overflow:hidden;line-height:0px"></span>';
            //cram the position string inbetween the two parts of the content we got earlier
            $scope.templateObject.body = part1 + checkedFields + positionString + part2;

            //replace the content of the editor with the content with the special span
            //use format: raw so that the bookmark meta tag will remain in the content
            editor.setContent($scope.templateObject.body, ({
                format: "raw"
            }));

            //move the cursor back to the bookmark
            //this will also strip out the bookmark metatag from the html
            editor.selection.moveToBookmark(bookmark);
            // editor.selection.focus();
            //return the bookmark just because
            return bookmark;
        };

        function getCursorPosition(editor) {
            //set a bookmark so we can return to the current position after we reset the content later
            var bm = editor.selection.getBookmark(0);

            //select the bookmark element
            var selector = "[data-mce-type=bookmark]";
            var bmElements = editor.dom.select(selector);

            //put the cursor in front of that element
            editor.selection.select(bmElements[0]);
            editor.selection.collapse();

            //add in my special span to get the index...
            //we won't be able to use the bookmark element for this because each browser will put id and class attributes in different orders.
            var elementID = ("######cursor######");
            var positionString = '<span id="' + elementID + '"></span>';
            editor.selection.setContent(positionString);

            //get the content with the special span but without the bookmark meta tag
            var content = editor.getContent({
                format: "html"
            });
            //find the index of the span we placed earlier
            var index = content.indexOf(positionString);

            //remove my special span from the content
            editor.dom.remove(elementID, false);

            //move back to the bookmark
            editor.selection.moveToBookmark(bm);

            return index;
        };

        if ($scope.reportObject.report_type) {
            $scope.getFilterFields();
        };

        function GetTemplates() {
            viewDataTablesService.getAllOrganizations().then(function (res) {
                if (res.data) {
                    angular.forEach(res.data, function (organizations, indexs) {
                        $('#'+organizations.org_id).empty();
                    });
                }
            }, function (err) {
                console.error(err);
            });
            var reportType = $scope.reportObject.report_type;
            $scope.reportObject.templates = null;
            var data = {
                report_type: reportType,
                employee_id: EmployeeId,
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            viewDataTablesService.getTemplates(data)
                .then(function (res) {
                    // console.log(res);
                    $scope.reportObject.templates = res.data;
                    console.log($scope.reportObject.templatesTypes);
                    if ($scope.reportObject.templatesTypes && $scope.reportObject.templates) {
                        var DefaultTemp = $('#DefaultTemplate');
                        var SharedTemp = $('#SharedTemplate');
//                        var MyTemp = $('#MyTemplate');
                        $(DefaultTemp).empty();
                        $(SharedTemp).empty();
                        
                        angular.forEach($scope.reportObject.templates, function (template, index) {
                            console.log(template);
                            var p = document.createElement('p');
                            var Span = document.createElement('span');
                            PopulateTemplates(p, Span, DefaultTemp, template);
                            // if (template.template_type_code == "DefaultTemplate") {
                            //     PopulateTemplates(p, Span, DefaultTemp, template);
                            // } else if (template.template_type_code == "SharedTemplate") {
                            //     PopulateTemplates(p, Span, SharedTemp, template);
                            // } else if (template.template_type_code == "MyTemplate") {
                            //     PopulateTemplates(p, Span, MyTemp, template);
                            // }
                        });
                    }
                    return true;
                }, function (err) {
                    console.error(err);
                    return false;
                });
        }

        function init() {

            EmployeeId = $scope.user.employee_id;
            userPermission = getUserGroupPermissions();
            localStorage.setItem('EmployeeId', EmployeeId);
            OrgId = $scope.user.org_id;
            // OrgId = localStorage.getItem('OrgId');
            $("#RepIncidentId").val($scope.reportObject.incident_id);
            setTimeout(setUpEvents, 250);
        };

        init();
    };
    controller.$inject = ['$scope', '$rootScope', '$uibModal', 'reportObject', 'coreService', 'viewDataTablesService', '$filter', '$q', '$state', 'uiGridConstants', 'uiGridExporterConstants', 'coreReportService']
    angular.module('viewDataTablesModule')
        .controller('printOrEmailCtrl', controller);
}());