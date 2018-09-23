<?php

$app->group('/api/v1', function() use($app) {
    $app->post('/gettrainingtypes', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        $where = " and " . $data['query'];
        try {
            $query = "select * from stellarhse_training.training_type where org_id =:org_id " . $where;
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/gettrainingreasons', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select training_reason_id,training_reason_name from stellarhse_training.training_reason where "
                    . "org_id = :org_id and language_id= :language_id and `hide` = 0 order by `order`,training_reason_name";
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
    $app->post('/gettraininglevelachieved', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select level_achieved_id, level_achieved_name from stellarhse_training.level_achieved where "
                    . "org_id = :org_id and language_id= :language_id and `hide` = 0 order by `order`,level_achieved_name";
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
    $app->post('/gettrainingquality', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select level_quality_id, level_quality_name from stellarhse_training.level_quality where "
                    . "org_id = :org_id and language_id= :language_id and `hide` = 0 order by `order`,level_quality_name";
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

    $app->post('/submittrainingreport', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $result = [];
        $db = $this->db;
      // var_dump($data['report_date']);exit;
        $whoIdentified = $data['whoIdentified'];
        $trainingType = $data['trainingType'];
        if (isset($data['report_date'])) {
            $h_date = $data['report_date'];
            $training_completed_by_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        if (isset($data['completed_date'])) {
            $h_date = $data['completed_date'];
            $completed_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        if (isset($data['expiry_date'])) {
            $h_date = $data['expiry_date'];
            $expiry_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        if (isset($data['observed_date'])) {
            $h_date = $data['observed_date'];
            $observed_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        try {
            $db->beginTransaction();
            if ($data['process_type'] === 'edit') {
                $query = "select max(version_number) from stellarhse_training.training where training_number = :training_number and org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":training_number", $data['training_number']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $version_number = $stmt->fetchColumn();
                if ($version_number === '' || $version_number === null) {
                    $version_number = 1;
                } else {
                    $version_number += 1;
                }
                $training_number = $data['training_number'];
            } else {
                $query = "select max(training_number) from stellarhse_training.`training` where org_id = :org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $training_number = $stmt->fetchColumn();
                if ($training_number === '' || $training_number === null) {
                    $training_number = 1;
                } else {
                    $training_number += 1;
                }
                $version_number = 1;
            }
            $data['report_number'] = $training_number;
            $data['version_number'] = $version_number;

            $training_id = Utils::getUUID($db);
            $data['report_id'] = $training_id;

            $query = "insert into stellarhse_training.training ("
                    . "training_id,training_type_id,training_type_name, org_id,report_owner,cont_cust_id,sponser_id,training_reason_id,traininy_completed_by,assigned_to_notify_supervisor,"
                    . "assigned_to_id,assigned_to_name,assigned_to_emp_id,assigned_to_position,assigned_to_crew,assigned_to_email,"
                    . "assigned_to_company,assigned_to_primary_phone,assigned_to_alternate_phone,assigned_to_supervisor,training_assigned_by,"
                    . "staff_member_id,third_party_id,address,city,state,contact_name,phone,website,evidence_of_completion,"
                    . "training_duration,completed_date,level_achieved_id,course_mark,expiry_date,quality_of_training_id,comments,"
                    . "is_trainee_observed_post,observed_date,observed_by_id,observations,training_number,version_number,creator_id,modifier_id)"
                    . " values (:training_id,:training_type_id,:training_type_name,:org_id,:report_owner,:cont_cust_id,:sponser_id,:training_reason_id,:traininy_completed_by,:assigned_to_notify_supervisor,"
                    . ":assigned_to_id,:assigned_to_name,:assigned_to_emp_id,:assigned_to_position,:assigned_to_crew,:assigned_to_email,"
                    . ":assigned_to_company,:assigned_to_primary_phone,:assigned_to_alternate_phone,:assigned_to_supervisor,:training_assigned_by,"
                    . ":staff_member_id,:third_party_id,:address,:city,:state,:contact_name,:phone,:website,:evidence_of_completion,"
                    . ":training_duration,:completed_date,:level_achieved_id,:course_mark,:expiry_date,:quality_of_training_id,:comments,"
                    . ":is_trainee_observed_post,:observed_date,:observed_by_id,:observations,:training_number,:version_number,:creator_id,:modifier_id)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":training_id", $training_id);
          //  var_dump($trainingType['training_type_id']);exit;
            if (isset($trainingType['training_type_id']) && $trainingType['training_type_id'] !== '' && $trainingType['training_type_id'] !== null)
                $stmt->bindParam(":training_type_id", $trainingType['training_type_id']);
            else
                $stmt->bindValue(":training_type_id", NULL);
//                return "Please choose type of training";
            $stmt->bindParam(":training_type_name", $trainingType['training_name']);
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
            if (isset($data['training_reason_id']) && $data['training_reason_id'] !== '' && $data['training_reason_id'] !== null)
                $stmt->bindParam(":training_reason_id", $data['training_reason_id']);
            else
                $stmt->bindValue(":training_reason_id", NULL);
            if (isset($training_completed_by_date))
                $stmt->bindParam(":traininy_completed_by", $training_completed_by_date);
            else
                $stmt->bindValue(":traininy_completed_by", NULL, PDO::PARAM_STR);
            if (isset($data['assigned_to_notify_supervisor']) && $data['assigned_to_notify_supervisor'] == '1')
                $stmt->bindValue(":assigned_to_notify_supervisor", 1, PDO::PARAM_INT);
            else
                $stmt->bindValue(":assigned_to_notify_supervisor", 0, PDO::PARAM_INT);
            $stmt->bindParam(":assigned_to_id", $whoIdentified['employee_id']);
            $stmt->bindParam(":assigned_to_name", $whoIdentified['full_name']);
            $stmt->bindParam(":assigned_to_emp_id", $whoIdentified['emp_id']);
            $stmt->bindParam(":assigned_to_position", $whoIdentified['position']);
            $stmt->bindParam(":assigned_to_crew", $whoIdentified['crew_id']);
            $stmt->bindParam(":assigned_to_email", $whoIdentified['email']);
            $stmt->bindParam(":assigned_to_company", $whoIdentified['company']);
            $stmt->bindParam(":assigned_to_primary_phone", $whoIdentified['primary_phone']);
            $stmt->bindParam(":assigned_to_alternate_phone", $whoIdentified['alternate_phone']);
            $stmt->bindParam(":assigned_to_supervisor", $whoIdentified['supervisor_name']);
            $stmt->bindParam(":training_assigned_by", $data['training_assigned_by']);
            if (isset($data['staff_member_id']) && $data['staff_member_id'] !== '' && $data['staff_member_id'] !== null)
                $stmt->bindParam(":staff_member_id", $data['staff_member_id']);
            else
                $stmt->bindValue(":staff_member_id", NULL);
            if (isset($data['provider_id']) && $data['provider_id'] !== '' && $data['provider_id'] !== null)
                $stmt->bindParam(":third_party_id", $data['provider_id']);
            else
                $stmt->bindValue(":third_party_id", NULL);
          //  var_dump($data['provider_id']);exit;
            $stmt->bindParam(":address", $data['address']);
            $stmt->bindParam(":city", $data['city']);
            $stmt->bindParam(":state", $data['state']);
            $stmt->bindParam(":contact_name", $data['contact_name']);
            $stmt->bindParam(":phone", $data['phone']);
            $stmt->bindParam(":website", $data['website']);
            $stmt->bindParam(":evidence_of_completion", $trainingType['evidence_of_completion_required']);
            $training_duration = intval($trainingType['duration_of_training']);
            $stmt->bindParam(":training_duration", $training_duration);
            $stmt->bindParam(":completed_date", $completed_date);
            if (isset($data['level_achieved_id']) && $data['level_achieved_id'] !== '' && $data['level_achieved_id'] !== null)
                $stmt->bindParam(":level_achieved_id", $data['level_achieved_id']);
            else
                $stmt->bindValue(":level_achieved_id", NULL);
            $stmt->bindParam(":course_mark", $data['course_mark']);
            $stmt->bindParam(":expiry_date", $expiry_date);
            if (isset($data['level_quality_id']) && $data['level_quality_id'] !== '' && $data['level_quality_id'] !== null)
                $stmt->bindParam(":quality_of_training_id", $data['level_quality_id']);
            else
                $stmt->bindValue(":quality_of_training_id", NULL);
           // $stmt->bindParam(":quality_of_training_id", $data['level_quality_id']);

            $stmt->bindParam(":comments", $data['comments']);
            if (isset($data['is_trainee_observed_post']) && $data['is_trainee_observed_post'] == '1')
                $stmt->bindValue(":is_trainee_observed_post", 1, PDO::PARAM_INT);
            else
                $stmt->bindValue(":is_trainee_observed_post", 0, PDO::PARAM_INT);
            $stmt->bindParam(":observed_date", $observed_date);
            $stmt->bindParam(":observed_by_id", $data['observed_by_id']);
            $stmt->bindParam(":observations", $data['observations']);
            $stmt->bindParam(":training_number", $training_number);
            $stmt->bindParam(":version_number", $version_number);
            if ($data['process_type'] === 'edit') {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindParam(":modifier_id", $data['modifier_id']);
            } else {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindValue(":modifier_id", NULL);
            }
            $stmt->execute();
            $result = $stmt->rowCount();

            $peopleInvolved = $data['peopleInvolved'];
            foreach ($peopleInvolved as $person) {
                if ($person['title'] != '' && $person['title'] != 'New Person') {
                    $people_involved_id = Utils::getUUID($db);

                    $query = "insert into stellarhse_training.`training_people_involved` "
                            . "(people_involved_id,training_id,people_id ,third_party_id,people_involved_name,company,supervisor,position,email,primary_phone,alternate_phone,"
                            . "exp_in_current_postion,exp_over_all,age,crew,how_he_involved,role_description,editing_by,hide,original_people_involved_id)"
                            . " values "
                            . "(:people_involved_id,:training_id,:people_id,:third_party_id,:people_involved_name,:company,:supervisor,:position,:email,:primary_phone,:alternate_phone,"
                            . ":exp_in_current_postion,:exp_over_all,:age,:crew,:how_he_involved,:role_description,:editing_by,:hide,:original_people_involved_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":people_involved_id", $people_involved_id);
                    $stmt->bindParam(":training_id", $training_id);
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
                    if ($person['exp_in_current_postion'] == '' || $person['exp_in_current_postion'] == null)
                        $stmt->bindValue(":exp_in_current_postion", NULL);
                    else
                        $stmt->bindParam(":exp_in_current_postion", $person['exp_in_current_postion']);
                    if ($person['exp_over_all'] == '' || $person['exp_over_all'] == null)
                        $stmt->bindValue(":exp_over_all", NULL);
                    else
                        $stmt->bindParam(":exp_over_all", $person['exp_over_all']);
                    if ($person['age'] == '' || $person['age'] == null)
                        $stmt->bindValue(":age", NULL);
                    else
                        $stmt->bindParam(":age", $person['age']);
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
                            $training_certificate_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_training.`training_certificate` "
                                    . "(training_certificate_id,people_involved_id,certificate_id)"
                                    . " values "
                                    . "(:training_certificate_id,:people_involved_id,:certificate_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":training_certificate_id", $training_certificate_id);
                            $stmt->bindParam(":certificate_id", $certificate['certificate_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    $actingAs = $person['actingAs'];
                    foreach ($actingAs as $acting) {
                        if (isset($acting['acting_choice']) && $acting['acting_choice'] == true) {
                            $training_acting_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_training.training_acting "
                                    . "(training_acting_id,people_involved_id,acting_id)"
                                    . " values "
                                    . "(:training_acting_id,:people_involved_id,:acting_id)";


                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":training_acting_id", $training_acting_id);
                            $stmt->bindParam(":acting_id", $acting['acting_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    
                    $person_custom = $person['peopleCustomField'];
                    if ($person_custom){
                        AddCustomFieldValues($db, $training_id, $data['peopleCustomField'],'Training','People',$people_involved_id);
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

                $query = "insert into stellarhse_training.training_followup_action "
                        . "(training_followup_action_id,training_id,training_followup_action_status_id,training_followup_action_priority_id,assigned_to_id,supervisor,supervisor_notify,start_date,target_end_date,"
                        . "actual_end_date,estimated_cost,actual_cost,task_description,out_come_follow_up,desired_results,comments,original_corrective_action_id)"
                        . " values "
                        . "(:training_followup_action_id,:training_id,:training_followup_action_status_id,:training_followup_action_priority_id,:assigned_to_id,:supervisor,:supervisor_notify,:start_date,:target_end_date,"
                        . ":actual_end_date,:estimated_cost,:actual_cost,:task_description,:out_come_follow_up,:desired_results,:comments,:original_corrective_action_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":training_followup_action_id", $corrective_action_id);
                $stmt->bindParam(":training_id", $training_id);
                $stmt->bindParam(":training_followup_action_status_id", $action['corrective_action_status_id']);
                $stmt->bindParam(":training_followup_action_priority_id", $action['corrective_action_priority_id']);
                $stmt->bindParam(":assigned_to_id", $action['assigned_to']['employee_id']);
                $stmt->bindParam(":supervisor", $action['assigned_to']['supervisor_name']);
                if ($action['supervisor_notify'] == '1')
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
                        $query = "insert into stellarhse_training.training_followup_action_notified "
                                . "(training_followup_action_id,notified_id) values (:training_followup_action_id,:notified_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":training_followup_action_id", $corrective_action_id);
                        $stmt->bindParam(":notified_id", $notify['employee_id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else if (isset($notify['notified_id'])) {
                        $query = "insert into stellarhse_training.training_followup_action_notified "
                                . "(training_followup_action_id,notified_id) values (:training_followup_action_id,:notified_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":training_followup_action_id", $corrective_action_id);
                        $stmt->bindParam(":notified_id", $notify['notified_id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
                
                $action_custom = $action['actionCustomField'];
                if ($action_custom){
                    AddCustomFieldValues($db, $training_id, $action_custom,'Training','Actions',$corrective_action_id);
                }
            }
            $db->commit();
            
            AddCustomFieldValues($db, $training_id, $data['whatCustomField'],'Training','Training','');
            AddCustomFieldValues($db, $training_id, $data['actionCustomField'],'Training','Training','');
            if($data['process_type'] === 'add'){
                $res = InsertIntoTrainingHistory($db,$training_id,$data['clientTimeZoneOffset'],$data['creator_id'],$data['process_type']);
                $report_values = GetTrainingFieldsValues($db,$training_id,$data['org_id']);

                $query = "SELECT subject,`body` FROM stellarhse_training.email_template where org_id = :org_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':org_id', $data['org_id']);
                $stmt->execute();
                $templates = $stmt->fetchAll(PDO::FETCH_OBJ);
//                
                sleep(1);
                $version_number =1;
                $hist_training_id = GetHistTrainingData($db, $data['org_id'], $training_number,$version_number);
                AddReportFile('training', $hist_training_id,$data['org_id'], $training_number,$version_number,$db);
                // finish the submitting request & process the rest of this function in the background sodecrease consuming time for the user
                fastcgi_finish_request();
                // adding to history then sending corrective action emails & notification emails
            
                // sending report emails 
                SendCorrectiveActionEmail($db, 'stellarhse_training', $data, $report_values, $correctiveActions, $templates[0]);
                SendNotificationEmail($db, 'stellarhse_training',$data,$report_values, $templates[1]);
                SendTrainingAssignedEmail($db,$data,$report_values, $templates[1]);
            }
            if($data['process_type'] === 'edit'){
                $data['process_type'] = 'update';
                $res = InsertIntoTrainingHistory($db,$training_id,$data['clientTimeZoneOffset'],$data['modifier_id'],$data['process_type']);

                sleep(1);
                $hist_training_id = GetHistTrainingData($db, $data['org_id'], $training_number,$version_number);
                AddReportFile('training', $hist_training_id,$data['org_id'], $training_number,$version_number,$db);
                
            }
//            return $this->response->withJson(1);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
        }
    });
    
    $app->post('/saveTrainingCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $user_id = $data['user_id'];
            
            // what tab
            $what_training_custom = $data['what_training'];
            $what_training_tab = GetTrainingSubTabId($db, 'WhatHappened', $language_id);
            $all_what_fields = [];
            for ($i = 0; $i < count($what_training_custom); $i++) {
                if (isset($what_training_custom[$i]["id"]) && $what_training_custom[$i]["id"] != NULL) {
                    array_push($all_what_fields, $what_training_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_what_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_training.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $what_training_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteTrainingCustomField($db, $res);
            }
            
            // people Tab
            $people_training_custom = $data['people_training'];
            $people_training_tab = GetTrainingSubTabId($db, 'people', $language_id);
            $all_people_fields = [];
            for ($i = 0; $i < count($people_training_custom); $i++) {
                if (isset($people_training_custom[$i]["id"]) && $people_training_custom[$i]["id"] != NULL) {
                    array_push($all_people_fields, $people_training_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_people_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_training.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $people_training_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteTrainingCustomField($db, $res);
            }
            
            // action Tab
            $action_training_custom = $data['action_training'];
            $action_training_tab = GetTrainingSubTabId($db, 'Follows', $language_id);
            $all_action_fields = [];
            for ($i = 0; $i < count($action_training_custom); $i++) {
                if (isset($action_training_custom[$i]["id"]) && $action_training_custom[$i]["id"] != NULL) {
                    array_push($all_action_fields, $action_training_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_action_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_training.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $action_training_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteTrainingCustomField($db, $res);
            }
            
            AddTrainingTabCustomField($db, $org_id, $language_id, $user_id, $what_training_tab,'WhatHappened', $what_training_custom);
            AddTrainingTabCustomField($db, $org_id, $language_id, $user_id, $people_training_tab,'people', $people_training_custom);
            AddTrainingTabCustomField($db, $org_id, $language_id, $user_id, $action_training_tab,'Follows', $action_training_custom);
            
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    
    $app->post('/getTrainingTabCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $sub_tab_name = $data['tab_name'];
            $sub_tab_id = GetTrainingSubTabId($db, $sub_tab_name, $language_id);
            $query = "SELECT * FROM stellarhse_training.field where org_id =:org_id and language_id=:language_id and sub_tab_id=:sub_tab_id order by `order` asc";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $org_id);
            $stmt->bindParam(':language_id', $language_id);
            $stmt->bindParam(':sub_tab_id', $sub_tab_id);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $customs = [];
            foreach ($result as $key => $custom_field) {

                $component = GetTrainingFieldTypeName($db, $custom_field->field_type_id, $language_id);
                if ($custom_field->is_mandatory == 1) {
                    $IsMandatory = true;
                } else {
                    $IsMandatory = false;
                }
                $query2 = "select option_id ,option_name  from stellarhse_training.`option` where field_id=:field_id";
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

function getTrainingData($db, $data) {
    $query = "call stellarhse_training.training_reload_data(:report_number,:org_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_number", $data['report_number']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
    $stmt->nextRowSet();
    $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
    $stmt->nextRowSet();
    $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetTrainingVersion($db, $data){
    $query2 = "select max(version_number) from stellarhse_training.training where training_number = :training_number";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":training_number", $data['report_number']);
    $stmt2->execute();
    $version_number = $stmt2->fetchColumn();
    return $version_number;
}


function GetTrainingIdByNumber($db, $data){
    $query2 = "select distinct training_id as report_id from stellarhse_training.training where training_number = :training_number  and org_id= :org_id  ORDER BY last_update_date desc limit  1";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":training_number", $data['report_number']);
    $stmt2->bindParam(":org_id", $data['org_id']);
    $stmt2->execute();
    $report_id = $stmt2->fetchColumn();
    return $report_id;
}

function sp_update_version_file_manager_training($db, $report_id,$clientTimeZoneOffset,$edit_by){
    $query = "call stellarhse_training.sp_update_version_file_manager(:report_id,:clientTimeZoneOffset,:edit_by,'update');";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_id", $report_id);
    $stmt->bindParam(":clientTimeZoneOffset", $clientTimeZoneOffset);
    $stmt->bindParam(":edit_by", $edit_by);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetHistTrainingData($db, $org_id,$training_number,$version_number){
    $query = "select hist_training_id from stellarhse_training.hist_training where org_id=:org_id and training_number=:training_number and version_number=:version_number";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":org_id", $org_id);
    $stmt->bindParam(":training_number", $training_number);
    $stmt->bindParam(":version_number", $version_number);
    $stmt->execute();
    $hist_training_id = $stmt->fetchColumn();
    return $hist_training_id;
}

function GetTrainingFieldsValues($db,$training_id,$org_id){
    try{
    $query = "call stellarhse_training.emails_data(:training_id,:org_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':training_id', $training_id);
    $stmt->bindParam(":org_id", $org_id);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
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

function InsertIntoTrainingHistory($db,$training_id,$client_timezone,$updated_by_id,$operation_type){
    try{
        $query = "call stellarhse_training.sp_move_training_to_hist(:training_id, :client_timezone, :updated_by_id, :operation_type)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':training_id', $training_id);
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

function ReplaceTrainingCorrectiveActionsParamters($report_data, $report_values, $ca, $index){
    try{
        $corrective_action_block = '$Action_Start
            <ul style="list-style-type: circle;">
                <li>Report Number: $training_number</li>
                <li>Training type : $training_type_name</li>
                <li>Training to be completed by: $training_completed_by</li>
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
        $corrective_action_replace = str_replace("$" . "training_number", $report_data['report_number'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "training_type_name", $report_values->training_type_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "training_completed_by", $report_data['report_date'].'<br/>', $corrective_action_replace);
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

function InsertIntoTrainingEmailLog($db, $email_log_id, $report_data){
    try{
        $query = "INSERT INTO stellarhse_training.`training_email_log`
                            (email_log_id, hist_training_id)
                        VALUES (:email_log_id,:hist_training_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id',$email_log_id);
        $stmt->bindParam(':hist_training_id',$report_data->hist_report_id);
        $stmt->execute();
        $result = $stmt->rowCount();
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function ReplaceTrainingReportParamters($db, $report_data, $report_values, $email_body, $notification){
    $whoIdentified = $report_data['whoIdentified'];
    $email_body = str_replace("$" . "Action_Start", '', $email_body);
    $email_body = str_replace("$" . "Action_End", '', $email_body);
    
    $email_body = str_replace("$" . "training_number", $report_data['report_number'], $email_body);
    $email_body = str_replace("$" . "training_type_name", $report_values->training_type_name, $email_body);
    $email_body = str_replace("$" . "training_completed_by", $report_values->date, $email_body);
    $email_body = str_replace("$" . "rep_name", $whoIdentified['full_name'], $email_body);
    $email_body = str_replace("$" . "rep_emp_id", $whoIdentified['emp_id'], $email_body);
    $email_body = str_replace("$" . "rep_position", $whoIdentified['position'], $email_body);
    $email_body = str_replace("$" . "rep_email", $whoIdentified['email'], $email_body);
    $email_body = str_replace("$" . "rep_company", $whoIdentified['org_name'], $email_body);
    $email_body = str_replace("$" . "rep_primary_phone", $whoIdentified['primary_phone'], $email_body);
    $email_body = str_replace("$" . "rep_alternate_phone", $whoIdentified['alternate_phone'], $email_body);
    $email_body = str_replace("$" . "rep_crew", $whoIdentified['crew_name'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor", $whoIdentified['supervisor_name'], $email_body);
    $email_body = str_replace("$" . "training_reason_name", $report_values->training_reason_name, $email_body);
    $email_body = str_replace("$" . "staff_member_id", $report_values->staff_member_name, $email_body);
    $email_body = str_replace("$" . "third_party_id", $report_values->third_party_name, $email_body);
    $email_body = str_replace("$" . "address", $report_data['address'], $email_body);
    $email_body = str_replace("$" . "city", $report_data['city'], $email_body);
    $email_body = str_replace("$" . "state", $report_data['state'], $email_body);
    $email_body = str_replace("$" . "phone", $report_data['phone'], $email_body);
    $email_body = str_replace("$" . "contact_name", $report_data['contact_name'], $email_body);
    $email_body = str_replace("$" . "website", $report_data['website'], $email_body);
    
    $email_body = str_replace("$" . "training_assigned_by", $report_values->training_assigned_by, $email_body);
    $email_body = str_replace("$" . "evidence_of_completion", $report_values->evidence_of_completion, $email_body);
    $email_body = str_replace("$" . "level_quality_name", $report_values->quality_of_training_name, $email_body);
    $email_body = str_replace("$" . "level_achieved_name", $report_values->level_achieved_name, $email_body);
    $email_body = str_replace("$" . "training_duration", $report_values->training_duration, $email_body);
    $email_body = str_replace("$" . "version_number", $report_data['version_number'], $email_body);
    $email_body = str_replace("$" . "modifier_name", '', $email_body);
    $email_body = str_replace("$" . "completed_date", $report_data['completed_date'], $email_body);
    $email_body = str_replace("$" . "expiry_date", $report_data['expiry_date'], $email_body);
    $email_body = str_replace("$" . "course_mark", $report_data['course_mark'], $email_body);
    $email_body = str_replace("$" . "is_trainee_observed_post", $report_values->is_trainee_observed_post, $email_body);
    $email_body = str_replace("$" . "observerd_by_id", $report_values->observed_by_name, $email_body);
    $email_body = str_replace("$" . "observed_date", $report_data['observed_date'], $email_body);
    $email_body = str_replace("$" . "observations", $report_data['observations'], $email_body);
    $email_body = str_replace("$" . "comments", $report_data['comments'], $email_body);
    
    // email footer
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
        $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_training.org_field of join stellarhse_training.field f on of.field_id = f.field_id join stellarhse_training.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'People' and of.org_id = :org_id and f.is_custom = 0 order by f.`order`";
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
    
    $index = strpos($email_body, "</ul>", 0);
    $body1 = substr($email_body, 0, $index);
    $body2 = substr($email_body, $index);
    foreach($notification as $field){
        if($field->field_name === 'CorrectiveActionsHeader'){
            $query = "select of.field_label, f.table_field_name from stellarhse_training.org_field of join stellarhse_training.field f on of.field_id = f.field_id join stellarhse_training.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Follows' and of.org_id = :org_id and f.is_custom = 0 order by f.`order`";
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
        } 
        else
        if($field->field_name !== 'training_type_name')
            $body1 .=  "<li>".$field->field_label." ".$report_values->{$field->table_field_name}."</li>";
    }
    $email_body = $body1.$body2;
//    print_r($report_values);
    return $email_body;
//    }
}

function SendTrainingAssignedEmail($db,$report_data,$report_values,$template){
    try{
            $query = "SELECT email_type_id FROM stellarhse_common.email_type where email_type_code = 'AssignedTraining'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $email_type_id = $stmt->fetchColumn();
        
            $body = $template->body."<br/>";
            $report_replace = ReplaceTrainingReportParamters($db, $report_data,$report_values, $body, array());
//        print_r($report_replace);
            $subject = 'Training assigned to you';
            $to = $report_data['whoIdentified']['email'];
//            $to = 'alaa.elsherbiny@procuredox.com';
//            $cc = 'alaaouda@gmail.com';
            $email = new SendEMail();
            $email->to = $to;
            $email->from = '';
            $email->cc = '';
            $email->subject = $subject;
            $email->body = $report_replace;
            $res = $email->sendmail($email);
            $email_sent_data = new stdClass();
            $email_sent_data->employee_id = $report_data['whoIdentified']['employee_id'];
            $email_sent_data->email_type = $email_type_id;
            return SaveEmailOfMonitorToDB($db,'stellarhse_training',$to,$cc,$res,$report_data,$subject,$report_replace, $report_data['org_id'],$report_values,array($email_sent_data));
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function GetTrainingSubTabId($db, $tab_name, $language_id) {
    $query = "select sub_tab_id,sub_tab_name from stellarhse_training.sub_tab where field_code= :field_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_code', $tab_name);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0]->sub_tab_id;
}

function GetTrainingFieldTypeId($db, $field_code, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_code= :field_type_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_code', $field_code);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0];
}

function GetTrainingFieldTypeName($db, $field_id, $language_id) {
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

function DeleteTrainingCustomField($db, $array_fields) {
    foreach ($array_fields as $value) {
        $field_id = $value->field_id;
        $query = "delete from  stellarhse_training.favorite_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.template_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.field_value  WHERE option_id IN (SELECT option_id FROM stellarhse_training.`option` WHERE field_id =  :field_id);";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.field_value  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.`option`  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.org_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_training.favorite_field 
            where favorite_table_id in(SELECT favorite_table_id from stellarhse_training.favorite_table  WHERE order_by_id = :field_id); ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_training.favorite_table  WHERE order_by_id = :field_id; ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_training.field where field_id = :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $res = true;
    }
}

function DeleteTrainingFieldOptions($db, $array_options) {
    foreach ($array_options as $value) {
        $option_id = $value->option_id;
        $query = "delete FROM stellarhse_training.`option` WHERE option_id =  :option_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":option_id", $option_id);
        $stmt->execute();
    }
}

function AddTrainingTabCustomField($db, $org_id, $language_id, $user_id, $sub_tab_id,$tab_name, $custom_array) {

    if ($custom_array != NULL) {
        for ($i = 0; $i < count($custom_array); $i++) {
            switch ($custom_array[$i]['component']) {
                case 'textInput':
                    $fieldType = GetTrainingFieldTypeId($db, 'textbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'textArea':
                    $fieldType = GetTrainingFieldTypeId($db, 'textarea', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'checkbox':
                    $fieldType = GetTrainingFieldTypeId($db, 'checkbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'radio':
                    $fieldType = GetTrainingFieldTypeId($db, 'radiobutton', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'select':
                    $fieldType = GetTrainingFieldTypeId($db, 'select', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'date':
                    $fieldType = GetTrainingFieldTypeId($db, 'calendar', $language_id);
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
                $query = "UPDATE stellarhse_training.field
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
                $query_check_field_in_org = "select * from  stellarhse_training.org_field WHERE org_id= :org_id  and field_id= :field_id";
                $stmt_check_field_in_org = $db->prepare($query_check_field_in_org);
                $stmt_check_field_in_org->bindParam(":org_id", $org_id);
                $stmt_check_field_in_org->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt_check_field_in_org->execute();
                $res_check_field = $stmt_check_field_in_org->fetchAll(PDO::FETCH_OBJ);
                if($res_check_field !=NULL){
                    var_dump('$res_check_field');
                    $query_org_field ="UPDATE  stellarhse_training.org_field
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
                    $query_org_field = "INSERT INTO stellarhse_training.org_field
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
                        //                            $query_delete_option = "select * from stellarhse_training.`option` where field_id=:field_id and option_name NOT IN $options";

                        $query_delete_option = "select * from stellarhse_training.`option` where field_id=:field_id and `order` > :count";
                        $stmt_delete_option = $db->prepare($query_delete_option);
                        $stmt_delete_option->bindParam(":field_id", $custom_array[$i]["id"]);
                        $stmt_delete_option->bindParam(":count", $count);
                        $stmt_delete_option->execute();
                        $field_options = $stmt_delete_option->fetchAll(PDO::FETCH_OBJ);
                        //                            var_dump($field_options);
                        if ($field_options != NULL) {
                            DeleteTrainingFieldOptions($db, $field_options);
                        }
                        $option_order = 0;
                        foreach ($custom_array[$i]["options"] as $option) {
                            //                                $query_check_option ="select option_id from stellarhse_training.`option` where field_id=:field_id and option_name =:option_name";

                            $query_check_option = "select option_id from stellarhse_training.`option` where field_id=:field_id and `order` =:order";
                            $stmt_check_option = $db->prepare($query_check_option);
                            $stmt_check_option->bindParam(":field_id", $custom_array[$i]["id"]);
                            $stmt_check_option->bindParam(":order", $option_order);
                            $stmt_check_option->execute();
                            $option_data = $stmt_check_option->fetchAll(PDO::FETCH_OBJ);
                            if ($option_data != NULL) {
                                $option_data[0]->option_id;
                                $query_add_option = "UPDATE stellarhse_training.option
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
                                $query_option = "INSERT INTO stellarhse_training.option
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
                $query = "INSERT INTO stellarhse_training.field
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
                $query_org_field = "INSERT INTO stellarhse_training.org_field
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
                        $query_option = "INSERT INTO stellarhse_training.option
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
            
            