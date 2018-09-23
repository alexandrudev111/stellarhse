<?php

//use Monolog\Logger;
//use Monolog\Handler\StreamHandler;
//use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->get('/getCountryHistory/{org_id}', function($request, $response, $args) {

        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getCountryHistory', $args);

//            MyLogger::info('getCountryHistory', $args);

            $query = "SELECT  hl1.*  , `ho`.`history_operation_name`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                      FROM   `stellarhse_common`.`hist_location1`  hl1
                      LEFT JOIN  `stellarhse_common`.`history_operation` ho ON `hl1`.`history_operation_id` = `ho`.`history_operation_id`
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `hl1`.`updated_by_id` = `e`.`employee_id` 
                      WHERE `hl1`.`org_id`  = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getStateHistory/{org_id}', function($request, $response, $args) {

        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getStateHistory', $args);
            $query = "SELECT  hl2.*  , `ho`.`history_operation_name`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                      FROM   `stellarhse_common`.`hist_location2`  hl2
                      LEFT JOIN  `stellarhse_common`.`history_operation` ho ON `hl2`.`history_operation_id` = `ho`.`history_operation_id`
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `hl2`.`updated_by_id` = `e`.`employee_id` 
                      WHERE `hl2`.`org_id`  = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getAreaHistory/{org_id}', function($request, $response, $args) {

        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getAreaHistory', $args);
            $query = "SELECT  hl3.*  , `ho`.`history_operation_name`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                      FROM   `stellarhse_common`.`hist_location3`  hl3
                      LEFT JOIN  `stellarhse_common`.`history_operation` ho ON `hl3`.`history_operation_id` = `ho`.`history_operation_id`
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `hl3`.`updated_by_id` = `e`.`employee_id` 
                      WHERE `hl3`.`org_id`  = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getSiteHistory/{org_id}', function($request, $response, $args) {

        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getSiteHistory', $args);
            $query = "SELECT  hl4.*  , `ho`.`history_operation_name`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name 
                      FROM   `stellarhse_common`.`hist_location4`  hl4
                      LEFT JOIN  `stellarhse_common`.`history_operation` ho ON `hl4`.`history_operation_id` = `ho`.`history_operation_id`
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `hl4`.`updated_by_id` = `e`.`employee_id` 
                      WHERE `hl4`.`org_id`  = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateOrgLocation', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            MyLogger::info('updateOrgLocation', $post);

            $query = " UPDATE `stellarhse_auth`.`organization` SET `location_level` = :location_level WHERE `org_id` = :org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":location_level", $post['location_level'], PDO::PARAM_INT);
            $stmt->execute();

            $query = " UPDATE stellarhse_auth.org_field SET `label` = :location1_label WHERE `org_id` = :org_id and field_name = 'Location1Id'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":location1_label", $post['location1_label']);
            $stmt->execute();

            $result = $stmt->rowCount();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getLocationsByOrgLevel', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
//            MyLogger::info('getLocationsByOrgLevel', $post);

            MyLogger::info('getLocationsByOrgLevel', $post);

            $query = "select location_level from stellarhse_auth.organization where org_id= :org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $level = $stmt->fetchColumn();
            $result->select_location_level = $level;

            $query = "SELECT * FROM stellarhse_common.`location_view` WHERE org_id =:org_id  and location1_hide=0  order by location1_name asc ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result->all_Locations = $stmt->fetchAll(PDO::FETCH_OBJ);


            $query = "SELECT * FROM stellarhse_auth.org_field where org_id =:org_id  ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result->locations_labels = $stmt->fetchAll(PDO::FETCH_OBJ);


            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getLocations1/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getLocations1', $args);
            $query = "SELECT  `location1_id`, `location1_name`  FROM   `stellarhse_common`.`location1` WHERE
                        org_id  = :org_id AND hide <>1 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getLocations2/{loc1_id}', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getLocations2', $args);
            var_dump($args);
            $query = "SELECT  `location2_id`, `location2_name`  FROM   `stellarhse_common`.`location2` WHERE
                        location1_id  = :location1_id AND hide <>1 ";


            $stmt = $db->prepare($query);
            $stmt->bindParam(":location1_id", $args['loc1_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getLocations3/{loc2_id}', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getLocations3', $args);
            $query = "SELECT  `location3_id`, `location3_name`  FROM   `stellarhse_common`.`location3` WHERE
                        location2_id  = :location2_id AND hide <>1 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":location2_id", $args['loc2_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getLocations4/{loc3_id}', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            MyLogger::info('getLocations4', $args);
            $query = "SELECT  `location4_id`, `location4_name`  FROM   `stellarhse_common`.`location4` WHERE
                        location3_id  = :location3_id AND hide <>1 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":location3_id", $args['loc3_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateLocation', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            MyLogger::info('updateLocation', $post);
            $query = "CALL stellarhse_common.sp_add_locations(:loc1_id,:loc1_name,:loc2_id,:loc2_name,:loc3_id,:loc3_name,:loc4_id,:loc4_name,:emp_id ,:org_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":loc1_id", $post['location1_id']);
            $stmt->bindParam(":loc1_name", $post['location1_name']);
            $stmt->bindParam(":loc2_id", $post['location2_id']);
            $stmt->bindParam(":loc2_name", $post['location2_name']);
            $stmt->bindParam(":loc3_id", $post['location3_id']);
            $stmt->bindParam(":loc3_name", $post['location3_name']);
            $stmt->bindParam(":loc4_id", $post['location4_id']);
            $stmt->bindParam(":loc4_name", $post['location4_name']);
            $stmt->bindParam(":emp_id", $post['updated_by']);
            $stmt->bindParam(":org_id", $post['org_id']);
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

    $app->post('/delLocation', function($request, $response, $args) {
        $error = new errorMessage();
//        $logger = new Logger('stellar_logger'); 
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            MyLogger::info('delLocation', $post);
            if ($post['location_level'] != 4) {
                if ($post['location_level'] == 1) {
                    $check_query = ' SELECT * FROM stellarhse_common.location2 WHERE location1_id  = :loc_id ';
                } elseif ($post['location_level'] == 2) {
                    $check_query = ' SELECT * FROM stellarhse_common.location3 WHERE location2_id  = :loc_id ';
                } elseif ($post['location_level'] == 3) {
                    $check_query = ' SELECT * FROM stellarhse_common.location4 WHERE location3_id  = :loc_id ';
                }
                $ch_stmt = $db->prepare($check_query);
                $ch_stmt->bindParam(":loc_id", $post['location_id']);
                $ch_stmt->execute();
                $ch_result = $ch_stmt->rowCount();
            }

            $query = "CALL stellarhse_common.sp_del_locations(:loc_id,:level_num,:org_id,:emp_id );";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":loc_id", $post['location_id']);
            $stmt->bindParam(":level_num", $post['location_level']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":emp_id", $post['editing_by']);
            $stmt->execute();
            $db = null;
            if ($ch_result) {
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $result = $stmt->rowCount();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});
?>

