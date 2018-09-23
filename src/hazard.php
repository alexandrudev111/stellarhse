<?php

$app->group('/api/v1', function() use($app) {
//    $app->post('/gethazardnumber', function($request, $response, $args) {
//        $data = $request->getParsedBody();
//        $db = $this->db;
//        try {
//            $query = "select max(hazard_number) from stellarhse_hazard.hazard where org_id = :org_id";
//            $stmt = $db->prepare($query);
//            $stmt->bindParam(":org_id", $data['org_id']);
//            $stmt->execute();
//            $result = $stmt->fetchColumn();
//            if($result === '' || $result === null){
//                $result = 1;
//            } else {
//                $result += 1;
//            }
//            return $this->response->withJson($result);
//        } catch (Exception $ex) {
//            return $this->response->withJson($ex->errorInfo);
//        }
//    });

    $app->post('/gethazardtypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select event_type_id as id,haz_type_name as name from stellarhse_hazard.hazard_event_type where org_id = :org_id "
                    . "and language_id= :language_id and hide = 0 order by `order`, haz_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    $app->post('/submithazardreport', function($request, $response, $args) {
        $result = [];
        $db = $this->db;
        $hazard_data = $request->getParsedBody();
        $effectsTypes = $hazard_data['effectsTypes'];
        $causeType = $hazard_data['causeTypes'];
        $whoIdentified = $hazard_data['whoIdentified'];
        $h_date = $hazard_data['report_date'];
        $hazard_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;

        try {
            $db->beginTransaction();
            if ($hazard_data['process_type'] === 'edit') {
                $query = "select max(version_number) from stellarhse_hazard.hazard where hazard_number = :hazard_number and org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":hazard_number", $hazard_data['hazard_number']);
                $stmt->bindParam(":org_id", $hazard_data['org_id']);
                $stmt->execute();
                $version_number = $stmt->fetchColumn();
                if ($version_number === '' || $version_number === null) {
                    $version_number = 1;
                } else {
                    $version_number += 1;
                }
                $hazard_number = $hazard_data['hazard_number'];
                /* if ($hazard_number === '' || $hazard_number === null) {
                  $query = "select max(hazard_number) from stellarhse_hazard.hazard where org_id = :org_id";
                  $stmt = $db->prepare($query);
                  $stmt->bindParam(":org_id", $hazard_data['org_id']);
                  $stmt->execute();
                  $hazard_number = $stmt->fetchColumn();
                  if ($hazard_number === '' || $hazard_number === null) {
                  $hazard_number = 1;
                  } else {
                  $hazard_number += 1;
                  }
                  } */
            } else {
                $query = "select max(hazard_number) from stellarhse_hazard.hazard where org_id = :org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $hazard_data['org_id']);
                $stmt->execute();
                $hazard_number = $stmt->fetchColumn();
                if ($hazard_number === '' || $hazard_number === null) {
                    $hazard_number = 1;
                } else {
                    $hazard_number += 1;
                }
                $version_number = 1;
            }
            $hazard_data['report_number'] = $hazard_number;
            $hazard_data['version_number'] = $version_number;

            $hazard_id = Utils::getUUID($db);
            $hazard_data['report_id'] = $hazard_id;

            $query = "insert into stellarhse_hazard.hazard ("
                    . "hazard_id,event_type_id,other_event_type,hazard_record_number,org_id,report_owner,cont_cust_id,sponser_id,hazard_date,hazard_time,"
                    . "hazard_min,reporter_id,rep_name,rep_emp_id,rep_crew,rep_department,rep_email,rep_position,rep_company,rep_primary_phone,"
                    . "rep_alternate_phone,rep_supervisor,rep_supervisor_notify,location1_id,location2_id,location3_id,location4_id,crew_involved,"
                    . "operation_type_id,hazard_desc,hazard_suspected_cause,initial_action_token,"
                    . "are_additional_corrective_actions_required,recommended_corrective_actions_summary,potential_impacts_desc,should_work_stopped,creator_id,"
                    . "hazard_number,hazard_note,hazard_cause_note,hazard_other_location,version_number,department_responsible_id,is_deleted,editing_by,modifier_id,hide)"
                    . " values (:hazard_id,:event_type_id,:other_event_type,:hazard_record_number,:org_id,:report_owner,:cont_cust_id,:sponser_id,:hazard_date,:hazard_time,"
                    . ":hazard_min,:reporter_id,:rep_name,:rep_emp_id,:rep_crew,:rep_department,:rep_email,:rep_position,:rep_company,:rep_primary_phone,"
                    . ":rep_alternate_phone,:rep_supervisor,:rep_supervisor_notify,:location1_id,:location2_id,:location3_id,:location4_id,:crew_involved,"
                    . ":operation_type_id,:hazard_desc,:hazard_suspected_cause,:initial_action_token,"
                    . ":are_additional_corrective_actions_required,:recommended_corrective_actions_summary,:potential_impacts_desc,:should_work_stopped,:creator_id,"
                    . ":hazard_number,:hazard_note,:hazard_cause_note,:hazard_other_location,:version_number,:department_responsible_id,:is_deleted,:editing_by,:modifier_id,:hide)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":hazard_id", $hazard_id);
            if (isset($hazard_data['report_type_id']) && $hazard_data['report_type_id'] !== '' && $hazard_data['report_type_id'] !== null)
                $stmt->bindParam(":event_type_id", $hazard_data['report_type_id']);
            else
                return "Please choose type of hazard";
            $stmt->bindParam(":other_event_type", $hazard_data['other_event_type']);
            $stmt->bindParam(":hazard_record_number", $hazard_data['hazard_record_number']);
            $stmt->bindParam(":org_id", $hazard_data['org_id']);
            $stmt->bindParam(":report_owner", $hazard_data['report_owner']);
            if (isset($hazard_data['cont_cust_id']) && $hazard_data['cont_cust_id'] !== '' && $hazard_data['cont_cust_id'] !== null)
                $stmt->bindParam(":cont_cust_id", $hazard_data['cont_cust_id']);
            else
                $stmt->bindValue(":cont_cust_id", NULL );
            if (isset($hazard_data['sponser_id']) && $hazard_data['sponser_id'] !== '' && $hazard_data['sponser_id'] !== null)
                $stmt->bindParam(":sponser_id", $hazard_data['sponser_id']);
            else
                $stmt->bindValue(":sponser_id", NULL );
            $stmt->bindParam(":hazard_date", $hazard_date);
            $stmt->bindParam(":hazard_time", $hazard_data['report_hour']);
            $stmt->bindParam(":hazard_min", $hazard_data['report_min']);
            if (isset($whoIdentified['employee_id']) && $whoIdentified['employee_id'] !== '' && $whoIdentified['employee_id'] !== null)
                $stmt->bindParam(":reporter_id", $whoIdentified['employee_id']);
            else
                $stmt->bindValue(":reporter_id", NULL);
            $stmt->bindParam(":rep_name", $whoIdentified['full_name']);
            $stmt->bindParam(":rep_emp_id", $whoIdentified['emp_id']);
            $stmt->bindParam(":rep_crew", $whoIdentified['crew_id']);
            $stmt->bindParam(":rep_department", $whoIdentified['department_id']);
            $stmt->bindParam(":rep_email", $whoIdentified['email']);
            $stmt->bindParam(":rep_position", $whoIdentified['position']);
            $stmt->bindParam(":rep_company", $whoIdentified['company']);
            $stmt->bindParam(":rep_primary_phone", $whoIdentified['primary_phone']);
            $stmt->bindParam(":rep_alternate_phone", $whoIdentified['alternate_phone']);
            $stmt->bindParam(":rep_supervisor", $whoIdentified['supervisor_name']);
            if ($whoIdentified['rep_supervisor_notify'])
                $stmt->bindValue(":rep_supervisor_notify", 1, PDO::PARAM_INT);
            else
                $stmt->bindValue(":rep_supervisor_notify", 0, PDO::PARAM_INT);
                    
            if (isset($hazard_data['location1']['location1_id']) && $hazard_data['location1']['location1_id'] !== '' && $hazard_data['location1']['location1_id'] !== null)
                $stmt->bindParam(":location1_id", $hazard_data['location1']['location1_id']);
            else
                $stmt->bindValue(":location1_id", NULL);
            if (isset($hazard_data['location2']['location2_id']) && $hazard_data['location2']['location2_id'] !== '' && $hazard_data['location2']['location2_id'] !== null)
                $stmt->bindParam(":location2_id", $hazard_data['location2']['location2_id']);
            else
                $stmt->bindValue(":location2_id", NULL);
            if (isset($hazard_data['location3']['location3_id']) && $hazard_data['location3']['location3_id'] !== '' && $hazard_data['location3']['location3_id'] !== null)
                $stmt->bindParam(":location3_id", $hazard_data['location3']['location3_id']);
            else
                $stmt->bindValue(":location3_id", NULL);
            if (isset($hazard_data['location4']['location4_id']) && $hazard_data['location4']['location4_id'] !== '' && $hazard_data['location4']['location4_id'] !== null)
                $stmt->bindParam(":location4_id", $hazard_data['location4']['location4_id']);
            else
                $stmt->bindValue(":location4_id", NULL);
            if (isset($hazard_data['crew_id']) && $hazard_data['crew_id'] !== '' && $hazard_data['crew_id'] !== null)
                $stmt->bindParam(":crew_involved", $hazard_data['crew_id']);
            else
                $stmt->bindValue(":crew_involved", NULL);
            if (isset($hazard_data['operation_type_id']) && $hazard_data['operation_type_id'] !== '' && $hazard_data['operation_type_id'] !== null)
                $stmt->bindParam(":operation_type_id", $hazard_data['operation_type_id']);
            else
                $stmt->bindValue(":operation_type_id", NULL);
            $stmt->bindParam(":hazard_desc", $hazard_data['report_description']);
            $stmt->bindParam(":hazard_suspected_cause", $hazard_data['report_suspected_cause']);
            $stmt->bindParam(":initial_action_token", $hazard_data['initial_action_token']);
           // $stmt->bindParam(":hazard_status_id", $hazard_data['hazard_status']);
           /* if (isset($hazard_data['are_additional_corrective_actions_required']) && $hazard_data['are_additional_corrective_actions_required'] !== '' && $hazard_data['are_additional_corrective_actions_required'] !== null && $hazard_data['are_additional_corrective_actions_required'] == '1')
                $stmt->bindValue(":are_additional_corrective_actions_required", 'Yes');
            else
                $stmt->bindValue(":are_additional_corrective_actions_required", 'No');
                */
            $stmt->bindParam(":are_additional_corrective_actions_required", $hazard_data['are_additional_corrective_actions_required']);
            $stmt->bindParam(":recommended_corrective_actions_summary", $hazard_data['recommended_corrective_actions_summary']);
            $stmt->bindParam(":potential_impacts_desc", $hazard_data['potential_impacts_desc']);
            if (isset($hazard_data['should_work_stopped']) && $hazard_data['should_work_stopped'] == '')
                $stmt->bindValue(":should_work_stopped", NULL);
            else
                $stmt->bindParam(":should_work_stopped", $hazard_data['should_work_stopped']);
            $stmt->bindParam(":creator_id", $hazard_data['creator_id']);
            $stmt->bindParam(":hazard_number", $hazard_number);
            $stmt->bindParam(":hazard_note", $hazard_data['hazard_note']);
            $stmt->bindParam(":hazard_cause_note", $hazard_data['hazard_cause_note']);
            $stmt->bindParam(":hazard_other_location", $hazard_data['other_location']);
            $stmt->bindParam(":version_number", $version_number);
            if (isset($hazard_data['department_responsible_id']) && $hazard_data['department_responsible_id'] != '' && $hazard_data['department_responsible_id'] != undefined)
                $stmt->bindParam(":department_responsible_id", $hazard_data['department_responsible_id']);
            else
                $stmt->bindValue(":department_responsible_id", NULL);
            $stmt->bindValue(":is_deleted", 0);
            $stmt->bindValue(":editing_by", NULL);
            if ($hazard_data['process_type'] === 'edit') {
                $stmt->bindParam(":creator_id", $hazard_data['creator_id']);
                $stmt->bindParam(":modifier_id", $hazard_data['modifier_id']);
            } else {
                $stmt->bindParam(":creator_id", $hazard_data['creator_id']);
                $stmt->bindValue(":modifier_id", NULL);
            }
            $stmt->bindValue(":hide", 0);
           // var_dump($stmt);
            $stmt->execute();
            $result = $stmt->rowCount();

            $impactTypes = $hazard_data['impactTypes'];
            foreach ($impactTypes as $impact) {
                if (isset($impact['impact_choice']) && $impact['impact_choice'] == true) {
                    $hazard_impact_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_hazard.hazard_impact "
                            . "(hazard_impact_id,hazard_id,impact_type_id,description,editing_by,hide)"
                            . " values "
                            . "(:hazard_impact_id,:hazard_id,:impact_type_id,:description,:editing_by,:hide)";


                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":hazard_impact_id", $hazard_impact_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    $stmt->bindParam(":impact_type_id", $impact['impact_type_id']);
                    $stmt->bindParam(":description", $impact['description']);
                    $stmt->bindValue(":editing_by", NULL);
                    $stmt->bindValue(":hide", 0);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }
            foreach ($effectsTypes as $type) {
                foreach ($type['effects_sub_types'] as $subtype) {

                    if (isset($subtype['effects_sub_type_choice']) && $subtype['effects_sub_type_choice'] == true) {
                        $hazard_effects_type_id = Utils::getUUID($db);
                        $query = "insert into stellarhse_hazard.hazard_effects_type "
                                . "(hazard_effects_type_id,hazard_id,effects_sub_type_id,effects_sub_type_status_id)"
                                . " values "
                                . "(:hazard_effects_type_id,:hazard_id,:effects_sub_type_id,:effects_sub_type_status_id)";


                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":hazard_effects_type_id", $hazard_effects_type_id);
                        $stmt->bindParam(":hazard_id", $hazard_id);
                        $stmt->bindParam(":effects_sub_type_id", $subtype['effects_sub_type_id']);
                        if (isset($subtype['effects_sub_type_status_id']) && $subtype['effects_sub_type_status_id'] != null && $subtype['effects_sub_type_status_id'] != "" ) {
                            $stmt->bindParam(":effects_sub_type_status_id", $subtype['effects_sub_type_status_id']);
                        }
                        else
                            $stmt->bindValue(":effects_sub_type_status_id", NULL);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
            }
            foreach ($causeType as $type) {
                foreach ($type['cause_sub_types'] as $subtype) {
                    if (isset($subtype['cause_sub_types_choice']) && $subtype['cause_sub_types_choice'] == true) {
                        $hazard_cause_id = Utils::getUUID($db);
                        $query = "insert into stellarhse_hazard.hazard_cause "
                                . "(hazard_cause_id,hazard_id,cause_sub_types_id, cause_sub_type_status_id)"
                                . " values "
                                . "(:hazard_cause_id,:hazard_id,:cause_sub_types_id,:cause_sub_type_status_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":hazard_cause_id", $hazard_cause_id);
                        $stmt->bindParam(":hazard_id", $hazard_id);
                        $stmt->bindParam(":cause_sub_types_id", $subtype['cause_sub_types_id']);
                        if (isset($subtype['cause_sub_type_status_id']) && $subtype['cause_sub_type_status_id'] != null && $subtype['cause_sub_type_status_id'] != "" ) {
                            $stmt->bindParam(":cause_sub_type_status_id", $subtype['cause_sub_type_status_id']);
                        }
                        else
                            $stmt->bindValue(":cause_sub_type_status_id", NULL);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
            }

            $riskControls = $hazard_data['riskControls'];
            foreach ($riskControls as $riskControl) {
                if (isset($riskControl['risk_control_choice']) && $riskControl['risk_control_choice'] == true) {
                    $hazard_risk_control_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_hazard.hazard_risk_control "
                            . "(hazard_risk_control_id,hazard_id,risk_control_id)"
                            . " values "
                            . "(:hazard_risk_control_id,:hazard_id,:risk_control_id)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":hazard_risk_control_id", $hazard_risk_control_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    $stmt->bindParam(":risk_control_id", $riskControl['risk_control_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }

            $riskLevels = $hazard_data['riskLevels'];
            if (isset($riskLevels['impactId']) && $riskLevels['impactId']!= undefined ) {
                $hazard_risk_level_id = Utils::getUUID($db);
               // var_dump($riskLevels);
                $query = "insert into stellarhse_hazard.hazard_risk_level "
                        . "(hazard_risk_level_id,hazard_id,risk_level_sup_impact_id,risk_level_sup_likelyhood_id,result)"
                        . " values "
                        . "(:hazard_risk_level_id,:hazard_id,:risk_level_sup_impact_id,:risk_level_sup_likelyhood_id,:result)";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":hazard_risk_level_id", $hazard_risk_level_id);
                $stmt->bindParam(":hazard_id", $hazard_id);
                $stmt->bindParam(":risk_level_sup_impact_id", $riskLevels['impactId']);
                $stmt->bindParam(":risk_level_sup_likelyhood_id", $riskLevels['likelyhoodId']);
                $riskResult = intval($riskLevels['result']);
                $stmt->bindParam(":result", $riskResult);
                $stmt->execute();
            }

            $hazard_third_party = $hazard_data['report_third_party'];
            foreach ($hazard_third_party as $person) {
                if (isset($person['third_party_id']) && $person['third_party_id'] !== '' && $person['third_party_id'] !== null) {
                    $hazard_third_party_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_hazard.hazard_third_party "
                            . "(hazard_third_party_id,hazard_id,third_party_id ,jop_number,contact_name)"
                            . " values "
                            . "(:hazard_third_party_id,:hazard_id,:third_party_id,:jop_number,:contact_name)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":hazard_third_party_id", $hazard_third_party_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    $stmt->bindParam(":third_party_id", $person['third_party_id']);
                    $stmt->bindParam(":jop_number", $person['jop_number']);
                    $stmt->bindParam(":contact_name", $person['contact_name']);

                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }

            $equipment_involved = $hazard_data['equipment_involved'];

            foreach ($equipment_involved as $equipment) {
                $hazard_equipment_id = Utils::getUUID($db);
                if (isset($equipment['equipment_id'])) {
                    $query = "insert into stellarhse_hazard.hazard_equipment "
                            . "(hazard_equipment_id,hazard_id,equipment_id)"
                            . " values "
                            . "(:hazard_equipment_id,:hazard_id,:equipment_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":hazard_equipment_id", $hazard_equipment_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    $stmt->bindParam(":equipment_id", $equipment['equipment_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }
            $identifierIndex = 0;
            $maxIdentifierIndex = 0;

            $peopleInvolved = $hazard_data['peopleInvolved'];
            foreach ($peopleInvolved as $person) {
                // var_dump($person['title']);
                if ($person['title'] != '' && $person['title'] != 'New Person') {

                    $people_involved_id = Utils::getUUID($db);

                    $query = "insert into stellarhse_hazard.hazard_people_involved "
                            . "(people_involved_id,hazard_id,people_id ,third_party_id,people_involved_name,company,supervisor,position,email,primary_phone,alternate_phone,"
                            . "exp_in_current_postion,exp_over_all,age,crew,how_he_involved,role_description,editing_by,hide,identifier,department,original_people_involved_id)"
                            . " values "
                            . "(:people_involved_id,:hazard_id,:people_id,:third_party_id,:people_involved_name,:company,:supervisor,:position,:email,:primary_phone,:alternate_phone,"
                            . ":exp_in_current_postion,:exp_over_all,:age,:crew,:how_he_involved,:role_description,:editing_by,:hide,:identifier,:department,:original_people_involved_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":people_involved_id", $people_involved_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    if (isset($person['type']) && ($person['type'] == 'whoidentified' || $person['type'] == 'investigator')) {
                        $stmt->bindParam(":people_id", $person['employee_id']);
                        $stmt->bindValue(":third_party_id", NULL, PDO::PARAM_STR);
                        $stmt->bindParam(":people_involved_name", $person['full_name']);
                    } else if (isset($person['type']) && $person['type'] == 'thirdparty') {
                        $stmt->bindValue(":people_id", NULL, PDO::PARAM_STR);
                        $stmt->bindParam(":third_party_id", $person['third_party_id']);
                        $stmt->bindParam(":people_involved_name", $person['full_name']);
                    } else {
                        $stmt->bindValue(":people_id", NULL, PDO::PARAM_STR);
                        $stmt->bindValue(":third_party_id", NULL, PDO::PARAM_STR);
                        $stmt->bindValue(":people_involved_name", NULL, PDO::PARAM_STR);
                    }
                    //                    $stmt->bindParam(":people_id", $person['employee_id']);
                    //                    $stmt->bindParam(":third_party_id", $person['third_party_id']);
                    //                    $stmt->bindParam(":people_involved_name", $person['first_name']);
                    $stmt->bindParam(":company", $person['company']);
                    $stmt->bindParam(":supervisor", $person['supervisor_name']);
                    $stmt->bindParam(":position", $person['position']);
                    $stmt->bindParam(":email", $person['email']);
                    $stmt->bindParam(":primary_phone", $person['primary_phone']);
                    $stmt->bindParam(":alternate_phone", $person['alternate_phone']);
                    $exp_in_current_postion = intval($person['exp_in_current_postion']);
                    $stmt->bindParam(":exp_in_current_postion", $exp_in_current_postion);
                    $exp_over_all = intval($person['exp_over_all']);
                    $stmt->bindParam(":exp_over_all", $exp_over_all);
                    $age = intval($person['age']);
                    $stmt->bindParam(":age", $age);
                    $stmt->bindParam(":crew", $person['crew']);
                    $stmt->bindParam(":department", $person['department']);
                    $stmt->bindParam(":how_he_involved", $person['how_he_involved']);
                    $stmt->bindParam(":role_description", $person['role_description']);
                    $stmt->bindValue(":editing_by", NULL);
                    $stmt->bindValue(":hide", 0);
                    $stmt->bindValue(":identifier", null);

                    if(isset($person['original_people_involved_id']) && $person['original_people_involved_id'] !='' && $person['original_people_involved_id'] !=NULL){
                        $stmt->bindParam(":original_people_involved_id", $person['original_people_involved_id']);
                    } else {
                        $stmt->bindParam(":original_people_involved_id", $people_involved_id);
                    }
                    $stmt->execute();
                    $result = $stmt->rowCount();

                    $certificates = $person['certifications'];
                    foreach ($certificates as $certificate) {
                        if (isset($certificate['certificate_choice']) && $certificate['certificate_choice'] == true) {
                            $hazard_certificate_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_hazard.hazard_certificate "
                                    . "(hazard_certificate_id,people_involved_id,certificate_id)"
                                    . " values "
                                    . "(:hazard_certificate_id,:people_involved_id,:certificate_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":hazard_certificate_id", $hazard_certificate_id);
                            $stmt->bindParam(":certificate_id", $certificate['certificate_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    $actingAs = $person['actingAs'];
                    foreach ($actingAs as $acting) {
                        if (isset($acting['acting_choice']) && $acting['acting_choice'] == true) {
                            $hazard_acting_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_hazard.hazard_acting "
                                    . "(hazard_acting_id,people_involved_id,acting_id)"
                                    . " values "
                                    . "(:hazard_acting_id,:people_involved_id,:acting_id)";


                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":hazard_acting_id", $hazard_acting_id);
                            $stmt->bindParam(":acting_id", $acting['acting_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    
                    $person_custom = $person['peopleCustomField'];
                    if ($person_custom){
                        AddCustomFieldValues($db, $hazard_id, $person_custom,'Hazard','People',$people_involved_id);
                    }
                }
            }

            $correctiveActions = $hazard_data['correctiveActions'];
            foreach ($correctiveActions as $action) {
                if ($action['assigned_to'] != null) {
                    $corrective_action_id = Utils::getUUID($db);
                    $start_date = $action['start_date'];
                    $action_start_date = (isset($start_date) && $start_date != 'undefined' && $start_date != "") ? Utils::formatMySqlDate($start_date) : null;

                    $target_end_date = $action['target_end_date'];
                    $action_target_end_date = (isset($target_end_date) && $target_end_date != 'undefined' && $target_end_date != "") ? Utils::formatMySqlDate($target_end_date) : null;

                    $actual_end_date = $action['actual_end_date'];
                    $action_actual_end_date = (isset($actual_end_date) && $actual_end_date != 'undefined' && $actual_end_date != "") ? Utils::formatMySqlDate($actual_end_date) : null;
                    $query = "insert into stellarhse_hazard.hazard_corrective_action "
                            . "(hazard_corrective_action_id,hazard_id,corrective_action_status_id,corrective_action_priority_id,assigned_to_id,supervisor,supervisor_notify,start_date,target_end_date,"
                            . "actual_end_date,estimated_cost,actual_cost,task_description,out_come_follow_up,desired_results,comments,original_corrective_action_id,corrective_action_result_id,related_hazard_id)"
                            . " values "
                            . "(:hazard_corrective_action_id,:hazard_id,:corrective_action_status_id,:corrective_action_priority_id,:assigned_to_id,:supervisor,:supervisor_notify,:start_date,:target_end_date,"
                            . ":actual_end_date,:estimated_cost,:actual_cost,:task_description,:out_come_follow_up,:desired_results,:comments,:original_corrective_action_id,:corrective_action_result_id,:related_hazard_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":hazard_corrective_action_id", $corrective_action_id);
                    $stmt->bindParam(":hazard_id", $hazard_id);
                    $stmt->bindParam(":corrective_action_status_id", $action['corrective_action_status_id']);
                    if (isset($action['corrective_action_priority_id']) && $action['corrective_action_priority_id'] != '' && $action['corrective_action_priority_id'] != NULL) {
                        $stmt->bindParam(":corrective_action_priority_id", $action['corrective_action_priority_id']);
                    } else {
                        $stmt->bindValue(":corrective_action_priority_id", null);
                    }
                    $stmt->bindParam(":assigned_to_id", $action['assigned_to']['employee_id']);
                    $stmt->bindParam(":supervisor", $action['assigned_to']['supervisor_name']);
                    if ($action['supervisor_notify'])
                        $stmt->bindValue(":supervisor_notify", 1, PDO::PARAM_INT);
                    else
                        $stmt->bindValue(":supervisor_notify", 0, PDO::PARAM_INT);
                    $stmt->bindParam(":start_date", $action_start_date);
                    $stmt->bindParam(":target_end_date", $action_target_end_date);
                    $stmt->bindParam(":actual_end_date", $action_actual_end_date);
                    $estimated_cost = floatval($action['estimated_cost']);
                    $stmt->bindParam(":estimated_cost", $estimated_cost);
                    $actual_cost = floatval($action['actual_cost']);
                    $stmt->bindParam(":actual_cost", $actual_cost);
                    $stmt->bindParam(":task_description", $action['task_description']);
                    if (isset($action['corrective_action_result_id']) && $action['corrective_action_result_id'] != '' && $action['corrective_action_result_id'] != NULL) {
                        $stmt->bindParam(":corrective_action_result_id", $action['corrective_action_result_id']);
                    } else {
                        $stmt->bindValue(":corrective_action_result_id", null);
                    }
                    if (isset($action['related_hazard_id']) && $action['related_hazard_id'] != '' && $action['related_hazard_id'] != NULL) {
                        $stmt->bindParam(":related_hazard_id", $action['related_hazard_id']);
                    } else {
                        $stmt->bindValue(":related_hazard_id", null);
                    }
                    $stmt->bindParam(":out_come_follow_up", $action['out_come_follow_up']);
                    if ($action['desired_results'] == '1')
                        $stmt->bindValue(":desired_results", 1, PDO::PARAM_INT);
                    else
                        $stmt->bindValue(":desired_results", 0, PDO::PARAM_INT);
                    $stmt->bindParam(":comments", $action['comments']);
                    if (isset($action['original_corrective_action_id']) && $action['original_corrective_action_id'] != '' && $action['original_corrective_action_id'] != NULL) {
                        $stmt->bindParam(":original_corrective_action_id", $action['original_corrective_action_id']);
                    } else {
                        $stmt->bindParam(":original_corrective_action_id", $corrective_action_id);
                    }
                    $stmt->execute();
                    $result = $stmt->rowCount();

                    foreach ($action['notified_to'] as $notify) {
                        if (isset($notify['employee_id'])) {
                            $query = "insert into stellarhse_hazard.hazard_corrective_action_notified "
                                    . "(hazard_corrective_action_id,notified_id) values (:hazard_corrective_action_id,:notified_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":hazard_corrective_action_id", $corrective_action_id);
                            $stmt->bindParam(":notified_id", $notify['employee_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        } else if (isset($notify['notified_id'])) {
                            $query = "insert into stellarhse_hazard.hazard_corrective_action_notified "
                                    . "(hazard_corrective_action_id,notified_id) values (:hazard_corrective_action_id,:notified_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":hazard_corrective_action_id", $corrective_action_id);
                            $stmt->bindParam(":notified_id", $notify['notified_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    $action_custom = $action['actionCustomField'];
                    if ($action_custom){
                        AddCustomFieldValues($db, $hazard_id, $action_custom,'Hazard','Actions',$corrective_action_id);
                    }
                }
            }
            $db->commit();
            
            AddCustomFieldValues($db, $hazard_id, $hazard_data['whatCustomField'],'Hazard','Hazard','');
            AddCustomFieldValues($db, $hazard_id, $hazard_data['detailCustomField'],'Hazard','Hazard','');

            if ($hazard_data['process_type'] === 'add') {
                $res = InsertIntoHazardHistory($db, $hazard_id, $hazard_data['clientTimeZoneOffset'], $hazard_data['creator_id'], $hazard_data['process_type']);

                sleep(1);
                $version_number = 1;
                $hist_hazard_id = GetHistHazardData($db, $hazard_data['org_id'], $hazard_number, $version_number);
                AddReportFile('hazard', $hist_hazard_id, $hazard_data['org_id'], $hazard_number, $version_number, $db);
            }

            if ($hazard_data['process_type'] === 'edit') {
                $hazard_data['process_type'] = 'update';
                $res = InsertIntoHazardHistory($db, $hazard_id, $hazard_data['clientTimeZoneOffset'], $hazard_data['modifier_id'], $hazard_data['process_type']);


                sleep(1);
                $hist_hazard_id = GetHistHazardData($db, $hazard_data['org_id'], $hazard_number,$version_number);
                AddReportFile('hazard', $hist_hazard_id,$hazard_data['org_id'], $hazard_number,$version_number,$db);

 
            }

                // finish the submitting request & process the rest of this function in the background sodecrease consuming time for the user
                fastcgi_finish_request();
                if ($hazard_data['process_type'] === 'add' || $hazard_data['notify'] === 'notify') {
                    $report_values = GetHazardFieldsValues($db, $hazard_id, $hazard_data['org_id']);
                    $query = "SELECT subject,`body` FROM stellarhse_hazard.email_template where org_id = :org_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':org_id', $hazard_data['org_id']);
                    $stmt->execute();
                    $templates = $stmt->fetchAll(PDO::FETCH_OBJ);
//                    print_r($report_values);
                    if($hazard_data['notify'] === 'notify')
                        $templates[1]->subject = "Hazard Report #".$hazard_data['report_number']." has been updated";
                    // adding to history then sending corrective action emails & notification emails
                    // sending report emails
//                    SendWhoIdentifiedEmail($db, 'stellarhse_hazard', $hazard_data, $report_values, $templates[0]);
                    if($hazard_data['process_type'] === 'add')
                        SendCorrectiveActionEmail($db, 'stellarhse_hazard', $hazard_data, $report_values, $correctiveActions, $templates[0]);
                    SendNotificationEmail($db, 'stellarhse_hazard',$hazard_data,$report_values, $templates[1]); 
                }
            return $this->response->withJson(1);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
        }
    });


    $app->post('/saveHazardCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $user_id = $data['user_id'];
            
            // what tab
            $what_hazard_custom = $data['what_hazard'];
            $what_hazard_tab = GetSubTabId($db, 'WhatHappened', $language_id);
            $all_what_fields = [];
            for ($i = 0; $i < count($what_hazard_custom); $i++) {
                if (isset($what_hazard_custom[$i]["id"]) && $what_hazard_custom[$i]["id"] != NULL) {
                    array_push($all_what_fields, $what_hazard_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_what_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_hazard.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $what_hazard_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteCustomField($db, $res);
            }
            // details Tab
            $detail_hazard_custom = $data['detail_hazard'];
            $detail_hazard_tab = GetSubTabId($db, 'hazarddetails', $language_id);
            $all_details_fields = [];
            for ($i = 0; $i < count($detail_hazard_custom); $i++) {
                if (isset($detail_hazard_custom[$i]["id"]) && $detail_hazard_custom[$i]["id"] != NULL) {
                    array_push($all_details_fields, $detail_hazard_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_details_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_hazard.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $detail_hazard_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteCustomField($db, $res);
            }
            
            // people Tab
            $people_hazard_custom = $data['people_hazard'];
            $people_hazard_tab = GetSubTabId($db, 'people', $language_id);
            $all_people_fields = [];
            for ($i = 0; $i < count($people_hazard_custom); $i++) {
                if (isset($people_hazard_custom[$i]["id"]) && $people_hazard_custom[$i]["id"] != NULL) {
                    array_push($all_people_fields, $people_hazard_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_people_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_hazard.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $people_hazard_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteCustomField($db, $res);
            }
            
            // action Tab
            $action_hazard_custom = $data['action_hazard'];
            $action_hazard_tab = GetSubTabId($db, 'actions', $language_id);
            $all_action_fields = [];
            for ($i = 0; $i < count($action_hazard_custom); $i++) {
                if (isset($action_hazard_custom[$i]["id"]) && $action_hazard_custom[$i]["id"] != NULL) {
                    array_push($all_action_fields, $action_hazard_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_action_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_hazard.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $action_hazard_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteCustomField($db, $res);
            }
            
            AddTabCustomField($db, $org_id, $language_id, $user_id, $what_hazard_tab,'WhatHappened', $what_hazard_custom);
            AddTabCustomField($db, $org_id, $language_id, $user_id, $detail_hazard_tab,'hazarddetails', $detail_hazard_custom);
            AddTabCustomField($db, $org_id, $language_id, $user_id, $people_hazard_tab,'people', $people_hazard_custom);
            AddTabCustomField($db, $org_id, $language_id, $user_id, $action_hazard_tab,'actions', $action_hazard_custom);
            
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    
    $app->post('/getHazardTabCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $sub_tab_name = $data['tab_name'];
            $sub_tab_id = GetSubTabId($db, $sub_tab_name, $language_id);
            $query = "SELECT * FROM stellarhse_hazard.field where org_id =:org_id and language_id=:language_id and sub_tab_id=:sub_tab_id order by `order` asc";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $org_id);
            $stmt->bindParam(':language_id', $language_id);
            $stmt->bindParam(':sub_tab_id', $sub_tab_id);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $customs = [];
            foreach ($result as $key => $custom_field) {

                $component = GetFieldTypeName($db, $custom_field->field_type_id, $language_id);
                if ($custom_field->is_mandatory == 1) {
                    $IsMandatory = true;
                } else {
                    $IsMandatory = false;
                }
                $query2 = "select option_id ,option_name  from stellarhse_hazard.`option` where field_id=:field_id";
                $stmt2 = $db->prepare($query2);
                $stmt2->bindParam(':field_id', $custom_field->field_id);
                $stmt2->execute();
                $result2 = $stmt2->fetchAll(PDO::FETCH_OBJ);

                if ($result2 != NULL) {
                    $options = [];
                    foreach ($result2 as $option) {
                        array_push($options, $option->option_name);
                    }

                    $field = [
                        'id' => $custom_field->field_id,
                        'component' => $component,
                        'label' => $custom_field->default_field_label,
                        'description' => $custom_field->default_help_me_description,
                        'placeholder' => $custom_field->default_help_me_name,
                        'options' => $options,
                        required => $IsMandatory
                    ];
                } else {
                    $options_array = [];
                    $field = [
                        'id' => $custom_field->field_id,
                        'component' => $component,
                        'label' => $custom_field->default_field_label,
                        'description' => $custom_field->default_help_me_description,
                        'placeholder' => $custom_field->default_help_me_name,
                        'options' => $options_array,
                        required => $IsMandatory
                    ];
                }
                array_push($customs, $field);
            }
            return $this->response->withJson($customs);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    
   
});

function GetHazardFieldsValues($db, $hazard_id, $org_id) {
    try {
        $query = "call stellarhse_hazard.emails_data(:hazard_id, :org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':hazard_id', $hazard_id);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $stmt->nextRowSet();
        $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->equipment_involved = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->impact_types = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->risk_levels = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->risk_controls = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->hazard_details = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->customFields = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->attachments = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $result;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function InsertIntoHazardHistory($db, $hazard_id, $client_timezone, $updated_by_id, $operation_type) {
    try {
        $query = "call stellarhse_hazard.sp_move_hazard_to_hist(:hazard_id, :client_timezone, :updated_by_id, :operation_type)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':hazard_id', $hazard_id);
        $stmt->bindParam(':client_timezone', $client_timezone);
        $stmt->bindParam(':updated_by_id', $updated_by_id);
        $stmt->bindParam(':operation_type', $operation_type);
        $stmt->execute();
        $result = $stmt->rowCount();
        return $result;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function getHazardData($db, $data) {
    $query = "call stellarhse_hazard.reload_data(:report_number,:org_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_number", $data['report_number']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
    $stmt->nextRowSet();
    $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->equipment_involved = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->impact_types = $stmt->fetchAll(PDO::FETCH_OBJ);
/*    $stmt->nextRowSet();
    $result->risk_levels = $stmt->fetchAll(PDO::FETCH_OBJ)[0];*/
    $stmt->nextRowSet();
    $result->risk_controls = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->hazard_details = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetHazardVersion($db, $data) {
    $query2 = "select max(version_number) from stellarhse_hazard.hazard where hazard_number = :hazard_number";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":hazard_number", $data['report_number']);
    $stmt2->execute();
    $version_number = $stmt2->fetchColumn();
    return $version_number;
}

function GetHazardIdByNumber($db, $data) {
    $query2 = "select distinct hazard_id as report_id from stellarhse_hazard.hazard where hazard_number = :hazard_number  and org_id= :org_id ORDER BY last_update_date desc limit  1";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":hazard_number", $data['report_number']);
    $stmt2->bindParam(":org_id", $data['org_id']);
    $stmt2->execute();
    $report_id = $stmt2->fetchColumn();
    return $report_id;
}

function sp_update_version_file_manager_hazard($db, $report_id, $clientTimeZoneOffset, $edit_by) {
    $query = "call stellarhse_hazard.sp_update_version_file_manager(:report_id,:clientTimeZoneOffset,:edit_by,'update');";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_id", $report_id);
    $stmt->bindParam(":clientTimeZoneOffset", $clientTimeZoneOffset);
    $stmt->bindParam(":edit_by", $edit_by);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetHistHazardData($db, $org_id, $hazard_number, $version_number) {
    $query = "select hist_hazard_id from stellarhse_hazard.hist_hazard where org_id=:org_id and hazard_number=:hazard_number and version_number=:version_number";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":org_id", $org_id);
    $stmt->bindParam(":hazard_number", $hazard_number);
    $stmt->bindParam(":version_number", $version_number);
    $stmt->execute();
    $hist_hazard_id = $stmt->fetchColumn();
    return $hist_hazard_id;
}

function ReplaceHazardCorrectiveActionsParamters($db, $report_data, $report_values, $ca, $index) {
    try {
        $corrective_action_replace = '
            <ul style="list-style-type: circle;">
                <li>Report Number: $hazard_number</li>
                <li>Event type : $haz_type_name</li>
                <li>Date: $hazard_date</li>
            ';
        
        $corrective_action_replace = str_replace("$" . "hazard_number", $report_data['report_number'] . '<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "haz_type_name", $report_values->haz_type_name . '<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "hazard_date", $report_values->date . '<br/>', $corrective_action_replace);
        
        $action_custom = new stdClass();
        // Custom fields
        foreach($report_values->customFields as $key=>$value){
            if(strpos($value->field_name, 'actions') === 0)
                $action_custom->{$value->field_name} = $value->field_value;
        }
        
        $query = "select of.field_label, f.table_field_name, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id',$report_data['org_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        foreach($res as $key2=>$f){
            if($f->field_name === 'notified_id'){
                $notifiedNames = '';
                foreach ($ca['notified_to'] as $notify) {
                    $notifiedNames .= $notify['full_name'] . ',';
                }
                $corrective_action_replace .= "<li>".$f->field_label." ".$notifiedNames."</li>";
            }else{
                if($f->is_custom === 'Yes')
                    $corrective_action_replace .= "<li>".$f->field_label . " " . $action_custom->{$f->field_name} . "</li>";
                else 
                if(isset($report_values->correctiveActions[$index]->{$f->table_field_name}))
                    $corrective_action_replace .=  "<li>".$f->field_label." ".$report_values->correctiveActions[$index]->{$f->table_field_name}."</li>";
                else
                    $corrective_action_replace .=  "<li>".$f->field_label." </li>";
            }
        }
        $corrective_action_replace .= ' </ul>';
        return $corrective_action_replace;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function InsertIntoHazardEmailLog($db, $email_log_id, $report_data) {
    try {
        $query = "INSERT INTO stellarhse_hazard.`hazard_email_log`
                            (email_log_id, hist_hazard_id)
                        VALUES (:email_log_id,:hist_hazard_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id', $email_log_id);
        $stmt->bindParam(':hist_hazard_id', $report_data->hist_report_id);
        $stmt->execute();
        $result = $stmt->rowCount();
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function ReplaceHazardReportParamters($db, $report_data, $report_values, $email_body, $notification) {
    $whoIdentified = $report_data['whoIdentified'];
    $email_body = str_replace("$" . "number", $report_data['report_number'], $email_body);
    $email_body = str_replace("$" . "haz_type_name", $report_values->haz_type_name, $email_body);
    $email_body = str_replace("$" . "hazard_date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "hour", $report_data['report_hour'] . ':', $email_body);
    $email_body = str_replace("$" . "min", $report_data['report_min'], $email_body);
    $email_body = str_replace("$" . "rep_name", $whoIdentified['full_name'], $email_body);
    $email_body = str_replace("$" . "rep_emp_id", $whoIdentified['emp_id'], $email_body);
    $email_body = str_replace("$" . "rep_position", $whoIdentified['position'], $email_body);
    $email_body = str_replace("$" . "rep_email", $whoIdentified['email'], $email_body);
    $email_body = str_replace("$" . "rep_company", $whoIdentified['org_name'], $email_body);
    $email_body = str_replace("$" . "rep_primary_phone", $whoIdentified['primary_phone'], $email_body);
    $email_body = str_replace("$" . "rep_alternate_phone", $whoIdentified['alternate_phone'], $email_body);
    $email_body = str_replace("$" . "rep_crew", $whoIdentified['crew_name'], $email_body);
    $email_body = str_replace("$" . "rep_department", $whoIdentified['department'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor", $whoIdentified['supervisor_name'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor_notify ", $whoIdentified['rep_supervisor_notify '], $email_body);
    $email_body = str_replace("$" . "hazard_desc", $report_data['report_description'], $email_body);
    $email_body = str_replace("$" . "location1_name", $report_values->location1_id, $email_body);
    $email_body = str_replace("$" . "location2_name", $report_values->location2_id, $email_body);
    $email_body = str_replace("$" . "location3_name", $report_values->location3_id, $email_body);
    $email_body = str_replace("$" . "location4_name", $report_values->location4_id, $email_body);
    $email_body = str_replace("$" . "other_location", $report_data['hazard_other_location'], $email_body);
    $email_body = str_replace("$" . "crew_name", $report_values->crew_name, $email_body);
    $email_body = str_replace("$" . "department_responsible_name", $report_values->department_responsible_name, $email_body);
    $email_body = str_replace("$" . "status_name", $report_values->status_id, $email_body);
    $email_body = str_replace("$" . "creator_name", $report_values->creator_name, $email_body);
    $email_body = str_replace("$" . "operation_type_name", $report_values->operation_type_name, $email_body);
    $email_body = str_replace("$" . "date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "description", $report_data['report_description'], $email_body);
    if($report_values->cont_cust_name !== '' && $report_values->cont_cust_name !== null){
        if($report_values->sponser_id !== '' && $report_values->sponser_id !== null)
            $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name.', '.$report_values->sponser_id, $email_body);
        else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name, $email_body);
    }else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name, $email_body);

    // Risk level part
//    $risk_level = 0;
//    foreach ($report_values->risk_levels as $level) {
//        $risk_level += $level->risk_level_value;
//        if($level->risk_level == 'hazard_exist')
//            $email_body = str_replace("$" . "probability_of_hazard", $level->risk_level_value, $email_body);
//        else if($level->risk_level == 'worker_exposure')
//            $email_body = str_replace("$" . "frequency_of_worker_exposure", $level->risk_level_value, $email_body);
//        else if($level->risk_level == 'potential_consequences')
//            $email_body = str_replace("$" . "severity_of_potential_consequences", $level->risk_level_value, $email_body);
//    }
//    if(count($report_values->risk_levels) === 0){
//        $email_body = str_replace("$" . "probability_of_hazard", '', $email_body);
//        $email_body = str_replace("$" . "frequency_of_worker_exposure", '', $email_body);
//        $email_body = str_replace("$" . "severity_of_potential_consequences", '', $email_body);
//    }
    $email_body = str_replace("$" . "risk_level_value", $report_values->risk_levels[0]->risk_level_result.'/25', $email_body);
    
    if($report_data['should_work_stopped'] == 1)
        $email_body = str_replace("$" . "should_work_stopped", 'Yes', $email_body);
    else if($report_data['should_work_stopped'] == 0)
        $email_body = str_replace("$" . "should_work_stopped", 'No', $email_body);
    else
        $email_body = str_replace("$" . "should_work_stopped", '', $email_body);

    $email_body = str_replace("$" . "initial_action_token", $report_data['initial_action_token'], $email_body);
    $email_body = str_replace("$" . "hazard_status_id", $report_values->status_id, $email_body);

    $people_custom = new stdClass();
    $action_custom = new stdClass();
    // Custom fields
    foreach($report_values->customFields as $key=>$value){
        if(strpos($value->field_name, 'people') === 0)
            $people_custom->{$value->field_name} = $value->field_value;
        else if(strpos($value->field_name, 'actions') === 0)
            $action_custom->{$value->field_name} = $value->field_value;
        else
            $email_body = str_replace('$'.$value->field_name, $value->field_value, $email_body);
    }
    
    // Hazard details part
    $hazarddetails = '';
    $causedetails = '';
    foreach($report_values->hazard_details as $key=>$type){
        if($type->classification_type === 'hazard'){
            $hazarddetails .= $type->type.": ".$type->sub_type;
            if($key !== count($report_values->hazard_details) - 1)
                $hazarddetails .= '<br/>';
        }else{
            $causedetails .= $type->type.": ".$type->sub_type;
            if($key !== count($report_values->hazard_details) - 1)
                $causedetails .= '<br/>';
        }
    }
    $email_body = str_replace("$" . "effects_type_name", $hazarddetails, $email_body);
    $email_body = str_replace("$" . "hazard_note", $report_data['hazard_note'], $email_body);
    $email_body = str_replace("$" . "cause_types_name", $causedetails, $email_body);
    $email_body = str_replace("$" . "hazard_cause_note", $report_data['hazard_cause_note'], $email_body);
    $email_body = str_replace("$" . "recommended_corrective_actions_summary", $report_data['recommended_corrective_actions_summary'], $email_body);

    // Risk Control part
    $risk_control = '';
    foreach ($report_values->risk_controls as $key => $control) {
        $risk_control .= $control->risk_control_id;
        if ($key !== count($report_values->risk_controls) - 1)
            $risk_control .= ', ';
    }
    $email_body = str_replace("$" . "risk_control_name", $risk_control, $email_body);

    $email_body = str_replace("$" . "version_number", $report_data['version_number'], $email_body);
    $email_body = str_replace("$" . "modifier_id", '', $email_body);
    $email_body = str_replace("$" . "hazard_suspected_cause", $report_data['report_suspected_cause'], $email_body);
    $email_body = str_replace("$" . "are_additional_corrective_actions_required", $report_values->are_additional_corrective_actions_required, $email_body);
    $email_body = str_replace("$" . "potential_impacts_desc", $report_data['potential_impacts_desc'], $email_body);

    // Potential impacts part
    $impacts = '';
    foreach ($report_values->impact_types as $key => $impact) {
        $impacts .= $impact->potential_impact_of_hazard;
        if ($key !== count($report_values->impact_types) - 1)
            $impacts .= ', ';
    }
    $email_body = str_replace("$" . "impact_type_name", $impacts, $email_body);

    // email footer
    $email_body = str_replace("$" . "Site_Url", SITE_URL, $email_body);
    $email_body = str_replace("$" . "Organization_AdminName", $notification[0]->first_name . ' ' . $notification[0]->last_name, $email_body);
    $email_body = str_replace("$" . "Organization_AdminEmail", $notification[0]->email, $email_body);
    $email_body = str_replace("$" . "Organization_AdminPhone", $notification[0]->primary_phone, $email_body);

    // replace people involved block
    $people_index = strpos($email_body, '$PersonInvolved_Start', 0);
    $people_index2 = strpos($email_body, '$PersonInvolved_End', 0);
    if ($people_index) {
        $body11 = substr($email_body, 0, $people_index);
        $body12 = substr($email_body, $people_index + 1, $people_index2 - 1);
        $body13 = substr($email_body, $people_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$PersonInvolved_End', '', $body13);
        $query = "select of.field_label, f.table_field_name, s.sub_tab_label, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'People' and of.org_id = :org_id order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id', $report_data['org_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        $people = $report_values->peopleInvolved;
        $body12 = $res[0]->sub_tab_label . "<br/>";
        foreach ($people as $key => $person) {
            foreach ($res as $key2 => $f) {
//                if($person->{$f->table_field_name} === 0)
//                    $body12 .= $f->field_label . " <br/>";
//                else
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $people_custom->{$f->field_name} . "<br/>";
                else if(isset($person->{$f->table_field_name}))
                    $body12 .= $f->field_label . " " . $person->{$f->table_field_name} . "<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                if($key === count($res)-1)
//                    $body12 .= "</li>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11 . $body12 . $body13;
    }
    
    // replace equipment part
    $equip = $report_values->equipment_involved;
    $equip_index = strpos($email_body, '$Equipment_Start', 0);
    $equip_index2 = strpos($email_body, '$Equipment_End', 0);
    if($equip_index){
        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where f.field_name = 'equipment_id' and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body11 = substr($email_body, 0, $equip_index);
        $body12 = substr($email_body, $equip_index+1, $equip_index2-1);
        $body13 = substr($email_body, $equip_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$Equipment_End', '', $body13);

        $body12 =  $res[0]->field_label." ";
        foreach($equip as $key=>$eq){
            $body12 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    // replace customer part
    $cust = $report_values->report_third_party;
    $cust_index = strpos($email_body, '$Customer_Start', 0);
    $cust_index2 = strpos($email_body, '$Customer_End', 0);
    if($cust_index){
        $body11 = substr($email_body, 0, $cust_index);
        $body12 = substr($email_body, $cust_index+1, $cust_index2-1);
        $body13 = substr($email_body, $cust_index2);
        $body13 = str_replace('$Customer_End', '', $body13);

        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'customer_id' or f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
        foreach($cust as $key=>$c){
            if($c->third_party_type_code === 'Customer'){
                $body12 .=  $res[0]->field_label." ".$c->third_party."<br/>".$res[1]->field_label.' '.$c->jop_number."<br/>".$res[2]->field_label.' '.$c->contact_name."<br/>";
            }
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace contractor part
    $cont = $report_values->report_third_party;
    $cont_index = strpos($email_body, '$Contractor_Start', 0);
    $cont_index2 = strpos($email_body, '$Contractor_End', 0);
    if($cont_index){
        $body11 = substr($email_body, 0, $cont_index);
        $body12 = substr($email_body, $cont_index+1, $cont_index2-1);
        $body13 = substr($email_body, $cont_index2);
        $body13 = str_replace('$Contractor_End', '', $body13);

        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'contractor_id' or f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
        foreach($cont as $key=>$c){
            if($c->third_party_type_code === 'Contractor'){
                $body12 .=  $res[0]->field_label." ".$c->third_party."<br/>".$res[1]->field_label.' '.$c->jop_number."<br/>".$res[2]->field_label.' '.$c->contact_name."<br/>";
            }
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace attachments part
    $attachments = $report_values->attachments;
    $attachment_index = strpos($email_body, '$SupportingDocuments_Start', 0);
    $attachment_index2 = strpos($email_body, '$SupportingDocuments_End', 0);
    if($attachment_index){
        $body11 = substr($email_body, 0, $attachment_index);
        $body12 = substr($email_body, $attachment_index+1, $attachment_index2-1);
        $body13 = substr($email_body, $attachment_index2);
        $body13 = str_replace('$SupportingDocuments_End', '', $body13);
        
        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'attachment_name' or f.field_name = 'attachment_size') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
//        print_r($attachments);
        foreach($attachments as $key=>$att){
            $body12 .=  $res[0]->field_label." ".$att->attachment_name."<br/>".$res[1]->field_label.' '.$att->attachment_size."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace corrective action part
    $actions = $report_values->correctiveActions;
    $action_index = strpos($email_body, '$Action_Start', 0);
    $action_index2 = strpos($email_body, '$Action_End', 0);
    if($action_index){
        $body11 = substr($email_body, 0, $action_index);
        $body12 = substr($email_body, $action_index+1, $action_index2-1);
        $body13 = substr($email_body, $action_index2);
        $body13 = str_replace('$Action_End', '', $body13);

        $query = "select of.field_label, f.table_field_name, s.sub_tab_label, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($actions as $key=>$action){
            foreach($res as $key2=>$f){
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $action_custom->{$f->field_name} . "<br/>";
                else if(isset($action->{$f->table_field_name}))
                    $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                        if($key === count($res)-1)
//                            $body1 .= "</li>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    $index = strpos($email_body, "</ul>", 0);
    $body1 = substr($email_body, 0, $index);
    $body2 = substr($email_body, $index);
//    $email_body = str_replace("</ul>", "", $email_body);
    foreach ($notification as $field) {
//        print_r($field);
        if($field->field_name === 'equipment_id'){
            if(!$equip_index){
                $equip = $report_values->equipment_involved;
                $equip_index = strpos($email_body, '$Equipment_Start', 0);
                $equip_index2 = strpos($email_body, '$Equipment_End', 0);
                if($equip_index){
                    $body11 = substr($email_body, 0, $equip_index);
                    $body12 = substr($email_body, $equip_index+1, $equip_index2-1);
                    $body13 = substr($email_body, $equip_index2);
            //        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
                    $body13 = str_replace('$Equipment_End', '', $body13);

                    $body12 =  $field->field_label." ";
                    foreach($equip as $key=>$eq){
                        $body12 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name;
                        $body12 .=  "<br/>";
                    }
                    $email_body = $body11.$body12.$body13;
                    $index = strpos($email_body, "</ul>", 0);
                    $body1 = substr($email_body, 0, $index);
                    $body2 = substr($email_body, $index);
                }else{
                    $body1 .=  "<li>".$field->field_label." ";
                    foreach($equip as $key=>$eq){
                        $body1 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name;
                        if($key === count($equip)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'customer_id'){
            if(!$cust_index){
                $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cust = $report_values->report_third_party;
                foreach($cust as $key=>$c){
                    if($c->third_party_type_code === 'Customer'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cust)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'contractor_id'){
            if(!$cont_index){
                $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cont = $report_values->report_third_party;
                foreach($cont as $key=>$c){
                    if($c->third_party_type_code === 'Contractor'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cont)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'CorrectiveActionsHeader'){
            if(!$action_index){
                $query = "select of.field_label, f.table_field_name, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id order by f.`order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $actions = $report_values->correctiveActions;
                $body1 .=  "<li>".$field->field_label."<br/>";
                foreach($actions as $key=>$action){
                    foreach($res as $key2=>$f){
                        if($f->is_custom === 'Yes')
                            $body12 .= $f->field_label . " " . $action_custom->{$f->field_name} . "<br/>";
                        else if(isset($action->{$f->table_field_name}))
                            $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
                        else
                            $body12 .= $f->field_label . " <br/>";
    //                        if($key === count($res)-1)
    //                            $body1 .= "</li>";
                    }
                    $body1 .= "<br/>";
                }
            }
        } else
        if ($field->field_name === 'location1_id' || $field->field_name === 'location2_id' || $field->field_name === 'location3_id' || $field->field_name === 'location4_id')
            $body1 .= "<li>" . $field->field_label . " " . $report_values->{$field->field_name} . "</li>";
        else if($field->field_name === 'risk_level'){
            $risk_level = 0;
            foreach ($report_values->risk_levels as $level) {
                $risk_level += $level->risk_level_value;
            }
            $body1 .= "<li>" . $field->field_label . " " . $risk_level . "</li>";
        }
        else
            $body1 .= "<li>" . $field->field_label . " " . $report_values->{$field->table_field_name} . "</li>";
    }
    $email_body = $body1 . $body2;
    return $email_body;
//    }
}



function ReplaceHazardReportParamtersDoc($db,$post_data, $report_data, $report_values, $email_body,$is_custom) {
    if($is_custom == 1){
        foreach($report_values->customFields as $custom_field){
            if (strpos($email_body, $custom_field->field_name) !== false) {
                $email_body = str_replace("$" . $custom_field->field_name, $custom_field->field_value, $email_body);
            }
        } 
    }
    $email_body = str_replace("$" . "number", $report_data->hazard_number, $email_body);
    $email_body = str_replace("$" . "haz_type_name", $report_values->haz_type_name, $email_body);
    $email_body = str_replace("$" . "hazard_date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "hour", $report_data->report_hour, $email_body);
    $email_body = str_replace("$" . "min", $report_data->report_min, $email_body);
    $email_body = str_replace("$" . "rep_name", $report_data->rep_name, $email_body);
    $email_body = str_replace("$" . "rep_emp_id", $report_data->rep_emp_id, $email_body);
    $email_body = str_replace("$" . "rep_position", $report_data->rep_position, $email_body);
    $email_body = str_replace("$" . "rep_email",$report_data->rep_email, $email_body);
    $email_body = str_replace("$" . "rep_company", $report_data->rep_company, $email_body);
    $email_body = str_replace("$" . "rep_primary_phone", $report_data->rep_primary_phone, $email_body);
    $email_body = str_replace("$" . "rep_alternate_phone", $report_data->rep_alternate_phone, $email_body);
    $email_body = str_replace("$" . "rep_crew", $report_data->rep_crew, $email_body);
    $email_body = str_replace("$" . "rep_department",$report_data->rep_department, $email_body);
    $email_body = str_replace("$" . "rep_supervisor", $report_data->rep_supervisor, $email_body);
    $email_body = str_replace("$" . "rep_supervisor_notify ", $report_data->rep_supervisor_notify, $email_body);
    
    $email_body = str_replace("$" . "hazard_desc", $report_data->report_description, $email_body);
    $email_body = str_replace("$" . "location1_name", $report_values->location1_id, $email_body);
    $email_body = str_replace("$" . "location2_name", $report_values->location2_id, $email_body);
    $email_body = str_replace("$" . "location3_name", $report_values->location3_id, $email_body);
    $email_body = str_replace("$" . "location4_name", $report_values->location4_id, $email_body);
    $email_body = str_replace("$" . "other_location", $report_data->other_location, $email_body);
    $email_body = str_replace("$" . "crew_name", $report_values->crew_name, $email_body);
    $email_body = str_replace("$" . "department_responsible_name", $report_values->department_responsible_name, $email_body);
    $email_body = str_replace("$" . "status_name", $report_values->status_id, $email_body);
    $email_body = str_replace("$" . "creator_name", $report_values->creator_name, $email_body);
    $email_body = str_replace("$" . "operation_type_name", $report_values->operation_type_name, $email_body);
    $email_body = str_replace("$" . "date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "description", $report_data->report_description, $email_body);
    
    
    
    // replace contractor & Customer part
    if($report_values->report_third_party){
        foreach($report_values->report_third_party as $key=>$c){
            if (strpos($email_body, 'contractor_id') !== false) {
                if($c->third_party_type_code === 'Contractor'){
                    $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'contractor_id' or f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':org_id',$post_data['org_id']);
                    $stmt->execute();
                    $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                    $email_body = '';
                    foreach($report_values->report_third_party as $key=>$c){
                        if($c->third_party_type_code === 'Contractor'){
                            $email_body .=  $res[0]->field_label." ".$c->third_party."<w:br/>".$res[1]->field_label.' '.$c->jop_number."<w:br/>".$res[2]->field_label.' '.$c->contact_name."<w:br/>";
                        }
                    }
                }
            }
            if($c->third_party_type_code === 'Customer'){
                if (strpos($email_body, 'customer_id') !== false) {
                    $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'customer_id' or f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':org_id',$post_data['org_id']);
                    $stmt->execute();
                    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
                    $email_body = '';
                    foreach($report_values->report_third_party as $key=>$c){
                        if($c->third_party_type_code === 'Customer'){
                            $email_body .=  $res[0]->field_label." ".$c->third_party."<w:br/>".$res[1]->field_label.' '.$c->jop_number."<w:br/>".$res[2]->field_label.' '.$c->contact_name."<w:br/>";
                        }
                    }
                }
            }
        }
    }else{
        $email_body = str_replace("$" . "contractor_id", '', $email_body);
        $email_body = str_replace("$" . "customer_id", '', $email_body);
    }
    if (strpos($email_body, 'contractor_jop_number') !== false) {
        return '';
    }
    if (strpos($email_body, 'contractor_contact_name') !== false) {
        return '';
    }
    if (strpos($email_body, 'customer_contact_name') !== false) {
        return '';
    }
    if (strpos($email_body, 'customer_job_number') !== false) {
        return '';
    }
    
    
    
    // replace equipment part
    if($report_values->equipment_involved){
        if (strpos($email_body, 'equipment_name') !== false) {
            $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where f.field_name = 'equipment_id' and of.org_id = :org_id order by `order`";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id',$post_data['org_id']);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_OBJ);
            $email_body = "";
            foreach($report_values->equipment_involved as $key=>$eq){
                $email_body .=  $res[0]->field_label." " . $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name."<w:br/>";
            }
            return $email_body;
        }
    }else{
        $email_body = str_replace("$" . "equipment_name", '', $email_body);
    }
    if (strpos($email_body, 'equipment_number') !== false) {
        return '';
    }
    if (strpos($email_body, 'equipment_type') !== false) {
        return '';
    }
    if (strpos($email_body, 'equipment_category_name') !== false) {
        return '';
    }
    
      // Risk Control part
    if (strpos($email_body, 'risk_control_id') !== false) {
        $risk_control = '';
        foreach ($report_values->risk_controls as $key => $control) {
            $risk_control .= $control->risk_control_id;
            if ($key !== count($report_values->risk_controls) - 1)
                $risk_control .= ', ';
        }
        if($risk_control){
            $email_body = str_replace("$" . "risk_control_id", $risk_control, $email_body);
            return $email_body;
        }else{
            return '';
        }
        
    }
    if( strpos($email_body, 'risk_level') !== false){
        if($report_values->risk_levels[0]->risk_level_result ){
            $email_body = str_replace("$" . "risk_level", $report_values->risk_levels[0]->risk_level_result.'/25', $email_body);
        }else{
            return '';
        }
    }
    if (strpos($email_body, 'hist_id') !== false) {
        return '';
    }
    

    $email_body = str_replace("$" . "version_number", $report_data->version_number, $email_body);
    $email_body = str_replace("$" . "modifier_id", '', $email_body);
    $email_body = str_replace("$" . "hazard_suspected_cause", $report_data->report_suspected_cause, $email_body);
    $email_body = str_replace("$" . "are_additional_corrective_actions_required", $report_values->are_additional_corrective_actions_required, $email_body);
    $email_body = str_replace("$" . "potential_impacts_desc", $report_data->potential_impacts_desc, $email_body);
    $email_body = str_replace("$" . "recommended_corrective_actions_summary", $report_data->recommended_corrective_actions_summary, $email_body);
    $email_body = str_replace("$" . "should_work_stopped", $report_data->should_work_stopped, $email_body);
    $email_body = str_replace("$" . "report_owner", $report_data->report_owner, $email_body);
    

    return $email_body;
    exit;
    
//    
//    
    if($report_values->cont_cust_name !== '' && $report_values->cont_cust_name !== null){
        if($report_values->sponser_id !== '' && $report_values->sponser_id !== null)
            $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name.', '.$report_values->sponser_id, $email_body);
        else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name, $email_body);
    }else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name, $email_body);

    $email_body = str_replace("$" . "risk_level_value", $report_values->risk_levels[0]->risk_level_result.'/25', $email_body);
    
    if($report_data['should_work_stopped'] == 1)
        $email_body = str_replace("$" . "should_work_stopped", 'Yes', $email_body);
    else if($report_data['should_work_stopped'] == 0)
        $email_body = str_replace("$" . "should_work_stopped", 'No', $email_body);
    else
        $email_body = str_replace("$" . "should_work_stopped", '', $email_body);

    $email_body = str_replace("$" . "initial_action_token", $report_data['initial_action_token'], $email_body);
    $email_body = str_replace("$" . "hazard_status_id", $report_values->status_id, $email_body);

    $people_custom = new stdClass();
    $action_custom = new stdClass();
    // Custom fields
    foreach($report_values->customFields as $key=>$value){
        if(strpos($value->field_name, 'people') === 0)
            $people_custom->{$value->field_name} = $value->field_value;
        else if(strpos($value->field_name, 'actions') === 0)
            $action_custom->{$value->field_name} = $value->field_value;
        else
            $email_body = str_replace('$'.$value->field_name, $value->field_value, $email_body);
    }
    
    // Hazard details part
    $hazarddetails = '';
    $causedetails = '';
    foreach($report_values->hazard_details as $key=>$type){
        if($type->classification_type === 'hazard'){
            $hazarddetails .= $type->type.": ".$type->sub_type;
            if($key !== count($report_values->hazard_details) - 1)
                $hazarddetails .= '<br/>';
        }else{
            $causedetails .= $type->type.": ".$type->sub_type;
            if($key !== count($report_values->hazard_details) - 1)
                $causedetails .= '<br/>';
        }
    }
    $email_body = str_replace("$" . "effects_type_name", $hazarddetails, $email_body);
    $email_body = str_replace("$" . "hazard_note", $report_data['hazard_note'], $email_body);
    $email_body = str_replace("$" . "cause_types_name", $causedetails, $email_body);
    $email_body = str_replace("$" . "hazard_cause_note", $report_data['hazard_cause_note'], $email_body);
    $email_body = str_replace("$" . "recommended_corrective_actions_summary", $report_data['recommended_corrective_actions_summary'], $email_body);

  
    // Potential impacts part
    $impacts = '';
    foreach ($report_values->impact_types as $key => $impact) {
        $impacts .= $impact->potential_impact_of_hazard;
        if ($key !== count($report_values->impact_types) - 1)
            $impacts .= ', ';
    }
    $email_body = str_replace("$" . "impact_type_name", $impacts, $email_body);

    // email footer
    $email_body = str_replace("$" . "Site_Url", SITE_URL, $email_body);
    $email_body = str_replace("$" . "Organization_AdminName", $notification[0]->first_name . ' ' . $notification[0]->last_name, $email_body);
    $email_body = str_replace("$" . "Organization_AdminEmail", $notification[0]->email, $email_body);
    $email_body = str_replace("$" . "Organization_AdminPhone", $notification[0]->primary_phone, $email_body);

    // replace people involved block
    $people_index = strpos($email_body, '$PersonInvolved_Start', 0);
    $people_index2 = strpos($email_body, '$PersonInvolved_End', 0);
    if ($people_index) {
        $body11 = substr($email_body, 0, $people_index);
        $body12 = substr($email_body, $people_index + 1, $people_index2 - 1);
        $body13 = substr($email_body, $people_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$PersonInvolved_End', '', $body13);
        $query = "select of.field_label, f.table_field_name, s.sub_tab_label, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'People' and of.org_id = :org_id order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id', $report_data['org_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        $people = $report_values->peopleInvolved;
        $body12 = $res[0]->sub_tab_label . "<br/>";
        foreach ($people as $key => $person) {
            foreach ($res as $key2 => $f) {
//                if($person->{$f->table_field_name} === 0)
//                    $body12 .= $f->field_label . " <br/>";
//                else
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $people_custom->{$f->field_name} . "<br/>";
                else if(isset($person->{$f->table_field_name}))
                    $body12 .= $f->field_label . " " . $person->{$f->table_field_name} . "<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                if($key === count($res)-1)
//                    $body12 .= "</li>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11 . $body12 . $body13;
    }
    
    // replace equipment part
    $equip = $report_values->equipment_involved;
    $equip_index = strpos($email_body, '$Equipment_Start', 0);
    $equip_index2 = strpos($email_body, '$Equipment_End', 0);
    if($equip_index){
        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where f.field_name = 'equipment_id' and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body11 = substr($email_body, 0, $equip_index);
        $body12 = substr($email_body, $equip_index+1, $equip_index2-1);
        $body13 = substr($email_body, $equip_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$Equipment_End', '', $body13);

        $body12 =  $res[0]->field_label." ";
        foreach($equip as $key=>$eq){
            $body12 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    // replace customer part
    $cust = $report_values->report_third_party;
    $cust_index = strpos($email_body, '$Customer_Start', 0);
    $cust_index2 = strpos($email_body, '$Customer_End', 0);
    if($cust_index){
        $body11 = substr($email_body, 0, $cust_index);
        $body12 = substr($email_body, $cust_index+1, $cust_index2-1);
        $body13 = substr($email_body, $cust_index2);
        $body13 = str_replace('$Customer_End', '', $body13);

        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'customer_id' or f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
        foreach($cust as $key=>$c){
            if($c->third_party_type_code === 'Customer'){
                $body12 .=  $res[0]->field_label." ".$c->third_party."<br/>".$res[1]->field_label.' '.$c->jop_number."<br/>".$res[2]->field_label.' '.$c->contact_name."<br/>";
            }
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace attachments part
    $attachments = $report_values->attachments;
    $attachment_index = strpos($email_body, '$SupportingDocuments_Start', 0);
    $attachment_index2 = strpos($email_body, '$SupportingDocuments_End', 0);
    if($attachment_index){
        $body11 = substr($email_body, 0, $attachment_index);
        $body12 = substr($email_body, $attachment_index+1, $attachment_index2-1);
        $body13 = substr($email_body, $attachment_index2);
        $body13 = str_replace('$SupportingDocuments_End', '', $body13);
        
        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'attachment_name' or f.field_name = 'attachment_size') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
//        print_r($attachments);
        foreach($attachments as $key=>$att){
            $body12 .=  $res[0]->field_label." ".$att->attachment_name."<br/>".$res[1]->field_label.' '.$att->attachment_size."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace corrective action part
    $actions = $report_values->correctiveActions;
    $action_index = strpos($email_body, '$Action_Start', 0);
    $action_index2 = strpos($email_body, '$Action_End', 0);
    if($action_index){
        $body11 = substr($email_body, 0, $action_index);
        $body12 = substr($email_body, $action_index+1, $action_index2-1);
        $body13 = substr($email_body, $action_index2);
        $body13 = str_replace('$Action_End', '', $body13);

        $query = "select of.field_label, f.table_field_name, s.sub_tab_label, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($actions as $key=>$action){
            foreach($res as $key2=>$f){
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $action_custom->{$f->field_name} . "<br/>";
                else if(isset($action->{$f->table_field_name}))
                    $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                        if($key === count($res)-1)
//                            $body1 .= "</li>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    $index = strpos($email_body, "</ul>", 0);
    $body1 = substr($email_body, 0, $index);
    $body2 = substr($email_body, $index);
//    $email_body = str_replace("</ul>", "", $email_body);
    foreach ($notification as $field) {
//        print_r($field);
        if($field->field_name === 'equipment_id'){
            if(!$equip_index){
                $equip = $report_values->equipment_involved;
                $equip_index = strpos($email_body, '$Equipment_Start', 0);
                $equip_index2 = strpos($email_body, '$Equipment_End', 0);
                if($equip_index){
                    $body11 = substr($email_body, 0, $equip_index);
                    $body12 = substr($email_body, $equip_index+1, $equip_index2-1);
                    $body13 = substr($email_body, $equip_index2);
            //        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
                    $body13 = str_replace('$Equipment_End', '', $body13);

                    $body12 =  $field->field_label." ";
                    foreach($equip as $key=>$eq){
                        $body12 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name;
                        $body12 .=  "<br/>";
                    }
                    $email_body = $body11.$body12.$body13;
                    $index = strpos($email_body, "</ul>", 0);
                    $body1 = substr($email_body, 0, $index);
                    $body2 = substr($email_body, $index);
                }else{
                    $body1 .=  "<li>".$field->field_label." ";
                    foreach($equip as $key=>$eq){
                        $body1 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name;
                        if($key === count($equip)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'customer_id'){
            if(!$cust_index){
                $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cust = $report_values->report_third_party;
                foreach($cust as $key=>$c){
                    if($c->third_party_type_code === 'Customer'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cust)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'contractor_id'){
            if(!$cont_index){
                $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cont = $report_values->report_third_party;
                foreach($cont as $key=>$c){
                    if($c->third_party_type_code === 'Contractor'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cont)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } else if($field->field_name === 'CorrectiveActionsHeader'){
            if(!$action_index){
                $query = "select of.field_label, f.table_field_name, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id join stellarhse_hazard.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id order by f.`order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $actions = $report_values->correctiveActions;
                $body1 .=  "<li>".$field->field_label."<br/>";
                foreach($actions as $key=>$action){
                    foreach($res as $key2=>$f){
                        if($f->is_custom === 'Yes')
                            $body12 .= $f->field_label . " " . $action_custom->{$f->field_name} . "<br/>";
                        else if(isset($action->{$f->table_field_name}))
                            $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
                        else
                            $body12 .= $f->field_label . " <br/>";
    //                        if($key === count($res)-1)
    //                            $body1 .= "</li>";
                    }
                    $body1 .= "<br/>";
                }
            }
        } else
        if ($field->field_name === 'location1_id' || $field->field_name === 'location2_id' || $field->field_name === 'location3_id' || $field->field_name === 'location4_id')
            $body1 .= "<li>" . $field->field_label . " " . $report_values->{$field->field_name} . "</li>";
        else if($field->field_name === 'risk_level'){
            $risk_level = 0;
            foreach ($report_values->risk_levels as $level) {
                $risk_level += $level->risk_level_value;
            }
            $body1 .= "<li>" . $field->field_label . " " . $risk_level . "</li>";
        }
        else
            $body1 .= "<li>" . $field->field_label . " " . $report_values->{$field->table_field_name} . "</li>";
    }
    $email_body = $body1 . $body2;
    return $email_body;
//    }
}

 function generateHazardDocReport($path,$db,$data){
     $phpWord = new \PhpOffice\PhpWord\PhpWord();
     
            $section = $phpWord->addSection();
            $header = $section->createHeader();
            $footer = $section->createFooter();
            
            $headerStyle['name'] = 'Arial Narrow';
            $headerStyle['size'] = 16;
            $headerStyle['bold'] = true;
            $headerStyle['align'] = 'right';
            $dateStyle['name'] = 'Arial Narrow';
            $dateStyle['size'] = 14;
            $dateStyle['bold'] = false;
            $footerStyle['name'] = 'Arial Narrow';
            $footerStyle['size'] = 11;
            $footerStyle['bold'] = true;
            $cellTextStyle['name'] = 'Arial Narrow';
            $cellTextStyle['size'] = 10;
            $cellTextStyle['bold'] = false;
            $boldRight['bold'] = true;
            $boldRight['align'] = 'right';
            $imageStyle = array(
                'align' => 'left',
                'wrappingStyle' => 'inline',
            );
            $cellStyle = array(
                'marginTop' => 20,
                'marginLeft' => 20,
            );
            
            $lineStyle = array(
                'weight' => 1,
                'width' => 450,
                'height' => 0,
                'align' => 'center'
            );
            $lineFooterStyle = array(
                'weight' => 1,
                'width' => 450,
                'height' => 0,
                'align' => 'center',
                'dash'=> \PhpOffice\PhpWord\Style\Line::DASH_STYLE_LONG_DASH_DOT_DOT,
            );
            
            $footer->addLine($lineFooterStyle);
            $table = $header->addTable('headerTable',array( 'align' => 'center'));
            $table->addRow();
            $styleTable = array('marginTop'=>20, 'borderSize' => 18, 'borderColor' => '006699');

            $table_footer = $footer->addTable('headerTable',$styleTable);
            $table_footer->addRow();
            
        try {
            $query = "select * from " . $data["dbname"] . ".field inner join " . $data["dbname"] . ".template_field on field.field_id = template_field.field_id "
                    . " where template_field.template_id=:template_id  and field.is_custom =0 order by field.`order` ASC;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":template_id", $data['template_id']);
            $stmt->execute();
            $fields = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            $query_custom = "select * from " . $data["dbname"] . ".field inner join " . $data["dbname"] . ".template_field on field.field_id = template_field.field_id "
                    . " where template_field.template_id=:template_id  and field.is_custom =1 order by field.`order` ASC;";
            $stmt_cutom = $db->prepare($query_custom);
            $stmt_cutom->bindParam(":template_id", $data['template_id']);
            $stmt_cutom->execute();
            $fields_custom = $stmt_cutom->fetchAll(PDO::FETCH_OBJ);
            $query2 = "select sub_tab_id from " . $data["dbname"] . ".sub_tab where language_id=:language_id  order by sub_tab.`order` ASC;";
            $stmt2 = $db->prepare($query2);
            $stmt2->bindParam(":language_id", $data['language_id']);
            $stmt2->execute();
            $fields_array = [];
            $sub_tabs = $stmt2->fetchAll(PDO::FETCH_OBJ);
            foreach ($sub_tabs as $sub_tab) {
                $fields_array[$sub_tab->sub_tab_id]['fields']=[];
                $fields_array[$sub_tab->sub_tab_id]['custom'] =[];
            }
            
            foreach ($fields as $field) {
                array_push($fields_array[$field->sub_tab_id]['fields'], $field);
            }
            foreach ($fields_custom as $field) {
                array_push($fields_array[$field->sub_tab_id]['custom'], $field);
            }
            $template_body ="";
            $report_data = getHazardData($db, $data);
            $report_values = GetHazardFieldsValues($db,  $data["report_id"], $data["org_id"]);
            
            $cell = $table->addCell(8000);
            $logoPath ='/data/logo/' . $data['org_id'] . '.gif';
            
            $cell->addImage($logoPath, $imageStyle);
            $cell2 = $table->addCell(8000, array('valign' => 'top'));
            $fieldLabel1 = $data['report_type'] ."#: ". $data['report_number'] ;
            $fieldLabel2 = "Date Report Generated :";
            $fieldLabel3 = "Generated by : ".$data['created_by'];
            $cell2->addText($fieldLabel1, $headerStyle, array('align' => 'right'));
            $cell2->addText($fieldLabel2 . " " . date("m/d/Y"), $dateStyle, array('align' => 'right'));
            $cell2->addText($fieldLabel3, $headerStyle, array('align' => 'right'));
            $header->addLine($lineStyle);
            $stellar_path ='resources/images/abcantrack.jpg';
            $cell_footer = $table_footer->addCell(10000, $cellStyle);
            $textrun = $cell_footer->createTextRun();
            $textrun->addText('IMPORTANT: ', array('bold' => true));
            $textrun->addText('The entire content of this report is confidential. The reader accepts full responsibility for protecting the information contained within and ensuring it is handled in compliance with company policy and jurisdictional law governing privacy and intellectual property.', $cellTextStyle, array('align' => 'left'));
            $cell2_footer =$table_footer->addCell(1000);
            $cell2_footer->addImage($stellar_path,array('width'=>120, 'height'=>35, 'align'=>'left'));
            $cell2_footer->addPreserveText('Page' .' {PAGE} ' .'of'. ' {NUMPAGES}', $footerStyle, $boldRight);
            foreach($fields_array as $key =>$field_arr){
                if($field_arr['fields'] !=NULL || $field_arr['custom'] !=NULL ){
                    $query_tab = "select sub_tab_label from " . $data["dbname"] . ".sub_tab where sub_tab_id=:sub_tab_id;";
                    $stmt_tab = $db->prepare($query_tab);
                    $stmt_tab->bindParam(":sub_tab_id", $key);
                    $stmt_tab->execute();
                    $sub_tab_res = $stmt_tab->fetchAll(PDO::FETCH_OBJ);
                    $sub_tab_name =$sub_tab_res[0]->sub_tab_label;
                    $fontStyleName = 'oneUserDefinedStyle';
                    $phpWord->addFontStyle(
                        $fontStyleName,
                        array('name' => 'Tahoma', 'size' => 14, 'color' => 'dd4b39', 'bold' => true)
                    );
                    $section->addText(
                        $sub_tab_name,
                        $fontStyleName
                    );
                    if($field_arr['fields'] !=NULL){
                        foreach($field_arr['fields'] as $field_val){
                            $report_replace = ReplaceHazardReportParamtersDoc($db,$data, $report_data , $report_values, $field_val->default_field_label ." $".$field_val->field_name ,'0');
                            if($report_replace!= ""){
                                $section->addText(
                                    $report_replace,
                                    array('name' => 'Tahoma', 'size' => 10)
                                );
                            }
                        }
                    }
                    if($field_arr['custom'] !=NULL){
                        foreach($field_arr['custom'] as $field_val){
                            $report_replace = ReplaceHazardReportParamtersDoc($db,$data, $report_data , $report_values, $field_val->default_field_label ." $".$field_val->field_name,1);
                            if($report_replace!= ""){
                                $section->addText(
                                    $report_replace,
                                    array('name' => 'Tahoma', 'size' => 10)
                                );
                            }
                        }
                    }
                    $section->addLine($lineStyle);
                    
                }
                
            }     
            $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $objWriter->save($path);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    }


function GetSubTabId($db, $tab_name, $language_id) {
    $query = "select sub_tab_id,sub_tab_name from stellarhse_hazard.sub_tab where field_code= :field_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_code', $tab_name);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0]->sub_tab_id;
}

function GetFieldTypeId($db, $field_code, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_code= :field_type_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_code', $field_code);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0];
}

function GetFieldTypeName($db, $field_id, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_id= :field_type_id and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_id', $field_id);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    switch ($res[0]->field_type_code) {
        case 'textbox':
            $field_type_name = 'textInput';
            break;
        case 'textarea':
            $field_type_name = 'textArea';
            break;
        case 'checkbox':
            $field_type_name = 'checkbox';
            break;
        case 'radiobutton':
            $field_type_name = 'radio';
            break;
        case 'select':
            $field_type_name = 'select';
            break;
        case 'calendar':
            $field_type_name = 'date';
            break;
    }
    return $field_type_name;
}

function DeleteCustomField($db, $array_fields) {
    foreach ($array_fields as $value) {
        $field_id = $value->field_id;
        $query = "delete from  stellarhse_hazard.favorite_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.template_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.field_value  WHERE option_id IN (SELECT option_id FROM stellarhse_hazard.`option` WHERE field_id =  :field_id);";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.field_value  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.`option`  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.org_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_hazard.favorite_field 
            where favorite_table_id in(SELECT favorite_table_id from stellarhse_hazard.favorite_table  WHERE order_by_id = :field_id); ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_hazard.favorite_table  WHERE order_by_id = :field_id; ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_hazard.field where field_id = :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $res = true;
    }
}

function DeleteFieldOptions($db, $array_options) {
    foreach ($array_options as $value) {
        $option_id = $value->option_id;
        $query = "delete FROM stellarhse_hazard.`option` WHERE option_id =  :option_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":option_id", $option_id);
        $stmt->execute();
    }
}

function AddTabCustomField($db, $org_id, $language_id, $user_id, $sub_tab_id,$tab_name, $custom_array) {

    if ($custom_array != NULL) {
        for ($i = 0; $i < count($custom_array); $i++) {
            switch ($custom_array[$i]['component']) {
                case 'textInput':
                    $fieldType = GetFieldTypeId($db, 'textbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'textArea':
                    $fieldType = GetFieldTypeId($db, 'textarea', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'checkbox':
                    $fieldType = GetFieldTypeId($db, 'checkbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'radio':
                    $fieldType = GetFieldTypeId($db, 'radiobutton', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'select':
                    $fieldType = GetFieldTypeId($db, 'select', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'date':
                    $fieldType = GetFieldTypeId($db, 'calendar', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
            }

            $IsEditable = 1;
            $IsCustom = 1;
            $IsHidden = 0;
            if ($custom_array[$i]["required"] == true) {
                $IsMandatory = 1;
            } else {
                $IsMandatory = 0;
            }
            $field_name = $tab_name."_". $field_type_code . "_" . $custom_array[$i]["index"];


            if (isset($custom_array[$i]["id"]) && $custom_array[$i]["id"] != NULL) {
                $query = "UPDATE stellarhse_hazard.field
                               SET  default_field_label =:default_field_label,
                                    field_name=:field_name,
                                    default_help_me_name =:default_help_me_name,
                                    `order`             =:order,
                                    default_help_me_description =:default_help_me_description,
                                    is_mandatory=:is_mandatory,
                                    editing_by=:editing_by
                                    WHERE field_id = :field_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":default_field_label", $custom_array[$i]["label"]);
                $stmt->bindParam(":field_name", $field_name);
                $stmt->bindParam(":default_help_me_name", $custom_array[$i]["placeholder"]);
                $stmt->bindParam(":default_help_me_description", $custom_array[$i]["description"]);
                $stmt->bindParam(":order", $custom_array[$i]["index"]);
                $stmt->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt->bindParam(":editing_by", $user_id);
                $stmt->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt->execute();
                $query_check_field_in_org = "select * from  stellarhse_hazard.org_field WHERE org_id= :org_id  and field_id= :field_id";
                $stmt_check_field_in_org = $db->prepare($query_check_field_in_org);
                $stmt_check_field_in_org->bindParam(":org_id", $org_id);
                $stmt_check_field_in_org->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt_check_field_in_org->execute();
                $res_check_field = $stmt_check_field_in_org->fetchAll(PDO::FETCH_OBJ);
                if($res_check_field !=NULL){
                    $query_org_field ="UPDATE  stellarhse_hazard.org_field
                                    SET  field_label         = :field_label,
                                        is_mandatory        = :is_mandatory,
                                        is_hidden           = :is_hidden,
                                        help_me_name         = :help_me_name,
                                        help_me_description  = :help_me_description
                                    WHERE org_id             = :org_id  
                                      and field_id           = :field_id";
                    $stmt_org_field = $db->prepare($query_org_field);
                    $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                    $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                    $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                    $stmt_org_field->bindParam(":org_id", $org_id);
                    $stmt_org_field->bindParam(":field_id", $custom_array[$i]["id"]);
                    $stmt_org_field->execute();
                }else{
                    $query_org_field = "INSERT INTO stellarhse_hazard.org_field
                                  (org_id,field_id,field_label,help_me_name,help_me_description,is_mandatory,is_hidden)
                              VALUES
                                  (:org_id,:field_id,:field_label,:help_me_name,:help_me_description,:is_mandatory,:is_hidden)";
                    $stmt_org_field = $db->prepare($query_org_field);
                    $stmt_org_field->bindParam(":org_id", $org_id);
                    $stmt_org_field->bindParam(":field_id", $custom_array[$i]["id"]);
                    $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                    $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                    $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                    $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                    $stmt_org_field->execute();

                }
                if (isset($custom_array[$i]["options"]) && $custom_array[$i]["options"] != NULL) {
                    $count = 0;
                    if ($custom_array[$i]["options"] != NULL) {
                        $count = count($custom_array[$i]["options"]) - 1;
                        //                            $options = '("'.implode('", "', $custom_array[$i]["options"]).'");';
                        //                            $query_delete_option = "select * from stellarhse_hazard.`option` where field_id=:field_id and option_name NOT IN $options";

                        $query_delete_option = "select * from stellarhse_hazard.`option` where field_id=:field_id and `order` > :count";
                        $stmt_delete_option = $db->prepare($query_delete_option);
                        $stmt_delete_option->bindParam(":field_id", $custom_array[$i]["id"]);
                        $stmt_delete_option->bindParam(":count", $count);
                        $stmt_delete_option->execute();
                        $field_options = $stmt_delete_option->fetchAll(PDO::FETCH_OBJ);
                        //                            var_dump($field_options);
                        if ($field_options != NULL) {
                            DeleteFieldOptions($db, $field_options);
                        }
                        $option_order = 0;
                        foreach ($custom_array[$i]["options"] as $option) {
                            //                                $query_check_option ="select option_id from stellarhse_hazard.`option` where field_id=:field_id and option_name =:option_name";

                            $query_check_option = "select option_id from stellarhse_hazard.`option` where field_id=:field_id and `order` =:order";
                            $stmt_check_option = $db->prepare($query_check_option);
                            $stmt_check_option->bindParam(":field_id", $custom_array[$i]["id"]);
                            $stmt_check_option->bindParam(":order", $option_order);
                            $stmt_check_option->execute();
                            $option_data = $stmt_check_option->fetchAll(PDO::FETCH_OBJ);
                            if ($option_data != NULL) {
                                $option_data[0]->option_id;
                                $query_add_option = "UPDATE stellarhse_hazard.option
                                                    SET  option_name=:option_name,
                                                        `order` =:order
                                                        WHERE option_id = :option_id";

                                $stmt_add_option = $db->prepare($query_add_option);
                                $stmt_add_option->bindParam(":option_id", $option_data[0]->option_id);
                                $stmt_add_option->bindParam(":option_name", $option);
                                $stmt_add_option->bindParam(":order", $option_order);
                                $stmt_add_option->execute();
                            } else {
                                $option_id = Utils::getUUID($db);
                                $query_option = "INSERT INTO stellarhse_hazard.option
                                               (option_id,option_name,field_id,`order`)
                                           VALUES
                                                (:option_id,:option_name,:field_id,:order)";
                                $stmt_option = $db->prepare($query_option);
                                $stmt_option->bindParam(":option_id", $option_id);
                                $stmt_option->bindParam(":option_name", $option);
                                $stmt_option->bindParam(":field_id", $custom_array[$i]["id"]);
                                $stmt_option->bindParam(":order", $option_order);
                                $stmt_option->execute();
                            }
                            $option_order ++;
                        }
                    }
                }
            } else {
                // insert new custom field
                $field_id = Utils::getUUID($db);
                $query = "INSERT INTO stellarhse_hazard.field
                                  (field_id,language_id,field_name,default_field_label,field_type_id,org_id,sub_tab_id, is_editable,default_help_me_name,default_help_me_description,is_mandatory,is_custom,`order`)
                              VALUES
                                  (:field_id,:language_id,:field_name,:default_field_label,:field_type_id,:org_id,:sub_tab_id,:IsEditable ,:default_help_me_name,:default_help_me_description,:is_mandatory,:is_custom,:order)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":field_id", $field_id);
                $stmt->bindParam(":language_id", $language_id);
                $stmt->bindParam(":field_name", $field_name);
                $stmt->bindParam(":default_field_label", $custom_array[$i]["label"]);
                $stmt->bindParam(":field_type_id", $field_type_id);
                $stmt->bindParam(":org_id", $org_id);
                $stmt->bindParam(":sub_tab_id", $sub_tab_id);
                $stmt->bindParam(":IsEditable", $IsEditable, PDO::PARAM_BOOL);
                $stmt->bindParam(":default_help_me_name", $custom_array[$i]["placeholder"]);
                $stmt->bindParam(":default_help_me_description", $custom_array[$i]["description"]);
                $stmt->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt->bindParam(":is_custom", $IsCustom, PDO::PARAM_BOOL);
                $stmt->bindParam(":order", $custom_array[$i]["index"]);
                $stmt->execute();
                $query_org_field = "INSERT INTO stellarhse_hazard.org_field
                                  (org_id,field_id,field_label,help_me_name,help_me_description,is_mandatory,is_hidden)
                              VALUES
                                  (:org_id,:field_id,:field_label,:help_me_name,:help_me_description,:is_mandatory,:is_hidden)";
                $stmt_org_field = $db->prepare($query_org_field);
                $stmt_org_field->bindParam(":org_id", $org_id);
                $stmt_org_field->bindParam(":field_id", $field_id);
                $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                $stmt_org_field->execute();

                if (isset($custom_array[$i]["options"]) && $custom_array[$i]["options"] != NULL) {
                    $order = 0;
                    foreach ($custom_array[$i]["options"] as $value) {
                        $option_id = Utils::getUUID($db);
                        $query_option = "INSERT INTO stellarhse_hazard.option
                                       (option_id,option_name,field_id,`order`)
                                   VALUES
                                        (:option_id,:option_name,:field_id,:order)";
                        $stmt_option = $db->prepare($query_option);
                        $stmt_option->bindParam(":option_id", $option_id);
                        $stmt_option->bindParam(":option_name", $value);
                        $stmt_option->bindParam(":field_id", $field_id);
                        $stmt_option->bindParam(":order", $order);
                        $stmt_option->execute();
                        $order ++;
                    }
                }
            }
        }
    }
}
