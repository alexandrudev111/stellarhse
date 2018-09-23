<?php

$app->group('/api/v1', function() use($app) {
//    $app->post('/getsafetymeetingnumber', function($request, $response, $args) {
//        $data = $request->getParsedBody();
//        $db = $this->db;
//        try {
//            $query = "select max(safetymeeting_number) from stellarhse_safetymeeting.`safetymeeting` where org_id = :org_id";
//            $stmt = $db->prepare($query);
//            $stmt->bindParam(":org_id", $data['org_id']);
//            $stmt->execute();
//            $result = $stmt->fetchColumn();
//            if ($result === '' || $result === null) {
//                $result = 1;
//            } else {
//                $result += 1;
//            }
//            return $this->response->withJson($result);
//        } catch (Exception $ex) {
//            return $this->response->withJson($ex->errorInfo);
//        }
//    });

    $app->post('/getsafetymeetingtypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select safetymeeting_type_id as id,safetymeeting_type_name as name from "
                    . "stellarhse_safetymeeting.safetymeeting_event_type where org_id = :org_id and language_id= :language_id "
                    . "and `hide` = 0 order by `order`,safetymeeting_type_name";
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

    $app->post('/submitsafetymeetingreport', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $result = [];
        $db = $this->db;
        $whoIdentified = $data['whoIdentified'];
        if (isset($data['report_date'])) {
            $h_date = $data['report_date'];
            $safetymeeting_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        try {
            $db->beginTransaction();
            if ($data['process_type'] === 'edit') {
                $query = "select max(version_number) from stellarhse_safetymeeting.safetymeeting where safetymeeting_number = :safetymeeting_number and org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":safetymeeting_number", $data['safetymeeting_number']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $version_number = $stmt->fetchColumn();
                if ($version_number === '' || $version_number === null) {
                    $version_number = 1;
                } else {
                    $version_number += 1;
                }
                $safetymeeting_number = $data['safetymeeting_number'];
            } else {
                $query = "select max(safetymeeting_number) from stellarhse_safetymeeting.`safetymeeting` where org_id = :org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $safetymeeting_number = $stmt->fetchColumn();
                if ($safetymeeting_number === '' || $safetymeeting_number === null) {
                    $safetymeeting_number = 1;
                } else {
                    $safetymeeting_number += 1;
                }
                $version_number = 1;
            }

            $data['report_number'] = $safetymeeting_number;
            $data['version_number'] = $version_number;

            $safetymeeting_id = Utils::getUUID($db);
            $data['report_id'] = $safetymeeting_id;

            $query = "insert into stellarhse_safetymeeting.safetymeeting ("
                    . "safetymeeting_id,safetymeeting_type_id, org_id,report_owner,cont_cust_id,sponser_id,safetymeeting_date,safetymeeting_hour,safetymeeting_min,reporter_id,rep_name,rep_emp_id,rep_crew,"
                    . "rep_email,rep_position,rep_company,rep_primary_phone,rep_alternate_phone,rep_supervisor,location1_id,location2_id,"
                    . "location3_id,location4_id,crew_involved,operation_type_id,safetymeeting_description,creator_id,"
                    . "safetymeeting_number,safetymeeting_other_location,version_number,editing_by,modifier_id)"
                    . " values (:safetymeeting_id,:safetymeeting_type_id, :org_id,:report_owner,:cont_cust_id,:sponser_id,:safetymeeting_date,:safetymeeting_hour,:safetymeeting_min,:reporter_id,:rep_name,:rep_emp_id,:rep_crew,"
                    . ":rep_email,:rep_position,:rep_company,:rep_primary_phone,:rep_alternate_phone,:rep_supervisor,:location1_id,:location2_id,"
                    . ":location3_id,:location4_id,:crew_involved,:operation_type_id,:safetymeeting_description,:creator_id,"
                    . ":safetymeeting_number,:safetymeeting_other_location,:version_number,:editing_by,:modifier_id)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":safetymeeting_id", $safetymeeting_id);
            if (isset($data['report_type_id']) && $data['report_type_id'] !== '' && $data['report_type_id'] !== null)
            $stmt->bindParam(":safetymeeting_type_id", $data['report_type_id']);
            else
                return "Please choose type of safety meeting";
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":report_owner", $data['report_owner']);
            if (isset($data['cont_cust_id']) && $data['cont_cust_id'] !== '' && $data['cont_cust_id'] !== null)
                $stmt->bindParam(":cont_cust_id", $data['cont_cust_id']);
            else
                $stmt->bindValue(":cont_cust_id", NULL );
            if (isset($data['sponser_id']) && $data['sponser_id'] !== '' && $data['sponser_id'] !== null)
                $stmt->bindParam(":sponser_id", $data['sponser_id']);
            else
                $stmt->bindValue(":sponser_id", NULL );
            if (isset($safetymeeting_date))
                $stmt->bindParam(":safetymeeting_date", $safetymeeting_date);
            else
                $stmt->bindValue(":safetymeeting_date", NULL, PDO::PARAM_STR);
//            $stmt->bindParam(":safetymeeting_date", $safetymeeting_date);
            $stmt->bindParam(":safetymeeting_hour", $data['report_hour']);
            $stmt->bindParam(":safetymeeting_min", $data['report_min']);
            $stmt->bindParam(":reporter_id", $whoIdentified['employee_id']);
            $stmt->bindParam(":rep_name", $whoIdentified['full_name']);
            $stmt->bindParam(":rep_emp_id", $whoIdentified['emp_id']);
            $stmt->bindParam(":rep_crew", $whoIdentified['crew_id']);
            $stmt->bindParam(":rep_email", $whoIdentified['email']);
            $stmt->bindParam(":rep_position", $whoIdentified['position']);
            $stmt->bindParam(":rep_company", $whoIdentified['company']);
            $stmt->bindParam(":rep_primary_phone", $whoIdentified['primary_phone']);
            $stmt->bindParam(":rep_alternate_phone", $whoIdentified['alternate_phone']);
            $stmt->bindParam(":rep_supervisor", $whoIdentified['supervisor_name']);
            $stmt->bindParam(":location1_id", $data['location1']['location1_id']);
            $stmt->bindParam(":location2_id", $data['location2']['location2_id']);
            $stmt->bindParam(":location3_id", $data['location3']['location3_id']);
            $stmt->bindParam(":location4_id", $data['location4']['location4_id']);
            $stmt->bindParam(":crew_involved", $data['crew_id']);

            if (isset($data['operation_type_id']) && $data['operation_type_id'] !== '' && $data['operation_type_id'] !== null) {
                $stmt->bindParam(":operation_type_id", $data['operation_type_id']);
            } else {
                $stmt->bindValue(":operation_type_id", NULL);
            }

            $stmt->bindParam(":safetymeeting_description", $data['report_description']);
            $stmt->bindParam(":safetymeeting_number", $safetymeeting_number);
            $stmt->bindParam(":safetymeeting_other_location", $data['other_location']);
            $stmt->bindParam(":version_number", $version_number);
//            $stmt->bindValue(":is_deleted", 0);
            $stmt->bindValue(":editing_by", NULL);
            if ($data['process_type'] === 'edit') {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindParam(":modifier_id", $data['modifier_id']);
            } else {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindValue(":modifier_id", NULL);
            }
//            $stmt->bindValue(":hide", 0);
            $stmt->execute();
            $result = $stmt->rowCount();

            $safetymeeting_third_party = $data['report_third_party'];
            foreach ($safetymeeting_third_party as $person) {
                if (isset($person['third_party_id']) && $person['third_party_id'] !== '' && $person['third_party_id'] !== null){
                $safetymeeting_third_party_id = Utils::getUUID($db);
                $query = "insert into stellarhse_safetymeeting.`safetymeeting_third_party` "
                        . "(safetymeeting_third_party_id,safetymeeting_id,third_party_id ,jop_number,contact_name)"
                        . " values "
                        . "(:safetymeeting_third_party_id,:safetymeeting_id,:third_party_id,:jop_number,:contact_name)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":safetymeeting_third_party_id", $safetymeeting_third_party_id);
                $stmt->bindParam(":safetymeeting_id", $safetymeeting_id);
                    $stmt->bindParam(":third_party_id", $person['third_party_id']);
                $stmt->bindParam(":jop_number", $person['jop_number']);
                $stmt->bindParam(":contact_name", $person['contact_name']);

                $stmt->execute();
                $result = $stmt->rowCount();
                }
            }

            $peopleInvolved = $data['peopleInvolved'];
            foreach ($peopleInvolved as $person) {
                if ($person['title'] != '' && $person['title'] != 'New Person') {
                    $people_involved_id = Utils::getUUID($db);

                    $query = "insert into stellarhse_safetymeeting.`safetymeeting_people_involved` "
                            . "(people_involved_id,safetymeeting_id,people_id ,third_party_id,people_involved_name,company,supervisor,position,email,primary_phone,alternate_phone,"
                            . "exp_in_current_postion,exp_over_all,age,crew,how_he_involved,role_description,editing_by,hide,original_people_involved_id)"
                            . " values "
                            . "(:people_involved_id,:safetymeeting_id,:people_id,:third_party_id,:people_involved_name,:company,:supervisor,:position,:email,:primary_phone,:alternate_phone,"
                            . ":exp_in_current_postion,:exp_over_all,:age,:crew,:how_he_involved,:role_description,:editing_by,:hide,:original_people_involved_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":people_involved_id", $people_involved_id);
                    $stmt->bindParam(":safetymeeting_id", $safetymeeting_id);
                    if (isset($person['type']) && ($person['type'] == 'whoidentified' || $person['type'] == 'investigator') ) {
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
                    $stmt->bindParam(":company", $person['company']);
                    $stmt->bindParam(":supervisor", $person['supervisor_name']);
                    $stmt->bindParam(":position", $person['position']);
                    $stmt->bindParam(":email", $person['email']);
                    $stmt->bindParam(":primary_phone", $person['primary_phone']);
                    $stmt->bindParam(":alternate_phone", $person['alternate_phone']);
                    $exp_in_current_postion = intval($person['exp_in_current_postion']);
                    $stmt->bindParam(":exp_in_current_postion", $exp_in_current_postion);
                    $exp_over_all = intval($person['exp_over_all']) ; 
                    $stmt->bindParam(":exp_over_all", $exp_over_all);
                    $age = intval($person['age']);
                    $stmt->bindParam(":age", $age);
                    $stmt->bindParam(":crew", $person['crew']);
                    $stmt->bindParam(":how_he_involved", $person['how_he_involved']);
                    $stmt->bindParam(":role_description", $person['role_description']);
                    $stmt->bindValue(":editing_by", NULL);
                    $stmt->bindValue(":hide", 0);
                    if(isset($person['original_people_involved_id']) && $person['original_people_involved_id'] !='' && $person['original_people_involved_id']!=NULL){
                        $stmt->bindParam(":original_people_involved_id", $person['original_people_involved_id']);
                    }else{
                        $stmt->bindParam(":original_people_involved_id", $people_involved_id);
                    }
                    $stmt->execute();
                    $result = $stmt->rowCount();

                    $certificates = $person['certifications'];
                    foreach ($certificates as $certificate) {
                        if (isset($certificate['certificate_choice']) && $certificate['certificate_choice'] == true) {
                            $safetymeeting_certificate_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_safetymeeting.`safetymeeting_certificate` "
                                    . "(safetymeeting_certificate_id,people_involved_id,certificate_id)"
                                    . " values "
                                    . "(:safetymeeting_certificate_id,:people_involved_id,:certificate_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":safetymeeting_certificate_id", $safetymeeting_certificate_id);
                            $stmt->bindParam(":certificate_id", $certificate['certificate_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    $actingAs = $person['actingAs'];
                    foreach ($actingAs as $acting) {
                        if (isset($acting['acting_choice']) && $acting['acting_choice'] == true) {
                            $safetymeeting_acting_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_safetymeeting.safetymeeting_acting "
                                    . "(safetymeeting_acting_id,people_involved_id,acting_id)"
                                    . " values "
                                    . "(:safetymeeting_acting_id,:people_involved_id,:acting_id)";


                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":safetymeeting_acting_id", $safetymeeting_acting_id);
                            $stmt->bindParam(":acting_id", $acting['acting_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    
                    $person_custom = $person['peopleCustomField'];
                    if ($person_custom){
                        AddCustomFieldValues($db, $safetymeeting_id, $data['peopleCustomField'],'SafetyMeeting','People',$people_involved_id);
                    }
                }
            }

            $correctiveActions = $data['correctiveActions'];
            foreach ($correctiveActions as $action) {
                $corrective_action_id = Utils::getUUID($db);
                $start_date = $action['start_date'];
                $action_start_date = (isset($start_date) && $start_date != 'undefined' && $start_date != "") ? Utils::formatMySqlDate($start_date) : null;

                $target_end_date = $action['target_end_date'];
                $action_target_end_date = (isset($target_end_date) && $target_end_date != 'undefined' && $target_end_date != "") ? Utils::formatMySqlDate($target_end_date) : null;

                $actual_end_date = $action['actual_end_date'];
                $action_actual_end_date = (isset($actual_end_date) && $actual_end_date != 'undefined' && $actual_end_date != "") ? Utils::formatMySqlDate($actual_end_date) : null;

                $query = "insert into stellarhse_safetymeeting.safetymeeting_followup_action "
                        . "(safetymeeting_followup_action_id,safetymeeting_id,safetymeeting_followup_action_status_id,safetymeeting_followup_priority_id,assigned_to_id,supervisor,supervisor_notify,start_date,target_end_date,"
                        . "actual_end_date,estimated_cost,actual_cost,task_description,out_come_follow_up,desired_results,comments,original_corrective_action_id)"
                        . " values "
                        . "(:safetymeeting_followup_action_id,:safetymeeting_id,:safetymeeting_followup_action_status_id,:safetymeeting_followup_priority_id,:assigned_to_id,:supervisor,:supervisor_notify,:start_date,:target_end_date,"
                        . ":actual_end_date,:estimated_cost,:actual_cost,:task_description,:out_come_follow_up,:desired_results,:comments,:original_corrective_action_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":safetymeeting_followup_action_id", $corrective_action_id);
                $stmt->bindParam(":safetymeeting_id", $safetymeeting_id);
                $stmt->bindParam(":safetymeeting_followup_action_status_id", $action['corrective_action_status_id']);
                $stmt->bindParam(":safetymeeting_followup_priority_id", $action['corrective_action_priority_id']);
                $stmt->bindParam(":assigned_to_id", $action['assigned_to']['employee_id']);
                $stmt->bindParam(":supervisor", $action['assigned_to']['supervisor_name']);
                if ($action['supervisor_notify'])
                    $stmt->bindValue(":supervisor_notify", 1, PDO::PARAM_INT);
                else
                    $stmt->bindValue(":supervisor_notify", 0, PDO::PARAM_INT);
                $stmt->bindParam(":start_date", $action_start_date);
                $stmt->bindParam(":target_end_date", $action_target_end_date);
                $stmt->bindParam(":actual_end_date", $action_actual_end_date);
                $stmt->bindParam(":estimated_cost", $action['estimated_cost']);
                $stmt->bindParam(":actual_cost", $action['actual_cost']);
                $stmt->bindParam(":task_description", $action['task_description']);
                $stmt->bindParam(":out_come_follow_up", $action['out_come_follow_up']);
                if ($action['desired_results'] == '1')
                    $stmt->bindValue(":desired_results", 1, PDO::PARAM_INT);
                else
                    $stmt->bindValue(":desired_results", 0, PDO::PARAM_INT);
                $stmt->bindParam(":comments", $action['comments']);
                if(isset($action['original_corrective_action_id']) && $action['original_corrective_action_id'] !='' && $action['original_corrective_action_id']!=NULL){
                    $stmt->bindParam(":original_corrective_action_id", $action['original_corrective_action_id']);
                }else{
                    $stmt->bindParam(":original_corrective_action_id", $corrective_action_id);
                }
                $stmt->execute();
                $result = $stmt->rowCount();

                foreach ($action['notified_to'] as $notify) {
                    if (isset($notify['employee_id'])) {
                        $query = "insert into stellarhse_safetymeeting.safetymeeting_followup_action_notified "
                                . "(safetymeeting_followup_action_id,notified_id) values (:safetymeeting_followup_action_id,:notified_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":safetymeeting_followup_action_id", $corrective_action_id);
                        $stmt->bindParam(":notified_id", $notify['employee_id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
                
                $action_custom = $action['actionCustomField'];
                if ($action_custom){
                    AddCustomFieldValues($db, $safetymeeting_id, $action_custom,'SafetyMeeting','Actions',$corrective_action_id);
                }
            }
            $db->commit();
            
            AddCustomFieldValues($db, $safetymeeting_id, $data['whatCustomField'],'SafetyMeeting','SafetyMeeting','');
            
            if($data['process_type'] === 'add'){
                $res = InsertIntoSafetyMeetingHistory($db,$safetymeeting_id,$data['clientTimeZoneOffset'],$data['creator_id'],$data['process_type']);
                $report_values = GetSafetyMeetingFieldsValues($db,$safetymeeting_id,$data['org_id']);

                $query = "SELECT subject,`body` FROM stellarhse_safetymeeting.email_template where org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':org_id', $data['org_id']);
                $stmt->execute();
                $templates = $stmt->fetchAll(PDO::FETCH_OBJ);

                sleep(1);
                $version_number =1;
                $hist_safetymeeting_id = GetHistSafetymeetingData($db, $data['org_id'], $safetymeeting_number,$version_number);
                AddReportFile('safetymeeting', $hist_safetymeeting_id,$data['org_id'], $safetymeeting_number,$version_number,$db);
                // finish the submitting request & process the rest of this function in the background sodecrease consuming time for the user
                fastcgi_finish_request();
                // adding to history then sending corrective action emails & notification emails
                // sending report emails
                SendCorrectiveActionEmail($db, 'stellarhse_safetymeeting', $data, $report_values, $correctiveActions, $templates[0]);
                SendNotificationEmail($db, 'stellarhse_safetymeeting',$data,$report_values, $templates[1]);

            }
            if($data['process_type'] === 'edit'){
                $data['process_type'] = 'update';
                $res = InsertIntoSafetyMeetingHistory($db,$safetymeeting_id,$data['clientTimeZoneOffset'],$data['modifier_id'],$data['process_type']);
                sleep(1);
                $hist_safetymeeting_id = GetHistSafetymeetingData($db, $data['org_id'], $safetymeeting_number,$version_number);
                AddReportFile('safetymeeting', $hist_safetymeeting_id,$data['org_id'], $safetymeeting_number,$version_number,$db);

            }
//            return $this->response->withJson(1);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
        }
    });
    
            $app->post('/saveSafetymeetingCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $user_id = $data['user_id'];
            
            // what tab
            $what_safetymeeting_custom = $data['what_safetymeeting'];
            $what_safetymeeting_tab = GetSafetymeetingSubTabId($db, 'WhatHappened', $language_id);
            $all_what_fields = [];
            for ($i = 0; $i < count($what_safetymeeting_custom); $i++) {
                if (isset($what_safetymeeting_custom[$i]["id"]) && $what_safetymeeting_custom[$i]["id"] != NULL) {
                    array_push($all_what_fields, $what_safetymeeting_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_what_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_safetymeeting.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $what_safetymeeting_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteSafetymeetingCustomField($db, $res);
            }
            
            // people Tab
            $people_safetymeeting_custom = $data['people_safetymeeting'];
            $people_safetymeeting_tab = GetSafetymeetingSubTabId($db, 'people', $language_id);
            $all_people_fields = [];
            for ($i = 0; $i < count($people_safetymeeting_custom); $i++) {
                if (isset($people_safetymeeting_custom[$i]["id"]) && $people_safetymeeting_custom[$i]["id"] != NULL) {
                    array_push($all_people_fields, $people_safetymeeting_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_people_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_safetymeeting.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $people_safetymeeting_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteSafetymeetingCustomField($db, $res);
            }
            
            // action Tab
            $action_safetymeeting_custom = $data['action_safetymeeting'];
            $action_safetymeeting_tab = GetSafetymeetingSubTabId($db, 'actions', $language_id);
            $all_action_fields = [];
            for ($i = 0; $i < count($action_safetymeeting_custom); $i++) {
                if (isset($action_safetymeeting_custom[$i]["id"]) && $action_safetymeeting_custom[$i]["id"] != NULL) {
                    array_push($all_action_fields, $action_safetymeeting_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_action_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_safetymeeting.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $action_safetymeeting_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteSafetymeetingCustomField($db, $res);
            }
            
            AddSafetymeetingTabCustomField($db, $org_id, $language_id, $user_id, $what_safetymeeting_tab,'WhatHappened', $what_safetymeeting_custom);
            AddSafetymeetingTabCustomField($db, $org_id, $language_id, $user_id, $people_safetymeeting_tab,'people', $people_safetymeeting_custom);
            AddSafetymeetingTabCustomField($db, $org_id, $language_id, $user_id, $action_safetymeeting_tab,'actions', $action_safetymeeting_custom);
            
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    
    $app->post('/getSafetymeetingTabCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $sub_tab_name = $data['tab_name'];
            $sub_tab_id = GetSafetymeetingSubTabId($db, $sub_tab_name, $language_id);
            $query = "SELECT * FROM stellarhse_safetymeeting.field where org_id =:org_id and language_id=:language_id and sub_tab_id=:sub_tab_id order by `order` asc";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $org_id);
            $stmt->bindParam(':language_id', $language_id);
            $stmt->bindParam(':sub_tab_id', $sub_tab_id);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $customs = [];
            foreach ($result as $key => $custom_field) {

                $component = GetSafetymeetingFieldTypeName($db, $custom_field->field_type_id, $language_id);
                if ($custom_field->is_mandatory == 1) {
                    $IsMandatory = true;
                } else {
                    $IsMandatory = false;
                }
                $query2 = "select option_id ,option_name  from stellarhse_safetymeeting.`option` where field_id=:field_id";
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

function getSafetyMeetingData($db, $data) {
    $query = "call stellarhse_safetymeeting.safetymeeting_reload_data(:report_number,:org_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_number", $data['report_number']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
    $stmt->nextRowSet();
    $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetSafetymeetingVersion($db, $data){
    $query2 = "select max(version_number) from stellarhse_safetymeeting.safetymeeting where safetymeeting_number = :safetymeeting_number";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":safetymeeting_number", $data['report_number']);
    $stmt2->execute();
    $version_number = $stmt2->fetchColumn();
    return $version_number;
}


function GetSafetymeetingIdByNumber($db, $data){
    $query2 = "select distinct safetymeeting_id as report_id from stellarhse_safetymeeting.safetymeeting where safetymeeting_number = :safetymeeting_number  and org_id= :org_id  ORDER BY last_update_date desc limit  1";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":safetymeeting_number", $data['report_number']);
    $stmt2->bindParam(":org_id", $data['org_id']);
    $stmt2->execute();
    $report_id = $stmt2->fetchColumn();
    return $report_id;
}

function sp_update_version_file_manager_safetymeeting($db, $report_id,$clientTimeZoneOffset,$edit_by){
    $query = "call stellarhse_safetymeeting.sp_update_version_file_manager(:report_id,:clientTimeZoneOffset,:edit_by,'update');";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_id", $report_id);
    $stmt->bindParam(":clientTimeZoneOffset", $clientTimeZoneOffset);
    $stmt->bindParam(":edit_by", $edit_by);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetHistSafetymeetingData($db, $org_id,$safetymeeting_number,$version_number){
    $query = "select hist_safetymeeting_id from stellarhse_safetymeeting.hist_safetymeeting where org_id=:org_id and safetymeeting_number=:safetymeeting_number and version_number=:version_number";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":org_id", $org_id);
    $stmt->bindParam(":safetymeeting_number", $safetymeeting_number);
    $stmt->bindParam(":version_number", $version_number);
    $stmt->execute();
    $hist_safetymeeting_id = $stmt->fetchColumn();
    return $hist_safetymeeting_id;
}

function GetSafetyMeetingFieldsValues($db,$safetymeeting_id,$org_id){
    try{
        $query = "call stellarhse_safetymeeting.emails_data(:safetymeeting_id, :org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':safetymeeting_id', $safetymeeting_id);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $stmt->nextRowSet();
        $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $result;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function InsertIntoSafetyMeetingHistory($db,$safetymeeting_id,$client_timezone,$updated_by_id,$operation_type){
    try{
        $query = "call stellarhse_safetymeeting.sp_move_safetymeeting_to_hist(:safetymeeting_id, :client_timezone, :updated_by_id, :operation_type)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':safetymeeting_id', $safetymeeting_id);
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

function ReplaceSafetyMeetingCorrectiveActionsParamters($report_data, $report_values, $ca, $index){
    try{
        $corrective_action_block = '$Action_Start
            <ul style="list-style-type: circle;">
                <li>Report Number: $safetymeeting_number</li>
                <li>Event type : $safetymeeting_type_name</li>
                <li>Date (mm/dd/yyyy): $safetymeeting_date</li>
                <li>Priority: $corrective_action_priority_name</li>
                <li>Task Status: $corrective_action_status_name</li>
                <li>Person responsible: $assigned_to_id</li>
                <li>Who else was notified?: $notified_id</li>
                <li>Start date: $start_date</li>
                <li>Target end date: $target_end_date</li>
                <li>Actual end date: $actual_end_date</li>
                <li>Estimated cost: $estimated_cost</li>
                <li>Description of corrective action: $task_description</li>
                <li>Task outcome and follow-up: $out_come_follow_up</li>
                <li>Did the completed task achieve desired results?: $desired_results</li>
                <li>Comments: $comments</li>
            </ul>
        $Action_End';
        $corrective_action_block = str_replace("$" . "Action_Start", '', $corrective_action_block);
        $corrective_action_block = str_replace("$" . "Action_End", '', $corrective_action_block);
//    foreach($corrective_actions as $ca){
//    print_r($index);
//    print_r($ca);
//    print_r($report_data);
//    print_r($report_values);
//    print_r($report_values->correctiveActions[$index]);
        $corrective_action_replace = $corrective_action_block;
        $corrective_action_replace = str_replace("$" . "safetymeeting_number", $report_data['report_number'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "safetymeeting_type_name", $report_values->event_type_id.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "safetymeeting_date", $report_values->date.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "corrective_action_priority_name", $report_values->correctiveActions[$index]->corrective_action_priority_id.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "corrective_action_status_name", $report_values->correctiveActions[$index]->corrective_action_status_id.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "assigned_to_id", $ca['assigned_to']['full_name'].'<br/>', $corrective_action_replace);
        $notifiedNames = '';
        foreach($ca['notified_to'] as $notify){
            $notifiedNames .= $notify['full_name'].',';
        }
        $corrective_action_replace = str_replace("$" . "notified_id", $notifiedNames.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "start_date", $ca['start_date'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "target_end_date", $ca['target_end_date'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "actual_end_date", $ca['actual_end_date'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "estimated_cost", $ca['estimated_cost'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "task_description", $ca['task_description'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "out_come_follow_up", $ca['out_come_follow_up'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "desired_results", $report_values->correctiveActions[$index]->desired_results.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "comments", $ca['comments'].'<br/>', $corrective_action_replace);
        return $corrective_action_replace;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
//    }
}

function InsertIntoSafetyMeetingEmailLog($db, $email_log_id, $report_data){
    try{
        $query = "INSERT INTO stellarhse_safetymeeting.`safetymeeting_email_log`
                            (email_log_id, hist_safetymeeting_id)
                        VALUES (:email_log_id,:hist_safetymeeting_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id',$email_log_id);
        $stmt->bindParam(':hist_safetymeeting_id',$report_data->hist_report_id);
        $stmt->execute();
        $result = $stmt->rowCount();
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function ReplaceSafetyMeetingReportParamters($db, $report_data, $report_values, $email_body, $notification){
    $whoIdentified = $report_data['whoIdentified'];
    $email_body = str_replace("$" . "Action_Start", '', $email_body);
    $email_body = str_replace("$" . "Action_End", '', $email_body);
//    foreach($corrective_actions as $ca){
//    var_dump($ca);
//        $corrective_action_replace = $report_data;
    $email_body = str_replace("$" . "safetymeeting_number", $report_data['report_number'], $email_body);
    $email_body = str_replace("$" . "safetymeeting_type_name", $report_values->event_type_id, $email_body);
    $email_body = str_replace("$" . "safetymeeting_date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "safetymeeting_hour", $report_data['report_hour'].':', $email_body);
    $email_body = str_replace("$" . "safetymeeting_minute", $report_data['report_min'], $email_body);
    $email_body = str_replace("$" . "rep_name", $whoIdentified['full_name'], $email_body);
    $email_body = str_replace("$" . "rep_emp_id", $whoIdentified['emp_id'], $email_body);
    $email_body = str_replace("$" . "rep_position", $whoIdentified['position'], $email_body);
    $email_body = str_replace("$" . "rep_email", $whoIdentified['email'], $email_body);
    $email_body = str_replace("$" . "rep_company", $whoIdentified['org_name'], $email_body);
    $email_body = str_replace("$" . "rep_primary_phone", $whoIdentified['primary_phone'], $email_body);
    $email_body = str_replace("$" . "rep_alternate_phone", $whoIdentified['alternate_phone'], $email_body);
    $email_body = str_replace("$" . "rep_crew", $whoIdentified['crew_name'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor", $whoIdentified['supervisor_name'], $email_body);
    $email_body = str_replace("$" . "safetymeeting_description", $report_data['report_description'], $email_body);
    $email_body = str_replace("$" . "location1_name", $report_values->location1_id, $email_body);
    $email_body = str_replace("$" . "location2_name", $report_values->location2_id, $email_body);
    $email_body = str_replace("$" . "location3_name", $report_values->location3_id, $email_body);
    $email_body = str_replace("$" . "location4_name", $report_values->location4_id, $email_body);
    $email_body = str_replace("$" . "other_location", $report_data['other_location'], $email_body);
    
    $email_body = str_replace("$" . "version_number", $report_data['version_number'], $email_body);
    $email_body = str_replace("$" . "modifier_id", '', $email_body);
    
    $email_body = str_replace("$" . "Site_Url", SITE_URL, $email_body);
    $email_body = str_replace("$" . "Organization_AdminName", $notification[0]->first_name.' '.$notification[0]->last_name, $email_body);
    $email_body = str_replace("$" . "Organization_AdminEmail", $notification[0]->email, $email_body);
    $email_body = str_replace("$" . "Organization_AdminPhone", $notification[0]->primary_phone, $email_body);
    
    // replace peple involved block
    $people_index = strpos($email_body, '$PersonInvolved_Start', 0);
    $people_index2 = strpos($email_body, '$PersonInvolved_End', 0);
    if($people_index){
        $body11 = substr($email_body, 0, $people_index);
        $body12 = substr($email_body, $people_index+1, $people_index2-1);
        $body13 = substr($email_body, $people_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$PersonInvolved_End', '', $body13);
        $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_safetymeeting.org_field of join stellarhse_safetymeeting.field f on of.field_id = f.field_id join stellarhse_safetymeeting.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'People' and of.org_id = :org_id and f.is_custom = 0 order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id',$report_data['org_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        $people = $report_values->peopleInvolved;
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($people as $key=>$person){
            foreach($res as $key2=>$f){
                $body12 .=  $f->field_label." ".$person->{$f->table_field_name}."<br/>";
//                if($key === count($res)-1)
//                    $body12 .= "</li>";
            }
            $body12 .=  "<br/>";
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

        $query = "select of.field_label from stellarhse_safetymeeting.org_field of join stellarhse_safetymeeting.field f on of.field_id = f.field_id where (f.field_name = 'customer_id' or f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id',$report_data['org_id']);
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
            print_r('Contractor body ');
            print_r($body12);
        $body13 = substr($email_body, $cont_index2);
        $body13 = str_replace('$Contractor_End', '', $body13);

        $query = "select of.field_label from stellarhse_safetymeeting.org_field of join stellarhse_safetymeeting.field f on of.field_id = f.field_id where (f.field_name = 'contractor_id' or f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id',$report_data['org_id']);
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
    
    $index = strpos($email_body, "</ul>", 0);
    $body1 = substr($email_body, 0, $index);
    $body2 = substr($email_body, $index);
//    $email_body = str_replace("</ul>", "", $email_body);
    foreach($notification as $field){
        if($field->field_name === 'CorrectiveActionsHeader'){
            $query = "select of.field_label, f.table_field_name from stellarhse_safetymeeting.org_field of join stellarhse_safetymeeting.field f on of.field_id = f.field_id join stellarhse_safetymeeting.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id and f.is_custom = 0 order by f.`order`";
            $stmt = $db->prepare($query);
            $stmt->bindParam('org_id',$report_data['org_id']);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            $actions = $report_values->correctiveActions;
            $body1 .=  "<li>".$field->field_label."<br/>";
            foreach($actions as $key=>$action){
                foreach($res as $key2=>$f){
                    $body1 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
//                        if($key === count($res)-1)
//                            $body1 .= "</li>";
                }
                $body1 .= "<br/>";
            }
        } else
        if($field->field_name !== 'location1_id' && $field->field_name !== 'location2_id' && $field->field_name !== 'location3_id' && $field->field_name !== 'location4_id' && $field->field_name !== 'event_type_id')
        $body1 .=  "<li>".$field->field_label." ".$report_values->{$field->table_field_name}."</li>";
    }
    $email_body = $body1.$body2;
    return $email_body;
//    }
}
function GetSafetymeetingSubTabId($db, $tab_name, $language_id) {
    $query = "select sub_tab_id,sub_tab_name from stellarhse_safetymeeting.sub_tab where field_code= :field_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_code', $tab_name);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0]->sub_tab_id;
}

function GetSafetymeetingFieldTypeId($db, $field_code, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_code= :field_type_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_code', $field_code);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0];
}

function GetSafetymeetingFieldTypeName($db, $field_id, $language_id) {
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

function DeleteSafetymeetingCustomField($db, $array_fields) {
    foreach ($array_fields as $value) {
        $field_id = $value->field_id;
        $query = "delete from  stellarhse_safetymeeting.favorite_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.template_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.field_value  WHERE option_id IN (SELECT option_id FROM stellarhse_safetymeeting.`option` WHERE field_id =  :field_id);";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.field_value  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.`option`  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.org_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_safetymeeting.favorite_field 
            where favorite_table_id in(SELECT favorite_table_id from stellarhse_safetymeeting.favorite_table  WHERE order_by_id = :field_id); ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_safetymeeting.favorite_table  WHERE order_by_id = :field_id; ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_safetymeeting.field where field_id = :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $res = true;
    }
}

function DeleteSafetymeetingFieldOptions($db, $array_options) {
    foreach ($array_options as $value) {
        $option_id = $value->option_id;
        $query = "delete FROM stellarhse_safetymeeting.`option` WHERE option_id =  :option_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":option_id", $option_id);
        $stmt->execute();
    }
}

function AddSafetymeetingTabCustomField($db, $org_id, $language_id, $user_id, $sub_tab_id,$tab_name, $custom_array) {

    if ($custom_array != NULL) {
        for ($i = 0; $i < count($custom_array); $i++) {
            switch ($custom_array[$i]['component']) {
                case 'textInput':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'textbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'textArea':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'textarea', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'checkbox':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'checkbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'radio':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'radiobutton', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'select':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'select', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'date':
                    $fieldType = GetSafetymeetingFieldTypeId($db, 'calendar', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
            }

            $IsEditable = 1;
            $IsCustom = 1;
            if ($custom_array[$i]["required"] == true) {
                $IsMandatory = 1;
            } else {
                $IsMandatory = 0;
            }
            $field_name = $tab_name."_". $field_type_code . "_" . $custom_array[$i]["index"];


            if (isset($custom_array[$i]["id"]) && $custom_array[$i]["id"] != NULL) {
                $query = "UPDATE stellarhse_safetymeeting.field
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
                $query_check_field_in_org = "select * from  stellarhse_safetymeeting.org_field WHERE org_id= :org_id  and field_id= :field_id";
                $stmt_check_field_in_org = $db->prepare($query_check_field_in_org);
                $stmt_check_field_in_org->bindParam(":org_id", $org_id);
                $stmt_check_field_in_org->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt_check_field_in_org->execute();
                $res_check_field = $stmt_check_field_in_org->fetchAll(PDO::FETCH_OBJ);
                if($res_check_field !=NULL){
                    var_dump('$res_check_field');
                    $query_org_field ="UPDATE  stellarhse_safetymeeting.org_field
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
                    $query_org_field = "INSERT INTO stellarhse_safetymeeting.org_field
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
                        //                            $query_delete_option = "select * from stellarhse_safetymeeting.`option` where field_id=:field_id and option_name NOT IN $options";

                        $query_delete_option = "select * from stellarhse_safetymeeting.`option` where field_id=:field_id and `order` > :count";
                        $stmt_delete_option = $db->prepare($query_delete_option);
                        $stmt_delete_option->bindParam(":field_id", $custom_array[$i]["id"]);
                        $stmt_delete_option->bindParam(":count", $count);
                        $stmt_delete_option->execute();
                        $field_options = $stmt_delete_option->fetchAll(PDO::FETCH_OBJ);
                        //                            var_dump($field_options);
                        if ($field_options != NULL) {
                            DeleteSafetymeetingFieldOptions($db, $field_options);
                        }
                        $option_order = 0;
                        foreach ($custom_array[$i]["options"] as $option) {
                            //                                $query_check_option ="select option_id from stellarhse_safetymeeting.`option` where field_id=:field_id and option_name =:option_name";

                            $query_check_option = "select option_id from stellarhse_safetymeeting.`option` where field_id=:field_id and `order` =:order";
                            $stmt_check_option = $db->prepare($query_check_option);
                            $stmt_check_option->bindParam(":field_id", $custom_array[$i]["id"]);
                            $stmt_check_option->bindParam(":order", $option_order);
                            $stmt_check_option->execute();
                            $option_data = $stmt_check_option->fetchAll(PDO::FETCH_OBJ);
                            if ($option_data != NULL) {
                                $option_data[0]->option_id;
                                $query_add_option = "UPDATE stellarhse_safetymeeting.option
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
                                $query_option = "INSERT INTO stellarhse_safetymeeting.option
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
                $query = "INSERT INTO stellarhse_safetymeeting.field
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
                $query_org_field = "INSERT INTO stellarhse_safetymeeting.org_field
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
                        $query_option = "INSERT INTO stellarhse_safetymeeting.option
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
            
     