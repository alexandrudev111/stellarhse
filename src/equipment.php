<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getEquipments', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);exit;
        try {
            $db = $this->db;
            $query = "call stellarhse_common.sp_equipment_data(:org_id);";
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

    $app->post('/updateEquipment', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);
        $db;
        try {
            $db = $this->db;
            $query = "select count(*) as count from stellarhse_common.equipment where hide <> 1 and   org_id =:org_id and equipment_name = :equipment_name ";
            $query.= $data['equipment_id'] ? " and equipment_id <> :equipment_id" : "";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":equipment_name", $data['equipment_name']);
            if ($data['equipment_id']) {
                $stmt->bindParam(":equipment_id", $data['equipment_id']);
            }

            $stmt->execute();
            $result = $stmt->fetchColumn();
           //var_dump($result);exit;

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                
                if ($data['equipment_id']) {
                    // update mode
                    $operation_type = 'update';
                    $equipment_id = $data['equipment_id'];
                    $hide =  0 ;
                  
                     $query = "call stellarhse_common.sp_equipment_transaction(:equipment_id,:equipment_type,:equipment_category,:equipment_name,:equipment_number,:org_id,:employee_id,:hide,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":equipment_id", $equipment_id);
                    $stmt->bindParam(":equipment_type", $data['equipment_type']);
                    $stmt->bindParam(":equipment_category", $data['equipment_category_name']);                    
                    $stmt->bindParam(":equipment_name", $data['equipment_name']);
                    $stmt->bindParam(":equipment_number", $data['equipment_number']);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":employee_id", $data['editing_by']);
                    $stmt->bindParam(":hide", $hide, PDO::PARAM_INT);
                    $stmt->bindParam(":operation_type", $operation_type);

                    $success =$stmt->execute();
                
                } else {
                    //add mode 
                    $operation_type = 'add';
                    $equipment_id = Utils::getUUID($db);
                    $hide =  0 ;
                  
                     $query = "call stellarhse_common.sp_equipment_transaction(:equipment_id,:equipment_type,:equipment_category,:equipment_name,:equipment_number,:org_id,:employee_id,:hide,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":equipment_id", $equipment_id);
                    $stmt->bindParam(":equipment_type", $data['equipment_type']);
                    $stmt->bindParam(":equipment_category", $data['equipment_category_name']);                    
                    $stmt->bindParam(":equipment_name", $data['equipment_name']);
                    $stmt->bindParam(":equipment_number", $data['equipment_number']);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":employee_id", $data['editing_by']);
                    $stmt->bindParam(":hide", $hide, PDO::PARAM_INT);
                    $stmt->bindParam(":operation_type", $operation_type);

                    $success =$stmt->execute();
                }
            }
            $db = null;
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

  $app->post('/deleteEquipment', function($request, $response, $args) {

        $error = new errorMessage();
        $data = $request->getParsedBody();

        try {
            $db = $this->db;
            $operation_type = 'delete';
            $equipment_id = $data['equipment_id'];
            $hide =  1 ;
          
             $query = "call stellarhse_common.sp_equipment_transaction(:equipment_id,'','','','',:org_id,:employee_id,:hide,:operation_type);";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":equipment_id", $equipment_id);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":employee_id", $data['editing_by']);
            $stmt->bindParam(":hide", $hide, PDO::PARAM_INT);
            $stmt->bindParam(":operation_type", $operation_type);

           $stmt->execute();
            $db = null;
            $result = $stmt->rowCount();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

  $app->post('/equipmentHistory', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();

        try {
            $db = $this->db;

            $query = " SELECT `he`.* , `ho`.`history_operation_name` , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                        FROM `stellarhse_common`.`hist_equipment` he 
                        LEFT JOIN `stellarhse_common`.`history_operation` ho ON `he`.`operation_type_id` = `ho`.`history_operation_id` 
                        LEFT JOIN `stellarhse_auth`.`employee` e ON `he`.`editing_by` = `e`.`employee_id` 
                        WHERE `he`.`org_id` = :org_id";
            $query .= $post['equipment_id'] ? " AND  `he`.`equipment_id` = :equipment_id" : " ";   
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            if ($post['equipment_id']) {
                $stmt->bindParam(":equipment_id", $post['equipment_id']);
            }
            $stmt->execute();
            $db = null;
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});
