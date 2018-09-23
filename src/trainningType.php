<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getTrainings', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);exit;
        try {
            $db = $this->db;
            $provider_id = '';
            //$data['org_id'] = 'cs4sql-b462002a-f447-11e6-8267-5254000a52fa';
            $query = "call stellarhse_training.sp_training_type_data(:org_id);";
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

    $app->post('/updateTrainingType', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);
        $db;
        try {
            $db = $this->db;
            $query = "select count(*) as count from stellarhse_training.training_type where hide <> 1 and   org_id =:org_id and training_name = :training_name ";
            $query.= $data['training_type_id'] ? " and training_type_id <> :training_type_id" : "";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":training_name", $data['training_name']);
            if ($data['training_type_id']) {
                $stmt->bindParam(":training_type_id", $data['training_type_id']);
            }

            $stmt->execute();
            $result = $stmt->fetchColumn();
           // var_dump($result);exit;

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                
                if ($data['training_type_id']) {
                    // update mode
                    $operation_type = 'update';
                    $training_type_id = $data['training_type_id'];
                    
                    $query = "call stellarhse_training.sp_add_training(:org_id,:training_type_id,:training_name,:evidence_of_completion,:duration_of_training,:freq,:employee_id,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":training_type_id", $training_type_id);
                    $stmt->bindParam(":training_name", $data['training_name']);
                    $stmt->bindParam(":evidence_of_completion", $data['evidence_of_completion_required']);
                    $stmt->bindParam(":duration_of_training", $data['duration_of_training']);
                    $stmt->bindParam(":freq", $data['recertificate_frequency']);
                    $stmt->bindParam(":employee_id", $data['added_by']);
                    $stmt->bindParam(":operation_type", $operation_type);
                    $success =$stmt->execute();
                
                } else {
                    //add mode 
                    $operation_type = 'add';
                    $training_type_id = Utils::getUUID($db);
                  
                    $query = "call stellarhse_training.sp_add_training(:org_id,:training_type_id,:training_name,:evidence_of_completion,:duration_of_training,:freq,:employee_id,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":training_type_id", $training_type_id);
                    $stmt->bindParam(":training_name", $data['training_name']);
                    $stmt->bindParam(":evidence_of_completion", $data['evidence_of_completion_required']);
                    $stmt->bindParam(":duration_of_training", $data['duration_of_training']);
                    $stmt->bindParam(":freq", $data['recertificate_frequency']);
                    $stmt->bindParam(":employee_id", $data['added_by']);
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

  $app->post('/deleteTrainingType', function($request, $response, $args) {

        $error = new errorMessage();
        $data = $request->getParsedBody();

        try {
            $db = $this->db;
            $operation_type = 'delete';
            $training_type_id = $data['training_type_id'];
            
            $query = "call stellarhse_training.sp_add_training(:org_id,:training_type_id,:training_name,:evidence_of_completion,:duration_of_training,:freq,:employee_id,:operation_type);";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":training_type_id", $training_type_id);
            $stmt->bindParam(":training_name", $data['training_name']);
            $stmt->bindParam(":evidence_of_completion", $data['evidence_of_completion_required']);
            $stmt->bindParam(":duration_of_training", $data['duration_of_training']);
            $stmt->bindParam(":freq", $data['recertificate_frequency']);
            $stmt->bindParam(":employee_id", $data['added_by']);
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

  $app->post('/trainingTypeHistory', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();

        try {
            $db = $this->db;

            $query = " SELECT `htt`.* , `ho`.`history_operation_name` , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                        FROM `stellarhse_training`.`hist_training_type` htt 
                        LEFT JOIN `stellarhse_common`.`history_operation` ho ON `htt`.`hist_operation_id` = `ho`.`history_operation_id` 
                        LEFT JOIN `stellarhse_auth`.`employee` e ON `htt`.`editing_by` = `e`.`employee_id` 
                        WHERE  `htt`.`org_id` = :org_id";
            $query .= $post['training_type_id'] ? " AND  `htt`.`training_type_id` = :training_type_id" : " ";     
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            if ($post['training_type_id']) {
                $stmt->bindParam(":training_type_id", $post['training_type_id']);
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
    $app->post('/getTrainingTypeData', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);exit;
        try {
            $db = $this->db;
           
            $query = "select * from stellarhse_training.training_type where training_type_id =:training_type_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":training_type_id", $data['training_type_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});
