<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->get('/getOrgCustomerStatus/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = " SELECT `show_customer` FROM `stellarhse_auth`.`organization`
                        WHERE `org_id` = :org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchColumn();
            if ($result == 1) {
                $result = true;
            } else {
                $result = false;
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/thirdparties', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            if ($post['customer_checker']) {
                $query = " SELECT `third_party_type_id` FROM `stellarhse_common`.`third_party_type` WHERE `third_party_type_name`= 'Customer' 
                           AND `org_id` = :org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post['org_id']);
                $stmt->execute();
                $result = $stmt->fetchColumn();
                $customer_type_id = $result;
            }
            $query = "SELECT tp.third_party_id,tp.third_party_name, tp.contact_name, tp.address, tp.postal_code,concat(e.first_name,'',e.last_name)as sponser_name,tp.sponser_id, tp.is_active, 
                     CASE tp.is_active WHEN '0' THEN  'Inactive'  WHEN '1' THEN 'Active' END AS is_active_view,
                             tp.primary_phone , tpt.third_party_type_name ,c.city_name ,p.province_name ,p.province_id 
                             ,cy.country_name ,tp.city_id ,cy.country_id,tp.third_party_type_id 
                        FROM stellarhse_common.third_party tp 
                        LEFT JOIN stellarhse_common.third_party_type tpt ON tp.third_party_type_id = tpt.third_party_type_id
                        LEFT JOIN stellarhse_auth.city c ON tp.city_id = c.city_id
                        LEFT JOIN stellarhse_auth.province p ON c.province_id  = p.province_id
                        left join stellarhse_auth.employee e on e.employee_id=tp.sponser_id 
                        LEFT JOIN stellarhse_auth.country  cy ON p.country_id  = cy.country_id
                        WHERE  tp.hide != 1 AND  tp.org_id = :org_id ";
            $query .= $customer_type_id ? " AND tp.third_party_type_id != :customer_type_id " : "";
            $query .= " ORDER BY tp.third_party_name  ASC";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            if ($customer_type_id) {
                $stmt->bindParam(":customer_type_id", $customer_type_id);
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

    $app->post('/deleteThirdParty', function($request, $response, $args) {

        $error = new errorMessage();
        $post = $request->getParsedBody();
//         print_r($post); die();
        try {
            $db = $this->db;
            $operation = 'delete';

            $query = " UPDATE stellarhse_common.third_party SET hide = 1 WHERE third_party_id =:third_party_id ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":third_party_id", $post['third_party_id']);
            $stmt->execute();

            $query = "call hist_third_party_proc(:third_party_id,:org_id,:operation_type,:updated_by_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":third_party_id", $post['third_party_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":operation_type", $operation);
            $stmt->bindParam(":updated_by_id", $post['editing_by']);
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

    $app->post('/getThirdPartyTypes', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;

            $post = $request->getParsedBody();
            $query = " SELECT third_party_type_id  , third_party_type_name FROM 
                       stellarhse_common.third_party_type WHERE  language_id =:language_id 
                       AND org_id =:org_id  AND hide != 1";
            $query .= $post['customer_checker'] ? " AND `third_party_type_name` != 'Customer' " : " ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":language_id", $post['language_id']);
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

    $app->post('/updatethirdparties', function($request, $response, $args) {
        $error = new errorMessage();
        $db;
        $thirdparty;
        try {
            $thirdparty = $request->getParsedBody();
            $db = $this->db;
            $query = "select count(*) as count from stellarhse_common.third_party  where hide <> 1 and  third_party_type_id  =:third_party_type_id 
                         and   org_id =:org_id and third_party_name = :third_party_name ";
            $query.= $thirdparty['third_party_id'] ? " and third_party_id <> :third_party_id" : "";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $thirdparty['org_id']);
            $stmt->bindParam(":third_party_type_id", $thirdparty['third_party_type_id']);
            $stmt->bindParam(":third_party_name", $thirdparty['third_party_name']);
            if ($thirdparty['third_party_id']) {
                $stmt->bindParam(":third_party_id", $thirdparty['third_party_id']);
            }

            $stmt->execute();
            $result = $stmt->fetchColumn();

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                if (isset($thirdparty['sponser'])) {
                    $sponser = $thirdparty['sponser'];
                }
                if ($thirdparty['third_party_id']) {// update mode
                    //                        print_r($thirdparty); die();
                    $operation = 'update';
                    $third_party_id = $thirdparty['third_party_id'];
                    $is_active = $thirdparty['is_active'] == "1" ? 1 : 0;
                    $query = "UPDATE `stellarhse_common`.`third_party`
                                        SET
                                            `third_party_name`= :third_party_name,
                                            `contact_name`    = :contact_name,
                                            `third_party_type_id` = :third_party_type_id,
                                            `org_id` = :org_id,
                                            `address` = :address,
                                            `city_id` = :city_id,
                                            `postal_code` = :postal_code,
                                            `primary_phone` = :primary_phone,
                                            `sponser_id` = :sponser_id,
                                            `editing_by` = :editing_by,
                                            `is_active` = :is_active
                                        WHERE `third_party_id` =:third_party_id;";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":third_party_name", $thirdparty['third_party_name']);
                    $stmt->bindParam(":contact_name", $thirdparty['contact_name']);
                    $stmt->bindParam(":third_party_type_id", $thirdparty['third_party_type_id']);
                    $stmt->bindParam(":org_id", $thirdparty['org_id']);
                    $stmt->bindParam(":address", $thirdparty['address']);
                    if (isset($thirdparty['city_id']) && $thirdparty['city_id'] != '' && $thirdparty['city_id'] != NULL) {
                        $stmt->bindParam(":city_id", $thirdparty['city_id']);
                    } else {
                        $stmt->bindValue(":city_id", null);
                    }
                    $stmt->bindParam(":postal_code", $thirdparty['postal_code']);
                    $stmt->bindParam(":primary_phone", $thirdparty['primary_phone']);
                    $stmt->bindParam(":sponser_id", $sponser['employee_id']);
                    $stmt->bindParam(":editing_by", $thirdparty['editing_by']);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":third_party_id", $thirdparty['third_party_id']);
                    $stmt->execute();
                } else {//add mode 
                    $operation = 'add';
                    $third_party_id = $thirdparty['newId'];
                    $is_active = $thirdparty['is_active'] == "1" ? 1 : 0;
                    $query = "INSERT INTO `stellarhse_common`.`third_party`
                                (`third_party_id`,`third_party_name`,`contact_name`,`third_party_type_id`,`org_id`,`address`,`city_id`,`postal_code`,
                                `primary_phone`,`sponser_id`,`is_active`)
                                VALUES
                                (:third_party_id,:third_party_name,:contact_name,:third_party_type_id,:org_id,:address,:city_id,
                                :postal_code,:primary_phone,:sponser_id,:is_active);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":third_party_id", $thirdparty['newId']);
                    $stmt->bindParam(":third_party_name", $thirdparty['third_party_name']);
                    $stmt->bindParam(":contact_name", $thirdparty['contact_name']);
                    $stmt->bindParam(":third_party_type_id", $thirdparty['third_party_type_id']);
                    $stmt->bindParam(":org_id", $thirdparty['org_id']);
                    $stmt->bindParam(":address", $thirdparty['address']);
                    if (isset($thirdparty['city_id']) && $thirdparty['city_id'] != '' && $thirdparty['city_id'] != NULL) {
                        $stmt->bindParam(":city_id", $thirdparty['city_id']);
                    } else {
                        $stmt->bindValue(":city_id", null);
                    }
                    $stmt->bindParam(":postal_code", $thirdparty['postal_code']);
                    $stmt->bindParam(":primary_phone", $thirdparty['primary_phone']);
                    $stmt->bindParam(":sponser_id", $sponser['employee_id']);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->execute();
                }
               // var_dump($thirdparty['editing_by']);
                $query = "call hist_third_party_proc(:third_party_id,:org_id,:operation_type,:updated_by_id);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":third_party_id", $third_party_id);
                $stmt->bindParam(":org_id", $thirdparty['org_id']);
                $stmt->bindParam(":operation_type", $operation);
                $stmt->bindParam(":updated_by_id", $thirdparty['editing_by']);
                $stmt->execute();

                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = $result;
            }
            $db = null;
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateThirdPartyCustomers', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $show_customer = $post['show_customer'] == "1" ? 1 : 0;
            $query = " UPDATE `stellarhse_auth`.`organization` SET `show_customer` = :show_customer WHERE `org_id` = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
             $stmt->bindParam(":show_customer", $post['show_customer'],PDO::PARAM_INT);
//            $stmt->bindParam(":show_customer", $show_customer, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->rowCount();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/thirdPartyHistory', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();

        try {
            $db = $this->db;

            $query = " SELECT `htp`.* , `ho`.`history_operation_name` , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                        FROM `stellarhse_common`.`hist_third_party` htp 
                        LEFT JOIN `stellarhse_common`.`history_operation` ho ON `htp`.`history_operation_id` = `ho`.`history_operation_id` 
                        LEFT JOIN `stellarhse_auth`.`employee` e ON `htp`.`updated_by_id` = `e`.`employee_id` 
                        WHERE `htp`.`org_id` = :org_id";
            $query .= $post['thirdPartyCheck'] ? " AND  `htp`.`third_party_id` = :third_party_id" : " ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            if ($post['thirdPartyCheck']) {
                $stmt->bindParam(":third_party_id", $post['third_party_id']);
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
