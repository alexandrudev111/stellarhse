<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getdefaultKPI', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getdefaultKPI', $post);
            $query = "select * from `stellarhse_incident`.`metrics_stat_default_view` where product_code in (
                      select  distinct product_code from stellarhse_auth.product_view where product_version_id in
                      (select product_version_id from stellarhse_auth.org_product where org_id=:org_id)) or product_code is null;";
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

    $app->post('/getfavouritKPI', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getfavouritKPI', $post);
            $query = " CALL stellarhse_incident.sp_get_stat_metrics_favorite(:org_id,:employee_id)";

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

    $app->post('/assigntofavourit', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('assigntofavourit', $post);

            $query = " CALL stellarhse_incident.add_assigned_metrics(:metrics_ids,:org_id,:employee_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":metrics_ids", $post['metrics_ids']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            while ($stmt->columnCount()) {
                $result[] = $stmt->fetch();
                $stmt->nextRowset();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/assigntofavouritcharts', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('assigntofavourit', $post);

            $query = " CALL stellarhse_incident.assign_chart_to_favorites(:org_id,:employee_id,:charts_ids);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":charts_ids", $post['chart_ids']);
            $stmt->execute();
            while ($stmt->columnCount()) {
                $result[] = $stmt->fetch();
                $stmt->nextRowset();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/viewfavchart', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('viewfavchart', $post);

            $table_field_name_que = " SELECT `table_field_name` FROM `stellarhse_incident`.`stat_default` WHERE `stat_default_id` = :stat_default_id ";
            $stmt = $db->prepare($table_field_name_que);
            $stmt->bindParam(":stat_default_id", $post['default_chart_id']);
            $stmt->execute();
            $result['table_field_name'] = $stmt->fetchColumn();

            if (!$post['time_frame_from']) {
                $post['time_frame_from'] = null;
            }
            if (!$post['time_frame_to']) {
                $post['time_frame_to'] = null;
            }

            $query = " CALL stellarhse_incident.sp_edit_default_chart(:stat_favorite_id,:org_id,:employee_id,:time_frame_from,:time_frame_to,:scope_id ,:period_items_id,:default_chart_id,:trend,:product_id,:output_type_id,:stat_name,'view');";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":stat_favorite_id", $post['favorite_metrics_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":time_frame_from", $post['time_frame_from']);
            $stmt->bindParam(":time_frame_to", $post['time_frame_to']);
            $stmt->bindParam(":scope_id", $post['scope_id']);
            $stmt->bindParam(":period_items_id", $post['period_items_id']);
            $stmt->bindParam(":default_chart_id", $post['default_chart_id']);
            $stmt->bindParam(":trend", $post['trend_line']);
            $stmt->bindParam(":product_id", $post['product_id']);
            $stmt->bindParam(":output_type_id", $post['output_type_id']);
            $stmt->bindParam(":stat_name", $post['favorite_metrics_name']);
            $stmt->execute();
            while ($stmt->columnCount()) {
                $result[] = $stmt->fetchAll(PDO::FETCH_OBJ);
                $stmt->nextRowset();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getmetricssharingboards/{metrics_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getmetricssharingboards', $args);
            $query = "SELECT `mts`.`shared_to_id`  , `mts`.`shared_employee_id`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name
                      FROM `stellarhse_incident`.`metrics_shared_to` mts
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `mts`.`shared_employee_id` = `e`.`employee_id`
                      WHERE   `mts`.`metrics_id` = :metrics_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":metrics_id", $args['metrics_id']);
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

    $app->get('/getmetricperitems/{lang_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getmetricperitems', $args);
            $query = " select period_items_name , period_items_id , field_code from stellarhse_common.period_items where language_id=:lang_id and  field_code not in ('yearbyyear(fiscalyear)','yearbyyear(calendaryear)') and  hide = 0 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":lang_id", $args['lang_id']);
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

    $app->get('/getmetricscope/{lang_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getmetricperitems', $args);
            $query = " select metrics_scope_id , metrics_scope_name , field_code from stellarhse_common.metrics_scope where language_id=:lang_id and  hide = 0";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":lang_id", $args['lang_id']);
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

    $app->post('/getmetricproducts', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getmetricproducts', $post);

            $query = "CALL stellarhse_incident.products_related_corrective(:metrics_type_id,:org_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":metrics_type_id", $post['metrics_type_id']);
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

    $app->post('/getmetricsubtypes', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getmetricsubtypes', $post);

            $query = "CALL stellarhse_incident.sp_sub_type_in_metrics(:metrics_type_id,:org_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":metrics_type_id", $post['metrics_type_id']);
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

    $app->post('/addmetfunc', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();

            $logger->info('addmetfunc', $post);
            if ($post['period_field_code'] != 'customdate') {
                $query = "SELECT `stellarhse_incident`.date_period_item_org(:period_itmes_id,:org_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":period_itmes_id", $post['period_items_id']);
                $stmt->bindParam(":org_id", $post['org_id']);
                $stmt->execute();
                $post['period_item_value'] = $stmt->fetchColumn();
            } else {
                $post['period_item_value'] = '"' . "'" . $post['time_frame_from'] . "'" . "and" . "'" . $post['time_frame_to'] . "'" . '"';
            }
            if ($post['sub_type_id'] == '') {
                $post['sub_type_id'] = null;
            }
//            print_r($post); die();
            $query = "CALL stellarhse_incident.edit_fav_metrics(:fav_met_id,:metrics_name,:org_id,
                    :employee_id,:period_item_id,:period_item_value,:metrics_type_id,:sub_type_id,:scope_id,:product_id,:corrective_all)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":fav_met_id", $post['favorite_metrics_id']);
            $stmt->bindParam(":metrics_name", $post['favorite_metrics_name']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":period_item_id", $post['period_items_id']);
            $stmt->bindParam(":period_item_value", $post['period_item_value']);
            $stmt->bindParam(":metrics_type_id", $post['metrics_type_id']);
            $stmt->bindParam(":sub_type_id", $post['sub_type_id']);
            $stmt->bindParam(":scope_id", $post['scope_id']);
            $stmt->bindParam(":product_id", $post['product_id']);
            $stmt->bindParam(":corrective_all", $post['corrective_all']);
            $stmt->execute();
//            $result['1'] = $stmt->fetch();
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

    $app->get('/getstatsharingboards/{stat_table_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getstatsharingboards', $args);
            $query = "SELECT `sst`.`shared_to_id`  , `sst`.`shared_employee_id`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name
                      FROM `stellarhse_incident`.`stat_shared_to` sst
                      LEFT JOIN `stellarhse_auth`.`employee` e ON `sst`.`shared_employee_id` = `e`.`employee_id`
                      WHERE   `sst`.`stat_table_id` = :stat_table_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":stat_table_id", $args['stat_table_id']);
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

    $app->post('/getChartOrMetricsSharingBoards', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getchartormetricssharingboards', $post);
            switch ($post['product_code']) {
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
            if ($post['output_type_name'] === 'KPI') {
                $query = "SELECT `mts`.`shared_to_id`  , `mts`.`shared_employee_id`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name
                          FROM `stellarhse_incident`.`metrics_shared_to` mts
                          LEFT JOIN `stellarhse_auth`.`employee` e ON `mts`.`shared_employee_id` = `e`.`employee_id`
                          WHERE   `mts`.`favorite_metrics_id` = :favorite_metrics_id ";
            } else {
                $query = "SELECT `sst`.`shared_to_id`  , `sst`.`shared_employee_id`  , concat(`e`.`first_name`,' ',`e`.`last_name`)  as full_name
                          FROM " . $db_name . ".`stat_shared_to` sst
                          LEFT JOIN `stellarhse_auth`.`employee` e ON `sst`.`shared_employee_id` = `e`.`employee_id`
                          WHERE   `sst`.`stat_favorite_id` = :favorite_metrics_id ";
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":favorite_metrics_id", $post['favorite_metrics_id']);
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

    $app->post('/shareFunc', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('shareFunc', $post);
            switch ($post['product_code']) {
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
            $result = shareFunction($post, $db, $db_name);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/deletemetric', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('deletemetric', $post);

//            $query = "DELETE FROM `stellarhse_incident`.`metrics_table` where metrics_id=:metrics_id;";
            $query = "UPDATE stellarhse_incident.favorite_metrics SET hide = 1 WHERE favorite_metrics_id = :favorite_metrics_id ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":favorite_metrics_id", $post['favorite_metrics_id']);
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

    $app->post('/deletechart', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('deletechart', $post);
            if ($post['default_chart_id']) { //default charts assigned to favourite 
                $query = "UPDATE stellarhse_incident.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
            } else {
                $prod_code_que = " SELECT product_code FROM stellarhse_auth.product WHERE product_id = :product_id";
                $stmt = $db->prepare($prod_code_que);
                $stmt->bindParam(":product_id", $post['product_id']);
                $stmt->execute();
                $prod_code = $stmt->fetchColumn();

                switch ($prod_code) {
                    case "ABCanTrack":
                        $query = "UPDATE stellarhse_incident.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                    case "Hazard":
                        $query = "UPDATE stellarhse_hazard.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                    case "Inspection":
                        $query = "UPDATE stellarhse_inspection.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                    case "SafetyMeeting":
                        $query = "UPDATE  stellarhse_safetymeeting.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                    case "Training":
                        $query = "UPDATE stellarhse_training.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                    case "MaintenanceManagement":
                        $query = "UPDATE stellarhse_maintenance.stat_favorite SET hide= 1 where stat_favorite_id=:stat_favorite_id;";
                        break;
                }
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":stat_favorite_id", $post['favorite_metrics_id']);
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

    $app->get('/getoutputformula/{language_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getoutputformula', $args);
            $query = "SELECT operation_id, operation_code, operation_name
                      FROM stellarhse_common.operation   where   language_id=:language_id;";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $args['language_id']);
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

    $app->post('/getchartfields', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getchartfields', $post);
            $query = "call stellarhse_incident.sp_get_chart_fields(:product_code,:org_id,:field_name)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":product_code", $post['product_code']);
            $stmt->bindParam(":field_name", $post['field_name']);
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

    $app->post('/getdecimalfields', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getdecimalfields', $post);
            $query = "call stellarhse_incident.sp_get_decimal_fields(:product_code,:org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":product_code", $post['product_code']);
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

    $app->post('/getorgtimeframe', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getorgtimeframe', $post);
            $query = "SELECT period_items_id,period_items_name, field_code FROM stellarhse_common.period_items
                        where hide != 1 and language_id=:language_id and  field_code not in ('customdate');";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $post['language_id']);
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

    $app->post('/getchartdata', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getchartdata', $post);

            switch ($post['product_code']) {
                case "ABCanTrack":
                    $query = "call stellarhse_incident.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
                case "Hazard":
                    $query = "call stellarhse_hazard.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
                case "Inspection":
                    $query = "call stellarhse_inspection.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
                case "SafetyMeeting":
                    $query = "call stellarhse_safetymeeting.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
                case "Training":
                    $query = "call stellarhse_training.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
                case "MaintenanceManagement":
                    $query = "call stellarhse_maintenance.sp_chart_data(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:field_id3 ,:time_frame_from,:time_frame_to );";
                    break;
            }


            $stmt = $db->prepare($query);
            $stmt->bindParam(":table_field_name", $post['table_field_name']);
            $stmt->bindParam(":field_name2", $post['field_name2']);
            $stmt->bindParam(":field_name3", $post['field_name3']);
            $stmt->bindParam(":operation_code", $post['operation_code']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":field_id3", $post['field_id3']);
            $stmt->bindParam(":time_frame_to", $post['time_frame_to']);
            $stmt->bindParam(":time_frame_from", $post['time_frame_from']);
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

    $app->post('/gettablechartdata', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('gettablechartdata', $post);
//            print_r($post); die();
            switch ($post['product_code']) {
                case "ABCanTrack":
                    $query = "call stellarhse_incident.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
                case "Hazard":
                    $query = "call stellarhse_hazard.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
                case "Inspection":
                    $query = "call stellarhse_inspection.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
                case "SafetyMeeting":
                    $query = "call stellarhse_safetymeeting.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
                case "Training":
                    $query = "call stellarhse_training.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
                case "MaintenanceManagement":
                    $query = "call stellarhse_maintenance.sp_table_data_updated(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
                    break;
            }

            $stmt = $db->prepare($query);
            $stmt->bindParam(":table_field_name", $post['table_field_name']);
            $stmt->bindParam(":field_name2", $post['field_name2']);
            $stmt->bindParam(":field_name3", $post['field_name3']);
            $stmt->bindParam(":operation_code", $post['operation_code']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":field_id3", $post['field_id3']);
            $stmt->bindParam(":scope_id", $post['scope_id']);
            $stmt->bindParam(":period_items_id", $post['period_items_id']);
            $stmt->bindParam(":time_frame_from", $post['time_frame_from']);
            $stmt->bindParam(":time_frame_to", $post['time_frame_to']);
            $stmt->bindParam(":trend_line", $post['trend_line']);
            $stmt->execute();
            $res = $stmt->rowCount();

            $query = "SELECT period , name , total_count FROM `stellarhse_hazard`.`chart_query_result_set` WHERE org_id = :org_id AND employee_id = :employee_id";
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

    $app->post('/gettabledata', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('gettabledata', $post);
            switch ($post['product_code']) {
                case "ABCanTrack":
                    $query = "call `stellarhse_incident`.sp_field_table_data(:field_name,:org_id);";
                    break;
                case "Hazard":
                    $query = "call `stellarhse_hazard`.sp_field_table_data(:field_name,:org_id);";  //
                    break;
                case "Inspection":
                    $query = "call `stellarhse_inspection`.sp_field_table_data(:field_name,:org_id);";
                    break;
                case "SafetyMeeting":
                    $query = "call `stellarhse_safetymeeting`.sp_field_table_data(:field_name,:org_id);";
                    break;
                case "Training":
                    $query = "call `stellarhse_training`.sp_field_table_data(:field_name,:org_id);";
                    break;
                case "MaintenanceManagement":
                    $query = "call `stellarhse_maintenance`.sp_field_table_data(:field_name,:org_id);";
                    break;
            }
//            $query = "call stellarhse_incident.sp_field_table_data(:field_name,:org_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":field_name", $post['field_name']);
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

    $app->post('/getoutputcodeid', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getoutputcodeid', $post);
            $query = "select `output_type_id` , `output_type_name` FROM `stellarhse_common`.`output_type` where output_code = :output_code and  language_id = :language_id ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":output_code", $post['output_code']);
            $stmt->bindParam(":language_id", $post['lang_id']);
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

    $app->post('/saveorgchart', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('saveorgchart', $post);
            if ($post['default_chart_id']) {

                $table_field_name_que = " SELECT `table_field_name` FROM `stellarhse_incident`.`stat_default` WHERE `stat_default_id` = :stat_default_id ";
                $stmt = $db->prepare($table_field_name_que);
                $stmt->bindParam(":stat_default_id", $post['default_chart_id']);
                $stmt->execute();
                $result['table_field_name'] = $stmt->fetchColumn();

                if (!$post['time_frame_from']) {
                    $post['time_frame_from'] = null;
                }
                if (!$post['time_frame_to']) {
                    $post['time_frame_to'] = null;
                }

                $query = " CALL stellarhse_incident.sp_edit_default_chart(:stat_favorite_id,:org_id,:employee_id,:time_frame_from,:time_frame_to,:scope_id,:period_items_id,:default_chart_id,:trend,:product_id,:output_type_id,:stat_name,'edit');";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":stat_favorite_id", $post['favorite_metrics_id']);
                $stmt->bindParam(":org_id", $post['org_id']);
                $stmt->bindParam(":employee_id", $post['employee_id']);
                $stmt->bindParam(":time_frame_from", $post['time_frame_from']);
                $stmt->bindParam(":time_frame_to", $post['time_frame_to']);
                $stmt->bindParam(":scope_id", $post['scope_id']);
                $stmt->bindParam(":period_items_id", $post['period_items_id']);
                $stmt->bindParam(":default_chart_id", $post['default_chart_id']);
                $stmt->bindParam(":trend", $post['trend_line']);
                $stmt->bindParam(":product_id", $post['product_id']);
                $stmt->bindParam(":output_type_id", $post['output_type_id']);
                $stmt->bindParam(":stat_name", $post['favorite_metrics_name']);
                $stmt->execute();
                while ($stmt->columnCount()) {
                    $result[] = $stmt->fetchAll(PDO::FETCH_OBJ);
                    $stmt->nextRowset();
                }
                if ($post['share_array']) {
                    $result->share = shareFunction($post, $db, 'stellarhse_incident');
                }
            } else {
                switch ($post['product_code']) {
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
                $result = savechart($post, $db, $db_name);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/drawChart', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('drawChart', $post);
            if (!$post['product_code']) {
                $prod_code_que = " SELECT product_code FROM stellarhse_auth.product WHERE product_id = :product_id";
                $stmt = $db->prepare($prod_code_que);
                $stmt->bindParam(":product_id", $post['product_id']);
                $stmt->execute();
                $post['product_code'] = $stmt->fetchColumn();
            }
            switch ($post['product_code']) {
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
            $result = commondrawing($post, $db, $db_name);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    function commondrawing($chart, $db, $db_name) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $logger->info('draw_' . $db_name . '_chart', $chart);
            $query = "call  `" . $db_name . "`.`sp_chart_data_updated`(:table_field_name,:field_name2,:field_name3,:operation_code,:org_id,:employee_id,:field_id3,:scope_id,:period_items_id,:time_frame_from,:time_frame_to,:trend_line);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":table_field_name", $chart['table_field_name']);
            $stmt->bindParam(":field_name2", $chart['field_name2']);
            $stmt->bindParam(":field_name3", $chart['field_name3']);
            $stmt->bindParam(":operation_code", $chart['operation_code']);
            $stmt->bindParam(":org_id", $chart['org_id']);
            $stmt->bindParam(":employee_id", $chart['employee_id']);
            $stmt->bindParam(":field_id3", $chart['field_id3']);
            $stmt->bindParam(":scope_id", $chart['scope_id']);
            $stmt->bindParam(":period_items_id", $chart['period_items_id']);
            $stmt->bindParam(":time_frame_from", $chart['time_frame_from']);
            $stmt->bindParam(":time_frame_to", $chart['time_frame_to']);
            $stmt->bindParam(":trend_line", $chart['trend_line']);
            $stmt->execute();
            $insert_in_temp_table = $stmt->rowCount();

            if ($chart['period_field_code'] != 'customdate' && $insert_in_temp_table) {
                $query = 'select `stellarhse_common`.`date_period_chart`(:period_item_id,:org_id,:time_frame_from,:time_frame_to);';
                $stmt = $db->prepare($query);
                $stmt->bindParam(":period_item_id", $chart['period_items_id']);
                $stmt->bindParam(":org_id", $chart['org_id']);
                $stmt->bindParam(":time_frame_from", $chart['time_frame_from']);
                $stmt->bindParam(":time_frame_to", $chart['time_frame_to']);
                $stmt->execute();
                $result['get_period_data'] = $stmt->fetchColumn();
            } else if ($chart['period_field_code'] == 'customdate') {
                $result['get_period_data'] = 1;
            }

            $result['period_pieces'] = explode("&", $result['get_period_data']);
            for ($i = 0; $i < count($result['period_pieces']); $i++) {
                $period_que = 'select stellarhse_common.year_month_name(:period);';
                $stmt = $db->prepare($period_que);
                $stmt->bindParam(":period", $result['period_pieces'][$i]);
                $stmt->execute();
                $result['period_name'][$i]['date'] = $stmt->fetchColumn();

                $proc_que = 'call `stellarhse_common`.`get_chart_data_updated`(:org_id,:employee_id ,:period ,:period_items_id ,:product_id);';
                $stmt = $db->prepare($proc_que);
                $stmt->bindParam(":org_id", $chart['org_id']);
                $stmt->bindParam(":employee_id", $chart['employee_id']);
                $stmt->bindParam(":period", $result['period_name'][$i]['date']);
                $stmt->bindParam(":period_items_id", $chart['period_items_id']);
                $stmt->bindParam(":product_id", $chart['product_id']);
                $stmt->execute();
                $result['final_result'][$i] = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $result;
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    }

    function savechart($chart, $db, $db_name) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $log_name = 'save_' . $db_name . '_chart';
            $logger->info($log_name, $chart);

            if (isset($chart['favorite_metrics_id'])) {
                $chart['stat_favorite_id'] = $chart['favorite_metrics_id'];
            } else {
                $chart['stat_favorite_id'] = Utils::getUUID($db);
            }

            $query = "select count(*) as count from " . $db_name . ".stat_favorite  where stat_favorite_name =:stat_favorite_name and org_id =:org_id and   stat_favorite_id != :stat_favorite_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":stat_favorite_name", $chart['stat_favorite_name']);
            $stmt->bindParam(":org_id", $chart['org_id']);
            $stmt->bindParam(":stat_favorite_id", $chart['stat_favorite_id']);
            $stmt->execute();
            $result_chart_found = $stmt->fetchColumn();

            if ($result_chart_found > 0) {
                $success = new Result();
                $success->success = 2;
            } else {
                $query = "select count(*)as count  from  " . $db_name . ".stat_favorite where stat_favorite_id=:stat_favorite_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":stat_favorite_id", $chart['stat_favorite_id']);
                $stmt->execute();
                $result = $stmt->fetchColumn();

                $query = "SELECT output_type_id FROM stellarhse_common.output_type  where output_code=:output_code  and language_id=:language_id;";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":output_code", $chart['output_code']);
                $stmt->bindParam(":language_id", $chart['language_id']);
                $stmt->execute();
                $output_type_id = $stmt->fetchColumn();

                if ($result == 1) {// update mode
                    $operation = 'update';
                    $query = " UPDATE " . $db_name . ".stat_favorite
                                SET
                                    `stat_favorite_name` = :stat_favorite_name ,
                                    `field_id1` = :field_id1,
                                    `field_id2` = :field_id2 ,
                                    `field_id3` = :field_id3,
                                    `output_type_id` = :output_type_id,
                                    `operation_id` = :operation_id,
                                    `period_item_id` = :period_items_id,
                                    `time_frame` = :time_frame,
                                    `product_id` = :product_id,
                                    `scope_id` = :scope_id,
                                    `hidden_params` = :hidden_params,
                                    `trend_line` = :trend_line ,
                                    `updated_date` = :updated_date
                              WHERE `stat_favorite_id`  = :stat_favorite_id;  ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":stat_favorite_name", $chart['stat_favorite_name']);
                    $stmt->bindParam(":field_id1", $chart['field_id1']);
                    $stmt->bindParam(":field_id2", $chart['field_id2']);
                    $stmt->bindParam(":field_id3", $chart['field_id3']);
                    $stmt->bindParam(":output_type_id", $output_type_id);
                    $stmt->bindParam(":operation_id", $chart['operation_id']);
                    $stmt->bindParam(":period_items_id", $chart['period_items_id']);
                    $stmt->bindParam(":time_frame", $chart['time_frame']);
                    $stmt->bindParam(":product_id", $chart['product_id']);
                    $stmt->bindParam(":scope_id", $chart['scope_id']);
                    $stmt->bindParam(":hidden_params", $chart['hidden_params']);
                    $stmt->bindParam(":trend_line", $chart['trend_line']);
                    $stmt->bindParam(":stat_favorite_id", $chart['stat_favorite_id']);
                    $stmt->bindParam(":updated_date", $chart['updated_date']);
                    $stmt->execute();
                } else {//add mode
                    $operation = 'add';
                    $query = "INSERT INTO " . $db_name . ".stat_favorite
                            (`stat_favorite_id`,`stat_favorite_name`,`employee_id`,`org_id`,`field_id1`,`field_id2`,`field_id3`,`output_type_id`,
                            `operation_id`,`period_item_id`,`time_frame`,`product_id`,`scope_id`,`hidden_params`,`trend_line`,`creation_date`,`updated_date`)
                            VALUES
                            (:stat_favorite_id,:stat_favorite_name,:employee_id,:org_id,:field_id1,:field_id2,:field_id3,
                            :output_type_id,:operation_id,:period_items_id,:time_frame,:product_id,:scope_id ,:hidden_params,:trend_line,:creation_date,:updated_date);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":stat_favorite_id", $chart['stat_favorite_id']);
                    $stmt->bindParam(":stat_favorite_name", $chart['stat_favorite_name']);
                    $stmt->bindParam(":employee_id", $chart['employee_id']);
                    $stmt->bindParam(":org_id", $chart['org_id']);
                    $stmt->bindParam(":field_id1", $chart['field_id1']);
                    $stmt->bindParam(":field_id2", $chart['field_id2']);
                    $stmt->bindParam(":field_id3", $chart['field_id3']);
                    $stmt->bindParam(":output_type_id", $output_type_id);
                    $stmt->bindParam(":operation_id", $chart['operation_id']);
                    $stmt->bindParam(":period_items_id", $chart['period_items_id']);
                    $stmt->bindParam(":time_frame", $chart['time_frame']);
                    $stmt->bindParam(":product_id", $chart['product_id']);
                    $stmt->bindParam(":scope_id", $chart['scope_id']);
                    $stmt->bindParam(":hidden_params", $chart['hidden_params']);
                    $stmt->bindParam(":trend_line", $chart['trend_line']);
                    $stmt->bindParam(":creation_date", $chart['creation_date']);
                    $stmt->bindParam(":updated_date", $chart['updated_date']);
                    $stmt->execute();
                }
                $result = $stmt->rowCount();
                if ($chart['share_array']) {
                    $result->share = shareFunction($chart, $db, $db_name);
                }
                $success = new Result();
                $success->success = $result;
                $success->operation = $operation;
            }
            return $success;
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    }

    function shareFunction($post, $db, $db_name) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $logger->info('shareAction', $post);
//            print_r($post);
//            die();
            if ($post['output_type_name'] === 'KPI') {
                $check_query = " DELETE FROM `stellarhse_incident`.`metrics_shared_to` WHERE favorite_metrics_id = :favorite_metrics_id  ";
            } else {
                $check_query = " DELETE FROM " . $db_name . ".`stat_shared_to`  WHERE stat_favorite_id = :favorite_metrics_id ";
            }
            $stmt = $db->prepare($check_query);
            $stmt->bindParam(":favorite_metrics_id", $post['favorite_metrics_id']);
            $stmt->execute();
            for ($i = 0; $i < count($post['share_array']); $i++) {
                if ($post['output_type_name'] === 'KPI') { // metrics sharing
                    $query = "select myuuid()";
                    $stmt = $db->prepare($query);
                    $stmt->execute();
                    $key_id = $stmt->fetchColumn();
                    $query = "INSERT INTO `stellarhse_incident`.`metrics_shared_to`
                                         (metrics_shared_to_id , favorite_metrics_id, shared_to_id, shared_employee_id)
                                         VALUES (:metrics_shared_to_id,:metrics_id,:shared_to_id,:shared_employee_id); ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":metrics_shared_to_id", $key_id);
                    $stmt->bindParam(":metrics_id", $post['favorite_metrics_id']);
                    $stmt->bindParam(":shared_to_id", $post['share_array'][$i]['shared_to_id']);
                    $stmt->bindParam(":shared_employee_id", $post['share_array'][$i]['shared_employee_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                } else { // charts sharing
                    $query = "select myuuid()";
                    $stmt = $db->prepare($query);
                    $stmt->execute();
                    $key_id = $stmt->fetchColumn();
                    if (!$post['favorite_metrics_id']) {
                        $post['favorite_metrics_id'] = $post['stat_favorite_id'];
                    }
                    $query = "INSERT INTO " . $db_name . ".`stat_shared_to`
                                         (stat_shared_to_id , stat_favorite_id, shared_to_id, shared_employee_id)
                                         VALUES (:stat_shared_to_id,:stat_favorite_id,:shared_to_id,:shared_employee_id); ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":stat_shared_to_id", $key_id);
                    $stmt->bindParam(":stat_favorite_id", $post['favorite_metrics_id']);
                    $stmt->bindParam(":shared_to_id", $post['share_array'][$i]['shared_to_id']);
                    $stmt->bindParam(":shared_employee_id", $post['share_array'][$i]['shared_employee_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }
            return $result;
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    }

    function saveincidentchart($chart, $db) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $logger->info('saveincidentchart', $chart);
            $query = "select count(*) as count from stellarhse_incident.stat_table  where   stat_table_name =:stat_table_name and org_id =:org_id and   stat_table_id !=:stat_table_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":stat_table_id", $chart['stat_table_id']);
            $stmt->bindParam(":org_id", $chart['org_id']);
            $stmt->bindParam(":stat_table_name", $chart['stat_table_name']);
            $stmt->execute();
            $result = $stmt->fetchColumn();

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                $query = "select count(*)as count  from  stellarhse_incident.stat_table where stat_table_id=:stat_table_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":stat_table_id", $chart['stat_table_id']);
                $stmt->execute();
                $result = $stmt->fetchColumn();

                $query = "SELECT output_type_id FROM stellarhse_common.output_type  where output_code=:output_code  and language_id=:language_id;";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":output_code", $chart['output_code']);
                $stmt->bindParam(":language_id", $chart['language_id']);
                $stmt->execute();
                $output_type_id = $stmt->fetchColumn();

                if ($result == 1) {// update mode
                    $operation = 'update';
                    $query = "UPDATE stellarhse_incident.stat_table
                                SET
                                    `stat_table_name` = :stat_table_name,
                                    `field_id1` = :field_id1,
                                    `field_id2` = :field_id2,
                                    `field_id3` = :field_id3,
                                    `output_type_id` = :output_type_id,
                                    `operation_id` = :operation_id,
                                    `time_frame` = :time_frame,
                                    `hidden_params` =:hidden_params,
                                    `updated_date` = :updated_date
                                WHERE `stat_table_id` =:stat_table_id;";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":stat_table_id", $chart['stat_table_id']);
                    $stmt->bindParam(":stat_table_name", $chart['stat_table_name']);
                    $stmt->bindParam(":field_id1", $chart['field_id1']);
                    $stmt->bindParam(":field_id2", $chart['field_id2']);
                    $stmt->bindParam(":field_id3", $chart['field_id3']);
                    $stmt->bindParam(":output_type_id", $output_type_id);
                    $stmt->bindParam(":operation_id", $chart['operation_id']);
                    $stmt->bindParam(":time_frame", $chart['time_frame']);
                    $stmt->bindParam(":updated_date", $chart['updated_date']);
                    $stmt->bindParam(":hidden_params", $chart['hidden_params']);
                    $stmt->execute();
                } else {//add mode
                    $operation = 'add';
                    $query = "INSERT INTO stellarhse_incident.stat_table
                            (`stat_table_id`,`stat_table_name`,`employee_id`,`field_id1`,`field_id2`,`org_id`,`field_id3`,`output_type_id`,
                            `operation_id`,`time_frame`,`creation_date`,`updated_date`,`hidden_params`)
                            VALUES
                            (:stat_table_id,:stat_table_name,:employee_id,:field_id1,:field_id2,:org_id,:field_id3,
                            :output_type_id,:operation_id,:time_frame,:creation_date,:updated_date,:hidden_params);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":stat_table_id", $chart['stat_table_id']);
                    $stmt->bindParam(":stat_table_name", $chart['stat_table_name']);
                    $stmt->bindParam(":employee_id", $chart['employee_id']);
                    $stmt->bindParam(":field_id1", $chart['field_id1']);
                    $stmt->bindParam(":field_id2", $chart['field_id2']);
                    $stmt->bindParam(":org_id", $chart['org_id']);
                    $stmt->bindParam(":field_id3", $chart['field_id3']);
                    $stmt->bindParam(":output_type_id", $output_type_id);
                    $stmt->bindParam(":operation_id", $chart['operation_id']);
                    $stmt->bindParam(":time_frame", $chart['time_frame']);
                    $stmt->bindParam(":creation_date", $chart['creation_date']);
                    $stmt->bindParam(":updated_date", $chart['updated_date']);
                    $stmt->bindParam(":hidden_params", $chart['hidden_params']);
                    $stmt->execute();
                }

                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = $result;

                if ($chart['share_array']) {
                    $result->share = shareFunctionIncident($chart, $db);
                }
            }
            return $success;
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    }

    $app->post('/setorgsetting', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('setorgtimeframe', $post);

            $query = "update  stellarhse_auth.organization
                        set
                        fiscal_year =:fiscal_year,
                        work_hour =:work_hour ,
                        km_driven =:km_driven
                     where org_id =:org_id;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":fiscal_year", $post['fiscal_year']);
            $stmt->bindParam(":work_hour", $post['work_hour']);
            $stmt->bindParam(":km_driven", $post['km_driven']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();

            $result = $stmt->rowCount();
            $success = new Result();
            $success->success = $result;

            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getorgsetting', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getorgsetting', $post);

            $query = "select org_id, fiscal_year, work_hour, km_driven  from stellarhse_auth.organization   where org_id =:org_id;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();

            $result = $stmt->fetchObject();

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getorgexternsldata', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getOrgexternsldata', $post);

            $query = "select *  FROM stellarhse_auth.org_external_value_view where org_id=:org_id order by 
                     org_year, stellarhse_common.month_number(org_month)";
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

    $app->post('/addorgexternsldata', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            if ($post['extDataType'] == 'employee_total_hour') {
                $post['employee_total_hour'] = $post['total_hour'];
                if (!$post['contractor_total_hour']) {
                    $post['contractor_total_hour'] = NULL;
                }
                if (!$post['employee_total_km']) {
                    $post['employee_total_km'] = NULL;
                }
                if (!$post['contractor_total_km']) {
                    $post['contractor_total_km'] = NULL;
                }
            } elseif ($post['extDataType'] == 'contractor_total_hour') {
                $post['contractor_total_hour'] = $post['total_hour'];
                if (!$post['employee_total_hour']) {
                    $post['employee_total_hour'] = NULL;
                }
                if (!$post['employee_total_km']) {
                    $post['employee_total_km'] = NULL;
                }
                if (!$post['contractor_total_km']) {
                    $post['contractor_total_km'] = NULL;
                }
            } elseif ($post['extDataType'] == 'employee_total_km') {
                $post['employee_total_km'] = $post['total_km'];
                if (!$post['employee_total_hour']) {
                    $post['employee_total_hour'] = NULL;
                }
                if (!$post['contractor_total_hour']) {
                    $post['contractor_total_hour'] = NULL;
                }
                if (!$post['contractor_total_km']) {
                    $post['contractor_total_km'] = NULL;
                }
            } elseif ($post['extDataType'] == 'contractor_total_km') {
                $post['contractor_total_km'] = $post['total_km'];
                if (!$post['employee_total_hour']) {
                    $post['employee_total_hour'] = NULL;
                }
                if (!$post['contractor_total_hour']) {
                    $post['contractor_total_hour'] = NULL;
                }
                if (!$post['employee_total_km']) {
                    $post['employee_total_km'] = NULL;
                }
            }
            $query = " SELECT org_external_value_id FROM stellarhse_auth.`org_external_value` WHERE org_id = :org_id AND org_year = :org_year AND org_month = :org_month AND hide = 0
                       AND " . $post['extDataType'] . " != NULL ";
            $query .= $post['operation'] ? " AND org_external_value_id != :org_external_value_id " : " ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":org_year", $post['org_year']);
            $stmt->bindParam(":org_month", $post['org_month']);
            if ($post['operation']) {
                $stmt->bindParam(":org_external_value_id", $post['org_external_value_id']);
            }
            $stmt->execute();
            $month_year_found = $stmt->fetchAll(PDO::FETCH_OBJ);
            if (count($month_year_found) > 0) {
                $result->month_year_found = $month_year_found;
            } else {
                if ($post['operation']) {
                    //edit status to previously added data
                    $query = "UPDATE stellarhse_auth.`org_external_value`
                                    SET
                                        `org_id` = :org_id,
                                        `org_year` = :org_year,
                                        `org_month` = :org_month,
                                        `employee_total_hour` = :employee_total_hour,
                                        `contractor_total_hour` = :contractor_total_hour,
                                        `employee_total_km` = :employee_total_km,
                                        `contractor_total_km` = :contractor_total_km,
                                        `editing_by` = :editing_by
                                    WHERE `org_external_value_id` =:org_external_value_id;";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->bindParam(":org_year", $post['org_year']);
                    $stmt->bindParam(":org_month", $post['org_month']);
                    $stmt->bindParam(":employee_total_hour", $post['employee_total_hour']);
                    $stmt->bindParam(":contractor_total_hour", $post['contractor_total_hour']);
                    $stmt->bindParam(":employee_total_km", $post['employee_total_km']);
                    $stmt->bindParam(":contractor_total_km", $post['contractor_total_km']);
                    $stmt->bindParam(":editing_by", $post['editing_by']);
                    $stmt->bindParam(":org_external_value_id", $post['org_external_value_id']);
                    $stmt->execute();
                    $result->update_op = $stmt->rowCount();
                } else {
                    // to find whether this month and year already exists
                    $check_month_year_query = " SELECT org_external_value_id FROM stellarhse_auth.`org_external_value` WHERE org_id = :org_id AND org_year = :org_year AND org_month = :org_month AND hide = 0 ";
                    $stmt = $db->prepare($check_month_year_query);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->bindParam(":org_year", $post['org_year']);
                    $stmt->bindParam(":org_month", $post['org_month']);
                    $stmt->execute();
                    $month_year_id = $stmt->fetchColumn();

                    if ($month_year_id) {
                        $data_value = $post['total_hour'] ? $post['total_hour'] : $post['total_km'];
//                        echo $data_value; die();
                        // add new field eor previously entered month and year
                        $query = " UPDATE stellarhse_auth.`org_external_value` SET  " . $post['extDataType'] . " = :data_value
                                  WHERE `org_external_value_id` =:org_external_value_id;";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":data_value", $data_value);
                        $stmt->bindParam(":org_external_value_id", $month_year_id);
                    } else {
                        //add status to a month in a year never added before
                        $query = "INSERT INTO stellarhse_auth.`org_external_value`
                                    (org_external_value_id, org_id, org_year, org_month, employee_total_hour, contractor_total_hour, employee_total_km, contractor_total_km)
                             VALUES (:org_external_value_id,:org_id,:org_year,:org_month,:employee_total_hour,:contractor_total_hour,:employee_total_km,:contractor_total_km)    ;";

                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":org_external_value_id", $post['org_external_value_id']);
                        $stmt->bindParam(":org_id", $post['org_id']);
                        $stmt->bindParam(":org_year", $post['org_year']);
                        $stmt->bindParam(":org_month", $post['org_month']);
                        $stmt->bindParam(":employee_total_hour", $post['employee_total_hour']);
                        $stmt->bindParam(":contractor_total_hour", $post['contractor_total_hour']);
                        $stmt->bindParam(":employee_total_km", $post['employee_total_km']);
                        $stmt->bindParam(":contractor_total_km", $post['contractor_total_km']);
                    }
//                    echo $data_value.'  '.$month_year_id.'  '.$query; die();
                    $stmt->execute();
                    $result->insert_op = $stmt->rowCount();
                }
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getsharingoptions/{language_id}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getsharingoptions', $args);
            $query = "SELECT shared_to_id , shared_to_name , field_code
                      FROM stellarhse_common.shared_to   where   language_id=:language_id AND hide = 0 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $args['language_id']);
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

    $app->get('/getdefchartdata/{table_field_name}', function($request, $response, $args) {
        $error = new errorMessage();
        $logger = new Logger('stellar_logger');
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $logger->info('getdefchartdata', $args);
            $query = "CALL `stellarhse_incident`.sp_default_chart(:table_field_name)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":table_field_name", $args['table_field_name']);
            $stmt->execute();
            while ($stmt->columnCount()) {
                $result[] = $stmt->fetchAll(PDO::FETCH_OBJ);
                $stmt->nextRowset();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

//    $app->post('/getorgmetrics', function($request, $response, $args) {
//        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
//        try {
//            $db = $this->db;
//            $post = $request->getParsedBody();
//            $logger->info('getorgmetrics', $post);
//
//            switch ($post['product_code']) {
//                case "ABCanTrack":
//                    $query = "SELECT `mt`.* , `pi`.`period_items_name` FROM `stellarhse_incident`.`metrics_table` mt
//                            LEFT JOIN `stellarhse_common`.`period_items` pi ON `mt`.`period_item_id` = `pi`.`period_items_id`
//                            WHERE `mt`.`org_id` = :org_id AND `mt`.`employee_id` = :employee_id ";
//                    break;
//                case "Hazard":
////                    $query = "call `stellarhse_hazard`.sp_hazard_charts(:org_id);";
//                    break;
//                case "Inspection":
////                    $query = "call `stellarhse_inspection`.sp_inspection_charts(:org_id);";
//                    break;
//                case "SafetyMeeting":
////                    $query = "call `stellarhse_safetymeeting`.sp_safetymeeting_charts(:org_id);";
//                    break;
//                case "Training":
////                    $query = "call `stellarhse_training`.sp_training_charts(:org_id);";
//                    break;
//                case "MaintenanceManagement":
////                    $query = "call `stellarhse_maintenance`.sp_maintenance_charts(:org_id);";
//                    break;
//            }
//
//            $stmt = $db->prepare($query);
//            $stmt->bindParam(":org_id", $post['org_id']);
//            $stmt->bindParam(":employee_id", $post['employee_id']);
//            $stmt->execute();
//            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//            return $this->response->withJson($result);
//        } catch (PDOException $ex) {
//            $logger->error($ex->getMessage());
//            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//        } catch (Exception $ex) {
//            $logger->error($ex->getMessage());
//            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//        }
//    });
//    $app->post('/getorgcharts', function($request, $response, $args) {
//        $error = new errorMessage();
//        $logger = new Logger('stellar_logger');
//        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
//        $logger->pushHandler(new FirePHPHandler());
//        try {
//            $db = $this->db;
//            $post = $request->getParsedBody();
//            $logger->info('getorgcharts', $post);
//
//            switch ($post['product_code']) {
//                case "ABCanTrack":
//                    $query = "call `stellarhse_incident`.sp_incident_charts(:org_id);";
//                    break;
//                case "Hazard":
//                    $query = "call `stellarhse_hazard`.sp_hazard_charts(:org_id);";
//                    break;
//                case "Inspection":
//                    $query = "call `stellarhse_inspection`.sp_inspection_charts(:org_id);";
//                    break;
//                case "SafetyMeeting":
//                    $query = "call `stellarhse_safetymeeting`.sp_safetymeeting_charts(:org_id);";
//                    break;
//                case "Training":
//                    $query = "call `stellarhse_training`.sp_training_charts(:org_id);";
//                    break;
//                case "MaintenanceManagement":
//                    $query = "call `stellarhse_maintenance`.sp_maintenance_charts(:org_id);";
//                    break;
//            }
//
//            $stmt = $db->prepare($query);
//            $stmt->bindParam(":org_id", $post['org_id']);
//            $stmt->execute();
//            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//            return $this->response->withJson($result);
//        } catch (PDOException $ex) {
//            $logger->error($ex->getMessage());
//            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//        } catch (Exception $ex) {
//            $logger->error($ex->getMessage());
//            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//        }
//    });

    /* end */
});
