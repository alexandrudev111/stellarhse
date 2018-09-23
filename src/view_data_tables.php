<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {
    $app->post('/getselectedview', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $result = filterViewDataTables($db, $data);
        session_start();
        $_SESSION["path"] = '';

        return $this->response->withJson($result);
    });

    $app->post('/getDefaulTemplatesByReportType', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getDefaulTemplatesByReportType', $post);
            $default_tempale_type_id_query = " SELECT template_type_id FROM stellarhse_common.template_type WHERE 
                                               template_type_code = 'DefaultTemplate' AND language_id = :lang_id ";
            $stmt = $db->prepare($default_tempale_type_id_query);
            $stmt->bindParam(":lang_id", $post['language_id']);
            $stmt->execute();
            $template_type_id = $stmt->fetchColumn();
            switch ($post['type']) {
                case "incident":
                    $db_name = 'stellarhse_incident';
                    break;
                case "hazard":
                    $db_name = 'stellarhse_hazard';
                    break;
                case "inspection":
                    $db_name = 'stellarhse_inspection';
                    break;
                case "safetymeeting":
                    $db_name = 'stellarhse_safetymeeting';
                    break;
                case "training":
                    $db_name = 'stellarhse_training';
                    break;
                case "maintenance":
                    $db_name = 'stellarhse_maintenance';
                    break;
            }
            $query = " SELECT template_id , template_name FROM " . $db_name . ".template WHERE template_type_id = :template_type_id 
                      AND employee_id = :employee_id AND org_id = :org_id and language_id = :lang_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":template_type_id", $template_type_id);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":lang_id", $post['language_id']);
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

    $app->post('/getDefTempDetails', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getDefTempDetails', $post);
            switch ($post['report_type']) {
                case "ABCanTrack":
                    $db_name = 'stellarhse_incident';
                    break;
                case "Hazard":
                    $db_name = 'stellarhse_hazard';
                    break;
                case "Inspection":
                    $db_name = 'stellarhse_inspection';
                    break;
                case "SafetyMeeting":
                    $db_name = 'stellarhse_safetymeeting';
                    break;
                case "Training":
                    $db_name = 'stellarhse_training';
                    break;
                case "MaintenanceManagement":
                    $db_name = 'stellarhse_maintenance';
                    break;
            }
            $query = " SELECT template_field.field_id, field_name,  template_field.field_param , tab_name , field.table_name ,field_label, sub_tab.`order`
                        from ".$db_name.".template_field
                            join ".$db_name.".field on field.field_id =  template_field.field_id
                            join ".$db_name.".org_field on field.field_id = org_field.field_id
                            join ".$db_name.".sub_tab on sub_tab.sub_tab_id = field.sub_tab_id
                            join  ".$db_name.".tab on  tab.tab_id = sub_tab.tab_id
                      where org_field.org_id=:org_id and template_id =:template_id   order by  sub_tab.`Order` asc, field.`order` asc";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":template_id", $post['default_template_id']);
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

    $app->post('/getSubTypesViews', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
       // var_dump($data);
        try {
            switch ($data['module']) {
                case 1:
                    $dbname = 'stellarhse_hazard';
                    break;
                case 2:
                    $dbname = 'stellarhse_incident';
                    break;
                case 3:
                    $dbname = 'stellarhse_inspection';
                    break;
                case 4:
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 5:
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 6:
                    $dbname = 'stellarhse_training';
                    break;
            }
            $query = "SELECT * from $dbname.`favorite_type`";
            $stmt = $db->prepare($query);
             $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/saveFavoritView', function($request, $response, $args) {
        $body = $request->getParsedBody();
        $data = $body['data'];
        $db = $this->db;
        $error = new errorMessage();
       // var_dump($data);
        try {
            switch ($data['moduleType']) {
                case 1:
                    $dbname = 'stellarhse_hazard';
                    break;
                case 2:
                    $dbname = 'stellarhse_incident';
                    break;
                case 3:
                    $dbname = 'stellarhse_inspection';
                    break;
                case 4:
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 5:
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 6:
                    $dbname = 'stellarhse_training';
                    break;
            }
            $favorite_id = Utils::getUUID($db);

            $query = "INSERT INTO $dbname.`favorite_table` (`favorite_table_id`,`favorite_table_name`,`employee_id`,`org_id`,`favorite_type_id`) VALUES
                (:favorite_table_id, :favorite_table_name, :employee_id, :org_id, :favorite_type_id)";
            $stmt = $db->prepare($query);

            $stmt->bindParam(":favorite_table_id", $favorite_id);
            $stmt->bindParam(":favorite_table_name", $data['favoritName']);
            $stmt->bindParam(":employee_id", $data['employee_id']);
            $stmt->bindParam(":org_id", $data['orgId']);
            $stmt->bindParam(":favorite_type_id", $data['favoritTypeId']);
            if ($stmt->execute()) {
                $fieldsIDs = $data['fieldIDs'];
          //      var_dump($fieldsIDs);
               foreach ($fieldsIDs as $field) {
              //  var_dump($field);
                    $query = "INSERT INTO $dbname.`favorite_field` (`favorite_table_id`,`field_id`) VALUES (:favorite_table_id, :field_id)";
                    $stmt = $db->prepare($query);

                    $stmt->bindParam(":favorite_table_id", $favorite_id);
                    $stmt->bindParam(":field_id", $field['id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
               }
            }
            return $this->response->withJson($result);

        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateFavoritView', function($request, $response, $args) {
        $body = $request->getParsedBody();
        $data = $body['data'];
        $db = $this->db;
        $error = new errorMessage();
       // var_dump($data);
        try {
            switch ($data['moduleType']) {
                case 1:
                    $dbname = 'stellarhse_hazard';
                    break;
                case 2:
                    $dbname = 'stellarhse_incident';
                    break;
                case 3:
                    $dbname = 'stellarhse_inspection';
                    break;
                case 4:
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 5:
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 6:
                    $dbname = 'stellarhse_training';
                    break;
            }
            if ($data['opreationType'] == 'rename') {

                $query = "UPDATE $dbname.`favorite_table` SET favorite_table_name =:favorite_table_name WHERE favorite_table_id =:favorite_table_id";

                $stmt = $db->prepare($query);

                $stmt->bindParam(":favorite_table_id", $data['favoritViewId']);
                $stmt->bindParam(":favorite_table_name", $data['favoritName']);

                $stmt->execute();

                $result = $stmt->rowCount();    
            }
            if ($data['opreationType'] == 'delete' || $data['opreationType'] == 'update') {

                $query = "DELETE FROM $dbname.`favorite_field` WHERE favorite_table_id =:favorite_table_id";

                $stmt = $db->prepare($query);

                $stmt->bindParam(":favorite_table_id", $data['favoritViewId']);
                $stmt->execute();

                if ($stmt->execute() && $data['opreationType'] == 'delete') {

                   $query = "DELETE  FROM $dbname.`favorite_table` WHERE favorite_table_id =:favorite_table_id";

                    $stmt = $db->prepare($query);

                    $stmt->bindParam(":favorite_table_id", $data['favoritViewId']);

                    $stmt->execute();

                    $result = $stmt->rowCount();
                      
                }
                elseif ($stmt->execute() && $data['opreationType'] == 'update') {
                    $fieldsIDs = $data['fieldIDs'];
                    foreach ($fieldsIDs as $field) {
                        $query = "INSERT INTO $dbname.`favorite_field` (`favorite_table_id`,`field_id`) VALUES (:favorite_table_id, :field_id)";
                        $stmt = $db->prepare($query);

                        $stmt->bindParam(":favorite_table_id", $data['favoritViewId']);
                        $stmt->bindParam(":field_id", $field['id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                   }
                }
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getSubTypesFavoritViews', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
       // var_dump($data);
        try {
            switch ($data['module']) {
                case 1:
                    $product_code = 'Hazard';
                    break;
                case 2:
                    $product_code = 'ABCanTrack';
                    break;
                case 3:
                    $product_code = 'Inspection';
                    break;
                case 4:
                    $product_code = 'SafetyMeeting';
                    break;
                case 5:
                    $product_code = 'MaintenanceManagement';
                    break;
                case 6:
                    $product_code = 'Training';
                    break;
            }
            $query = "call stellarhse_common.sp_get_favorites_datatables(:org_id, :employee_id, :product_code) ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $data['employee_id']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":product_code", $product_code);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    
    $app->post('/getUserEmail', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            
            $query = "SELECT * from stellarhse_auth.employee WHERE employee_id=:employee_id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $data['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/sendLockedEmail', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            
            $email = new SendEMail();

            $email->to = $data['to'] ;
            $email->from = $data['from'];
            $email->cc = '';
            $email->subject = $data['subject'];
            $email->body = $data['body'];
            $result = $email->sendmail($email);
            return $this->response->withJson($result);

        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getFisledsByTab', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
           // var_dump($data);
            switch ($data['product_code']) {
                case "hazard":
                    $data['product_code'] = 'Hazard';
                    break;
                case 2:
                    $data['product_code'] = 'stellarhse_incident';
                    break;
                case 3:
                    $data['product_code'] = 'stellarhse_inspection';
                    break;
                case 4:
                   $data['product_code'] = 'stellarhse_safetymeeting';
                    break;
                case 5:
                    $data['product_code'] = 'stellarhse_maintenance';
                    break;
                case 6:
                    $data['product_code'] = 'stellarhse_training';
                    break;
            }
            $query = "call stellarhse_common.sp_get_fields_by_tab(:tabId, :org_id, :product_code)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":tabId", $data['tabId']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":product_code", $data['product_code']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getFisledsBySection', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
           // var_dump($data);
            switch ($data['product_code']) {
                case "hazard":
                    $data['product_code'] = 'Hazard';
                    break;
                case 2:
                    $data['product_code'] = 'stellarhse_incident';
                    break;
                case 3:
                    $data['product_code'] = 'stellarhse_inspection';
                    break;
                case 4:
                   $data['product_code'] = 'stellarhse_safetymeeting';
                    break;
                case 5:
                    $data['product_code'] = 'stellarhse_maintenance';
                    break;
                case 6:
                    $data['product_code'] = 'stellarhse_training';
                    break;
            }
            $query = "call stellarhse_common.sp_get_fields_by_section(:sectionId, :org_id, :product_code)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":sectionId", $data['sectionId']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":product_code", $data['product_code']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    function filterViewDataTables($db, $data) {

        $result = [];
        $creator_id = 0;
     //   var_dump($data);
        switch ($data['selectedView']) {
            // Hazard
            case 811:
            case 111:
            case 821:
            case 121:
                $query = "call stellarhse_hazard.get_corrective_action(:xml)";
                break;
            case 211:
            case 611:
            case 221:
            case 621:
                $query = "call stellarhse_hazard.get_hazard(:xml)";
                break;
            case 311:
            case 321:
                $query = "call stellarhse_hazard.get_documents(:xml)";
                break;
            case 411:
            case 421:
                $query = "call stellarhse_hazard.get_people_involved(:xml)";
                break;
            case 511:
            case 521:
                $query = "call stellarhse_hazard.get_impacts(:xml)";
                break;
            case 711:
            case 721:
                $query = "call stellarhse_hazard.get_version(:xml)";
                break;
            case 911: // Risk Controls Required 
            case 921:
                $query = "call stellarhse_hazard.get_risk_control_required(:xml)";
                break;
            case 1011: // third party
            case 1021:
                $query = "call stellarhse_hazard.get_third_party(:xml)";
                break;
            case 1111: // Equipmnts
            case 1121:
                $query = "call stellarhse_hazard.get_equipment(:xml)";
                break;
            case 1211: // Equipmnts
            case 1221:
                $query = "call stellarhse_hazard.get_classification(:xml)";
                break;
            case 1311: // Equipmnts
            case 1321:
                $query = "call stellarhse_hazard.get_deleted(:xml)";
                break;

            // safety meeting views
            case 114: // all safety meeting
            case 124: 
            case 214: // my safety meeting
            case 224: 
                $query = "call stellarhse_safetymeeting.get_safetymeeting(:xml)";
                break;
            case 314: // all corrective action 
            case 324: 
            case 414:// my corrective action 
            case 424: 
                $query = "call stellarhse_safetymeeting.get_corrective_action(:xml)";
                break;
            case 514:
                $query = "call stellarhse_safetymeeting.sp_get_People_involved(:org_id, :search, :limit, :start)";
                break;
            case 614:
                $query = "call stellarhse_safetymeeting.sp_get_Third_parties(:org_id, :search, :limit, :start)";
                break;
            case 714:
                $query = "call stellarhse_safetymeeting.sp_safetymeeting_versions(:org_id, :search, :limit, :start)";
                break;

            //////// inspection ////////    
            case 113: // all corrective
            case 124: 
            case 613: //my corrective
            case 624: 
                $query = "call stellarhse_inspection.get_corrective_action(:xml)";
                break;

            case 513: // my inspection
            case 523: 
            case 213: // all inspection
            case 223: 
                $query = "call stellarhse_inspection.get_inspection(:xml)";
                break;
            case 313:
                $query = "call stellarhse_inspection.sp_getEquipment_inspected(:org_id, :search, :limit, :start)";
                break;
            case 413:
                $query = "call stellarhse_inspection.sp_get_Third_parties_involved(:org_id, :search, :limit, :start)";
                break;
            case 713:
                $query = "call stellarhse_inspection.sp_get_Hazard_classifications(:org_id, :search, :limit, :start)";
                break;

            case 813:
                $query = "call stellarhse_inspection.sp_get_People_involved(:org_id, :search, :limit, :start)";
                break;
            case 913:
                $query = "call stellarhse_inspection.sp_get_risk_control(:org_id, :search, :limit, :start)";
                break;
            case 1013:
                $query = "call stellarhse_inspection.sp_get_impacts(:org_id, :search, :limit, :start)";
                break;
            case 1113:
                $query = "call stellarhse_inspection.sp_inspection_versions(:org_id, :search, :limit, :start)";
                break;

            //////// incident //////// 
            case 112:  // All incident
            case 122: 
            case 212: // My incident
            case 222: 
                $query = "call stellarhse_incident.get_incident(:xml)";
                break;
            case 312: //All corrective action
            case 322:
            case 412: //My corrective action
            case 422:
                $query = "call stellarhse_incident.get_corrective_action(:xml)";
                break;
            case 512:
                $query = "call stellarhse_incident.sp_get_cause_analysis(:org_id, :search, :limit, :start)";
                break;
            case 612:
                $query = "call stellarhse_incident.sp_get_all_people_involved(:org_id, :search, :limit, :start)";
                break;
            case 712:
                $query = "call stellarhse_incident.sp_get_risk_control_required(:org_id, :search, :limit, :start)";
                break;
            case 812:
                $query = "call stellarhse_incident.sp_get_third_parties_involved(:org_id, :search, :limit, :start)";
                break;
            case 912:
                $query = "call stellarhse_incident.sp_get_equipment_involved(:org_id, :search, :limit, :start)";
                break;
            case 1012:
                $query = "call stellarhse_incident.sp_get_observations_view(:org_id, :search, :limit, :start)";
                break;
            case 1112:
                $query = "call stellarhse_incident.sp_get_env_condition_view(:org_id, :search, :limit, :start)";
                break;
            case 1212:
                $query = "call stellarhse_incident.sp_get_impacts(:org_id, :search, :limit, :start)";
                break;
            case 1312:
                $query = "call stellarhse_incident.sp_get_investigation_findings(:org_id, :search, :limit, :start)";
                break;

            case 1412:
                $query = "call stellarhse_incident.sp_get_injured_body_part(:org_id, :search, :limit, :start)";
                break;
            case 1512:
                $query = "call stellarhse_incident.sp_get_incidents_versions(:org_id, :search, :limit, :start)";
                break;
            case 1612:
                $query = "call stellarhse_incident.sp_get_corrective_emaillog(:org_id, :search, :limit, :start)";
                break;
            case 1712:
                $query = "call stellarhse_incident.sp_get_corrective_supportdocs(:org_id, :search, :limit, :start)";
                break;
            case 1812:
                $query = "call stellarhse_incident.sp_get_deleted_incident(:org_id, :search, :limit, :start)";
                break;

            ///Maintenance
            case 115:
                $query = "call stellarhse_maintenance.sp_get_maintenance(:org_id, :search, :limit, :start)";
                break;
            case 215:
                $creator_id = 1;
                $query = "call stellarhse_maintenance.sp_get_my_maintenance(:org_id,:creator_id ,:search, :limit, :start)";
                break;

            case 415:
                $query = "call stellarhse_maintenance.sp_get_followup_action(:org_id,:search, :limit, :start)";
                break;

            case 515:
                $creator_id = 1;
                $query = "call stellarhse_maintenance.sp_get_my_folloup_action(:org_id,:creator_id ,:search, :limit, :start)";
                break;

            case 1015:
                $query = "call stellarhse_maintenance.sp_get_people_involved(:org_id, :search, :limit, :start)";
                break;


            case 1115:
                $query = "call stellarhse_maintenance.sp_get_third_party(:org_id, :search, :limit, :start)";
                break;

            case 1215:
                $query = "call stellarhse_maintenance.sp_maintenance_versions(:org_id, :search, :limit, :start)";
                break;

            // training views
            case 116:
                $query = "call stellarhse_training.sp_get_training(:org_id, :search, :limit, :start)";
                break;
            case 216:
                $creator_id = 1;
                $query = "call stellarhse_training.sp_get_my_training(:org_id, :creator_id, :search, :limit, :start)";
                break;
            case 316:
                $query = "call stellarhse_training.sp_get_followup_action(:org_id, :search, :limit, :start)";
                break;
            case 416:
                $creator_id = 1;
                $query = "call stellarhse_training.sp_get_my_followup_action(:org_id, :creator_id, :search, :limit, :start)";
                break;
            case 516:
                $query = "call stellarhse_training.sp_get_people_involved(:org_id, :search, :limit, :start)";
                break;
            case 616:
                $query = "call stellarhse_training.sp_get_training_provider(:org_id, :search, :limit, :start)";
                break;
            case 716:
                $query = "call stellarhse_training.sp_training_versions(:org_id, :search, :limit, :start)";
                break;
        }

        $stmt = $db->prepare($query);
       // var_dump($data['xmlData']);
      //  var_dump($query); exit;
        if ($data['xmlUpdate'] == "1") {
            $stmt->bindParam(":xml", $data['xmlData']);
        }
        else{
            $stmt->bindParam(":org_id", $data['org_id']);
            if ($creator_id === 1) {
                $stmt->bindParam(":creator_id", $data['creator_id']);
            }
            $stmt->bindParam(":search", $data['search']);

            $stmt->bindParam(":limit", $data['limit']);

            $stmt->bindParam(":start", $data['start']);
        }

        $stmt->execute();
        $result['items'] = $stmt->fetchAll(PDO::FETCH_OBJ); /// Get the Data Rows
        $stmt->nextRowset();
        $result['count'] = $stmt->fetchColumn(); /// Get the Data Founds Rows
        return $result;
    }

});
