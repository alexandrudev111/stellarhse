<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getProviders', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);exit;
        try {
            $db = $this->db;
            $provider_id = '';
            //$data['org_id'] = 'cs4sql-b462002a-f447-11e6-8267-5254000a52fa';
            $query = "call stellarhse_training.sp_provider_data(:org_id);";
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


    $app->post('/updateTrainingProvider', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);
        $db;
        try {
            $db = $this->db;
            $query = "select count(*) as count from stellarhse_training.provider where hide <> 1 and   org_id =:org_id and provider_name = :provider_name ";
            $query.= $data['provider_id'] ? " and provider_id <> :provider_id" : "";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":provider_name", $data['provider_name']);
            if ($data['provider_id']) {
                $stmt->bindParam(":provider_id", $data['provider_id']);
            }

            $stmt->execute();
            $result = $stmt->fetchColumn();
           // var_dump($result);exit;

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                
                if ($data['provider_id']) {
                    // update mode
                    $operation_type = 'update';
                    $provider_id = $data['provider_id'];
                    $is_active =  1 ;
                  
                     $query = "call stellarhse_training.sp_add_provider(:org_id,:provider_name,:phone,:website,:is_active,:provider_id,:employee_id,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":provider_name", $data['provider_name']);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":provider_id", $provider_id);
                    $stmt->bindParam(":employee_id", $data['added_by']);
                    $stmt->bindParam(":operation_type", $operation_type);
                    $stmt->bindParam(":phone", $data['phone']);
                    $stmt->bindParam(":website", $data['website']);
                    $success =$stmt->execute();
                
                } else {
                    //add mode 
                    $operation_type = 'add';
                    $provider_id = Utils::getUUID($db);
                    $is_active =  1 ;
                  
                     $query = "call stellarhse_training.sp_add_provider(:org_id,:provider_name,:phone,:website,:is_active,:provider_id,:employee_id,:operation_type);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $data['org_id']);
                    $stmt->bindParam(":provider_name", $data['provider_name']);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":provider_id", $provider_id);
                    $stmt->bindParam(":employee_id", $data['added_by']);
                    $stmt->bindParam(":operation_type", $operation_type);
                    $stmt->bindParam(":phone", $data['phone']);
                    $stmt->bindParam(":website", $data['website']);
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

  $app->post('/deleteTrainingProvider', function($request, $response, $args) {

        $error = new errorMessage();
        $data = $request->getParsedBody();

        try {
            $db = $this->db;
            $operation_type = 'delete';
            $provider_id = $data['provider_id'];
            $is_active =  1 ;
          
             $query = "call stellarhse_training.sp_add_provider(:org_id,:provider_name,:phone,:website,:is_active,:provider_id,:employee_id,:operation_type);";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":provider_name", $data['provider_name']);
            $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
            $stmt->bindParam(":provider_id", $provider_id);
            $stmt->bindParam(":employee_id", $data['added_by']);
            $stmt->bindParam(":operation_type", $operation_type);
            $stmt->bindParam(":phone", $data['phone']);
            $stmt->bindParam(":website", $data['website']);
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

  $app->post('/trainingProviderHistory', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();

        try {
            $db = $this->db;

            $query = " SELECT `htp`.* , `ho`.`history_operation_name` , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                        FROM `stellarhse_training`.`hist_provider` htp 
                        LEFT JOIN `stellarhse_common`.`history_operation` ho ON `htp`.`operation_id` = `ho`.`history_operation_id` 
                        LEFT JOIN `stellarhse_auth`.`employee` e ON `htp`.`updated_by_id` = `e`.`employee_id` 
                        WHERE  `htp`.`org_id` = :org_id";
            $query .= $post['provider_id'] ? " AND  `htp`.`provider_id` = :provider_id" : " ";     
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            if ($post['provider_id']) {
                $stmt->bindParam(":provider_id", $post['provider_id']);
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
    $app->post('/getProviderData', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
       // var_dump($data);exit;
        try {
            $db = $this->db;
           
            $query = "select * from stellarhse_training.provider where provider_id =:provider_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":provider_id", $data['provider_id']);
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
