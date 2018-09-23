<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/notificationmodulestypes', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select distinct product_id as id, product_name as `name`, product_code as code from stellarhse_auth. 
            product_view where product_version_id in (select product_version_id from stellarhse_auth.org_product where org_id 
            = :org_id) and product_code in ('Hazard','ABCanTrack','Inspection','MaintenanceManagement','SafetyMeeting','Training') order by product_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            // $stmt->bindParam(':language_id', $data['language_id']);
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
    $app->post('/notificationtypes', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "SELECT notification_type_id as id, notification_type_name as `name`, notification_type_code as code FROM 
            stellarhse_common.notification_type where language_id = :language_id and hide = 0";
            $stmt = $db->prepare($query);
            // $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':language_id', $data['language_id']);
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
    $app->post('/notifications', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $params = $request->getParsedBody();
            $db = $this->db;
            $query = "call stellarhse_common.get_assign_notifications_updated(:org_id)";
            // switch ($params['reportType']) {
            //     case 'hazard':
            //         $query = "call stellarhse_hazard.get_assign_notifications(:params)";
            //         break;
            //     case 'incident':
            //         $query = "call stellarhse_incident.get_assign_notifications(:params)";
            //         break;
            //     case 'inspection':
            //         $query = "call stellarhse_inspection.get_assign_notifications(:params)";
            //         break;
            //     case 'safetymeeting':
            //         $query = "call stellarhse_safetymeeting.get_assign_notifications(:params)";
            //         break;
            //     case 'maintenance':
            //         $query = "call stellarhse_maintenance.get_assign_notifications(:params)";
            //         break;
            //     case 'training':
            //         $query = "call stellarhse_training.get_assign_notifications(:params)";
            //         break;
            // }
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $params['org_id']);
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
    $app->post('/notifiedemployees', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select distinct(employee_id), full_name from stellarhse_auth.get_user_info where org_id = :org_id and email is not null and emp_is_active = 1 and "
                    . "full_name like concat('%',(:letters),'%') and language_id = :language_id AND emp_grp_is_active = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':language_id', $data['language_id']);
            $stmt->bindParam(':letters', $data['letters']);
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
    $app->post('/notifiedgroups', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select group_id as id, group_name as name from stellarhse_auth.`group` where org_id = :org_id and 
            group_name like concat('%',(:letters),'%') and language_id = :language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':language_id', $data['language_id']);
            $stmt->bindParam(':letters', $data['letters']);
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
    $app->post('/filterfields', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "call get_notifications_field(:org_id, :code )";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':code', $data['code']);
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
    $app->post('/filtervalues', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "call get_org_notification_value(:org_id, :field_id, :code, :impact_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':field_id', $data['field_id']);
            $stmt->bindParam(':code', $data['code']);
            $stmt->bindParam(':impact_id', $data['impact_id']);
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
    $app->post('/filterescalatedfields', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "call get_escalated_field(:org_id, :code )";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':code', $data['code']);
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
    $app->post('/savenotification', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            switch($data['choosedNotificationModuleCode']){
                case 'Hazard':
                    $db_name = "stellarhse_hazard";
                break;
                case 'ABCanTrack':
                    $db_name = "stellarhse_incident";
                break;
                case 'Inspection':
                    $db_name = "stellarhse_inspection";
                break;
                case 'SafetyMeeting':
                    $db_name = "stellarhse_safetymeeting";
                break;
                case 'MaintenanceManagement':
                    $db_name = "stellarhse_maintenance";
                break;
                case 'Training':
                    $db_name = "stellarhse_training";
                break;
            }
            $query = "select max(notification_trigger_number) from $db_name.email_to where org_id = :org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->execute();
            $notification_number = $stmt->fetchColumn();
            if($notification_number === false)
                $notification_number = 0;
            $notification_number++;
            $query = "select email_type_id from email_type where email_type_code = 'NewReport'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $email_type_id = $stmt->fetchColumn();
            foreach($data['notifiedStandardFilterFields'] as $filter){
                if($filter['choosed'] === true){
                    if($filter['field_name'] === 'CorrectiveActionsHeader'){
                        $query = "select $db_name.myuuid()";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                        $email_to_id = $stmt->fetchColumn();
                        $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                        values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':email_to_id', $email_to_id);
                        $stmt->bindValue(':table_key_value', NULL);
                        $stmt->bindParam(':email_type_id', $email_type_id);
                        $stmt->bindParam(':org_id', $data['org_id']);
                        if($data['choosedNotifiedCategory'] === 'user'){
                            $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']);
                            $stmt->bindValue(':group_id', NULL);
                        }else{
                            $stmt->bindValue(':employee_id', NULL);
                            $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']);
                        }
                        $stmt->bindParam(':table_name', $filter['table_name']);
                        $stmt->bindParam(':field_id', $filter['field_id']);
                        $stmt->bindParam(':notification_trigger_number', intval($notification_number));
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else {
                        foreach($filter['filterValues'] as $value){
                            if($value['choosed'] === true){
                                $query = "select $db_name.myuuid()";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                $email_to_id = $stmt->fetchColumn();
                                $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                                values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':email_to_id', $email_to_id);
                                $stmt->bindParam(':table_key_value', $value['id']);
                                $stmt->bindParam(':email_type_id', $email_type_id);
                                $stmt->bindParam(':org_id', $data['org_id']);
                                if($data['choosedNotifiedCategory'] === 'user'){
                                    $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']);
                                    $stmt->bindValue(':group_id', NULL);
                                }else{
                                    $stmt->bindValue(':employee_id', NULL);
                                    $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']);
                                }
                                $stmt->bindParam(':table_name', $filter['table_name']);
                                $stmt->bindParam(':field_id', $filter['field_id']);
                                $stmt->bindParam(':notification_trigger_number', intval($notification_number));
                                $stmt->execute();
                                $result = $stmt->rowCount();
                            }
                        }
                    }
                }
            }
            foreach($data['notifiedSpecialFilterFields'] as $filter){
                if($filter['choosed'] === true){
                    if($filter['field_name'] === 'CorrectiveActionsHeader'){
                        $query = "select $db_name.myuuid()";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                        $email_to_id = $stmt->fetchColumn();
                        $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                        values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':email_to_id', $email_to_id);
                        $stmt->bindValue(':table_key_value', NULL);
                        $stmt->bindParam(':email_type_id', $email_type_id);
                        $stmt->bindParam(':org_id', $data['org_id']);
                        if($data['choosedNotifiedCategory'] === 'user'){
                            $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']);
                            $stmt->bindValue(':group_id', NULL);
                        }else{
                            $stmt->bindValue(':employee_id', NULL);
                            $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']);
                        }
                        $stmt->bindParam(':table_name', $filter['table_name']);
                        $stmt->bindParam(':field_id', $filter['field_id']);
                        $stmt->bindParam(':notification_trigger_number', intval($notification_number));
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else {
                        foreach($filter['filterValues'] as $value){
                            if($value['choosed'] === true){
                                $query = "select $db_name.myuuid()";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                $email_to_id = $stmt->fetchColumn();
                                $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                                values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':email_to_id', $email_to_id);
                                $stmt->bindParam(':table_key_value', $value['id']);
                                $stmt->bindParam(':email_type_id', $email_type_id);
                                $stmt->bindParam(':org_id', $data['org_id']);
                                if($data['choosedNotifiedCategory'] === 'user'){
                                    $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']);
                                    $stmt->bindValue(':group_id', NULL);
                                }else{
                                    $stmt->bindValue(':employee_id', NULL);
                                    $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']);
                                }
                                $stmt->bindParam(':table_name', $filter['table_name']);
                                $stmt->bindParam(':field_id', $filter['field_id']);
                                $stmt->bindParam(':notification_trigger_number', intval($notification_number));
                                $stmt->execute();
                                $result = $stmt->rowCount();
                            }
                        }
                    }
                }
            }
            foreach($data['notifiedFilterEscalatedFields'] as $filter){
                if($filter['choosed'] === true){
                    $query = "select $db_name.myuuid()";
                    $stmt = $db->prepare($query);
                    $stmt->execute();
                    $email_to_esc_id = $stmt->fetchColumn();
                    $query = "insert into $db_name.email_to_esc (email_to_esc_id,org_id,employee_id,group_id,days_start,days_freq,table_name,field_id,notification_trigger_number) 
                    values (:email_to_esc_id,:org_id,:employee_id,:group_id,:days_start,:days_freq,:table_name,:field_id,:notification_trigger_number)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':email_to_esc_id', $email_to_esc_id);
                    $stmt->bindParam(':org_id', $data['org_id']);
                    if($data['choosedNotifiedCategory'] === 'user'){
                        $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']);
                        $stmt->bindValue(':group_id', NULL);
                    }else{
                        $stmt->bindValue(':employee_id', NULL);
                        $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']);
                    }
                    $stmt->bindParam(':days_start', $filter['start']);
                    $stmt->bindParam(':days_freq', $filter['freq']);
                    $stmt->bindParam(':table_name', $filter['table_name']);
                    $stmt->bindParam(':field_id', $filter['field_id']);
                    $stmt->bindParam(':notification_trigger_number', intval($notification_number));
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }
            $query = "update $db_name.email_template set subject = :subject, body = :body where template_id = :template_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':subject', $data['emailtemplates']['subject']);
            $stmt->bindParam(':body', $data['emailtemplates']['body']);
            $stmt->bindParam(':template_id', $data['emailtemplates']['template_id']);
            $stmt->execute();
            $result = $stmt->rowCount();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/deletenotification', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        $result = new stdClass();
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            switch($data['report_type_code']){
                case 'Hazard':
                    $db_name = "stellarhse_hazard";
                break;
                case 'ABCanTrack':
                    $db_name = "stellarhse_incident";
                break;
                case 'Inspection':
                    $db_name = "stellarhse_inspection";
                break;
                case 'SafetyMeeting':
                    $db_name = "stellarhse_safetymeeting";
                break;
                case 'MaintenanceManagement':
                    $db_name = "stellarhse_maintenance";
                break;
                case 'Training':
                    $db_name = "stellarhse_training";
                break;
            }
            $query = "delete from $db_name.email_to where org_id = :org_id and notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $result->row1 = $stmt->rowCount();
            $query = "delete from $db_name.email_to_esc where org_id = :org_id and notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $result->row2 = $stmt->rowCount();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/emailtemplates', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            switch ($data['reportType']) {
                case 'hazard':
                    $query = "select * from stellarhse_hazard.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
                case 'incident':
                    $query = "select * from stellarhse_incident.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
                case 'inspection':
                    $query = "select * from stellarhse_inspection.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
                case 'safetymeeting':
                    $query = "select * from stellarhse_safetymeeting.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
                case 'maintenance':
                    $query = "select * from stellarhse_maintenance.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
                case 'training':
                    $query = "select * from stellarhse_training.email_template where `order` = 2 and is_active = 1 and org_id = :org_id";
                    break;
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            // $stmt->bindParam(':language_id', $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getnotificationdata', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        $result = new stdClass();
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            switch($data['reportType']){
                case 'Hazard':
                    $db_name = "stellarhse_hazard";
                break;
                case 'ABCanTrack':
                    $db_name = "stellarhse_incident";
                break;
                case 'Inspection':
                    $db_name = "stellarhse_inspection";
                break;
                case 'SafetyMeeting':
                    $db_name = "stellarhse_safetymeeting";
                break;
                case 'MaintenanceManagement':
                    $db_name = "stellarhse_maintenance";
                break;
                case 'Training':
                    $db_name = "stellarhse_training";
                break;
            }
            $query = "select * from $db_name.email_to where org_id = :org_id and notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $result->row1 = $stmt->fetchAll(PDO::FETCH_OBJ);
            $query = "select * from $db_name.email_to_esc where org_id = :org_id and notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $result->row2 = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/updatenotification', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_notification.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            switch($data['choosedNotificationModuleCode']){
                case 'Hazard':
                    $db_name = "stellarhse_hazard";
                break;
                case 'ABCanTrack':
                    $db_name = "stellarhse_incident";
                break;
                case 'Inspection':
                    $db_name = "stellarhse_inspection";
                break;
                case 'SafetyMeeting':
                    $db_name = "stellarhse_safetymeeting";
                break;
                case 'MaintenanceManagement':
                    $db_name = "stellarhse_maintenance";
                break;
                case 'Training':
                    $db_name = "stellarhse_training";
                break;
            }
            $query = "delete from $db_name.email_to where notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $query = "delete from $db_name.email_to_esc where notification_trigger_number = :notification_trigger_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':notification_trigger_number', $data['notification_trigger_number']);
            $stmt->execute();
            $query = "select email_type_id from email_type where email_type_code = 'NewReport'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $email_type_id = $stmt->fetchColumn();
            foreach($data['notifiedStandardFilterFields'] as $filter){
                if($filter['choosed'] === true){
                    if($filter['field_name'] === 'CorrectiveActionsHeader'){
                        $query = "select $db_name.myuuid()";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                        $email_to_id = $stmt->fetchColumn();
                        $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                        values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':email_to_id', $email_to_id);
                        $stmt->bindValue(':table_key_value', NULL);
                        $stmt->bindParam(':email_type_id', $email_type_id);
                        $stmt->bindParam(':org_id', $data['org_id']);
                        if($data['choosedNotifiedCategory'] === 'user'){
                            $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']['employee_id']);
                            $stmt->bindValue(':group_id', NULL);
                        }else{
                            $stmt->bindValue(':employee_id', NULL);
                            $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']['group_id']);
                        }
                        $stmt->bindParam(':table_name', $filter['table_name']);
                        $stmt->bindParam(':field_id', $filter['field_id']);
                        $stmt->bindParam(':notification_trigger_number', intval($data['notification_trigger_number']));
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else {
                        foreach($filter['filterValues'] as $value){
                            if($value['choosed'] === true){
                                $query = "select $db_name.myuuid()";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                $email_to_id = $stmt->fetchColumn();
                                $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                                values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':email_to_id', $email_to_id);
                                $stmt->bindParam(':table_key_value', $value['id']);
                                $stmt->bindParam(':email_type_id', $email_type_id);
                                $stmt->bindParam(':org_id', $data['org_id']);
                                if($data['choosedNotifiedCategory'] === 'user'){
                                    $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']['employee_id']);
                                    $stmt->bindValue(':group_id', NULL);
                                }else{
                                    $stmt->bindValue(':employee_id', NULL);
                                    $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']['group_id']);
                                }
                                $stmt->bindParam(':table_name', $filter['table_name']);
                                $stmt->bindParam(':field_id', $filter['field_id']);
                                $stmt->bindParam(':notification_trigger_number', intval($data['notification_trigger_number']));
                                $stmt->execute();
                                $result = $stmt->rowCount();
                            }
                        }
                    }
                }
            }
            foreach($data['notifiedSpecialFilterFields'] as $filter){
                if($filter['choosed'] === true){
                    if($filter['field_name'] === 'CorrectiveActionsHeader'){
                        $query = "select $db_name.myuuid()";
                        $stmt = $db->prepare($query);
                        $stmt->execute();
                        $email_to_id = $stmt->fetchColumn();
                        $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                        values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':email_to_id', $email_to_id);
                        $stmt->bindValue(':table_key_value', NULL);
                        $stmt->bindParam(':email_type_id', $email_type_id);
                        $stmt->bindParam(':org_id', $data['org_id']);
                        if($data['choosedNotifiedCategory'] === 'user'){
                            $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']['employee_id']);
                            $stmt->bindValue(':group_id', NULL);
                        }else{
                            $stmt->bindValue(':employee_id', NULL);
                            $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']['group_id']);
                        }
                        $stmt->bindParam(':table_name', $filter['table_name']);
                        $stmt->bindParam(':field_id', $filter['field_id']);
                        $stmt->bindParam(':notification_trigger_number', intval($data['notification_trigger_number']));
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else {
                        foreach($filter['filterValues'] as $value){
                            if($value['choosed'] === true){
                                $query = "select $db_name.myuuid()";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                $email_to_id = $stmt->fetchColumn();
                                $query = "insert into $db_name.email_to (email_to_id,table_key_value,email_type_id,org_id,employee_id,group_id,table_name,field_id,notification_trigger_number) 
                                values (:email_to_id,:table_key_value,:email_type_id,:org_id,:employee_id,:group_id,:table_name,:field_id,:notification_trigger_number)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':email_to_id', $email_to_id);
                                $stmt->bindParam(':table_key_value', $value['id']);
                                $stmt->bindParam(':email_type_id', $email_type_id);
                                $stmt->bindParam(':org_id', $data['org_id']);
                                if($data['choosedNotifiedCategory'] === 'user'){
                                    $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']['employee_id']);
                                    $stmt->bindValue(':group_id', NULL);
                                }else{
                                    $stmt->bindValue(':employee_id', NULL);
                                    $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']['group_id']);
                                }
                                $stmt->bindParam(':table_name', $filter['table_name']);
                                $stmt->bindParam(':field_id', $filter['field_id']);
                                $stmt->bindParam(':notification_trigger_number', intval($data['notification_trigger_number']));
                                $stmt->execute();
                                $result = $stmt->rowCount();
                            }
                        }
                    }
                }
            }
            foreach($data['notifiedFilterEscalatedFields'] as $filter){
                if($filter['choosed'] === true){
                    $query = "select $db_name.myuuid()";
                    $stmt = $db->prepare($query);
                    $stmt->execute();
                    $email_to_esc_id = $stmt->fetchColumn();
                    $query = "insert into $db_name.email_to_esc (email_to_esc_id,org_id,employee_id,group_id,days_start,days_freq,table_name,field_id,notification_trigger_number) 
                    values (:email_to_esc_id,:org_id,:employee_id,:group_id,:days_start,:days_freq,:table_name,:field_id,:notification_trigger_number)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':email_to_esc_id', $email_to_esc_id);
                    $stmt->bindParam(':org_id', $data['org_id']);
                    if($data['choosedNotifiedCategory'] === 'user'){
                        $stmt->bindParam(':employee_id', $data['notifiedSelectedUser']['employee_id']);
                        $stmt->bindValue(':group_id', NULL);
                    }else{
                        $stmt->bindValue(':employee_id', NULL);
                        $stmt->bindParam(':group_id', $data['notifiedSelectedGroup']['group_id']);
                    }
                    $stmt->bindParam(':days_start', $filter['start']);
                    $stmt->bindParam(':days_freq', $filter['freq']);
                    $stmt->bindParam(':table_name', $filter['table_name']);
                    $stmt->bindParam(':field_id', $filter['field_id']);
                    $stmt->bindParam(':notification_trigger_number', intval($data['notification_trigger_number']));
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }
            $query = "update $db_name.email_template set subject = :subject, body = :body where template_id = :template_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':subject', $data['emailtemplates']['subject']);
            $stmt->bindParam(':body', $data['emailtemplates']['body']);
            $stmt->bindParam(':template_id', $data['emailtemplates']['template_id']);
            $stmt->execute();
            $result = $stmt->rowCount();
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
