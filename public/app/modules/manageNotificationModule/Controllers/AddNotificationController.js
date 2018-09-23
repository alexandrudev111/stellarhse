(function () {
    var controller = function ($scope, constantService, manageNotificationService, $state, $filter, coreService, $q, $uibModal, $confirm, coreReportService) {
        $scope.oneAtATime = true;
        $scope.tinymceOptions = {
            selector: 'textarea',
            // height: 390,
            // min_height: 390,
            // max_height: 390,
            // fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
            plugins: "lists",
            menubar: true,
            toolbar: "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify bullist numlist | undo redo | fontselect | fontsizeselect"
        };
        $scope.status = {
            addNewNotification: true,
            filterStatus : {},
            fieldStatus: {}
        };
        $scope.closeOtherAccordions = function(field_name){
            angular.forEach($scope.status.filterStatus, function(acc, key){
                if(key === field_name)
                    $scope.status.filterStatus[key] = true;
                else
                    $scope.status.filterStatus[key] = false;
            });
        };
        $scope.closeOtherFieldAccordions = function(sub_tab_name){
            angular.forEach($scope.status.fieldStatus, function(acc, key){
                if(key === sub_tab_name)
                    $scope.status.fieldStatus[key] = true;
                else
                    $scope.status.fieldStatus[key] = false;
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
        $scope.tinymceOptions = {
            height: 300
        };
        $scope.notifiedFilterFields = [];
        // $scope.notifiedType = 'user';
        $scope.assignedNotification = {
            org_id: coreService.getUser().org_id,
            choosedNotificationModule: null,
            choosedNotificationType: null,
            choosedNotificationModuleCode: null,
            choosedNotifiedCategory: 'user',
            // choosedNotificationTo: 'user',
            notifiedSelectedGroup: null,
            notifiedSelectedUser: null,
            notifiedFilterFields:[],
            notifiedStandardFilterFields: [],
            notifiedSpecialFilterFields:[],
            notifiedFilterEscalatedFields:{}
            // selectedFilters: {},
            // escalatedFilters: {}
        };
        // $scope.notifiedSelectedGroups = [];
        $scope.notificationAssignment = {};
        // $scope.individulals = [];
        $scope.notifiedEmployees = [];
        $scope.filterValues = [];
        // $scope.multiselectsettings = {displayProp: 'name', smartButtonMaxItems: 3, scrollableHeight: '200px', 
        // scrollable: true, enableSearch: true, searchField: 'name'};
        $scope.notifiedFilterValues = [];
        $scope.user = coreService.getUser();
        if (!$scope.user)
            $state.go('login');
        // $scope.notificationTypes = [
        //     {id: 'analytics', name: 'Analytics'},
        //     {id: 'hazard', name: 'Hazard ID'},
        //     {id: 'hseprogram', name: 'HSE Program'},
        //     {id: 'incident', name: 'Incident'},
        //     {id: 'inspection', name: 'Inspection'},
        //     {id: 'maintenance', name: 'Maintenance'},
        //     {id: 'safetymeeting', name: 'Safety Meeting'},
        //     {id: 'training', name: 'Training'}
        // ];
        // $scope.choosedNotificationType = 'incident';
        $scope.getNotifiedEmployees = function (letters) {
            if (letters !== null && letters !== '')
                manageNotificationService.getNotifiedEmployees({
                    org_id: $scope.user['org_id'],
                    language_id: $scope.user['language_id'],
                    letters: letters
                }).then(function (response) {
                    var res = response.data;
                    if (res) {
                        $scope.notifiedEmployees = res;
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        $scope.getNotifiedGroups = function (letters) {
            if (letters !== null && letters !== '')
                manageNotificationService.getNotifiedGroups({
                    org_id: $scope.user['org_id'],
                    language_id: $scope.user['language_id'],
                    letters: letters
                }).then(function (response) {
                    var res = response.data;
                    if (res) {
                        $scope.notifiedGroups = res;
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
        };
        var init = function () {
            var data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id
            };
            $q.all([
                manageNotificationService.getNotificationModulesTypes(data),
                manageNotificationService.getNotificationTypes(data),
                // manageNotificationService.getNotifiedGroups(data),
                coreService.getDefaultFields(data),
                coreService.getDefaultEmailTypes(data)
            ]).then(function (queues) {
                $scope.notificationModulesTypes = queues[0].data;
                $scope.assignedNotification.choosedNotificationModule = $scope.notificationModulesTypes[0].id;
                // $scope.assignedNotification.choosedNotificationModuleCode = $filter('filter')($scope.notificationModulesTypes, {id:$scope.assignedNotification.choosedNotificationType})[0].code;
                $scope.notificationTypes = queues[1].data;
                $scope.assignedNotification.choosedNotificationType = $scope.notificationTypes[0].code;
                // $scope.notifiedGroups = queues[2].data;
                $scope.notifiedFields = queues[2].data;
                $scope.emailTypes = queues[3].data;
                console.log($scope.emailTypes)
                
                $scope.notified_labels = [];
                angular.forEach($scope.notifiedFields, function (field) {
                    $scope.notified_labels[field.field_name] = field;
                });
                console.log($scope.notified_labels)
                // $scope.newIndividual();
                $scope.getFilterFields();
            }, function (errors) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
                coreService.setAlert({type: 'exception', message: errors[2].data});
                coreService.setAlert({type: 'exception', message: errors[3].data});
            });
        };
        init();
        // $scope.newIndividual = function () {
        //     var individual = null;
        //     $scope.assignedNotification.individulals.push(individual);
        // };
        // $scope.removeIndividual = function (index, item) {
        //     $scope.assignedNotification.individulals.splice(index, 1);
        //     $scope.notifiedEmployees.splice(index, 1);
        // };
        $scope.getFilterFields = function(){
            $scope.assignedNotification.notifiedStandardFilterFields = [];
            $scope.assignedNotification.notifiedSpecialFilterFields = [];
            $scope.assignedNotification.choosedNotificationType = $scope.notificationTypes[0].code;
            $scope.assignedNotification.choosedNotificationModuleCode = $filter('filter')($scope.notificationModulesTypes, {id:$scope.assignedNotification.choosedNotificationModule})[0].code;
            console.log($scope.assignedNotification.choosedNotificationModuleCode);
            var data = {
                org_id: $scope.user.org_id,
                code: $scope.assignedNotification.choosedNotificationModuleCode
            };
            var report_type = '';
            switch($scope.assignedNotification.choosedNotificationModuleCode){
                case 'Hazard':
                    report_type = 'hazard';
                    break;
                case 'ABCanTrack':
                    report_type = 'incident';
                    break;
                case 'Inspection':
                    report_type = 'inspection';
                    break;
                case 'SafetyMeeting':
                    report_type = 'safetymeeting';
                    break;
                case 'MaintenanceManagement':
                    report_type = 'maintenance';
                    break;
                case 'Training':
                    report_type = 'training';
                    break;
            }
            // if($scope.assignedNotification.choosedNotificationModuleCode === 'ABCanTrack'){
            //     report_type = 'incident';
            // }else{
            //     report_type = $scope.assignedNotification.choosedNotificationModuleCode.charAt(0).toLowerCase() + $scope.assignedNotification.choosedNotificationModuleCode.slice(1);
            // }
            var fields_data = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                type: report_type
            };
            var emailTemplateData = {
                org_id: $scope.user.org_id,
                language_id: $scope.user.language_id,
                reportType: report_type
            };
            $q.all([
            manageNotificationService.getFilterFields(data),
            manageNotificationService.getFilterEscalatedFields(data),
            coreReportService.getReportFields(fields_data),
            manageNotificationService.getEmailTemplates(emailTemplateData)
            ]).then(function (queues) {
                // $scope.notifiedFilterFields = [];
                $scope.notifiedFilterFields = queues[0].data;
                console.log($scope.notifiedFilterFields);
                // if($scope.assignedNotification.notifiedStandardFilterFields.length === 0)
                //     $scope.getFilterFieldsByType();
                // $scope.status.filterStatus[$scope.notifiedFilterFields[0].field_name] = true;
                $scope.notifiedFilterEscalatedFields = queues[1].data;
                console.log($scope.notifiedFilterEscalatedFields);
                // $scope.notified_escalated_labels = [];
                $scope.assignedNotification.notifiedFilterEscalatedFields = {};
                angular.forEach($scope.notifiedFilterEscalatedFields, function (field) {
                    $scope.assignedNotification.notifiedFilterEscalatedFields[field.field_name] = field;
                });
                console.log($scope.assignedNotification.notifiedFilterEscalatedFields);
                $scope.reportFields = queues[2].data;
                console.log($scope.reportFields);
                $scope.report_tabs = {};
                // $scope.report_labels = [];
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
                $scope.emailtemplates = queues[3].data;
                console.log($scope.emailtemplates);
                $scope.getFilterFieldsByType();
            }, function(errors){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: errors[0].data});
                coreService.setAlert({type: 'exception', message: errors[1].data});
                coreService.setAlert({type: 'exception', message: errors[2].data});
                coreService.setAlert({type: 'exception', message: errors[3].data});
            });
        };
        $scope.getFilterFieldsByType = function(){
            if($scope.assignedNotification.notifiedStandardFilterFields.length === 0 && 
                $scope.assignedNotification.choosedNotificationType === 'standard'){
                    $scope.assignedNotification.notifiedFilterFields = $filter('filter')($scope.notifiedFilterFields, {type_code:$scope.assignedNotification.choosedNotificationType});
                    // $scope.assignedNotification.notifiedStandardFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
            }else if($scope.assignedNotification.notifiedSpecialFilterFields.length === 0 && 
                $scope.assignedNotification.choosedNotificationType === 'special'){
                    // $scope.assignedNotification.notifiedStandardFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
                    $scope.assignedNotification.notifiedFilterFields = $filter('filter')($scope.notifiedFilterFields, {type_code:$scope.assignedNotification.choosedNotificationType});
                    // $scope.assignedNotification.notifiedSpecialFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
            }else if($scope.assignedNotification.notifiedStandardFilterFields.length !== 0 && 
                $scope.assignedNotification.choosedNotificationType === 'standard'){
                    // $scope.assignedNotification.notifiedSpecialFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
                    $scope.assignedNotification.notifiedFilterFields = angular.copy($scope.assignedNotification.notifiedStandardFilterFields);
            }else if($scope.assignedNotification.notifiedSpecialFilterFields.length !== 0 && 
                $scope.assignedNotification.choosedNotificationType === 'special'){
                    // $scope.assignedNotification.notifiedStandardFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
                    $scope.assignedNotification.notifiedFilterFields = angular.copy($scope.assignedNotification.notifiedSpecialFilterFields);
            }
            console.log($scope.assignedNotification.notifiedFilterFields);
            console.log($scope.assignedNotification.notifiedStandardFilterFields);
            console.log($scope.assignedNotification.notifiedSpecialFilterFields);
        };
        $scope.getFilterValues = function(filter, impact_id){
            // if(filter.field_name === 'CorrectiveActionsHeader' && filter.choosed === true && angular.isDefined($scope.assignedNotification.selectedFilters)){
            //     delete $scope.assignedNotification.selectedFilters.CorrectiveActionsHeader;
            // }
            if(angular.isDefined(filter.field_id) && filter.field_id !== null && filter.field_id !== '')
                if(filter.field_name === 'CorrectiveActionsHeader' && filter.choosed === true){
                    filter.filterValues = [];
                    filter.filterValues[0] = {};
                    filter.filterValues[0].email_type = $scope.emailTypes[0].email_type_id;
                } else if((impact_id === null && filter.field_name !== 'impact_sub_type_id' && filter.choosed === true) || 
                (impact_id !== null && impact_id !== "" && filter.field_name === 'impact_sub_type_id'))
                    manageNotificationService.getFilterValues({
                        field_id: filter.field_id,
                        org_id: $scope.user['org_id'],
                        code: $scope.assignedNotification.choosedNotificationModuleCode,
                        impact_id: impact_id
                    })
                    .then(function(response){
                        filter.filterValues = response.data;
                        console.log(filter.field_name);
                        console.log(filter.filterValues);
                        console.log($scope.assignedNotification.notifiedFilterFields);
                    }, function(error){
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.getSubImpactValues = function(filter, impactValue){
            $scope.sub_impact_types = '';
            angular.forEach(filter.filterValues, function(assignedValue){
                if(angular.isDefined(assignedValue.choosed) && assignedValue.choosed === true){
                    $scope.sub_impact_types += assignedValue.id + ',';
                }
            });
            console.log($scope.sub_impact_types);
            var field = $filter('filter')($scope.assignedNotification.notifiedFilterFields, {field_name: 'impact_sub_type_id'})[0]; 
            console.log(field);
            if($scope.sub_impact_types !== null && $scope.sub_impact_types !== ""){
                $scope.getFilterValues(field, $scope.sub_impact_types);
            }else{
                field.filterValues = null;
            }
        };
        $scope.$watch("assignedNotification.notifiedFilterFields", function(newVal, oldVal){
            if(newVal !== oldVal){
                if($scope.assignedNotification.choosedNotificationType === 'standard')
                    $scope.assignedNotification.notifiedStandardFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
                else
                    $scope.assignedNotification.notifiedSpecialFilterFields = angular.copy($scope.assignedNotification.notifiedFilterFields);
            }
        }, true);
        $scope.$watchGroup(["assignedNotification.notifiedStandardFilterFields",
        "assignedNotification.notifiedSpecialFilterFields"], function(newVal, oldVal){
            console.log(newVal);
            $scope.disableFilters = true;
            $scope.disableFiltersValues = true;
            $scope.assignedFiltersCount = 0;
            $scope.assignedStandardFiltersCount = 0;
            $scope.assignedStandardFilterValuesCount = [];
            $scope.assignedSpecialFiltersCount = 0;
            $scope.assignedSpecialFilterValuesCount = [];
            var index = 0;
            var index2 = 0;
            $scope.summaryFilters = '';
            // if(newVal !== oldVal){
                // Standard Filters
                angular.forEach(newVal[0], function(assignedfilter){
                    if(assignedfilter.choosed === true){
                        $scope.assignedStandardFiltersCount++;
                        if(assignedfilter.field_name === 'CorrectiveActionsHeader'){
                            $scope.summaryFilters += assignedfilter.field_label;
                            if(!angular.isDefined( $scope.assignedStandardFilterValuesCount[index]))
                            $scope.assignedStandardFilterValuesCount[index] = 0;
                            $scope.assignedStandardFilterValuesCount[index]++;
                        } else{
                            $scope.summaryFilters += assignedfilter.field_label+': ';
                            angular.forEach(assignedfilter.filterValues, function(filterValue){
                                if(!angular.isDefined( $scope.assignedStandardFilterValuesCount[index]))
                                $scope.assignedStandardFilterValuesCount[index] = 0;
                                if(filterValue.choosed === true){
                                    $scope.assignedStandardFilterValuesCount[index]++;
                                    $scope.summaryFilters += filterValue.name+', ';
                                }
                                console.log( $scope.assignedStandardFilterValuesCount);
                            });
                        }
                        $scope.summaryFilters += "\n";
                        index++;
                    }
                });
                // Special Filters
                angular.forEach(newVal[1], function(assignedfilter){
                    if(assignedfilter.choosed === true){
                        $scope.assignedSpecialFiltersCount++;
                        if(assignedfilter.field_name === 'CorrectiveActionsHeader'){
                            $scope.summaryFilters += assignedfilter.field_label;
                            if(!angular.isDefined( $scope.assignedSpecialFilterValuesCount[index2]))
                            $scope.assignedSpecialFilterValuesCount[index2] = 0;
                            $scope.assignedSpecialFilterValuesCount[index2]++;
                        } else{
                            $scope.summaryFilters += assignedfilter.field_label+': ';
                            angular.forEach(assignedfilter.filterValues, function(filterValue){
                                if(!angular.isDefined( $scope.assignedSpecialFilterValuesCount[index2]))
                                $scope.assignedSpecialFilterValuesCount[index2] = 0;
                                if(filterValue.choosed === true){
                                    $scope.assignedSpecialFilterValuesCount[index2]++;
                                    $scope.summaryFilters += filterValue.name+', ';
                                }
                                console.log( $scope.assignedSpecialFilterValuesCount);
                            });
                        }
                        $scope.summaryFilters += "\n";
                        index2++;
                    }
                });
                $scope.assignedFiltersCount = $scope.assignedStandardFiltersCount + $scope.assignedSpecialFiltersCount;
                if( $scope.assignedFiltersCount + $scope.assignedEscalatedFiltersCount <= 4 &&
                    $scope.assignedFiltersCount + $scope.assignedEscalatedFiltersCount > 0)
                    $scope.disableFilters = false;
                else
                    $scope.disableFilters = true;
                    console.log( $scope.assignedFiltersCount);
                    console.log( $scope.assignedEscalatedFiltersCount);
                    console.log( $scope.disableFilters);
                    console.log( $scope.assignedStandardFilterValuesCount.length);
                    console.log( $scope.assignedSpecialFilterValuesCount.length);
                if( $scope.assignedStandardFilterValuesCount.length + $scope.assignedSpecialFilterValuesCount.length === $scope.assignedFiltersCount){
                    console.log( $scope.assignedStandardFilterValuesCount.indexOf(0));
                    console.log( $scope.assignedSpecialFilterValuesCount.indexOf(0));
                    if( $scope.assignedStandardFilterValuesCount.indexOf(0) !== -1 ||
                    $scope.assignedSpecialFilterValuesCount.indexOf(0) !== -1){
                        $scope.disableFiltersValues = true;
                        console.log($scope.disableFiltersValues);
                    }else{
                        $scope.disableFiltersValues = false;
                        console.log($scope.disableFiltersValues);
                    }
                } else {
                    $scope.disableFiltersValues = true;
                    console.log($scope.disableFiltersValues);
                }
                $scope.notificationSummary = $scope.summaryFilters + $scope.summaryEscalatedFilters;
            // }
        }, true);
        $scope.$watch("assignedNotification.notifiedFilterEscalatedFields", function(newVal, oldVal){
            console.log(newVal);
            $scope.disableFilters = true;
            $scope.disableEscalatedFiltersValues = true;
            $scope.assignedEscalatedFiltersCount = 0;
            $scope.assignedEscalatedFilterValuesCount = [];
            var index = 0;
            $scope.summaryEscalatedFilters = '';
            if(newVal !== oldVal){
                angular.forEach(newVal, function(assignedfilter){
                    console.log(assignedfilter);
                    if(assignedfilter.choosed === true){
                        $scope.assignedEscalatedFiltersCount++;
                        if(angular.isDefined(assignedfilter.start) && angular.isDefined(assignedfilter.start) 
                        && assignedfilter.start !== '' && assignedfilter.start !== null
                        && assignedfilter.freq !== '' && assignedfilter.freq !== null){
                        $scope.summaryEscalatedFilters += assignedfilter.field_label+': overdue '+assignedfilter.start+' days, '+assignedfilter.freq+
                        ' day remindar frequency.';
                        $scope.summaryEscalatedFilters += "\n";

                        if(!angular.isDefined( $scope.assignedEscalatedFilterValuesCount[index]))
                            $scope.assignedEscalatedFilterValuesCount[index] = 0;
                        $scope.assignedEscalatedFilterValuesCount[index]++;
                        console.log( $scope.assignedEscalatedFilterValuesCount);
                        index++;
                        }
                    }
                });
                if( $scope.assignedFiltersCount + $scope.assignedEscalatedFiltersCount <= 4 &&
                    $scope.assignedFiltersCount + $scope.assignedEscalatedFiltersCount > 0)
                    $scope.disableFilters = false;
                else
                    $scope.disableFilters = true;
                    console.log( $scope.assignedFiltersCount);
                    console.log( $scope.assignedEscalatedFiltersCount);
                    console.log( $scope.disableFilters);
                if( $scope.assignedEscalatedFilterValuesCount.length === $scope.assignedEscalatedFiltersCount){
                    console.log( $scope.assignedEscalatedFilterValuesCount.indexOf(0));
                    if( $scope.assignedEscalatedFilterValuesCount.indexOf(0) !== -1){
                        $scope.disableEscalatedFiltersValues = true;
                        console.log($scope.disableEscalatedFiltersValues);
                    }else{
                        $scope.disableEscalatedFiltersValues = false;
                        console.log($scope.disableEscalatedFiltersValues);
                    }
                } else {
                    $scope.disableEscalatedFiltersValues = true;
                    console.log($scope.disableEscalatedFiltersValues);
                }
                $scope.notificationSummary = $scope.summaryFilters + $scope.summaryEscalatedFilters;
            }
        }, true);
        $scope.addFullReport = function(){
            var checkedFields = '';
            angular.forEach($scope.report_tabs, function(tab, key){
                if(key === 'Actions' || key === 'Follows' || key === 'People' || 
                key === 'Impacts' || key === 'SCATAnalysis' || key === 'Upload'){
                    checkedFields += tab.field_block+tab.field_block_end+" <br/>";
                }
                angular.forEach(tab.report_labels, function(field, key2){
                    if(field.hasOwnProperty('field_block')){
                        if(field.field_name === 'contractor_id' || field.field_name === 'customer_id')
                            checkedFields += field.field_block+field.field_block_end+" <br/>";
                        else
                            checkedFields += field.field_block+' <br/><br/>';
                    } 
//                    else if(field.field_name === 'frequency_of_worker_exposure' || field.field_name === 'severity_of_potential_consequences' || field.field_name === 'probability_of_hazard'){
//                        checkedFields += field.field_label+':$'+field.field_name+' <br/><br/>'; 
//                    }else
//                        checkedFields += field.field_label+':$'+field.table_field_name+' <br/><br/>';
                });
            });
            console.log(checkedFields);

            var editor = tinyMCE.activeEditor;
			var cursorIndex = getCursorPosition(editor);
			console.log(cursorIndex);
            if(cursorIndex === 3 || cursorIndex === -1)
                $scope.emailtemplates.body = checkedFields + $scope.emailtemplates.body;
            else
			    setCursorPosition(editor, cursorIndex, checkedFields);
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
                $scope.emailtemplates.body = checkedFields + $scope.emailtemplates.body;
            else
			    setCursorPosition(editor, cursorIndex, checkedFields);
        };
        
        // function setCaretToPos (input, pos) {
        //     setSelectionRange(input, pos, pos);
        // }
        
        function setCursorPosition(editor, index, checkedFields) {
            //get the content in the editor before we add the bookmark... 
            //use the format: html to strip out any existing meta tags
            var content = editor.getContent({format: "html"});
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
            var positionString = '<span id="'+bookmark.id+'_start" data-mce-type="bookmark" data-mce-style="overflow:hidden;line-height:0px"></span>';
            //cram the position string inbetween the two parts of the content we got earlier
            $scope.emailtemplates.body = part1 + checkedFields + positionString + part2;
    
            //replace the content of the editor with the content with the special span
            //use format: raw so that the bookmark meta tag will remain in the content
            editor.setContent($scope.emailtemplates.body, ({format: "raw"}));
    
            //move the cursor back to the bookmark
            //this will also strip out the bookmark metatag from the html
            editor.selection.moveToBookmark(bookmark);
            // editor.selection.focus();
            //return the bookmark just because
            return bookmark;
        }
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
            var positionString = '<span id="'+elementID+'"></span>';
            editor.selection.setContent(positionString);

            //get the content with the special span but without the bookmark meta tag
            var content = editor.getContent({format: "html"});
            //find the index of the span we placed earlier
            var index = content.indexOf(positionString);

            //remove my special span from the content
            editor.dom.remove(elementID, false);            

            //move back to the bookmark
            editor.selection.moveToBookmark(bm);

            return index;
        }
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };
        $scope.previewEmail = function(){
            var msg = {
                title: $scope.emailtemplates.subject,
                body: $scope.emailtemplates.body
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
            msg.body = msg.body.replaceAll("$rep_department", "Management");
            msg.body = msg.body.replaceAll("$rep_supervisor", "Eman");
            msg.body = msg.body.replaceAll("$rep_supervisor_notify", "Yes");
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
            msg.body = msg.body.replaceAll("$risk_level_value", "20/25");
            msg.body = msg.body.replaceAll("$should_work_stopped", "Yes");
            msg.body = msg.body.replaceAll("$crew_name", "Managers Crew");
            msg.body = msg.body.replaceAll("$department_responsible_name", "Management");
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
                templateUrl: 'app/modules/manageNotificationModule/views/previewEmail.html',
                controller: 'PreviewEmailController',
                backdrop: 'static',
                resolve: {
                    msg: msg
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
        $scope.saveNotification = function(){
            $scope.assignedNotification.emailtemplates = $scope.emailtemplates;
            console.log($scope.assignedNotification);
            manageNotificationService.saveNotification($scope.assignedNotification)
            .then(function(response){
                console.log(response.data);
                $state.go('manageNotification');
            }, function(error){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
            
           
        };
    
          $scope.status ={
                openTheBigOne:true
            };
        
        $scope.closeIt = function(){
            
            $scope.status ={
                openTheBigOne:false
            };
        };
    };
    controller.$inject = ['$scope', 'constantService', 'manageNotificationService', '$state', '$filter', 'coreService', '$q', '$uibModal', '$confirm', 'coreReportService'];
    angular.module('manageNotificationModule')
            .controller('AddNotificationController', controller);
}());
