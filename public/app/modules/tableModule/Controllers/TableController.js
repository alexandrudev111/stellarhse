(function () {
    var controller = function ($scope, $rootScope, $uibModal,constantService , coreService, $filter, $state, uiGridConstants, uiGridExporterConstants, coreReportService, viewDataTablesService) {
        $scope.hideGrid = false;
        $scope.user = coreService.getUser();
        $scope.products = coreService.getProducts();
                    $scope.gridOptions = coreService.getGridOptions();

        $scope.blah = function () {
                $scope.openReport();
            };
        $scope.gridOptions.isRowSelectable = function () {
            return true;
        };
        $scope.gridOptions.exporterCsvFilename = 'Customers.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.gridOptions.enableFullRowSelection = true;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //  var msg = 'row selected ' + row.isSelected;
                $scope.db.selectedItem = (row.isSelected ? row.entity : null);
                console.log($scope.db.selectedItem);
            });
            gridApi.core.on.sortChanged( $scope, function(grid, sortColumns){
              // sortColumns is an array containing just the column sorted in the grid
                if (sortColumns && sortColumns.length>0) {
                      $scope.sortedHeaderSelected = sortColumns[0].name; // the name of the first column sorted
                      console.log("name sorted", $scope.sortedHeaderSelected);
                      $scope.sortedTypeSelected = sortColumns[0].sort.direction // the direction of the first column sorted: "desc" or "asc"
                      // Your logic to do the server sorting
                      console.log("name sorted", $scope.sortedTypeSelected);
                      $scope.filter();
                }
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.pageNumber = newPage;
                $scope.pageSize = pageSize;
                console.log('pageChanged', $scope.pageNumber, $scope.pageSize);
               // $scope.filter();
            });

            /*gridApi.colMovable.on.columnPositionChanged($scope,function(colDef, originalPosition, newPosition){
                console.log(colDef);
                console.log(originalPosition);
                console.log(newPosition);
            })*/
        };
            
        

        $scope.sortedHeaderSelected = 'number';
        $scope.sortedTypeSelected = 'asc';
        /*$scope.pageNumber = 1;
        $scope.pageSize = 10;*/

        $scope.limits = [
            {
                id: 10,
                value: 10
            },
            {
                id: 20,
                value: 20
            },
            {
                id: 30,
                value: 30
            },
            {
                id: 40,
                value: 40
            },
            {
                id: 50,
                value: 50
            },
            {
                id: 100,
                value: 100
            }
        ];
        $scope.pageChanged = function () {
            $scope.filter();
        };

        console.log($scope.db);

        $scope.openAddCustomer = function () {
            $rootScope.isNew = true;
            $rootScope.org_id = '';
            $rootScope.selectedRow = '';
            if ($scope.db.selectArrays['Report Type'] === 1 && $scope.products.Hazard) // Hazard Id
                coreReportService.deleteTempFiles({
                }).then(function (response) {
                    var res = response.data;
                    if (res) {
                        console.log(res);
                    }
                });
                $state.go('createhazardreport');

            if ($scope.db.selectArrays['Report Type'] === 2 && $scope.products.ABCanTrack)
                $state.go('addincident');

            if ($scope.db.selectArrays['Report Type'] === 3 && $scope.products.Inspection)
                $state.go('createinspectionreport');

            if ($scope.db.selectArrays['Report Type'] === 4 && $scope.products.SafetyMeeting)
                $state.go('createsafetymeetingreport');

            if ($scope.db.selectArrays['Report Type'] === 5 && $scope.products.Training)
                $state.go('createtrainingreport');

            if ($scope.db.selectArrays['Report Type'] === 6 && $scope.products.MaintenanceManagement)
                $state.go('createmaintenancereport');
        }

        $scope.editCustomer = function () {
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                $rootScope.org_id = $scope.gridApi.selection.getSelectedRows()[0]['org_id'];
                $rootScope.selectedRow = $scope.gridApi.selection.getSelectedRows()[0];
                $rootScope.isNew = false;
                $state.go('addCustomer');
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.openHelp = function () {
            coreService.resetAlert();
            var post = {language_id: $scope.user.language_id, alert_message_code: 'customer'};
            coreService.getAlertMessageByCode(post).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    $scope.msgTitle = response.data['alert_name'];
                    $scope.msgBody = response.data['alert_message_description'];
                    // console.log($scope.msgBody);
                    $scope.$uibModalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/adminToolsModule/views/help.html',
                        controller: 'TableController',
                        scope: $scope
                    });
                }
            }, function (error) {
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };

        $scope.cancel = function () {
            angular.element('.modal').addClass('hide');
                  angular.element('.modal-backdrop').addClass('hide');
        };

        function setGridHeaders(viewName) {
            console.log(viewName);
            switch (viewName) {
                case 111: // All Corrective Actions
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'corrective_action_id',
                            displayName: 'corrective_action_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_number',
                            displayName: 'hazard_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_date',
                            displayName: 'hazard_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_event_type_name',
                            displayName: 'hazard_event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_desc',
                            displayName: 'hazard_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_action_token',
                            displayName: 'initial_action_token',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'status_of_hazard',
                            displayName: 'status_of_hazard',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_status',
                            displayName: 'corrective_action_status',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_priority',
                            displayName: 'corrective_action_priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        }

                    ];
                    break;
                case 211: // All Hazards
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'hazard_id',
                            displayName: 'hazard_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_event_type_name',
                            displayName: 'hazard_event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_date',
                            displayName: 'hazard_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_time',
                            displayName: 'hazard_time',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_min',
                            displayName: 'hazard_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_desc',
                            displayName: 'hazard_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_action_token',
                            displayName: 'initial_action_token',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'impact_type',
                            displayName: 'impact_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'acting', displayName: 'acting', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'potential_impacts_desc',
                            displayName: 'potential_impacts_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_number',
                            displayName: 'hazard_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_note',
                            displayName: 'hazard_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_cause_note',
                            displayName: 'hazard_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_other_location',
                            displayName: 'hazard_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by_name',
                            displayName: 'editing_by_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_id',
                            displayName: 'modifier_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_types',
                            displayName: 'hazard_types',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'certificates',
                            displayName: 'certificates',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_id',
                            displayName: 'corrective_action_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_status',
                            displayName: 'corrective_action_status',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_priority',
                            displayName: 'corrective_action_priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    break;
                case 311: // Basic Underlying Causes
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'hazard_id',
                            displayName: 'hazard_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'hazard_date',
                            displayName: 'hazard_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_number',
                            displayName: 'hazard_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_crew',
                            displayName: 'reporter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_primary_phone',
                            displayName: 'reporter_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_desc',
                            displayName: 'hazard_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'cause_type',
                            displayName: 'cause_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'cause_subtype',
                            displayName: 'cause_subtype',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'haz_type_name',
                            displayName: 'haz_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    break;
                case 411: // Impacts
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'hazard_id',
                            displayName: 'hazard_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'hazard_date',
                            displayName: 'hazard_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_number',
                            displayName: 'hazard_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_crew',
                            displayName: 'reporter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_primary_phone',
                            displayName: 'reporter_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_desc',
                            displayName: 'hazard_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'haz_type_name',
                            displayName: 'haz_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    break;
                case 511:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'hazard_id',
                            displayName: 'hazard_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'deleted_by',
                            displayName: 'deleted_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'employee_position',
                            displayName: 'employee_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'hazard_number',
                            displayName: 'hazard_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'deletion_reason',
                            displayName: 'deletion_reason',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'deletion_date',
                            displayName: 'deletion_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    //                $query = "call stellarhse_hazard.sp_deleted_hazard(:org_id, :search, :limit, :start)";
                    break;

                    // safety meeting views
                case 114:
                case 214:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'safetymeeting_id',
                            displayName: 'safetymeeting_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_type_name',
                            displayName: 'safetymeeting_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_date',
                            displayName: 'safetymeeting_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_hour',
                            displayName: 'safetymeeting_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_min',
                            displayName: 'safetymeeting_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_description',
                            displayName: 'safetymeeting_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'acting', displayName: 'acting', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_number',
                            displayName: 'safetymeeting_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_other_location',
                            displayName: 'safetymeeting_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by_name',
                            displayName: 'editing_by_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'certificates',
                            displayName: 'certificates',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    break;
                case 314:
                case 414:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'followup_action_id_',
                            displayName: 'followup_action_id_',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_number',
                            displayName: 'safetymeeting_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_id',
                            displayName: 'safetymeeting_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_date',
                            displayName: 'safetymeeting_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_hour',
                            displayName: 'safetymeeting_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_min',
                            displayName: 'safetymeeting_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'priority',
                            displayName: 'priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_by',
                            displayName: 'modifier_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'sent_date',
                            displayName: 'sent_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];
                    break;
                case 514:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'safetymeeting_id',
                            displayName: 'safetymeeting_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_type_name',
                            displayName: 'safetymeeting_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_date',
                            displayName: 'safetymeeting_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_other_location',
                            displayName: 'safetymeeting_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_description',
                            displayName: 'safetymeeting_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'acting', displayName: 'acting', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_number',
                            displayName: 'safetymeeting_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'person_name',
                            displayName: 'person_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true , minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'certificates',
                            displayName: 'certificates',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;
                case 614:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'safetymeeting_id',
                            displayName: 'safetymeeting_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_type_name',
                            displayName: 'safetymeeting_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_date',
                            displayName: 'safetymeeting_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_other_location',
                            displayName: 'safetymeeting_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'jop_number',
                            displayName: 'jop_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'contact_name',
                            displayName: 'contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_type_name',
                            displayName: 'third_party_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_description',
                            displayName: 'safetymeeting_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'safetymeeting_number',
                            displayName: 'safetymeeting_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;

                    //////// inspection ////////

                case 313:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'conducted_by',
                            displayName: 'conducted_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment_type',
                            displayName: 'equipment_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment_number',
                            displayName: 'equipment_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;

                case 413:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'conducted_by',
                            displayName: 'conducted_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_id',
                            displayName: 'third_party_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'third_party_type_name',
                            displayName: 'third_party_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'jop_number',
                            displayName: 'jop_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'contact_name',
                            displayName: 'contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;
                case 213:
                case 513:
                    //  case 1113:

                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_hour',
                            displayName: 'inspection_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_min',
                            displayName: 'inspection_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'impact_type',
                            displayName: 'impact_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'acting', displayName: 'acting', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'potential_impacts_desc',
                            displayName: 'potential_impacts_desc',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_inspection_exists',
                            displayName: 'Probability_of_inspection_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_note',
                            displayName: 'hazard_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_cause_note',
                            displayName: 'hazard_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by_name',
                            displayName: 'editing_by_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'corrective_action_status',
                            displayName: 'corrective_action_status',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_priority',
                            displayName: 'corrective_action_priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'corrective_action_supervisor',
                            displayName: 'corrective_action_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'superviosr_notify',
                            displayName: 'superviosr_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'certificates',
                            displayName: 'certificates',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];


                    break;

                case 113:
                case 613:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'corrective_action_id',
                            displayName: 'corrective_action_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_hour',
                            displayName: 'inspection_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_min',
                            displayName: 'inspection_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'priority',
                            displayName: 'priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;

                case 713:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'conducted_by',
                            displayName: 'conducted_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'classification_type',
                            displayName: 'classification_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'type', displayName: 'type', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'sub_type',
                            displayName: 'sub_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;

                case 813:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                        {name: 'acting', displayName: 'acting', cellTooltip: true, headerTooltip: true, visible: true, minWidth: 150},
                        {
                            name: 'certificates',
                            displayName: 'certificates',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true, minWidth: 150
                        },
                    ];

                    break;
                case 913:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'conducted_by',
                            displayName: 'conducted_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 1013:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_crew',
                            displayName: 'reporter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_primary_phone',
                            displayName: 'reporter_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_id',
                            displayName: 'impact_type_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;

                //////// incident ////////
                case 112:
                case 212:
                case 1512:
                    coreReportService.getDataTablesReportFields(fields_data).then(function(res){
                        // console.error(res.data);
                        $scope.gridOptions.columnDefs = [];
                        angular.forEach(res.data, function (value, key) {
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                field: value.field_name,
                                type: (value.field_name == "incident_number")? 'number': 'string',
                                displayName: value.sub_tab_label !== ""? (value.FieldLabel + '(' + value.sub_tab_label + ')'): value.FieldLabel,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: getDefaultFields(value.field_name)
                            });
                        });
                        console.log('$scope.gridOptions.columnDefs for incident',$scope.gridOptions.columnDefs);
                    },function(err){
                        console.error(err);
                    });
                    break;
                    /*$scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_hour',
                            displayName: 'incident_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_min',
                            displayName: 'incident_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_emergency_response',
                            displayName: 'is_emergency_response',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Customers_name',
                            displayName: 'Customers_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Contractors_name',
                            displayName: 'Contractors_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipments_name',
                            displayName: 'equipments_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_sequence',
                            displayName: 'event_sequence',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_condition_note',
                            displayName: 'env_condition_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inc_description',
                            displayName: 'inc_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_conditions',
                            displayName: 'env_conditions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'oe_department_name',
                            displayName: 'oe_department_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_code',
                            displayName: 'impact_type_code',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'imapct_sub_type_name',
                            displayName: 'imapct_sub_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name1',
                            displayName: 'initial_employee_name1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name2',
                            displayName: 'initial_employee_name2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name3',
                            displayName: 'initial_employee_name3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept1',
                            displayName: 'initial_employee_dept1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept2',
                            displayName: 'initial_employee_dept2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept3',
                            displayName: 'initial_employee_dept3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'primary_responder_name',
                            displayName: 'primary_responder_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_description',
                            displayName: 'impact_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_estimated_cost',
                            displayName: 'impact_estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Identification',
                            displayName: 'Identification',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'ext_agency_name',
                            displayName: 'ext_agency_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'certificate_name',
                            displayName: 'certificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'corrective_action_status',
                            displayName: 'corrective_action_status',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'repprter_crew',
                            displayName: 'repprter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_phone',
                            displayName: 'reporter_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'all_third_party_names',
                            displayName: 'all_third_party_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_id',
                            displayName: 'people_involved_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternative_phone',
                            displayName: 'alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment',
                            displayName: 'equipment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_suspected_cause',
                            displayName: 'hazard_suspected_cause',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_actions_taken',
                            displayName: 'initial_actions_taken',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'status', displayName: 'status', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'are_additional_corrective_actions_required',
                            displayName: 'are_additional_corrective_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'recommended_corrective_actions_summary',
                            displayName: 'recommended_corrective_actions_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 1013:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'inspection_id',
                            displayName: 'inspection_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_date',
                            displayName: 'inspection_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_number',
                            displayName: 'inspection_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_crew',
                            displayName: 'reporter_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_position',
                            displayName: 'reporter_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_company',
                            displayName: 'reporter_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_primary_phone',
                            displayName: 'reporter_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_alternative_phone',
                            displayName: 'reporter_alternative_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_supervisor',
                            displayName: 'reporter_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_other_location',
                            displayName: 'inspection_other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'hazard_description',
                            displayName: 'hazard_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_description',
                            displayName: 'inspection_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inspection_type_name',
                            displayName: 'inspection_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_id',
                            displayName: 'impact_type_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;

                    //////// incident ////////
                case 112:
                case 212:
                case 1512:
                    coreReportService.getDataTablesReportFields(fields_data).then(function (res) {
                        // console.error(res.data);
                        $scope.gridOptions.columnDefs = [];
                        angular.forEach(res.data, function (value, key) {
                            $scope.gridOptions.columnDefs.push({
                                name: value.field_name,
                                field: value.field_name,
                                type: (value.field_name == "incident_number") ? 'number' : 'string',
                                displayName: value.sub_tab_label !== "" ? (value.FieldLabel + '(' + value.sub_tab_label + ')') : value.FieldLabel,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: getDefaultFields(value.field_name)
                            });
                        });
                    }, function (err) {
                        console.error(err);
                    });
                    break;
                    /*$scope.gridOptions.columnDefs = [
                     {
                     name: 'incident_id',
                     displayName: 'incident_id',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'event_type_name',
                     displayName: 'event_type_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'incident_number',
                     displayName: 'incident_number',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'incident_date',
                     displayName: 'incident_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                     {
                     name: 'incident_hour',
                     displayName: 'incident_hour',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'incident_min',
                     displayName: 'incident_min',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'creator_id',
                     displayName: 'creator_id',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'creator_name',
                     displayName: 'creator_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'is_emergency_response',
                     displayName: 'is_emergency_response',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Customers_name',
                     displayName: 'Customers_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Contractors_name',
                     displayName: 'Contractors_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'equipments_name',
                     displayName: 'equipments_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_name',
                     displayName: 'rep_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_email',
                     displayName: 'rep_email',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_position',
                     displayName: 'rep_position',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_company',
                     displayName: 'rep_company',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_crew',
                     displayName: 'rep_crew',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_primary_phone',
                     displayName: 'rep_primary_phone',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'rep_alternate_phone',
                     displayName: 'rep_alternate_phone',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'supervisor',
                     displayName: 'supervisor',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'country',
                     displayName: 'country',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                     {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                     {
                     name: 'community',
                     displayName: 'community',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'other_location',
                     displayName: 'other_location',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'operation_type_name',
                     displayName: 'operation_type_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'crew_involved',
                     displayName: 'crew_involved',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'event_sequence',
                     displayName: 'event_sequence',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'env_condition_note',
                     displayName: 'env_condition_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'inc_description',
                     displayName: 'inc_description',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'env_conditions',
                     displayName: 'env_conditions',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'oe_department_name',
                     displayName: 'oe_department_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'risk_control',
                     displayName: 'risk_control',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Probability_of_hazard_exists',
                     displayName: 'Probability_of_hazard_exists',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Probability_of_worker_exposure',
                     displayName: 'Probability_of_worker_exposure',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Probability_of_potential_consequences',
                     displayName: 'Probability_of_potential_consequences',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'total_risk_level_value',
                     displayName: 'total_risk_level_value',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'impact_type_name',
                     displayName: 'impact_type_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'impact_type_code',
                     displayName: 'impact_type_code',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'imapct_sub_type_name',
                     displayName: 'imapct_sub_type_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_name1',
                     displayName: 'initial_employee_name1',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_name2',
                     displayName: 'initial_employee_name2',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_name3',
                     displayName: 'initial_employee_name3',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_dept1',
                     displayName: 'initial_employee_dept1',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_dept2',
                     displayName: 'initial_employee_dept2',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'initial_employee_dept3',
                     displayName: 'initial_employee_dept3',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'primary_responder_name',
                     displayName: 'primary_responder_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'impact_description',
                     displayName: 'impact_description',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'impact_estimated_cost',
                     displayName: 'impact_estimated_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Identification',
                     displayName: 'Identification',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'ext_agency_name',
                     displayName: 'ext_agency_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'people_name',
                     displayName: 'people_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'people_involved_name',
                     displayName: 'people_involved_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'company',
                     displayName: 'company',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'position',
                     displayName: 'position',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                     {
                     name: 'primary_phone',
                     displayName: 'primary_phone',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'alternate_phone',
                     displayName: 'alternate_phone',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'exp_in_current_postion',
                     displayName: 'exp_in_current_postion',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'exp_over_all',
                     displayName: 'exp_over_all',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                     {
                     name: 'how_he_involved',
                     displayName: 'how_he_involved',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'role_description',
                     displayName: 'role_description',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'people_involved_supervisor',
                     displayName: 'people_involved_supervisor',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                     {
                     name: 'certificate_name',
                     displayName: 'certificate_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'acting_name',
                     displayName: 'acting_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'corrective_action_status',
                     displayName: 'corrective_action_status',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'corrective_action_priority',
                     displayName: 'corrective_action_priority',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'assigned_to',
                     displayName: 'assigned_to',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'start_date',
                     displayName: 'start_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'target_end_date',
                     displayName: 'target_end_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'actual_end_date',
                     displayName: 'actual_end_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'estimated_cost',
                     displayName: 'estimated_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'actual_cost',
                     displayName: 'actual_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'out_come_follow_up',
                     displayName: 'out_come_follow_up',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'desired_results',
                     displayName: 'desired_results',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'corr_act_comments',
                     displayName: 'corr_act_comments',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'notified_names',
                     displayName: 'notified_names',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'task_description',
                     displayName: 'task_description',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'type_of_energy_name',
                     displayName: 'type_of_energy_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'immediate_cause_name',
                     displayName: 'immediate_cause_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'basic_cause_name',
                     displayName: 'basic_cause_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'sub_cause_name',
                     displayName: 'sub_cause_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'immdeiate_cause_type',
                     displayName: 'immdeiate_cause_type',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'basic_cause_type',
                     displayName: 'basic_cause_type',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'comments',
                     displayName: 'comments',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'EnergyForm',
                     displayName: 'EnergyForm',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'SubActions',
                     displayName: 'SubActions',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'SubConditions',
                     displayName: 'SubConditions',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'UnderLyingCauses',
                     displayName: 'UnderLyingCauses',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'energy_form_note',
                     displayName: 'energy_form_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'sub_standard_action_note',
                     displayName: 'sub_standard_action_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'sub_standard_condition_note',
                     displayName: 'sub_standard_condition_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'under_lying_cause_note',
                     displayName: 'under_lying_cause_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'inv_status_name',
                     displayName: 'inv_status_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_date',
                     displayName: 'investigation_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_id1',
                     displayName: 'investigator_id1',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_name1',
                     displayName: 'investigator_name1',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_id2',
                     displayName: 'investigator_id2',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_name2',
                     displayName: 'investigator_name2',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_id3',
                     displayName: 'investigator_id3',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigator_name3',
                     displayName: 'investigator_name3',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_summary',
                     displayName: 'investigation_summary',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_follow_up_note',
                     displayName: 'investigation_follow_up_note',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_response_cost',
                     displayName: 'investigation_response_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_repair_cost',
                     displayName: 'investigation_repair_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_insurance_cost',
                     displayName: 'investigation_insurance_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_wcb_cost',
                     displayName: 'investigation_wcb_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_other_cost',
                     displayName: 'investigation_other_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_total_cost',
                     displayName: 'investigation_total_cost',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_risk_of_recurrence_name',
                     displayName: 'investigation_risk_of_recurrence_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_severity_name',
                     displayName: 'investigation_severity_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_source',
                     displayName: 'investigation_source',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_source_details',
                     displayName: 'investigation_source_details',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Behaviors_cause',
                     displayName: 'Behaviors_cause',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Actions_cause',
                     displayName: 'Actions_cause',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Inactions_cause',
                     displayName: 'Inactions_cause',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'Conditions_cause',
                     displayName: 'Conditions_cause',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'supporting_information_root_cause_choices',
                     displayName: 'supporting_information_root_cause_choices',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'sign_off_investigator_id',
                     displayName: 'sign_off_investigator_id',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'sign_off_investigator_name',
                     displayName: 'sign_off_investigator_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'investigation_sign_off_date',
                     displayName: 'investigation_sign_off_date',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'modifier_name',
                     displayName: 'modifier_name',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'is_deleted',
                     displayName: 'is_deleted',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {
                     name: 'editing_by',
                     displayName: 'editing_by',
                     cellTooltip: true,
                     headerTooltip: true,
                     visible: true
                     },
                     {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                     ];
                     */
                    break;
                case 312:
                case 412:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_emp_id',
                            displayName: 'rep_emp_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_supervisor',
                            displayName: 'rep_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'corrective_action_status',
                            displayName: 'corrective_action_status',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'corrective_action_priority',
                            displayName: 'corrective_action_priority',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to',
                            displayName: 'assigned_to',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor_notify',
                            displayName: 'supervisor_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'corr_act_comments',
                            displayName: 'corr_act_comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sent_date',
                            displayName: 'sent_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 512:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'type_of_action',
                            displayName: 'type_of_action',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'immdeiate_cause_type',
                            displayName: 'immdeiate_cause_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'substandard_acts',
                            displayName: 'substandard_acts',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'substandard_conditions',
                            displayName: 'substandard_conditions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'root_cause_type',
                            displayName: 'root_cause_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'job_factors',
                            displayName: 'job_factors',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'personal_factors',
                            displayName: 'personal_factors',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sub_cause_name',
                            displayName: 'sub_cause_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'updated_date',
                            displayName: 'updated_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 612:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_email',
                            displayName: 'reporter_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_primary_phone',
                            displayName: 'reporter_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'person_name',
                            displayName: 'person_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'certificate_name',
                            displayName: 'certificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 712:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control_name',
                            displayName: 'risk_control_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_hour',
                            displayName: 'incident_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_min',
                            displayName: 'incident_min',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_emergency_response',
                            displayName: 'is_emergency_response',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Customers_name',
                            displayName: 'Customers_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Contractors_name',
                            displayName: 'Contractors_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipments_name',
                            displayName: 'equipments_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'certificate_name',
                            displayName: 'certificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;
                case 812:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_type_name',
                            displayName: 'third_party_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'job_number',
                            displayName: 'job_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'contact_name',
                            displayName: 'contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;

                case 912:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_category_name',
                            displayName: 'equipment_category_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_type',
                            displayName: 'equipment_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_number',
                            displayName: 'equipment_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'certificate_name',
                            displayName: 'certificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;

                case 1012:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipments_name',
                            displayName: 'equipments_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observation_and_analysis_param_id',
                            displayName: 'observation_and_analysis_param_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observation_type',
                            displayName: 'observation_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'type_id',
                            displayName: 'type_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observation_sub_type',
                            displayName: 'observation_sub_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;
                case 1112:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_condition_type',
                            displayName: 'env_condition_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_condition_sub_type',
                            displayName: 'env_condition_sub_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipments_name',
                            displayName: 'equipments_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'certificate_name',
                            displayName: 'certificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'risk_control',
                            displayName: 'risk_control',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_hazard_exists',
                            displayName: 'Probability_of_hazard_exists',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_worker_exposure',
                            displayName: 'Probability_of_worker_exposure',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            displayName: 'Probability_of_potential_consequences',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_risk_level_value',
                            displayName: 'total_risk_level_value',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;
                case 1212:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_date',
                            displayName: 'incident_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'incident_description',
                            displayName: 'incident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_code',
                            displayName: 'impact_type_code',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'imapct_sub_type_name',
                            displayName: 'imapct_sub_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name1',
                            displayName: 'initial_employee_name1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name2',
                            displayName: 'initial_employee_name2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name3',
                            displayName: 'initial_employee_name3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept1',
                            displayName: 'initial_employee_dept1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept2',
                            displayName: 'initial_employee_dept2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept3',
                            displayName: 'initial_employee_dept3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'primary_responder_name',
                            displayName: 'primary_responder_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_description',
                            displayName: 'impact_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Identification',
                            displayName: 'Identification',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'ext_agency_name',
                            displayName: 'ext_agency_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;
                case 1312:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'root_cause_name',
                            displayName: 'root_cause_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'root_cause_param_name',
                            displayName: 'root_cause_param_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inc_date',
                            displayName: 'inc_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_emp_id',
                            displayName: 'rep_emp_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_supervisor',
                            displayName: 'rep_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_emergency_response',
                            displayName: 'is_emergency_response',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_sequence',
                            displayName: 'event_sequence',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'icident_description',
                            displayName: 'icident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_condition_note',
                            displayName: 'env_condition_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'energy_form_note',
                            displayName: 'energy_form_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sub_standard_action_note',
                            displayName: 'sub_standard_action_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sub_standard_condition_note',
                            displayName: 'sub_standard_condition_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'under_lying_cause_note',
                            displayName: 'under_lying_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inv_status_name',
                            displayName: 'inv_status_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_date',
                            displayName: 'investigation_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id1',
                            displayName: 'investigator_id1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name1',
                            displayName: 'investigator_name1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id2',
                            displayName: 'investigator_id2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name2',
                            displayName: 'investigator_name2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id3',
                            displayName: 'investigator_id3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name3',
                            displayName: 'investigator_name3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_summary',
                            displayName: 'investigation_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_follow_up_note',
                            displayName: 'investigation_follow_up_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_response_cost',
                            displayName: 'investigation_response_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_repair_cost',
                            displayName: 'investigation_repair_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_insurance_cost',
                            displayName: 'investigation_insurance_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_wcb_cost',
                            displayName: 'investigation_wcb_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_other_cost',
                            displayName: 'investigation_other_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_total_cost',
                            displayName: 'investigation_total_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_risk_of_recurrence_name',
                            displayName: 'investigation_risk_of_recurrence_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_severity_name',
                            displayName: 'investigation_severity_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_source_details',
                            displayName: 'investigation_source_details',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_root_cause_note',
                            displayName: 'investigation_root_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sign_off_investigator_id',
                            displayName: 'sign_off_investigator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sign_off_investigator_name',
                            displayName: 'sign_off_investigator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_sign_off_date',
                            displayName: 'investigation_sign_off_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;

                case 1412:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'incident_id',
                            displayName: 'incident_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_type_name',
                            displayName: 'event_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'incident_number',
                            displayName: 'incident_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_name',
                            displayName: 'creator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inc_date',
                            displayName: 'inc_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_emp_id',
                            displayName: 'rep_emp_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_supervisor',
                            displayName: 'rep_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_emergency_response',
                            displayName: 'is_emergency_response',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'event_sequence',
                            displayName: 'event_sequence',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'icident_description',
                            displayName: 'icident_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'env_condition_note',
                            displayName: 'env_condition_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'should_work_stopped',
                            displayName: 'should_work_stopped',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'energy_form_note',
                            displayName: 'energy_form_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sub_standard_action_note',
                            displayName: 'sub_standard_action_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sub_standard_condition_note',
                            displayName: 'sub_standard_condition_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'under_lying_cause_note',
                            displayName: 'under_lying_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'inv_status_id',
                            displayName: 'inv_status_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_date',
                            displayName: 'investigation_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id1',
                            displayName: 'investigator_id1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name1',
                            displayName: 'investigator_name1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id2',
                            displayName: 'investigator_id2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name2',
                            displayName: 'investigator_name2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_id3',
                            displayName: 'investigator_id3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigator_name3',
                            displayName: 'investigator_name3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_summary',
                            displayName: 'investigation_summary',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_follow_up_note',
                            displayName: 'investigation_follow_up_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_response_cost',
                            displayName: 'investigation_response_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_repair_cost',
                            displayName: 'investigation_repair_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_insurance_cost',
                            displayName: 'investigation_insurance_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_wcb_cost',
                            displayName: 'investigation_wcb_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_other_cost',
                            displayName: 'investigation_other_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_total_cost',
                            displayName: 'investigation_total_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_risk_of_recurrence_id',
                            displayName: 'investigation_risk_of_recurrence_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_severity_id',
                            displayName: 'investigation_severity_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_source_details',
                            displayName: 'investigation_source_details',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_root_cause_note',
                            displayName: 'investigation_root_cause_note',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sign_off_investigator_id',
                            displayName: 'sign_off_investigator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sign_off_investigator_name',
                            displayName: 'sign_off_investigator_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'investigation_sign_off_date',
                            displayName: 'investigation_sign_off_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_name',
                            displayName: 'modifier_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'body_part_name',
                            displayName: 'body_part_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_sub_type_name',
                            displayName: 'impact_sub_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_type_name',
                            displayName: 'impact_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'PersonalInjured',
                            displayName: 'PersonalInjured',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'LostTimeStart',
                            displayName: 'LostTimeStart',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'LostTimeEnd',
                            displayName: 'LostTimeEnd',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'adjustment_days',
                            displayName: 'adjustment_days',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'total_days_off',
                            displayName: 'total_days_off',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'injury_description',
                            displayName: 'injury_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'prim_respond_name',
                            displayName: 'prim_respond_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name1',
                            displayName: 'initial_employee_name1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name2',
                            displayName: 'initial_employee_name2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_name3',
                            displayName: 'initial_employee_name3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'impact_description',
                            displayName: 'impact_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept1',
                            displayName: 'initial_employee_dept1',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept2',
                            displayName: 'initial_employee_dept2',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'initial_employee_dept3',
                            displayName: 'initial_employee_dept3',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'InvStatusId',
                            displayName: 'InvStatusId',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'RiskOfRecurrenceId',
                            displayName: 'RiskOfRecurrenceId',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'IncidentSeverityId',
                            displayName: 'IncidentSeverityId',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;

                    ///Maintenance
                case 115:
                case 215:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'maintenance_id',
                            displayName: 'maintenance_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_type_name',
                            displayName: 'maintenance_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_reason_name',
                            displayName: 'maintenance_reason_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_number',
                            displayName: 'maintenance_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_date',
                            displayName: 'maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_hour',
                            displayName: 'maintenance_hour',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_minute',
                            displayName: 'maintenance_minute',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_id',
                            displayName: 'reporter_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_emp_id',
                            displayName: 'rep_emp_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_position',
                            displayName: 'rep_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_crew',
                            displayName: 'rep_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_company',
                            displayName: 'rep_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_alternate_phone',
                            displayName: 'rep_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_supervisor',
                            displayName: 'rep_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location1_name',
                            displayName: 'location1_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location2_name',
                            displayName: 'location2_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location3_name',
                            displayName: 'location3_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location4_name',
                            displayName: 'location4_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Facility_location_last_maintenance',
                            displayName: 'Facility_location_last_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_maintenance_date',
                            displayName: 'last_maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_description',
                            displayName: 'maintenance_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'unusual_findings_resulting_from_maintenance',
                            displayName: 'unusual_findings_resulting_from_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'are_additional_followup_actions_required',
                            displayName: 'are_additional_followup_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'summary_of_recommended_followup_actions',
                            displayName: 'summary_of_recommended_followup_actions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'attachment_name',
                            displayName: 'attachment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_status_name',
                            displayName: 'followup_action_status_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_priority_name',
                            displayName: 'followup_action_priority_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor_notify',
                            displayName: 'supervisor_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_comments',
                            displayName: 'followup_action_comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'crtificate_name',
                            displayName: 'crtificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_by',
                            displayName: 'creator_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_by',
                            displayName: 'modifier_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];
                    break;

                case 415:
                case 515:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'maintenance_id',
                            displayName: 'maintenance_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_type_name',
                            displayName: 'maintenance_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_reason_name',
                            displayName: 'maintenance_reason_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_number',
                            displayName: 'maintenance_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_date',
                            displayName: 'maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_name',
                            displayName: 'reporter_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'country',
                            displayName: 'country',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'province',
                            displayName: 'province',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'community',
                            displayName: 'community',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Facility_location_last_maintenance',
                            displayName: 'Facility_location_last_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_maintenance_date',
                            displayName: 'last_maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_description',
                            displayName: 'maintenance_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'unusual_findings_resulting_from_maintenance',
                            displayName: 'unusual_findings_resulting_from_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'are_additional_followup_actions_required',
                            displayName: 'are_additional_followup_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'summary_of_recommended_followup_actions',
                            displayName: 'summary_of_recommended_followup_actions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_status_name',
                            displayName: 'followup_action_status_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_priority_name',
                            displayName: 'followup_action_priority_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor',
                            displayName: 'supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor_notify',
                            displayName: 'supervisor_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_comments',
                            displayName: 'followup_action_comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_by',
                            displayName: 'creator_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'sent_date',
                            displayName: 'sent_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_by',
                            displayName: 'modifier_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];
                    break;


                case 1015:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'maintenance_id',
                            displayName: 'maintenance_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_type_name',
                            displayName: 'maintenance_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_reason_name',
                            displayName: 'maintenance_reason_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_number',
                            displayName: 'maintenance_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_date',
                            displayName: 'maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_id',
                            displayName: 'reporter_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location1_name',
                            displayName: 'location1_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location2_name',
                            displayName: 'location2_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location3_name',
                            displayName: 'location3_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location4_name',
                            displayName: 'location4_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Facility_location_last_maintenance',
                            displayName: 'Facility_location_last_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_maintenance_date',
                            displayName: 'last_maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_description',
                            displayName: 'maintenance_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'unusual_findings_resulting_from_maintenance',
                            displayName: 'unusual_findings_resulting_from_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'are_additional_followup_actions_required',
                            displayName: 'are_additional_followup_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'summary_of_recommended_followup_actions',
                            displayName: 'summary_of_recommended_followup_actions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'crtificate_name',
                            displayName: 'crtificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_by',
                            displayName: 'creator_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modifier_by',
                            displayName: 'modifier_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];
                    break;


                case 1115:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'maintenance_id',
                            displayName: 'maintenance_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_type_name',
                            displayName: 'maintenance_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_reason_name',
                            displayName: 'maintenance_reason_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_number',
                            displayName: 'maintenance_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_date',
                            displayName: 'maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'reporter_id',
                            displayName: 'reporter_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_name',
                            displayName: 'rep_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_email',
                            displayName: 'rep_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'rep_primary_phone',
                            displayName: 'rep_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_type',
                            displayName: 'third_party_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'jop_number',
                            displayName: 'jop_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'contact_name',
                            displayName: 'contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location1_name',
                            displayName: 'location1_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location2_name',
                            displayName: 'location2_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location3_name',
                            displayName: 'location3_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'location4_name',
                            displayName: 'location4_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'other_location',
                            displayName: 'other_location',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'crew_involved',
                            displayName: 'crew_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'operation_type_name',
                            displayName: 'operation_type_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'Facility_location_last_maintenance',
                            displayName: 'Facility_location_last_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_maintenance_date',
                            displayName: 'last_maintenance_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'maintenance_description',
                            displayName: 'maintenance_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'unusual_findings_resulting_from_maintenance',
                            displayName: 'unusual_findings_resulting_from_maintenance',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'are_additional_followup_actions_required',
                            displayName: 'are_additional_followup_actions_required',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'summary_of_recommended_followup_actions',
                            displayName: 'summary_of_recommended_followup_actions',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'equipment_name',
                            displayName: 'equipment_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_by',
                            displayName: 'creator_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'editing_by',
                            displayName: 'editing_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                    ];

                    break;

                    // training views
                case 116:
                case 216:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'training_id',
                            displayName: 'training_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_type',
                            displayName: 'training_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_number',
                            displayName: 'training_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_reason',
                            displayName: 'training_reason',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'traininy_completed_by',
                            displayName: 'traininy_completed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_by',
                            displayName: 'assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_emp_id',
                            displayName: 'assigned_to_emp_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_position',
                            displayName: 'assigned_to_position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_crew',
                            displayName: 'assigned_to_crew',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_email',
                            displayName: 'assigned_to_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_company',
                            displayName: 'assigned_to_company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_primary_phone',
                            displayName: 'assigned_to_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_alternate_phone',
                            displayName: 'assigned_to_alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_supervisor',
                            displayName: 'assigned_to_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_aprovided_by',
                            displayName: 'training_aprovided_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'staff_member',
                            displayName: 'staff_member',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'address',
                            displayName: 'address',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'website',
                            displayName: 'website',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'provider_contact_name',
                            displayName: 'provider_contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provider_phone',
                            displayName: 'provider_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'evidence_of_completion',
                            displayName: 'evidence_of_completion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_duration',
                            displayName: 'training_duration',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'completed_date',
                            displayName: 'completed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'level_achieved',
                            displayName: 'level_achieved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'course_mark',
                            displayName: 'course_mark',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'expiry_date',
                            displayName: 'expiry_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_quality',
                            displayName: 'training_quality',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_trainee_observed_post',
                            displayName: 'is_trainee_observed_post',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_date',
                            displayName: 'observed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_by',
                            displayName: 'observed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observations',
                            displayName: 'observations',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_status_name',
                            displayName: 'followup_action_status_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_priority_name',
                            displayName: 'followup_action_priority_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_name',
                            displayName: 'assigned_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_supervisor',
                            displayName: 'followup_action_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor_notify',
                            displayName: 'supervisor_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_comment',
                            displayName: 'followup_action_comment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'crtificate_name',
                            displayName: 'crtificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'modified_by',
                            displayName: 'modified_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'created_by',
                            displayName: 'created_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'edititng_by',
                            displayName: 'edititng_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];

                    break;

                case 316:
                case 416:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'training_id',
                            displayName: 'training_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_type',
                            displayName: 'training_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_number',
                            displayName: 'training_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_reason',
                            displayName: 'training_reason',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'traininy_completed_by_date',
                            displayName: 'traininy_completed_by_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_by',
                            displayName: 'assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_email',
                            displayName: 'assigned_to_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_primary_phone',
                            displayName: 'assigned_to_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_assigned_by',
                            displayName: 'training_assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'staff_member',
                            displayName: 'staff_member',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'third_party_name',
                            displayName: 'third_party_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'address',
                            displayName: 'address',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'website',
                            displayName: 'website',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'provider_contact_name',
                            displayName: 'provider_contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provider_phone',
                            displayName: 'provider_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'evidence_of_completion',
                            displayName: 'evidence_of_completion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_duration',
                            displayName: 'training_duration',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'completed_date',
                            displayName: 'completed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'level_achieved',
                            displayName: 'level_achieved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'course_mark',
                            displayName: 'course_mark',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'expiry_date',
                            displayName: 'expiry_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_quality',
                            displayName: 'training_quality',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_trainee_observed_post',
                            displayName: 'is_trainee_observed_post',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_date',
                            displayName: 'observed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_by',
                            displayName: 'observed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observations',
                            displayName: 'observations',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_status_name',
                            displayName: 'followup_action_status_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_priority_name',
                            displayName: 'followup_action_priority_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'notified_names',
                            displayName: 'notified_names',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_name',
                            displayName: 'assigned_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_supervisor',
                            displayName: 'followup_action_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'supervisor_notify',
                            displayName: 'supervisor_notify',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'start_date',
                            displayName: 'start_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'target_end_date',
                            displayName: 'target_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_end_date',
                            displayName: 'actual_end_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'estimated_cost',
                            displayName: 'estimated_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'actual_cost',
                            displayName: 'actual_cost',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'task_description',
                            displayName: 'task_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'out_come_follow_up',
                            displayName: 'out_come_follow_up',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'desired_results',
                            displayName: 'desired_results',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'followup_action_comment',
                            displayName: 'followup_action_comment',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'send_date',
                            displayName: 'send_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'created_by',
                            displayName: 'created_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'creator_id',
                            displayName: 'creator_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'edititng_by',
                            displayName: 'edititng_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];
                    break;
                case 516:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'training_id',
                            displayName: 'training_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_type',
                            displayName: 'training_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_number',
                            displayName: 'training_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_reason',
                            displayName: 'training_reason',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'traininy_completed_by',
                            displayName: 'traininy_completed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_by',
                            displayName: 'assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_email',
                            displayName: 'assigned_to_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_primary_phone',
                            displayName: 'assigned_to_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_assigned_by',
                            displayName: 'training_assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provided_by',
                            displayName: 'provided_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'address',
                            displayName: 'address',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'website',
                            displayName: 'website',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'provider_contact_name',
                            displayName: 'provider_contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provider_phone',
                            displayName: 'provider_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'evidence_of_completion',
                            displayName: 'evidence_of_completion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_duration',
                            displayName: 'training_duration',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'completed_date',
                            displayName: 'completed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'level_achieved',
                            displayName: 'level_achieved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'course_mark',
                            displayName: 'course_mark',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'expiry_date',
                            displayName: 'expiry_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_quality',
                            displayName: 'training_quality',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_trainee_observed_post',
                            displayName: 'is_trainee_observed_post',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_date',
                            displayName: 'observed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_by',
                            displayName: 'observed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observations',
                            displayName: 'observations',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_name',
                            displayName: 'people_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_name',
                            displayName: 'people_involved_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'company',
                            displayName: 'company',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'position',
                            displayName: 'position',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'email', displayName: 'email', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'primary_phone',
                            displayName: 'primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'alternate_phone',
                            displayName: 'alternate_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_in_current_postion',
                            displayName: 'exp_in_current_postion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'exp_over_all',
                            displayName: 'exp_over_all',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'age', displayName: 'age', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'how_he_involved',
                            displayName: 'how_he_involved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'role_description',
                            displayName: 'role_description',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'last_update_date',
                            displayName: 'last_update_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'people_involved_supervisor',
                            displayName: 'people_involved_supervisor',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'crew', displayName: 'crew', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'crtificate_name',
                            displayName: 'crtificate_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'acting_name',
                            displayName: 'acting_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'created_by',
                            displayName: 'created_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'edititng_by',
                            displayName: 'edititng_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];

                    break;
                case 616:
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'training_id',
                            displayName: 'training_id',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_type',
                            displayName: 'training_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_number',
                            displayName: 'training_number',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'org_id', displayName: 'org_id', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'organization_name',
                            displayName: 'organization_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_reason',
                            displayName: 'training_reason',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'traininy_completed_by',
                            displayName: 'traininy_completed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_by',
                            displayName: 'assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_name',
                            displayName: 'assigned_to_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_email',
                            displayName: 'assigned_to_email',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'assigned_to_primary_phone',
                            displayName: 'assigned_to_primary_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_assigned_by',
                            displayName: 'training_assigned_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provided_type',
                            displayName: 'provided_type',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provided_by',
                            displayName: 'provided_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'address',
                            displayName: 'address',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'website',
                            displayName: 'website',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'state', displayName: 'state', cellTooltip: true, headerTooltip: true, visible: true},
                        {name: 'city', displayName: 'city', cellTooltip: true, headerTooltip: true, visible: true},
                        {
                            name: 'provider_contact_name',
                            displayName: 'provider_contact_name',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'provider_phone',
                            displayName: 'provider_phone',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'evidence_of_completion',
                            displayName: 'evidence_of_completion',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_duration',
                            displayName: 'training_duration',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'completed_date',
                            displayName: 'completed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'level_achieved',
                            displayName: 'level_achieved',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'expiry_date',
                            displayName: 'expiry_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'training_quality',
                            displayName: 'training_quality',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'comments',
                            displayName: 'comments',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_trainee_observed_post',
                            displayName: 'is_trainee_observed_post',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_date',
                            displayName: 'observed_date',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observed_by',
                            displayName: 'observed_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'observations',
                            displayName: 'observations',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'created_by',
                            displayName: 'created_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'edititng_by',
                            displayName: 'edititng_by',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {
                            name: 'is_deleted',
                            displayName: 'is_deleted',
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: true
                        },
                        {name: 'hide', displayName: 'hide', cellTooltip: true, headerTooltip: true, visible: true},
                    ];
                    break;
            }
        }

        $scope.reload = function () {
            $scope.filter();
                //            $state.reload();
        };
        $scope.selectItem = function (item) {
            // $(".dataTable tr").removeClass("selectedItem");
            $scope.db.selectedItem = item;
            item.classactive = 'selectedItem';
        };
        $scope.openReport = function () {
            if ($scope.db.hasOwnProperty('selectedItem') && $scope.db.selectedItem) {
                if ($scope.db.selectArrays['Report Type'] === 1){
                    coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'hazard',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('edithazardreport', {reportNumber: $scope.db.selectedItem.number, draftId: $scope.db.selectedItem.hazard_id});
                    
                }else if ($scope.db.selectArrays['Report Type'] === 2){
                    coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'incident',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.incident_number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('editincidentreport', {reportNumber: $scope.db.selectedItem.incident_number, draftId: $scope.db.selectedItem.incident_id});
                }else if ($scope.db.selectArrays['Report Type'] === 3){
                     coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'inspection',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.inspection_number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('editinspectionreport', {reportNumber: $scope.db.selectedItem.number});
                }else if ($scope.db.selectArrays['Report Type'] === 4){
                     coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'safetymeeting',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.safetymeeting_number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('editsafetymeetingreport', {reportNumber: $scope.db.selectedItem.number});
                }else if ($scope.db.selectArrays['Report Type'] === 5){
                     coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'maintenance',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.maintenance_number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('editmaintenancereport', {reportNumber: $scope.db.selectedItem.maintenance_number});

                }else if ($scope.db.selectArrays['Report Type'] === 6){
                     coreReportService.deleteTempFiles({}).then(function (response) {var res = response.data; if (res) {console.log(res);}});
                    coreReportService.copyReportFilesToTemp({type: 'training',org_id: $scope.db.org_id,report_number: $scope.db.selectedItem.training_number,version_no:$scope.db.selectedItem.version_number}).then(function(res){
                    },function(err){
                        console.error(err);
                    });
                    $state.go('edittrainingreport', {reportNumber: $scope.db.selectedItem.training_number});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: 'Please choose report first'});
            }
        };

        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        };

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        };

        $scope.clearSearch = function () {
            $scope.gridApi.selection.clearSelectedRows(); // clear selected rows
            var columns = $scope.gridApi.grid.columns;
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].enableFiltering) {
                    columns[i].filters[0].term = '';
                }
            }
        };

        function getDefaultFields(field_name) {
            var x = false;
            if (field_name == "editing_by" || field_name == "incident_number" ||
                    field_name == "event_type_id" || field_name == "date" || field_name == "location"
                    || field_name == "risk_level" || field_name == "inv_status_id")
                x = true;
            return x;
        };


        var fields_data = {
            org_id: $scope.user.org_id,
            language_id: $scope.user.language_id,
           // type: $scope.reportType
        };

        $scope.chooseView = function () {
            $scope.db.selectedView = 0;
            angular.forEach($scope.db.select, function (select) {
            //                $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                $scope.db.selectedView += $scope.db.selectArrays[select.name];
               // console.log($scope.db.selectedView);
            });
            console.log($scope.db.selectedView);
            if ($scope.db.selectArrays['Type'] == 20){
                var selectedViewSrt = $scope.db.selectedView.toString();
                var selectedView = parseInt(selectedViewSrt.substring(0, 2));
                selectedView += $scope.db.selectedObj.defaultid;
                $scope.db.selectedView = selectedView;
            }
            selectFilter($scope.db.selectedView);
            $scope.allColumns = [];
            $scope.allCustomizedColumns = [];
            $scope.allPrimaryColumns = [];
            customizeFlag = 0;

            $scope.sXmlData = '<org_id>' +$scope.db.org_id+ '</org_id>\n';
            //  $scope.sXmlData += '<Export>false</Export>\n';
            if ($scope.db.selectedView == 611 || $scope.db.selectedView == 811
                || $scope.db.selectedView == 212 || $scope.db.selectedView == 412
                || $scope.db.selectedView == 513 || $scope.db.selectedView == 613
                || $scope.db.selectedView == 214 || $scope.db.selectedView == 414) {
                $scope.sXmlData += '<creator_id>' +$scope.user.employee_id+ '</creator_id>\n';
                $scope.sXmlData += '<mine>true</mine>\n';
            }
            $scope.sortedHeaderSelected = 'number';
            $scope.sortedTypeSelected = 'asc';
           /* $scope.pageNumber = 1;
            $scope.pageSize = 10;*/
           // $scope.pageOffset = ($scope.pageNumber * $scope.pageSize) - $scope.pageSize;
            if ($scope.db.selectedView === 112 || $scope.db.selectedView === 212
            || $scope.db.selectedView === 312 || $scope.db.selectedView === 412
            || $scope.db.selectedView === 122 || $scope.db.selectedView === 222
            || $scope.db.selectedView === 322 || $scope.db.selectedView === 422) {
                $scope.sortedHeaderSelected = 'incident_number';
            }
            $scope.filter();
            
        };
        $scope.detrminedReportType = function(){

            if ($scope.db.selectArrays["Report Type"] == 1) 
                $scope.reportType = 'hazard';
            if ($scope.db.selectArrays["Report Type"] == 2) 
                $scope.reportType = 'incident';
            if ($scope.db.selectArrays["Report Type"] == 3) 
                $scope.reportType = 'inspection';
            if ($scope.db.selectArrays["Report Type"] == 4) 
                $scope.reportType = 'safetymeeting';
            if ($scope.db.selectArrays["Report Type"] == 5) 
                $scope.reportType = 'maintenance';
            if ($scope.db.selectArrays["Report Type"] == 6) 
                $scope.reportType = 'training';
        }
        $scope.canUpdateSaved = false ;
        $scope.sXmlData = "";
        $scope.dXmlData = "";
        $scope.xmlData = "";
        $scope.allColumns = [];
        $scope.allCustomizedColumns = [];
        $scope.allPrimaryColumns = [];
        var customizeFlag = 0;
        $scope.canSave = false ;
        $scope.filter = function () {
            $scope.tabsArr = [];
            $scope.hideGrid = true;
            $scope.db.search = '';
            console.log($scope.db);
            $scope.detrminedReportType();
            console.log($scope.db.selectedObj);
            fields_data.type = $scope.reportType ;
           // $scope.customizeColumns();
            console.log("$scope.db.currentfields", $scope.db.currentfields);
            console.log($scope.db.selectedObj);
            if ($scope.db.selectArrays['Type'] == 20) {
                $scope.canSave = false;
                $scope.canUpdateSaved = true ;
                var favoritFielda = $scope.db.selectedObj.fields.split(';');
                console.log(favoritFielda); 
                $scope.favoritFieldaName = $scope.db.selectedObj.fields_name.split(';');
                console.log($scope.favoritFieldaName);  

                angular.forEach($scope.favoritFieldaName, function (value, key) {
                    $scope.xmlData += '<' + value + '></' + value + '>\n';
                });            
            }
            else{
                $scope.canUpdateSaved = false ;
                $scope.canSave = true;
            }

            $scope.dXmlData = '<index>' +$scope.sortedHeaderSelected+ '</index>\n';
            $scope.dXmlData += '<sortorder>' +$scope.sortedTypeSelected+ '</sortorder>\n';

           /* $scope.dXmlData += '<page>' +$scope.pageOffset+ '</page>\n';
            $scope.dXmlData += '<limit>' + $scope.pageSize+ '</limit>\n';
*/
            $scope.xmlData = $scope.sXmlData + $scope.dXmlData;

            var data = {
                org_id: $scope.db.org_id,
                creator_id: $scope.user.employee_id,
                search: $scope.db.search,
                start: ($scope.db.currentPage - 1) * $scope.db.limit,
                limit: 2000, // $scope.db.limit,
                selectedView: $scope.db.selectedView,
                db: $scope.db.module,
                xmlData:  $scope.xmlData
            };

            if ($scope.db.selectedView == 211 || $scope.db.selectedView == 111|| $scope.db.selectedView == 611 || $scope.db.selectedView == 811
                || $scope.db.selectedView == 311 || $scope.db.selectedView == 411 || $scope.db.selectedView == 511 || $scope.db.selectedView == 911 
                || $scope.db.selectedView == 1011 || $scope.db.selectedView == 1111 || $scope.db.selectedView == 711
                || $scope.db.selectedView == 1211 || $scope.db.selectedView == 1311 || $scope.db.selectArrays['Type'] == 20 

                || $scope.db.selectedView === 112 || $scope.db.selectedView === 212
                || $scope.db.selectedView === 312 || $scope.db.selectedView === 412

                || $scope.db.selectedView === 113 || $scope.db.selectedView === 213
                || $scope.db.selectedView === 513 || $scope.db.selectedView === 613

                || $scope.db.selectedView === 114 || $scope.db.selectedView === 214
                || $scope.db.selectedView === 314 || $scope.db.selectedView === 414) {
                data.xmlUpdate = "1";
            }
            else
                data.xmlUpdate = "0";

            console.log(data);
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: 'Filter Records .. Please wait'});

            coreService.filterRecords(data).then(function (response) {
                coreService.resetAlert();
                $scope.db.items = response.data.items;
                $scope.db.count = response.data.count;
                    console.log('fields from pre controller',$scope.db.currentfields);

                //for versions
                //|| $scope.db.selectedView ===1512

                if ($scope.db.selectedView === 211 ||  $scope.db.selectedView === 111 || $scope.db.selectedView == 611 || $scope.db.selectedView == 811 
                    || $scope.db.selectedView === 311 || $scope.db.selectedView == 411 || $scope.db.selectedView == 511 || $scope.db.selectedView == 911 || $scope.db.selectedView == 711
                     || $scope.db.selectedView == 1011 || $scope.db.selectedView == 1111 || $scope.db.selectedView == 1211 || $scope.db.selectedView == 1311 || $scope.db.selectArrays['Type'] == 20
                     // incident Views
                     ||$scope.db.selectedView === 112 || $scope.db.selectedView === 212
                     || $scope.db.selectedView === 312 || $scope.db.selectedView === 412
                     //inspection Views
                    || $scope.db.selectedView === 113 || $scope.db.selectedView === 213
                    || $scope.db.selectedView === 513 || $scope.db.selectedView === 613
                    // safetymeeting Views
                    || $scope.db.selectedView === 114 || $scope.db.selectedView === 214
                    || $scope.db.selectedView === 314 || $scope.db.selectedView === 414) {
                    console.log("customizeFlag", customizeFlag);
                    if (customizeFlag) {

                        $scope.gridOptions.columnDefs = $filter('filter')($scope.allColumns, {visible: 1});
                        $scope.gridOptions.columnDefs.sort(compare);
                        console.log($scope.gridOptions.columnDefs);
                        $scope.girdData = response.data.items;
                    console.log($scope.girdData);
                    angular.forEach($scope.girdData, function (value, key) {
                        if (value.locked_id != "") {
                            if (value.locked_id == $scope.user.employee_id ) {
                                value.lockerId = value.locked_id;
                                value.locked_id = "resources/images/blueLock.png";
                            }
                            else{
                                value.lockerId = value.locked_id;
                                value.locked_id = "resources/images/redLock.png";
                            }
                        }
                    });
                    console.log($scope.girdData);
                    $scope.gridOptions.data = $scope.girdData;
                  //  $scope.gridOptions.enableSorting = true ;
                    console.log($scope.gridOptions.data);
                    $scope.gridOptions.totalItems = totalItems;
                    $scope.db.headerFields = $scope.gridOptions.columnDefs ;

                    }
                    else{
                        updateHeadersdynamic(response.data.items, response.data.count);
                       // $scope.gridOptions.totalItems = response.data.count;

                    }
                }
                /*else if($scope.db.selectedView === 112 || $scope.db.selectedView === 212 ){
                    setGridHeaders($scope.db.selectedView);
                        $scope.girdData = response.data.items;

                    $scope.gridOptions.data = $scope.girdData;

       
                    $scope.gridOptions.totalItems = response.data.count;
                }*/
                else{

                    //setGridHeaders($scope.db.selectedView);
                    $scope.gridOptions.columnDefs = [];
                    angular.forEach($scope.db.currentfields, function (value, key) {
                        $scope.gridOptions.columnDefs.push({
                            name: value.name,
                            type: value.type,
                            displayName: value.display,
                            cellTooltip: true,
                            headerTooltip: true,
                            visible: (value.show === 1)
                        });
                    });
                        $scope.girdData = response.data.items;
    
                    $scope.gridOptions.data = $scope.girdData;

       
                    $scope.gridOptions.totalItems = response.data.count;
                }

            /*    $scope.gridOptions.columnDefs = [];
                    angular.forEach($scope.db.currentfields, function (value, key) {
                        if (value.name == "locked_id") {
                                $scope.gridOptions.columnDefs.push({
                                    name: value.name,
                                    field: value.name,
                                    displayName: value.name,
                                    cellTooltip: true,
                                    headerTooltip: true,

                                    cellTemplate: "<img width=\"50px\" ng-src=\"{{grid.getCellValue(row, col)}}\" lazy-src>"
                                    //cellTemplate: "<img width='50px' ng-src='resources/images/abcantrack.jpg' lazy-src>"

                                  //  cellTemplate: '<div style="text-align:center" class="ngCellText ui-grid-cell-contents ng-binding ng-scope"><img src="{{grid.appScope.getTemplate(COL_FIELD)}}" alt="" height="35" width="35"/></br>{{ COL_FIELD }}</div>'
                                });
                            }
                            else{
                                $scope.gridOptions.columnDefs.push({
                                    name: value.name,
                                    field: value.name,
                                    displayName: value.name,
                                    cellTooltip: true,
                                    headerTooltip: true,
                                });
                            }
                    });*/


              //  console.log($scope.gridOptions.columnDefs);
                //create xml for current colum

             //   $scope.girdData = response.data.items;
             /*   console.log($scope.girdData);
                angular.forEach($scope.girdData, function (value, key) {
                    if (value.locked_id != "") {
                        value.locked_id = "http://cdn.flaticon.com/png/256/70689.png";
                    }
                });
                console.log($scope.girdData);*/
              //  $scope.gridOptions.data = $scope.girdData;

       
              //  $scope.gridOptions.totalItems = response.data.count;
                
            }, function (response) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                });
            });
        };
        function getDefaultColumns(field_name) {
            var x = 0;
            var checkIfFieldExist = $filter('filter')($scope.db.currentfields, {name: field_name}, true);

            if (checkIfFieldExist.length !== 0 ){
            
                x = 1;
            }
                
            return x;
        };
        function getFavoritColumns(field_name) {

            //console.log("favoritFieldaName", $scope.favoritFieldaName );
            var x = 0;
            var checkIfFieldExist = $filter('filter')($scope.favoritFieldaName,  field_name, true);
           // console.log("field_name", field_name );
              //  console.log("checkIfFieldExist", checkIfFieldExist );

            if (checkIfFieldExist.length !== 0 ){
              //  console.log("field_name", field_name );
                x = 1;
            }
                
            return x;
        };
        $scope.CustomizationPopUp = function(){
            angular.forEach($scope.allColumns, function (value, key) {
                if (value.tabName != "" ) {
                    var newTab = $filter('filter')($scope.tabsArr, {name: value.tabName});

                    if (newTab.length == 0 ){
                        $scope.tabsArr.push({
                            name: value.tabName,
                            id: value.sub_tab_id
                        });
                    }
                }
            });
/*            $scope.tabsArr.push({
                            name: "Custom Fields",
                            id: null
                        });*/
            angular.forEach($scope.tabsArr, function (tab) {
               // $scope.getSections(tab);// feature work on Sections
                var tabFields = $filter('filter')($scope.allColumns, {tabName: tab.name});
                tab.fields = tabFields ;
            });
            console.log('$scope.tabsArr',$scope.tabsArr);
            customizeFlag = 1;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/tableModule/views/Customization.html',
                controller: 'customizationCtrl',
                scope: $scope
            });
            modalInstance.result.then(function (data) {
            }, function (data) {
                console.log(data);

                if (data) {
                    console.log($scope.allColumns[0].visible);
                    if (data == "backdrop click") 
                        console.log("backdrop click");
                        // $scope.xmlData = '<org_id>' +$scope.db.org_id+ '</org_id>\n';
                    else{
                        if (data.submit) {
                            $scope.sXmlData = data.sXmlData;
                            console.log($scope.sXmlData);
                            $scope.allColumns = data.allColumns;
                            console.log($scope.allColumns);
                            $scope.filter();
                        }
                    }
                }
            });
        }
        
        var updateHeadersdynamic = function(data ,totalItems){
            $scope.allColumns = [];
            $scope.allCustomizedColumns = [];
            $scope.allPrimaryColumns = [];
            $scope.detrminedReportType();
            fields_data.type = $scope.reportType ;
            console.log("selectedFilterArray", selectedFilterArray);
           coreReportService.getDataTablesReportFields(fields_data).then(function(res){
                console.log(res.data);
                angular.forEach(res.data, function (value, key) {
                    var checkIfFieldExist = $filter('filter')(selectedFilterArray, {name: value.field_name});
                    if ($scope.db.selectArrays['Type'] == 10) {

                        if (checkIfFieldExist.length !== 0 ){
                            if (value.field_name == "locked_id") {

                                $scope.allPrimaryColumns.push({
                                    id: value.field_id,
                                    name: value.field_name,
                                    field: value.field_name,
                                    tabName: value.sub_tab_label,
                                    tabId: value.sub_tab_id,
                                    type: (value.field_name == "incident_number")? 'number': 'string',
                                    displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                    cellTooltip: true,
                                    headerTooltip: true,
                                    visible: getDefaultColumns(value.field_name),
                                    minWidth: 150,
                                   // cellTemplate: "<div class=\"ui-grid-cell-contents\" ng-click=\"grid.appScope.cellClicked(row,col)\" title=\"This report is locked by {{row.entity.updated_by_id}}\"><img width=\"20px\" height=\"20px\" ng-src=\"{{grid.getCellValue(row, col)}}\" ></div>",
                                   
                                    //cellTemplate: "<div class=\"ui-grid-cell-contents glyphicon glyphicon-alert" title="TOOLTIP"\" ng-click=\"grid.appScope.cellClicked(row,col)\" title=\"grid.appScope.tooltipFun(row,col)\"><img width=\"20px\" height=\"20px\" ng-src=\"{{grid.getCellValue(row, col)}}\" ></div>",
                                    cellTemplate: "<div class=\"ui-grid-cell-contents\" ng-click=\"grid.appScope.cellClicked(row,col)\" title=\"{{grid.appScope.tooltipFun(row,col)}}\"><img width=\"20px\" height=\"20px\" ng-src=\"{{grid.getCellValue(row, col)}}\" ></div>",
                                    cellTooltip:
                                                function (row, col) {
                                                    return 'This report is locked by  ' + row.entity.editing_by ;
                                                },
                                   // cellClass: 'cellToolTip'  //title=\"This report is locked by  \" {{row.entity.editing_by}}
                                });
                            }
                            else{
                                $scope.allPrimaryColumns.push({
                                    id: value.field_id,
                                    name: value.field_name,
                                   field: value.field_name,
                                   tabName: value.sub_tab_label,
                                    tabId: value.sub_tab_id,
                                    type: (value.field_name == "incident_number")? 'number': 'string',
                                    displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                    cellTooltip: true,
                                    headerTooltip: true,
                                    visible: getDefaultColumns(value.field_name),
                                    minWidth: 150,
                                 //   enableSorting : true
                                   // visible: true
                                });
                            }         
                        }
                    }
                    else if ($scope.db.selectArrays['Type'] == 20){
                       // console.log("TYpe = favorit");
                        if (checkIfFieldExist.length !== 0 ){
                            if (value.field_name == "locked_id") {

                                $scope.allPrimaryColumns.push({
                                    id: value.field_id,
                                    name: value.field_name,
                                    field: value.field_name,
                                    tabName: value.sub_tab_label,
                                    tabId: value.sub_tab_id,
                                    type: (value.field_name == "incident_number")? 'number': 'string',
                                    displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                    cellTooltip: true,
                                    headerTooltip: true,
                                    visible: getFavoritColumns(value.field_name),
                                    minWidth: 150,
                                    //   enableSorting : true,
                                   // cellTemplate: "<i class='fa fa-mobile'></i>"

                                    cellTemplate: "<img width=\"50px\" ng-src=\"{{grid.getCellValue(row, col)}}\" >"
                                    //cellTemplate: "<img width='50px' ng-src='resources/images/abcantrack.jpg' lazy-src>"

                                  //  cellTemplate: '<div style="text-align:center" class="ngCellText ui-grid-cell-contents ng-binding ng-scope"><img src="{{grid.appScope.getTemplate(COL_FIELD)}}" alt="" height="35" width="35"/></br>{{ COL_FIELD }}</div>'
                                });
                            }
                            else{
                                $scope.allPrimaryColumns.push({
                                    id: value.field_id,
                                    name: value.field_name,
                                   field: value.field_name,
                                   tabName: value.sub_tab_label,
                                    tabId: value.sub_tab_id,
                                    type: (value.field_name == "incident_number")? 'number': 'string',
                                    displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                    cellTooltip: true,
                                    headerTooltip: true,
                                    visible: getFavoritColumns(value.field_name),
                                    minWidth: 150,
                                 //   enableSorting : true
                                   // visible: true
                                });
                            }
                        }
                    }       
                });
                console.log('$scope.allPrimaryColumns',$scope.allPrimaryColumns);

                coreReportService.getDataTablesReportCustomFields(fields_data).then(function(response){
                    console.log(response.data);
                    angular.forEach(response.data, function (value, key) {
                        if ($scope.db.selectArrays['Type'] == 10) {    
                            $scope.allCustomizedColumns.push({
                                id: value.field_id,
                                name: value.field_name,
                                field: value.field_name,
                                tabName: value.sub_tab_label,
                                tabId: value.sub_tab_id,
                                type: (value.field_name == "incident_number")? 'number': 'string',
                                displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: getDefaultColumns(value.field_name),
                                minWidth: 150,
                             //   enableSorting : true
                               // visible: true
                            }); 
                        }
                        else if ($scope.db.selectArrays['Type'] == 20){
                           // console.log("TYpe = favorit");
                            $scope.allCustomizedColumns.push({
                                id: value.field_id,
                                name: value.field_name,
                               field: value.field_name,
                               tabName: value.sub_tab_label,
                                tabId: value.sub_tab_id,
                                type: (value.field_name == "incident_number")? 'number': 'string',
                                displayName: value.sub_tab_label !== ""? (value.FieldLabel + ' (' + value.sub_tab_label + ')'): value.FieldLabel,
                                cellTooltip: true,
                                headerTooltip: true,
                                visible: getFavoritColumns(value.field_name),
                                minWidth: 150,
                             //   enableSorting : true
                               // visible: true
                            });
                        }       
                    });
                    console.log('$scope.allCustomizedColumns',$scope.allCustomizedColumns);

                    $scope.allColumns = $scope.allPrimaryColumns.concat($scope.allCustomizedColumns);
                   // $scope.allColumns.sort(compare);
                    console.log('$scope.allColumns',$scope.allColumns);
                    $scope.gridOptions.columnDefs = [];
                    $scope.gridOptions.columnDefs = $filter('filter')($scope.allColumns, {visible: 1});
                    $scope.gridOptions.columnDefs.sort(compare);
                    console.log($scope.gridOptions.columnDefs);

                    $scope.girdData = data;
                    console.log($scope.girdData);
                    angular.forEach($scope.girdData, function (value, key) {
                        if (value.locked_id != "") {
                            if (value.locked_id == $scope.user.employee_id ) {
                                value.lockerId = value.locked_id;
                                value.locked_id = "resources/images/blueLock.png";
                            }
                            else{
                                value.lockerId = value.locked_id;
                                value.locked_id = "resources/images/redLock.png";
                            }
                        }
                    });
                    console.log($scope.girdData);
                    $scope.gridOptions.data = $scope.girdData;
                  //  $scope.gridOptions.enableSorting = true ;
                    console.log($scope.gridOptions.data);
                    $scope.gridOptions.totalItems = totalItems;
                    $scope.db.headerFields = $scope.gridOptions.columnDefs ;

                },function(err){
                    console.error(err);
                }); 

            },function(err){
                console.error(err);
            }); 
            
            
       
          
        }

        function compare(a, b) {
            // Use toUpperCase() to ignore character casing
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            let comparison = 0;
            if (nameA > nameB) {
            comparison = 1;
            } else if (nameA < nameB) {
            comparison = -1;
            }
            return comparison;
            }
        $scope.getSections = function (tab){
            console.log(tab.id);
            viewDataTablesService.getFisledsByTab({tabId: tab.id, org_id: $scope.db.org_id, product_code: $scope.reportType}).then(function (response) {
                console.log(response);
                tab.sections = response.data ;
                console.log(tab);

                console.log($scope.tabsArr);
            }, function (err) {
                console.error(err);
            });
        };

        $scope.tooltipFun = function (row, col) {
            if (row.entity.updated_by_id != "" ) {
                return 'This report is locked by  ' + row.entity.updated_by_id ;
            }    
        };

        $scope.cellClicked = function (row, col){
            
            if (row.entity.locked_id == "resources/images/blueLock.png") {
                coreService.resetAlert();
                var post = {language_id: $scope.user.language_id, alert_message_code: 'lockedisloggedon'};
                coreService.getAlertMessageByCode(post).then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        $scope.msgTitle = response.data['alert_name'];
                        $scope.msgBody = response.data['alert_message_description'];
                        console.log($scope.msgTitle);

                        $scope.$uibModalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'app/modules/adminToolsModule/views/help.html',
                            controller: 'trainningProviderCtrl',
                            scope: $scope
                        });
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
            }
            else if (row.entity.locked_id == "resources/images/redLock.png") {

                $scope.email = {
                    from : "account.services@abcanada.com"
                }
                //get email To
                viewDataTablesService.getUserEmail({employee_id : row.entity.lockerId}).then(function (response) {
                    
                    $scope.email.to = response.data[0].email;
                    console.log($scope.email.To);
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/tableModule/views/sendEmail.html',
                    controller: 'TableController',
                    scope: $scope
                });
            }
        }


        $scope.sendEmail = function () {
            
            angular.element('.modal').addClass('hide');
                  angular.element('.modal-backdrop').addClass('hide');
            viewDataTablesService.sendLockedEmail($scope.email).then(function (response) {
                    console.log(response);
                    coreService.resetAlert();
                    coreService.setAlert({type: 'success', message: "E-mail sent"});
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
        };

        var filterOptionalFields = {
            allHazard : [
                {
                    name: 'locked_id'
                },{
                    name: 'hour'
                },{
                    name: 'min'
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'event_type_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'creator_name'
                },{
                    name: 'version_number'
                },{
                    name: 'Cause_notes'
                },{
                    name: 'notes'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'frequency_of_worker_exposure'
                },{
                    name: 'severity_of_potential_consequences'
                },{
                    name: 'probability_of_hazard'
                },{
                    name: 'risk_level'
                },{
                    name: 'contractor_id'
                },{
                    name: 'contractor_jop_number'
                },{
                    name: 'contractor_contact_name'
                },{
                    name: 'customer_id'
                },{
                    name: 'customer_job_number'
                },{
                    name: 'customer_contact_name'
                },{
                    name: 'equipment_id'
                },{
                    name: 'equipment_category_name'
                },{
                    name: 'equipment_type'
                },{
                    name: 'equipment_number'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'corrective_action_priority_id'
                },{
                    name: 'corrective_action_status_id'
                },{
                    name: 'assigned_to_id'
                },{
                    name: 'supervisor_notify'
                },{
                    name: 'notified_id'
                },{
                    name: 'start_date'
                },{
                    name: 'target_end_date'
                },{
                    name: 'actual_end_date'
                },{
                    name: 'estimated_cost'
                },{
                    name: 'actual_cost'
                },{
                    name: 'task_description'
                },{
                    name: 'out_come_follow_up'
                },{
                    name: 'desired_results'
                },{
                    name: 'comments'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'version_date'
                },{
                    name: 'updated_by_id'
                },{
                    name: 'notified_id'
                },{
                    name: 'risk_level'
                },{
                    name: 'risk_level_sup_type_id'
                },{
                    name: 'risk_level_sup_impact_id'
                },{
                    name: 'related_hazard_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department'
                },{
                    name: 'department_responsible_id'
                },{
                    name: 'hazard_type'
                },{
                    name: 'hazard_sup_type'
                },{
                    name: 'cause_type'
                },{
                    name: 'cause_sup_type'
                },{
                    name:'corrective_action_result_id'
                },{
                    name: 'sup_type'
                }
            ],
            allHazardCorrectiveActions: [
                {
                    name: 'corrective_action_id'
                },{
                    name: 'number'
                },{
                    name: 'date'
                },{
                    name: 'target_end_date'
                },{
                    name: 'corrective_action_status_id'
                },{
                    name: 'corrective_action_priority_id'
                },{
                    name: 'task_description'
                },{
                    name: 'assigned_to_id'
                },{
                    name: 'notified_id'
                },{
                    name: 'supervisor_notify'
                },{
                    name: 'start_date'
                },{
                    name: 'actual_end_date'
                },{
                    name: 'comments'
                },{
                    name: 'estimated_cost'
                },{
                    name: 'actual_cost'
                },{
                    name: 'out_come_follow_up'
                },{
                    name: 'desired_results'
                },{
                    name: 'description'
                },{
                    name: 'event_type_id'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'status'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'risk_level'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'risk_level'
                },{
                    name: 'related_hazard_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                },{
                    name:'corrective_action_result_id'
                }
            ],
            supportingDocuments: [
                {
                    name: 'number'
                },{
                    name: 'date'
                },{
                    name: 'attachment_name'
                },{
                    name: 'attachment_size'
                },{
                    name: 'attachment_type'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'event_type_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'attachment_date'
                }
            ],
            peopleInvolved: [
                {
                    name: 'number'
                },{
                    name: 'date'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'event_type_id'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'status'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'risk_level'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'risk_level'
                },{
                    name: 'risk_level_sup_type_id'
                },{
                    name: 'risk_level_sup_impact_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department'
                },{
                    name: 'department_responsible_id'
                },{
                    name: 'hazard_type'
                },{
                    name: 'hazard_sup_type'
                },{
                    name: 'cause_type'
                },{
                    name: 'cause_sup_type'
                }
            ],
            impacts: [
                {
                    name: 'number'
                },{
                    name: 'date'
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_alternate_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'creator_name'
                },{
                    name: 'version_number'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'frequency_of_worker_exposure'
                },{
                    name: 'severity_of_potential_consequences'
                },{
                    name: 'probability_of_hazard'
                },{
                    name: 'risk_level'
                },{
                    name: 'contractor_id'
                },{
                    name: 'contractor_jop_number'
                },{
                    name: 'contractor_contact_name'
                },{
                    name: 'customer_id'
                },{
                    name: 'customer_job_number'
                },{
                    name: 'customer_contact_name'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'event_type_id'
                },{
                    name: 'version_date'
                },{
                    name: '"modified_by"'
                },{
                    name: 'risk_level_sup_type_id'
                },{
                    name: 'risk_level_sup_impact_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],
            riskControl: [
                {
                    name: 'number'
                },{
                    name: 'date'
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_alternate_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'frequency_of_worker_exposure'
                },{
                    name: 'severity_of_potential_consequences'
                },{
                    name: 'probability_of_hazard'
                },{
                    name: 'risk_level'
                },{
                    name: 'contractor_id'
                },{
                    name: 'contractor_jop_number'
                },{
                    name: 'contractor_contact_name'
                },{
                    name: 'customer_id'
                },{
                    name: 'customer_job_number'
                },{
                    name: 'customer_contact_name'
                },{
                    name: 'equipment_id'
                },{
                    name: 'equipment_category_name'
                },{
                    name: 'equipment_type'
                },{
                    name: 'equipment_number'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'corrective_action_status_id'
                },{
                    name: 'corrective_action_priority_id'
                },{
                    name: 'assigned_to_id'
                },{
                    name: 'supervisor_notify'
                },{
                    name: 'modified_id'
                },{
                    name: 'target_end_date'
                },{
                    name: 'task_description'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'risk_level'
                },{
                    name: 'risk_level_sup_type_id'
                },{
                    name: 'risk_level_sup_impact_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],
            thirdParty: [
                {
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'third_party_name',
                },{
                    name: 'third_party_type',
                },{
                    name: 'third_party_jop_number',
                },{
                    name: 'how_he_involved',
                },{
                    name: 'role_description',
                },{
                    name: 'third_party_representative_name ',
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_alternate_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'version_number'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'risk_level'
                },{
                    name: 'equipment_id'
                },{
                    name: 'equipment_category_name'
                },{
                    name: 'equipment_type'
                },{
                    name: 'equipment_number'
                },{
                    name: 'third_party_type'
                },{
                    name: 'third_party_name'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],
            equipmentInvolved: [
                {
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_alternate_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: "creator_name"
                },{
                    name: 'version_number'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'equipment_id'
                },{
                    name: 'equipment_category_name'
                },{
                    name: 'equipment_type'
                },{
                    name: 'equipment_number'
                },{
                    name: 'equipment_name'
                },{
                    name: 'frequency_of_worker_exposure'
                },{
                    name: 'severity_of_potential_consequences'
                },{
                    name: 'probability_of_hazard'
                },{
                    name: 'risk_level'
                },{
                    name: 'contractor_id'
                },{
                    name: 'contractor_jop_number'
                },{
                    name: 'contractor_contact_name'
                },{
                    name: 'customer_id'
                },{
                    name: 'customer_job_number'
                },{
                    name: 'customer_contact_name'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],
            classification : [
                {
                    name: 'date'
                },{
                    name: 'notes'
                },{
                    name: 'Cause_notes'
                },{
                    name: 'identified_by'
                },{
                    name: 'rep_name'
                },{
                    name: 'rep_id'
                },{
                    name: 'rep_position'
                },{
                    name: 'rep_crew'
                },{
                    name: 'rep_email'
                },{
                    name: 'rep_company'
                },{
                    name: 'rep_primary_phone'
                },{
                    name: 'rep_alternate_phone'
                },{
                    name: 'rep_supervisor'
                },{
                    name: 'location1_id'
                },{
                    name: 'location2_id'
                },{
                    name: 'location3_id'
                },{
                    name: 'location4_id'
                },{
                    name: 'event_type_id'
                },{
                    name: 'other_location'
                },{
                    name: 'crew_involved'
                },{
                    name: 'operation_type_id'
                },{
                    name: 'description'
                },{
                    name: 'suspected_cause'
                },{
                    name: 'initial_action_taken'
                },{
                    name: 'are_additional_corrective_actions_required'
                },{
                    name: 'recommended_corrective_actions_summary'
                },{
                    name: 'creator_name'
                },{
                    name: 'version_number'
                },{
                    name: 'potential_impacts_description'
                },{
                    name: 'should_work_stopped'
                },{
                    name: 'frequency_of_worker_exposure'
                },{
                    name: 'severity_of_potential_consequences'
                },{
                    name: 'probability_of_hazard'
                },{
                    name: 'risk_level'
                },{
                    name: 'contractor_id'
                },{
                    name: 'contractor_jop_number'
                },{
                    name: 'contractor_contact_name'
                },{
                    name: 'customer_id'
                },{
                    name: 'customer_job_number'
                },{
                    name: 'customer_contact_name'
                },{
                    name: 'potential_impact_of_hazard'
                },{
                    name: 'people_involved_name'
                },{
                    name: 'email'
                },{
                    name: 'primary_phone'
                },{
                    name: 'alternate_phone'
                },{
                    name: 'position'
                },{
                    name: 'company'
                },{
                    name: 'people_involved_supervisor'
                },{
                    name: 'crew'
                },{
                    name: 'exp_in_current_postion'
                },{
                    name: 'exp_over_all'
                },{
                    name: 'age'
                },{
                    name: 'certificate_id'
                },{
                    name: 'acting_id'
                },{
                    name: 'how_he_involved'
                },{
                    name: 'role_description'
                },{
                    name: 'risk_control_id'
                },{
                    name: 'classification_type'
                },{
                    name: 'type'
                },{
                    name: 'sub_type'
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],
            deletion :  [
                {
                    name: 'number',
                },{
                    name: 'event_type_id',
                },{
                    name: 'deletion_date',
                },{
                    name: 'deletion_reason',
                },{
                    name: 'deleted_by',
                },{
                    name: 'position',
                },{
                    name: 'rep_department'
                },{
                    name: 'department_responsible_id'
                }
            ],// Incident
            allIncident :  [
                {
                    name: 'locked_id',
                },{
                    name: 'incident_number',
                },{
                    name: 'date',
                },{
                    name: 'hour',
                },{
                    name: 'min',
                },{
                    name: 'is_emergency_response',
                },{
                    name: 'rep_name',
                },{
                    name: 'rep_email',
                },{
                    name: 'rep_position',
                },{
                    name: 'rep_company',
                },{
                    name: 'rep_primary_phone',
                },{
                    name: 'rep_alternate_phone',
                },{
                    name: 'other_location',
                },{
                    name: 'event_sequence',
                },{
                    name: 'env_condition_note',
                },{
                    name: 'incident_description',
                },{
                    name: 'energy_form_note',
                },{
                    name: 'sub_standard_action_note',
                },{
                    name: 'sub_standard_condition_note',
                },{
                    name: 'investigation_follow_up_note',
                },{
                    name: 'investigation_date',
                },{
                    name: 'investigator_name1',
                },{
                    name: 'investigator_name2',
                },{
                    name: 'investigator_name3',
                },{
                    name: 'investigation_summary',
                },{
                    name: 'investigation_follow_up_note',
                },{
                    name: 'investigation_response_cost',
                },{
                    name: 'investigation_repair_cost',
                },{
                    name: 'investigation_insurance_cost',
                },{
                    name: 'investigation_wcb_cost',
                },{
                    name: 'investigation_other_cost',
                },{
                    name: 'investigation_total_cost',
                },{
                    name: 'investigation_source_traffic_details',
                },{
                    name: 'investigation_root_cause_note',
                },{
                    name: 'Sign_off_investigator_name',
                },{
                    name: 'investigation_sign_off_date',
                },{
                    name: 'version_number',
                },{
                    name: 'under_lying_cause_note',
                },{
                    name: 'event_type_id',
                },{
                    name: 'operation_type_id',
                },{
                    name: 'location4_id',
                },{
                    name: 'location3_id',
                },{
                    name: 'location2_id',
                },{
                    name: 'location1_id',
                },{
                    name: 'inv_status_id',
                },{
                    name: 'risk_of_recurrence_id',
                },{
                    name: 'investigation_severity_id',
                },{
                    name: 'updated_by_name',
                },{
                    name: 'creator_name',
                },{
                    name: 'customer_id',
                      },{
                    name: 'customer_job_number',
                },{
                    name: 'cust_name',
                },{
                    name: 'contractor_id',
                },{
                    name: 'contractor_job_number',
                },{
                    name: 'Cont_name',
                },{
                    name: 'oe_department_id',
                },{
                    name: 'env_conditions',
                },{
                    name: 'root_cause_param_id',
                },{
                    name: 'inv_source_param_id',
                },{
                    name: 'energy_form',
                },{
                    name: 'substandard_actions',
                },{
                    name: 'under_lying_causes',
                },{
                    name: 'substandard_conditions',
                },{
                    name: 'people_involved_name',
                },{
                    name: 'email',
                },{
                    name: 'company',
                },{
                    name: 'position',
                },{
                    name: 'primary_phone',
                },{
                    name: 'alternative_phone',
                },{
                    name: 'exp_in_current_postion',
                },{
                    name: 'exp_over_all',
                },{
                    name: 'age',
                },{
                    name: 'how_he_involved',
                },{
                    name: 'role_description',
                },{
                    name: 'certificate_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'employee_id',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'start_date',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'target_end_date',
                },{
                    name: 'task_description',
                },{
                    name: 'task_estimated_cost',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'comments',
                },{
                    name: 'imapct_type_id',
                },{
                    name: 'should_work_stopped',
                },{
                    name: 'frequency_of_worker_exposure',
                },{
                    name: 'severity_of_potential_consequences',
                },{
                    name: 'probability_of_hazard',
                },{
                    name: 'risk_level',
                },{
                    name: 'risk_control_id',
                },{
                    name: 'impact_sub_type_id',
                },{
                    name: 'ext_agency_id',
                },{
                    name: 'imapct_type_id',
                },{
                    name: 'impact_sub_type_id',
                },{
                    name: 'ext_agency_id',
                },{
                    name: 'impact_description',
                },{
                    name: 'initial_department_id1',
                },{
                    name: 'initial_department_id2',
                },{
                    name: 'initial_department_id3',
                },{
                    name: 'impact_estimated_cost',
                },{
                    name: 'initial_employee_name1',
                },{
                    name: 'initial_department_id1',
                },{
                    name: 'initial_employee_name2',
                },{
                    name: 'initial_department_id2',
                },{
                    name: 'initial_employee_name3',
                },{
                    name: 'initial_department_id3',
                },{
                    name: 'primary_responder_name',
                },{
                    name: 'impact_description',
                },{
                    name: 'impact_estimated_cost',
                },{
                    name: 'initial_employee_name1',
                },{
                    name: 'initial_department_id1',
                },{
                    name: 'initial_employee_name2',
                },{
                    name: 'initial_department_id2',
                },{
                    name: 'initial_employee_name3',
                },{
                    name: 'initial_department_id3',
                },{
                    name: 'primary_responder_name',
                },{
                    name: 'injury_type_id',
                },{
                    name: 'body_area_id',
                },{
                    name: 'contact_code_id',
                },{
                    name: 'injury_initial_treatment_id',
                },{
                    name: 'injury_lost_time_end',
                },{
                    name: 'injury_description',
                },{
                    name: 'injury_lost_time_start',
                },{
                    name: 'body_part_id',
                },{
                    name: 'personal_injured',
                },{
                    name: 'contact_code_id',
                },{
                    name: 'recordable_id',
                },{
                    name: 'injury_initial_treatment_id',
                },{
                    name: 'injury_contact_agency_id',
                },{
                    name: 'injury_adjustment_days',
                },{
                    name: 'injury_total_days_off',
                },{
                    name: 'injury_description',
                },{
                    name: 'injury_lost_time_end',
                },{
                    name: 'injury_lost_time_start',
                },{
                    name: 'illness_description',
                },{
                    name: 'illness_personal_injured',
                },{
                    name: 'contact_code_id',
                },{
                    name: 'Illness_adjustment_days',
                },{
                    name: 'Illness_lost_time_end',
                },{
                    name: 'Illness_total_days_off',
                },{
                    name: 'illness_description',
                },{
                    name: 'illness_restricted_work_id',
                },{
                    name: 'illness_personal_injured',
                },{
                    name: 'Illness_initial_treatment_id',
                },{
                    name: 'Illness_adjustment_days',
                },{
                    name: 'symptoms_id',
                },{
                    name: 'illness_total_days_off',
                },{
                    name: 'illness_lost_time_end',
                },{
                    name: 'traffic_driver_licence',
                },{
                    name: 'traffic_vehicle_type_id',
                },{
                    name: 'traffic_details',
                },{
                    name: 'ticket_number',
                },{
                    name: 'traffic_driver_name',
                },{
                    name: 'traffic_driver_licence',
                },{
                    name: 'traffic_vehicle_type_id',
                },{
                    name: 'traffic_vehicle_licence',
                },{
                    name: 'traffic_details',
                },{
                    name: 'value_of_fine',
                },{
                    name: 'ticket_number',
                },{
                    name: 'how_did_that_done',
                },{
                    name: 'damage_driver_name',
                },{
                    name: 'damage_vehicle_type_id',
                },{
                    name: 'how_did_that_done',
                },{
                    name: 'damage_driver_name',
                },{
                    name: 'damage_driver_licence',
                },{
                    name: 'damage_vehicle_type_id',
                },{
                    name: 'damage_vehicle_licence',
                },{
                    name: 'how_did_that_occur',
                },{
                    name: 'damage_description',
                },{
                    name: 'source_id',
                },{
                    name: 'duration_unit_id',
                },{
                    name: 'quantity_unit_id',
                },{
                    name: 'recovered_unit_id',
                },{
                    name: 'is_reportable',
                },{
                    name: 'duration_value',
                },{
                    name: 'duration_unit_id',
                },{
                    name: 'quantity_value',
                },{
                    name: 'quantity_unit_id',
                },{
                    name: 'quantity_recovered_value',
                },{
                    name: 'recovered_unit_id',
                },{
                    name: 'what_was_it',
                },{
                    name: 'how_did_sr_occur',
                },{
                    name: 'is_reportable',
                },{
                    name: 'impacts_ext_agency_id',
                },{
                    name: 'type_of_energy_id',
                },{
                    name: 'immediate_cause_id',
                },{
                    name: 'basic_cause_id',
                },{
                    name: 'sub_cause_id',
                },{
                    name: 'immediate_cause_type',
                },{
                    name: 'cause_comments',
                },{
                    name: 'equipment_category_name',
                },{
                    name: 'equipment_type',
                },{
                    name: 'equipment_name',
                },{
                    name: 'equipment_number',
                }
            ],
            allIncidentCorrectiveActions :  [
                {
                    name: 'locked_id',
                },{
                    name: 'incident_number',
                },{
                    name: 'incident_date',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'notified_id',
                },{
                    name: 'target_end_date',
                },{
                    name: 'task_description',
                },{
                    name: 'corrective_action_supervisor',
                },{
                    name: 'sent_date',
                },{
                    name: 'order_date',
                },{
                    name: 'start_date',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'task_estimated_cost',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'comments',
                },{
                    name: 'should_work_stopped',
                },{
                    name: 'frequency_of_worker_exposure',
                },{
                    name: 'severity_of_potential_consequences',
                },{
                    name: 'probability_of_hazard',
                },{
                    name: 'risk_level',
                },{
                    name: 'risk_control_id',
                }
            ],// Inspection
            allInspection :  [
                {
                    name: 'locked_id',
                },{
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'event_type_id',
                },{
                    name: 'location4_id',
                },{
                    name: 'status_id',
                },{
                    name: 'hour',
                },{
                    name: 'min',
                },{
                    name: 'status_id',
                },{
                    name: 'identified_by',
                },{
                    name: 'rep_name',
                },{
                    name: 'rep_id',
                },{
                    name: 'rep_position',
                },{
                    name: 'rep_crew',
                },{
                    name: 'rep_email',
                },{
                    name: 'rep_company',
                },{
                    name: 'rep_primary_phone',
                },{
                    name: 'rep_alternate_phone',
                },{
                    name: 'rep_supervisor',
                },{
                    name: 'location1_id',
                },{
                    name: 'location2_id',
                },{
                    name: 'location3_id',
                },{
                    name: 'other_location',
                },{
                    name: 'crew_involved',
                },{
                    name: 'operation_type_id',
                },{
                    name: 'description',
                },{
                    name: 'hazard_description',
                },{
                    name: 'hazard_suspected_cause',
                },{
                    name: 'initial_action_taken',
                },{
                    name: 'are_additional_corrective_actions_required',
                },{
                    name: 'recommended_corrective_actions_summary',
                },{
                    name: 'creator_name',
                },{
                    name: 'version_number',
                },{
                    name: 'Cause_notes',
                },{
                    name: 'hazard_notes',
                },{
                    name: 'potential_impacts_description',
                },{
                    name: 'should_work_stopped',
                },{
                    name: 'frequency_of_worker_exposure',
                },{
                    name: 'severity_of_potential_consequences',
                },{
                    name: 'probability_of_inspection',
                },{
                    name: 'risk_level',
                },{
                    name: 'contractor_id',
                },{
                    name: 'contractor_jop_number',
                },{
                    name: 'contractor_contact_name',
                },{
                    name: 'customer_id',
                },{
                    name: 'customer_job_number',
                },{
                    name: 'customer_contact_name',
                },{
                    name: 'equipment_id',
                },{
                    name: 'equipment_category_name',
                },{
                    name: 'equipment_type',
                },{
                    name: 'equipment_number',
                },{
                    name: 'risk_control_id',
                },{
                    name: 'potential_impact_of_hazard',
                },{
                    name: 'hazard_type',
                },{
                    name: 'hazard_sub_type',
                },{
                    name: 'cause_type',
                },{
                    name: 'cause_sub_type',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'supervisor_notify',
                },{
                    name: 'notified_id',
                },{
                    name: 'start_date',
                },{
                    name: 'target_end_date',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'estimated_cost',
                },{
                    name: 'actual_cost',
                },{
                    name: 'task_description',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'comments',
                },{
                    name: 'people_involved_name',
                },{
                    name: 'email',
                },{
                    name: 'primary_phone',
                },{
                    name: 'alternative_phone',
                },{
                    name: 'position',
                },{
                    name: 'company',
                },{
                    name: 'people_involved_supervisor',
                },{
                    name: 'crew',
                },{
                    name: 'exp_in_current_postion',
                },{
                    name: 'exp_over_all',
                },{
                    name: 'age',
                },{
                    name: 'certificate_id',
                },{
                    name: 'acting_id',
                },{
                    name: 'how_he_involved',
                },{
                    name: 'role_description',
                }
            ],
            allInspectionCorrectiveActions :  [
                {
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'target_end_date',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'notified_id',
                },{
                    name: 'task_description',
                },{
                    name: 'supervisor_notify',
                },{
                    name: 'locked_id',
                },{
                    name: 'order_date',
                },{
                    name: 'sent_date',
                },{
                    name: 'start_date',
                },{
                    name: 'supervisor',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'comments',
                },{
                    name: 'estimated_cost',
                },{
                    name: 'actual_cost',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'description',
                },{
                    name: 'hazard_description',
                },{
                    name: 'event_type_id',
                },{
                    name: 'hazard_suspected_cause',
                },{
                    name: 'initial_action_taken',
                },{
                    name: 'status_id',
                },{
                    name: 'recommended_corrective_actions_summary',
                },{
                    name: 'should_work_stopped',
                },{
                    name: 'risk_level',
                },{
                    name: 'risk_control_id',
                },{
                    name: 'notified_id',
                }
            ],//SafetyMeeting
            allSafetyMeeting :  [
                {
                    name: 'locked_id',
                },{
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'event_type_id',
                },{
                    name: 'location4_id',
                },{
                    name: 'identified_by',
                },{
                    name: 'updated_by_id',
                },{
                    name: 'min',
                },{
                    name: 'hour',
                },{
                    name: 'rep_name',
                },{
                    name: 'rep_id',
                },{
                    name: 'rep_position',
                },{
                    name: 'rep_crew',
                },{
                    name: 'rep_email',
                },{
                    name: 'rep_company',
                },{
                    name: 'rep_primary_phone',
                },{
                    name: 'rep_alternate_phone',
                },{
                    name: 'rep_supervisor',
                },{
                    name: 'location1_id',
                },{
                    name: 'location2_id',
                },{
                    name: 'location3_id',
                },{
                    name: 'other_location',
                },{
                    name: 'crew_involved',
                },{
                    name: 'operation_type_id',
                },{
                    name: 'description',
                },{
                    name: 'creator_name',
                },{
                    name: 'version_number',
                },{
                    name: 'contractor_id',
                },{
                    name: 'contractor_jop_number',
                },{
                    name: 'contractor_contact_name',
                },{
                    name: 'customer_id',
                },{
                    name: 'customer_job_number',
                },{
                    name: 'customer_contact_name',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'supervisor_notify',
                },{
                    name: 'notified_id',
                },{
                    name: 'start_date',
                },{
                    name: 'target_end_date',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'estimated_cost',
                },{
                    name: 'actual_cost',
                },{
                    name: 'task_description',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'comments',
                },{
                    name: 'people_involved_name',
                },{
                    name: 'email',
                },{
                    name: 'primary_phone',
                },{
                    name: 'alternative_phone',
                },{
                    name: 'position',
                },{
                    name: 'company',
                },{
                    name: 'people_involved_supervisor',
                },{
                    name: 'crew',
                },{
                    name: 'exp_in_current_postion',
                },{
                    name: 'exp_over_all',
                },{
                    name: 'age',
                },{
                    name: 'certificate_id',
                },{
                    name: 'acting_id',
                },{
                    name: 'how_he_involved',
                },{
                    name: 'role_description',
                }
            ],
            allSafetyMeetingCorrectiveActions :  [
                {
                    name: 'number',
                },{
                    name: 'date',
                },{
                    name: 'target_end_date',
                },{
                    name: 'corrective_action_status_id',
                },{
                    name: 'corrective_action_priority_id',
                },{
                    name: 'assigned_to_id',
                },{
                    name: 'corrective_action_supervisor',
                },{
                    name: 'notified_id',
                },{
                    name: 'task_description',
                },{
                    name: 'supervisor_notify',
                },{
                    name: 'locked_id',
                },{
                    name: 'updated_by_id',
                },{
                    name: 'sent_date',
                },{//optional
                    name: 'event_type_id',
                },{
                    name: 'start_date',
                },{
                    name: 'actual_end_date',
                },{
                    name: 'estimated_cost',
                },{
                    name: 'actual_cost',
                },{
                    name: 'out_come_follow_up',
                },{
                    name: 'desired_results',
                },{
                    name: 'comments',
                }
            ]
        }
        var selectedFilterArray = [];
        var selectFilter = function(selectedView){
            switch (selectedView) {
                case 211: // All Hazard
                case 221:
                case 611: // My Hazard Reports
                case 621:
                case 711: // My Hazard Report versions
                case 721:
                    selectedFilterArray = filterOptionalFields.allHazard;
                    break;
                case 811: // My Corrective Actions
                case 111: // All Corrective Actions
                case 821:
                case 121:
                    selectedFilterArray = filterOptionalFields.allHazardCorrectiveActions;
                    break;
                case 311: //  Supporting Documents
                case 321:
                    selectedFilterArray = filterOptionalFields.supportingDocuments;
                break;
                case 411: //  pPeople Involved
                case 421:
                    selectedFilterArray = filterOptionalFields.peopleInvolved;
                break;
                case 511: //  Impacts
                case 521:
                    selectedFilterArray = filterOptionalFields.impacts;
                break;
                case 911: //  risk Control
                case 921:
                    selectedFilterArray = filterOptionalFields.riskControl;
                break;
                case 1011: //  thirdParty
                case 1021:
                    selectedFilterArray = filterOptionalFields.thirdParty;
                break;
                case 1111: //  equipment Involved
                case 1121:
                    selectedFilterArray = filterOptionalFields.equipmentInvolved;
                break;
                case 1211: //  equipment Involved
                case 1221:
                    selectedFilterArray = filterOptionalFields.classification;
                break;
                case 1311: //  equipment Involved
                case 1321:
                    selectedFilterArray = filterOptionalFields.deletion;
                break;
                case 112: //  all incident
                case 212:
                    selectedFilterArray = filterOptionalFields.allIncident;
                break;
                case 312: //  all incident corrective action
                case 412:
                    selectedFilterArray = filterOptionalFields.allIncidentCorrectiveActions;
                break;
                case 213:
                case 513: // Inspection Report & Default view & All Inspection subtype
                    selectedFilterArray = filterOptionalFields.allInspection;
                break;
                case 113:
                case 613: // Inspection Report & Default view & All Corrective Actions subtype
                     selectedFilterArray = filterOptionalFields.allInspectionCorrectiveActions;
                break; 
                case 114: // all safety meeting
                case 214: // my safety meeting  
                    selectedFilterArray = filterOptionalFields.allSafetyMeeting;
                break; 
                case 314: // all =Corrective Actions subtype
                case 414: // my s Corrective Actions subtype
                    selectedFilterArray = filterOptionalFields.allSafetyMeetingCorrectiveActions;
                break; 
            }
        }
        
 
        function uniq_fast(a) {
            var seen = {};
            var out = [];
            var len = a.length;
            var j = 0;
            for(var i = 0; i < len; i++) {
                 var item = a[i];
                 if(seen[item.org_id] !== 1) {
                       seen[item.org_id] = 1;
                       out[j++] = item;
                 }
            }
            return out;
        }
        
        $scope.templatePopUp = function (size) {
            if ($scope.gridApi.selection.getSelectedRows()[0]) {
                console.table($scope.gridApi.selection.getSelectedRows());
                $scope.reportObject = {
                    dbname: null,
                    report_type: null,
                    report_id: null
                };
                if($scope.db.selectArrays['Report Type'] === 1 && $scope.products.Hazard){
                    $scope.reportObject.report_type = 'Hazard';
                    $scope.reportObject.dbname = 'stellarhse_hazard';
                    $scope.reportObject.report_id = $scope.gridApi.selection.getSelectedRows()[0].hazard_id;
                    $scope.reportObject.report_number = $scope.gridApi.selection.getSelectedRows()[0].number;
                }else if($scope.db.selectArrays['Report Type'] === 2 && $scope.products.ABCanTrack){
                    $scope.reportObject.report_type = 'ABCanTrack';
                    $scope.reportObject.dbname = 'stellarhse_incident';
                    $scope.reportObject.report_id = $scope.gridApi.selection.getSelectedRows()[0].incident_id;
                    $scope.reportObject.report_number = $scope.gridApi.selection.getSelectedRows()[0].incident_number;
                }else if($scope.db.selectArrays['Report Type'] === 3 && $scope.products.Inspection){
                    $scope.reportObject.report_type = 'Inspection';
                    $scope.reportObject.dbname = 'stellarhse_inspection';
                }else if($scope.db.selectArrays['Report Type'] === 4 && $scope.products.SafetyMeeting){
                    $scope.reportObject.report_type = 'SafetyMeeting';
                    $scope.reportObject.dbname = 'stellarhse_safetymeeting';
                }else if($scope.db.selectArrays['Report Type'] === 5 && $scope.products.Training){
                    $scope.reportObject.report_type = 'Training';
                    $scope.reportObject.dbname = 'stellarhse_training';
                }else if($scope.db.selectArrays['Report Type'] === 6 && $scope.products.MaintenanceManagement){
                    $scope.reportObject.report_type = 'MaintenanceManagement';
                    $scope.reportObject.dbname = 'stellarhse_maintenance';
                }
                var data = {
                    db: $scope.reportObject.dbname,
                    employee_id: $scope.user.employee_id,
                    org_id: $scope.user.org_id,
                    language_id: $scope.user.language_id,
                    report_type: $scope.reportObject.report_type
                };
                viewDataTablesService.getTemplatesTypes(data)
                    .then(function(res){
                        console.log(res);
                        var arr = uniq_fast(res.data);
                        arr.unshift({org_id:'DefaultTemplate', org_name: "Default Templates"});
                        console.table(arr);
                        var arr2 = [];
                        $.each(arr, function(i){
                            if(arr[i].org_id == $scope.user.org_id || arr[i].org_id=="DefaultTemplate") {
                                arr2.push(arr[i]);
                            }
                        });
                        $scope.reportObject.templatesTypes = arr2;
                    }, function(err){
                        console.error(err);
                    });

                getAllLabels(data);

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/viewDataTablesModule/views/templatePop.html',
                    controller: 'printOrEmailCtrl',
                    size: size,
                    scope: $scope,
                    resolve: {
                        reportObject: function () {
                            return $scope.reportObject;
                        }
                    }
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }

        };

        function getAllLabels(body) {
            var data = {
                LanguageId: body.language_id,
                dbname: body.db
            };
            coreService.getAllLabels(data)
            .then(function(res){
                console.log(res);
                localStorage.setItem('AllLabels', JSON.stringify(res.data));
            }, function(err){
                console.error(err);
            });
        }

        $scope.sendEmailPopUp = function () {
            
        };



        $scope.saveAsFavorit= function () {
            $scope.FavoritViewName = '';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/tableModule/views/saveAsFavorit.html',
                controller: 'TableController',
                scope: $scope
            });
        };

        $scope.saveFavoritFun= function () {


            angular.element('.modal').addClass('hide');
         angular.element('.modal-backdrop').addClass('hide');
          //  modalInstance.dismiss();
             console.log($scope.db.headerFields);
            $scope.favoritFields = [];
            angular.forEach($scope.db.headerFields, function (value, key) {
                    $scope.favoritFields.push({
                        id: value.id
                    });
            });
            data = {
                favoritName: $scope.FavoritViewName,
                employee_id: $scope.user.employee_id,
                orgId: $scope.user.org_id,
                favoritTypeId: $scope.db.selectedObj.dBId,
                fieldIDs: $scope.favoritFields,
                moduleType: $scope.db.selectArrays['Report Type']
            }
            console.log(data);
            viewDataTablesService.saveFavoritView({data}).then(function (response) {
                console.log(response);
                $scope.getSelectArrays("type");
            }, function (response) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                });
            });
        };
            
              
        $scope.renameFavorit= function () {
            $scope.FavoritViewName = $scope.db.selectedObj.name;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'app/modules/tableModule/views/renameFavorit.html',
                controller: 'TableController',
                scope: $scope
            });
        };

        $scope.updateFavoritFun= function (opreation) {
             angular.element('.modal').addClass('hide');
                  angular.element('.modal-backdrop').addClass('hide');
            data = {
                favoritViewId: $scope.db.selectedObj.id,
                moduleType: $scope.db.selectArrays['Report Type'],
                opreationType: opreation
            }
            if (opreation == 'rename') 
                data.favoritName = $scope.FavoritViewName;
            if (opreation == 'update') {
                $scope.favoritFields = [];
                angular.forEach($scope.db.headerFields, function (value, key) {
                        $scope.favoritFields.push({
                            id: value.id
                        });
                });
                data.fieldIDs = $scope.favoritFields;
            }
                
            console.log(data);
            viewDataTablesService.updateFavoritView({data}).then(function (response) {
                console.log(response);
                $scope.getSelectArrays("type");
                if ( opreation == 'update') 
                    $scope.filter();
            }, function (response) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                });
            });
        };
        
        $scope.fileManagerPopUp = function () {
            if ($scope.db.hasOwnProperty('selectedItem') && $scope.db.selectedItem) {

                $scope.selectedItem = $scope.db.selectedItem;

                if ($scope.db.selectArrays['Report Type'] === 1) {
//                    coreReportService.setTempFiles({user_id:$scope.user.employee_id}).then(function (response) {
//                        var res = response.data;
//                        if (res) {
//                            console.log(res);
//                        }
//                    });
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'hazard',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'hazard', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.number}).then(function (res) {
                    }, function (err) {

                        console.error(err);
                    });
                    $scope.selectedItem.report_number = $scope.db.selectedItem.number;
                    report_type = 'hazard';
                } else if ($scope.db.selectArrays['Report Type'] === 2) {
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'incident',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'incident', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.incident_number}).then(function (res) {
                    }, function (err) {
                        console.error(err);
                    });
                    report_type = 'incident';
                    $scope.selectedItem.report_number = $scope.db.selectedItem.incident_number;
                } else if ($scope.db.selectArrays['Report Type'] === 3) {
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'inspection',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'inspection', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.inspection_number}).then(function (res) {
                    }, function (err) {
                        console.error(err);
                    });

                    report_type = 'inspection';
                    $scope.selectedItem.report_number = $scope.db.selectedItem.inspection_number;
                } else if ($scope.db.selectArrays['Report Type'] === 4) {
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'safetymeeting',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'safetymeeting', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.safetymeeting_number}).then(function (res) {
                    }, function (err) {
                        console.error(err);
                    });

                    report_type = 'safetymeeting';
                    $scope.selectedItem.report_number = $scope.db.selectedItem.safetymeeting_number;
                } else if ($scope.db.selectArrays['Report Type'] === 5) {
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'maintenance',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'maintenance', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.maintenance_number}).then(function (res) {
                    }, function (err) {
                        console.error(err);
                    });

                    report_type = 'maintenance';
                    $scope.selectedItem.report_number = $scope.db.selectedItem.maintenance_number;
                } else if ($scope.db.selectArrays['Report Type'] === 6) {
                    coreReportService.deleteTempFiles({}).then(function (response) {
                        var res = response.data;
                        if (res) {
                            console.log(res);
                        }
                    });

                    coreReportService.getAllTypeReportNo({type: 'training',org_id: $scope.user.org_id}).then(function (response) {
                        var res = response.data;
                        $scope.reportNumbers = response.data;
                    });

                    coreReportService.copyReportFilesToTemp({type: 'training', org_id: $scope.db.org_id, report_number: $scope.db.selectedItem.training_number}).then(function (res) {
                    }, function (err) {
                        console.error(err);
                    });

                    report_type = 'training';
                    $scope.selectedItem.report_number = $scope.db.selectedItem.training_number;
                }
                //                console.log($scope.selectedItem);
                setTimeout(function () {
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/tableModule/views/fileMangerPopup.html',
                        controller: 'TableController',
                        scope: $scope,
                        resolve: {
                            item: function () {
                                $scope.$watch('selectedItem.report_number', function (newVal, oldVal) {

                                    if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
                                        coreReportService.deleteTempFiles({}).then(function (response) {
                                            var res = response.data;
                                            if (res) {
                                                console.log(res);
                                            }
                                        });
                                        coreReportService.copyReportFilesToTemp({type: report_type, org_id: $scope.db.org_id, report_number: newVal}).then(function (res) {
                                        }, function (err) {
                                            console.error(err);
                                        });

                                        setTimeout(function () {
                                            $('#angular-filemanager-buttom').triggerHandler('click');
                                        }, 2000);
                                    }
                                });
                            }
                        }

                    });
                }, 2000);

            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: 'Please choose report first'});
            }
        
        };
        
   
     


        $scope.submitReportFiles = function () {
            var offset = (new Date().getTimezoneOffset()) / 60;

            if ($scope.db.hasOwnProperty('selectedItem') && $scope.db.selectedItem) {

                edit_by = $scope.user.employee_id;
//                coreReportService.dirSize({}).then(function (response) {
//                    var res = response.data;
//                    if (res === true) {

                        if ($scope.db.selectArrays['Report Type'] === 1) {
                            coreReportService.submitReportFiles({type: 'hazard', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                                
                            }, function (err) {
                                console.error(err);
                            });

                        } else if ($scope.db.selectArrays['Report Type'] === 2) {

                            coreReportService.submitReportFiles({type: 'incident', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                            }, function (err) {
                                console.error(err);
                            });

                        } else if ($scope.db.selectArrays['Report Type'] === 3) {

                            coreReportService.submitReportFiles({type: 'inspection', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                            }, function (err) {
                                console.error(err);
                            });
                        } else if ($scope.db.selectArrays['Report Type'] === 4) {

                            coreReportService.submitReportFiles({type: 'safetymeeting', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                            }, function (err) {
                                console.error(err);
                            });

                        } else if ($scope.db.selectArrays['Report Type'] === 5) {

                            coreReportService.submitReportFiles({type: 'maintenance', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                            }, function (err) {
                                console.error(err);
                            });

                        } else if ($scope.db.selectArrays['Report Type'] === 6) {
                            coreReportService.submitReportFiles({type: 'training', org_id: $scope.db.org_id, report_number: $scope.selectedItem.report_number, edit_by: edit_by, clientTimeZoneOffset: offset}).then(function (res) {
                                var response = res.data;
                                if (response) {
                                    coreService.resetAlert();
                                    coreService.setAlert({type: 'success', message: 'Files Uploaded Successfuly'});
                                    setTimeout(function () {
                                        angular.element('#modalwindow').addClass('hide');
                                        angular.element('.modal-backdrop').addClass('hide');
                                    }, 1000);
                                }
                            }, function (err) {
                                console.error(err);
                            });
                        }


//                    } else {
//                        coreService.resetAlert();
//                        coreService.setAlert({type: 'error', message: 'Max Folder Size is 10 MB '});
//                    }
//
//
//                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: 'Please choose report first'});
            }


        };
        
        $scope.closemodal  = function(){
            angular.element('#modalwindow').addClass('hide');
            angular.element('.modal-backdrop').addClass('hide');
            coreReportService.deleteTempFiles({}).then(function (response) {
                var res = response.data;
                if (res) {
                    console.log(res);
                }
            });
        };
    };
    controller.$inject = ['$scope', '$rootScope', '$uibModal','constantService', 'coreService', '$filter', '$state', 'uiGridConstants', 'uiGridExporterConstants', 'coreReportService', 'viewDataTablesService']
    angular.module('tableModule', ['ui.grid', 'ui.grid.selection', 'ui.grid.cellNav', 'ngAria'])
            .controller('TableController', controller)
}());