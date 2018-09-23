<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {
    $app->post('/getFieldLabDashboard', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getFieldLabDashboard', $post);
            $query = " select field_name,default_field_label as label,
                        (case
                            when field_name ='date' then 1
                            when field_name ='SourceName' then 2
                            when field_name ='ReportType' then 3
                            when field_name ='report_number' then 4
                            when field_name ='reported_by' then 5
                            when field_name ='Location' then 6
                            when field_name ='description' then 7
                            when field_name ='risk_level' then 8
                            when field_name ='PriorityName' then 9
                            when field_name ='CorrActStatusName' then 10
                            when field_name ='Subject' then 11 
                            when field_name ='summary_desc' then 12
                            when field_name ='sent_to' then 13
                            when field_name ='assigned_to' then 14
                            when field_name ='Also_notified' then 15
                            when field_name = 'SupervisorName' then 16
                             end) as ordre
                         from stellarhse_incident.field where field_name in (
                        'date','SourceName','ReportType','report_number','reported_by','Location','description','risk_level',
                        'PriorityName','CorrActStatusName','Subject','summary_desc'
                        ,'sent_to','assigned_to','Also_notified','SupervisorName'
                        )and language_id=:language_id and org_id is null and is_custom=1 order by ordre;
                    ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $post['language_id']);
            $stmt->execute();
            $result['all_mod'] = $stmt->fetchAll(PDO::FETCH_OBJ);
            $query = "  select og.field_id,f.field_name,replace(og.field_label,':','') as label,
                         (case
                            when field_name ='date' then 1
                            when field_name ='training_type_id' then 2
                            when field_name ='ReportType' then 3
                            when field_name ='training_duration' then 4
                            when field_name ='identified_by' then 5
                            when field_name ='training_assigned_by' then 6
                            when field_name ='training_provided_by' then 7
                            when field_name ='address' then 8
                            when field_name ='training_reason_id' then 9 end ) as ordre
                        from stellarhse_training.field f
                        join stellarhse_training.org_field og on og.field_id=f.field_id and f.is_custom<>1 and og.org_id=:org_id and field_name in 
                        (
                            'training_assigned_by','training_type_id','training_reason_id','training_provided_by',
                            'date','training_duration','address','identified_by'
                        )
                        order by ordre
                        ;  ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result['training'] = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getMyNotificationDashboard', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getMyNotificationDashboard', $post);
            $query = " CALL stellarhse_common.sp_notifications(:org_id,:employee_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getMyIncompleteActions', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getMyIncompleteActions', $post);
            $query = " CALL stellarhse_common.sp_incomplete_action(:org_id,:employee_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getMyIncompleteTraining', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getMyIncompleteTraining', $post);
            $query = " CALL stellarhse_training.sp_incomplete_training(:org_id,:employee_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getMyRecentReports', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getMyRecentReports', $post);
            $query = " CALL stellarhse_common.sp_my_recent_report(:org_id,:employee_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getAllNotificationDashboard', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getAllNotificationDashboard', $post);
            $query = " CALL stellarhse_common.sp_notifications(:org_id,NULL)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getAllIncompleteActions', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getAllIncompleteActions', $post);
            $query = " CALL stellarhse_common.sp_incomplete_action(:org_id,NULL)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getAllIncompleteTraining', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getAllIncompleteTraining', $post);
            $query = " CALL stellarhse_training.sp_incomplete_training(:org_id,NULL)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getAllRecentReports', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getAllRecentReports', $post);
            $query = " CALL stellarhse_common.sp_my_recent_report(:org_id,NULL)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getReportPopupdata', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getReportPopupdata', $post);
            switch ($post['report_code']) {
                case "ABCanTrack":
                    $query = "SELECT `otn`.`operation_type_name`,inc.investigation_summary ,
                               th.customer_name,th.contractor_name ,`inc`.`incident_description` AS `desc` , 
                               group_concat(iv.impact_type_name separator '-')as main_impact FROM `stellarhse_incident`.`incident`  `inc`
                               LEFT JOIN stellarhse_incident.impacts_view iv on iv.incident_id=inc.incident_id
                               LEFT JOIN stellarhse_incident.incident_third_party_detail th on th.incident_id=inc.incident_id 
                               LEFT JOIN `stellarhse_common`.`operation_type` `otn` ON `otn`.`operation_type_id` = `inc`.`operation_type_id`;
                               WHERE `inc`.`incident_id` = :report_id ;";
                    break;
                case "Hazard":
                    $query = "SELECT `otn`.`operation_type_name` ,group_concat(hi.impact_type separator '-') as main_impact,th.customer_name,th.contractor_name, `h`.`hazard_desc` AS `desc` ,
                               `hs`.`status_Name` AS `status` FROM stellarhse_hazard.hazard  `h` 
                               LEFT JOIN stellarhse_hazard.hazard_impacts_view  hi on hi.hazard_id=h.hazard_id
                               LEFT JOIN stellarhse_hazard.`hazard_third_party_detail` th on th.hazard_id=h.hazard_id                                                              
                               LEFT JOIN `stellarhse_common`.`operation_type` `otn` ON  `otn`.`operation_type_id` = `h`.`operation_type_id`
                               LEFT JOIN `stellarhse_common`.`status` `hs` ON `hs`.`status_id` = `stellarhse_hazard`.`h`.`hazard_status_id`     
                               WHERE `h`.`hazard_id` = :report_id ;";
                    break;
                case "Inspection":
                    $query = "SELECT `otn`.`operation_type_name` , `i`.`inspection_description` AS `desc` ,
                              th.customer_name,th.contractor_name , group_concat(ip.impact_type separator '-') as main_impact ,
                             `hs`.`status_Name` AS `status` FROM stellarhse_inspection.inspection  `i`
                              LEFT JOIN `stellarhse_common`.`operation_type` `otn` ON  `otn`.`operation_type_id` = `i`.`operation_type_id`
                              LEFT JOIN `stellarhse_inspection`.`inspection_third_party_detail` th on th.inspection_id=i.inspection_id 
                              LEFT JOIN stellarhse_inspection.inspection_impacts_view  ip on ip.inspection_id=i.inspection_id
                              LEFT JOIN `stellarhse_common`.`status` `hs` ON `hs`.`status_id` = `i`.`inspection_status_id`
                              WHERE `i`.`inspection_id` = :report_id";
                    break;
                case "SafetyMeeting":
                    $query = "SELECT `sm`.`safetymeeting_description` AS `desc`, 
                              th.customer_name,th.contractor_name 
                              FROM stellarhse_safetymeeting.safetymeeting  `sm` 
                              LEFT JOIN `stellarhse_safetymeeting`.`safetymeeting_third_party_detail` th on th.safetymeeting_id=sm.safetymeeting_id
                              WHERE `sm`.`safetymeeting_id` =:report_id";
                    break;
                case "MaintenanceManagement":
                    $query = "SELECT `m`.`maintenance_description` AS `desc`,th.customer_name,th.contractor_name   
                              FROM stellarhse_maintenance.maintenance `m`
                              LEFT JOIN `stellarhse_maintenance`.`maintenance_third_party_detail` th on th.maintenance_id=m.maintenance_id
                              WHERE `m`.`maintenance_id` = :report_id";
                    break;
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_id", $post['report_id']);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getEmailContent', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getEmailContent', $post);
            switch ($post['product_code']) {
                case "ABCanTrack":
                    $folder_name = 'stellarhse_incident';
                    break;
                case "Hazard":
                    $folder_name = 'stellarhse_hazard';
                    break;
                case "Inspection":
                    $folder_name = 'stellarhse_inspection';
                    break;
                case "SafetyMeeting":
                    $folder_name = 'stellarhse_safetymeeting';
                    break;
                case "Training":
                    $folder_name = 'stellarhse_training';
                    break;
                case "MaintenanceManagement":
                    $folder_name = 'stellarhse_maintenance';
                    break;
            }
            $filename = '/data/emails/' . $folder_name . '/' . $post['email_log_id'] . '.doc';
            $file_contents = file_get_contents($filename);
            
            $query = " SELECT `from` , `to` , `c_c` FROM ".$folder_name.".email_log WHERE email_log_id = :email_log_id ;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email_log_id", $post['email_log_id']);
            $stmt->execute();
            $result['email_data'] = $stmt->fetch(PDO::FETCH_OBJ);
            $result['email_body'] = $file_contents;
//            return $file_contents;
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateActionStatus', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('updateActionStatus', $post);
            
            $status_query = " SELECT corrective_action_status_id FROM stellarhse_common.corrective_action_status 
                              WHERE language_id = :lang_id and org_id = :org_id and field_code = 'closed' and hide = 0  ";
            $stmt = $db->prepare($status_query);
            $stmt->bindParam(":lang_id", $post['lang_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $close_status_id = $stmt->fetchColumn();

            switch ($post['product_code']) {
                case "ABCanTrack":
                    $query = 'UPDATE stellarhse_incident.incident_corrective_action SET `corrective_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE incident_corrective_action_id = :corrective_action_id';
                    break;
                case "Hazard":
                    $query = 'UPDATE stellarhse_hazard.hazard_corrective_action SET `corrective_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE hazard_corrective_action_id = :corrective_action_id';
                    break;
                case "Inspection":
                    $query = 'UPDATE stellarhse_inspection.inspection_corrective_action SET `corrective_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE inspection_corrective_action_id = :corrective_action_id';
                    break;
                case "SafetyMeeting":
                    $query = 'UPDATE stellarhse_safetymeeting.safetymeeting_followup_action SET `safetymeeting_followup_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE safetymeeting_followup_action_id = :corrective_action_id';
                    break;
                case "Training":
                    $query = 'UPDATE stellarhse_training.training_followup_action SET `training_followup_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE training_followup_action_id = :corrective_action_id';
                    break;
                case "MaintenanceManagement":
                    $query = 'UPDATE stellarhse_maintenance.maintenance_followup_action SET `corrective_action_status_id` = :close_status_id,
                                        `actual_end_date` = :actual_end_date WHERE maintenance_followup_action_id = :corrective_action_id';
                    break;
            }
//            echo $query; die();
            $stmt = $db->prepare($query);
            $stmt->bindParam(":close_status_id", $close_status_id);
            $stmt->bindParam(":actual_end_date", $post['actual_end_date']);
            $stmt->bindParam(":corrective_action_id", $post['corrective_action_id']);
            $stmt->execute();
            $result = $stmt->rowCount();
//            print_r($result); die();
           return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});

