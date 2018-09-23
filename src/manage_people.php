<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getPeople', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = "call `stellarhse_auth`.sp_org_employees(:language_code,:org_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_code", $post['language_code']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/activePeople', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        $operation = 'activate';
        $db = $this->db;
        try {
            for ($i = 1; $i < count($post); $i++) {
                $query = "UPDATE    `stellarhse_auth`.`org_employee` SET   `emp_is_active` = 1 WHERE
                        employee_id  = :employee_id AND org_id = :org_id ";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $post[$i]);
                $stmt->bindParam(":org_id", $post[0]['org_id']);
                $stmt->execute();
                $result['activiation'] = $stmt->rowCount();

                $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post[0]['org_id']);
                $stmt->bindParam(":employee_id", $post[$i]);
                $stmt->bindParam(":updated_by_id", $post[0]['updated_by_id']);
                $stmt->bindParam(":operation", $operation);
                $stmt->execute();
                $result['activiation_history'] = $stmt->rowCount();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/inActivePeopleFun', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();

        $operation = 'deactivate';
        $db = $this->db;
        try {

            for ($i = 1; $i < count($post); $i++) {
                $query = "UPDATE    `stellarhse_auth`.`org_employee` SET   `emp_is_active` = 0 WHERE
                        employee_id  = :employee_id AND org_id = :org_id ";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $post[$i]['employee_id']);
                $stmt->bindParam(":org_id", $post[0]['org_id']);
                $stmt->execute();
                $result['inActiviation'] = $stmt->rowCount();
                
                if ($post[$i]['group_id'] != '') {

                    $query = "Update `stellarhse_auth`.`emp_group`
                                set is_active     = 0 
                                where employee_id = :employee_id 
                                    and group_id  = :group_id ";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post[$i]['employee_id']);
                    $stmt->bindParam(":group_id", $post[$i]['group_id']);
                    $stmt->execute();
                }

                $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post[0]['org_id']);
                $stmt->bindParam(":employee_id", $post[$i]['employee_id']);
                $stmt->bindParam(":updated_by_id", $post[0]['updated_by_id']);
                $stmt->bindParam(":operation", $operation);
                $stmt->execute();
                $result['inActiviation_history'] = $stmt->rowCount();
            }

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/assignReassignGroup', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        $db = $this->db;
        $utils = new Utils();
        try {
            $ret = '';
            for ($i = 1; $i < count($post); $i++) {
                $group_id = $post[$i]['group_id'];
                if ($group_id != '') {
                    $operation = 'update';
                    $query = "UPDATE `stellarhse_auth`.`emp_group`
                                SET group_id     = :new_group_id 
                                where group_id   = :old_group_id
                                and employee_id  = :employee_id ";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":new_group_id", $post[0]['new_group_id']);
                    $stmt->bindParam(":old_group_id", $group_id);
                    $stmt->bindParam(":employee_id", $post[$i]["employee_id"]);
                    $stmt->execute();
                    $result['reassign'] = $stmt->rowCount();
                } else {
                    $operation = 'update';
                    $query = "INSERT INTO `stellarhse_auth`.`emp_group`
                                SET group_id     = :new_group_id ,
                                    is_active    = 0 ,
                                    employee_id  = :employee_id ";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":new_group_id", $post[0]['new_group_id']);
                    $stmt->bindParam(":employee_id", $post[$i]["employee_id"]);
                    $stmt->execute();
                    $result['assign'] = $stmt->rowCount();

                    $password = $utils->generateStrongPassword();

                    $query = " UPDATE `stellarhse_auth`.`employee`
                            SET password       =:NewPassword
                            where employee_id  =:employee_id ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post[$i]["employee_id"]);
                    $stmt->bindParam(":NewPassword", $password);
                    $stmt->execute();
                    $result['newPassword'] = $stmt->rowCount();

                    SendUserEmail('NewUserAccount', $post[$i]["employee_id"], $post[0]['org_id'], $password, $db);

                    $query = " select concat(first_name ,' ', last_name ) as fullName from `stellarhse_auth`.`employee` where employee_id = :EmployeeId; ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":EmployeeId", $post[$i]["employee_id"]);
                    $stmt->execute();
                    $results = $stmt->fetch(PDO::FETCH_ASSOC);

                    $ret .="<br/>" . $results['fullName'];
                    $result['ret'] = $ret;
                }

                $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post[0]['org_id']);
                $stmt->bindParam(":employee_id", $post[$i]['employee_id']);
                $stmt->bindParam(":updated_by_id", $post[0]['updated_by_id']);
                $stmt->bindParam(":operation", $operation);
                $stmt->execute();
                $result['history'] = $stmt->rowCount();
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getActiveGroupsByOrgId', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = " SELECT `group_id` ,`group_name`, `description`   FROM `stellarhse_auth`.`group` 
                        WHERE `org_id` = :org_id AND language_id  = :lang_id AND is_active = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":lang_id", $post['lang_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getCrewsByOrgIdAndLangId', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = " SELECT `crew_id` ,`crew_name`   FROM `stellarhse_auth`.`crew` 
                        WHERE `org_id` = :org_id AND language_id  = :lang_id AND hide = 0";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":lang_id", $post['lang_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getClassifications/{language_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = "select classification_id , classification_name  from  stellarhse_auth.classification 
                        where language_id=:language_id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $args['language_id']);
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

    $app->get('/getProductListByOrgId/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;

            $query = "select p.product_id,p.product_code,p.product_name from stellarhse_auth.org_product op
                        join stellarhse_auth.product_version pv on pv.product_version_id= op.product_version_id
                        join stellarhse_auth.product p on p.product_id = pv.product_id
                        where op.org_id=:org_id;";

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

    $app->post('/getMatchedActiveUsers', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = " CALL stellarhse_auth.`get_supervisor_list`(:keyword ,:org_id); ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":keyword", $post['keyWord']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getGroupProducts/{group_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;

            $query = "SELECT DISTINCT  product.product_id, product_code, product_name, product_description
                        FROM stellarhse_auth.product                       
                        JOIN stellarhse_auth.product_version ON product_version.product_id = product.product_id
                        JOIN stellarhse_auth.product_group ON product_group.product_version_id = product_version.product_version_id                                              
                        WHERE product_group.group_id = :group_id  
                        ORDER BY product_name ASC ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":group_id", $args['group_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateUsersGeneralFun', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;

            $query = " SELECT count(e.employee_id) as count   FROM `stellarhse_auth`.`employee`  e
                        LEFT JOIN `stellarhse_auth`.`org_employee` oe ON `e`.`employee_id` = `oe`.`employee_id` 
                        WHERE e.first_name = :first_name AND e.last_name = :last_name AND e.hide <> 1 AND oe.org_id = :org_id
                      ";
            $query .= $post['email'] ? " AND e.email = :email " : "";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":first_name", $post['first_name']);
            $stmt->bindParam(":last_name", $post['last_name']);
            if ($post['email']) {
                $stmt->bindParam(":email", $post['email']);
            }
            $stmt->execute();
            $result->employee_found = $stmt->fetchColumn();

            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });


    $app->post('/submitPeopleFunction', function($request, $response, $args) {
        // var_dump($request->getParsedBody());
        // exit;
        $error = new errorMessage();
        $db;
        $people;
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $people = $request->getParsedBody();
            $logger->info('submitPeopleFunction', $people);
            $db = $this->db;
            $emp_id = $people['emp_id'] == "" ? null : $people['emp_id'];
            $address = $people['address'] == "" ? null : $people['address'];
            $city_id = $people['city_id'] == "" ? null : $people['city_id'];
            $postal_code = $people['postal_code'] == "" ? null : $people['postal_code'];
            $position = $people['position'] == "" ? null : $people['position'];
            $area = $people['area'] == "" ? null : $people['area'];
            $location = $people['location'] == "" ? null : $people['location'];
            $primary_phone = $people['primary_phone'] == "" ? null : $people['primary_phone'];
            $alternate_phone = $people['alternate_phone'] == "" ? null : $people['alternate_phone'];
            $editing_by = $people['editing_by'] == "" ? null : $people['editing_by'];
            $supervisor_id = $people['supervisor_id'] == "" ? null : $people['supervisor_id'];
            $crew_id = $people['crew_id'] == "" ? null : $people['crew_id'];
            $group_id = $people['group_id'] == "" ? null : $people['group_id'];
            $password = $people['password'] == "" ? null : $people['password'];
            $security_question_id = $people['security_question_id'] == "" ? null : $people['security_question_id'];
            $security_answer = $people['security_answer'] == "" ? null : $people['security_answer'];
            $access_code = $people['direct_access_code'] == "" ? null : $people['direct_access_code'];
            $company = $people['company'] == "" ? null : $people['company'];
            $department = $people['department'] == "" ? null : $people['department'];
            $classification_id = $people['classification_id'] == "" ? null : $people['classification_id'];
            
            // echo "var l people";
            // var_dump($people);

            if ($people['operation'] == 'update') {
                // if($people['check_ques']=='no'){
                //     $group_id = null;
                // }
                $query = "call `stellarhse_auth`.add_people_user(:id,:first_name,:last_name,:emp_id,:email,
                        :address,:city_id,:postal_code,:position ,:area,:location,:primary_phone,:second_phone,:employee_id,:crew_id,:password,
                        :sec_q,:answer,:org_id,:department,:company,:supervisor_id,:classification_id,:direct_code,:group_id,:old_group,:operation_type_code );";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $people['employee_id']);
                $stmt->bindParam(":first_name", $people['first_name']);
                $stmt->bindParam(":last_name", $people['last_name']);
                $stmt->bindParam(":emp_id", $emp_id);
                $stmt->bindParam(":email", $people['email']);
                $stmt->bindParam(":address", $address);
                $stmt->bindParam(":city_id", $city_id);
                $stmt->bindParam(":postal_code", $postal_code);
                $stmt->bindParam(":position", $position);
                $stmt->bindParam(":area", $area);
                $stmt->bindParam(":location", $location);
                $stmt->bindParam(":primary_phone", $primary_phone);
                $stmt->bindParam(":second_phone", $alternate_phone);
                $stmt->bindParam(":employee_id", $editing_by);
                $stmt->bindParam(":crew_id", $crew_id);
                $stmt->bindParam(":password", $password);
                $stmt->bindParam(":sec_q", $security_question_id);
                $stmt->bindParam(":answer", $security_answer);
                $stmt->bindParam(":org_id", $people['org_id']);
                $stmt->bindParam(":department", $department);
                $stmt->bindParam(":company", $company);
                $stmt->bindParam(":supervisor_id", $supervisor_id);
                $stmt->bindParam(":classification_id", $classification_id);
                $stmt->bindParam(":group_id", $group_id);
                $stmt->bindParam(":old_group", $people['old_group']);
                $stmt->bindParam(":direct_code", $access_code);
                $stmt->bindParam(":operation_type_code", $people['operation']);
                $stmt->execute();
                $result = $stmt->rowCount();

                $query2 ="call `stellarhse_auth`.insert_into_hist_employee(:org_id ,:employee_id,:operation ,:updated_by )";
                $stmt2 = $db->prepare($query2);
                $stmt2->bindParam(":employee_id", $people['employee_id']);
                $stmt2->bindParam(":org_id", $people['org_id']);
                $stmt2->bindParam(":operation", $people['operation']);
                $stmt2->bindParam(":updated_by", $editing_by);
                $stmt2->execute();
                // if($people['check_ques']=='no'){
                //     $query3 ="delete from `stellarhse_auth`.emp_group where group_id=:group_id and employee_id=:employee_id";
                //     $stmt3 = $db->prepare($query3);
                //     $stmt3->bindParam(":employee_id", $people['employee_id']);
                //     $stmt3->bindParam(":group_id", $people['old_group']);
                //     $stmt3->execute();
                // }
                
//                 delete from emp_group where group_id=$old_group_id and employee_id=$id;
                
                $success = new Result();
                if ($result > 0) {
                    $success->success_edit = $result;
                } else {
                    $success->success_edit = $result;
                }
            } else if ($people['operation'] == 'add') {//add mode 
                $password = GenerateRandomChar(10);
                $query = "call `stellarhse_auth`.add_people_user(:id,:first_name,:last_name,:emp_id,:email,
                        :address,:city_id,:postal_code,:position ,:area,:location,:primary_phone,:second_phone,:employee_id,:crew_id,:password,
                        :sec_q,:answer,:org_id,:department,:company,:supervisor_id,:classification_id,:direct_code,:group_id,'',:operation_type_code );";
                $stmt = $db->prepare($query);
                $IDD=$people['newId'];
                $stmt->bindParam(":id", $IDD);
                $stmt->bindParam(":first_name", $people['first_name']);
                $stmt->bindParam(":last_name", $people['last_name']);
                $stmt->bindParam(":emp_id", $emp_id);
                $stmt->bindParam(":email", $people['email']);
                $stmt->bindParam(":address", $address);
                $stmt->bindParam(":city_id", $city_id);
                $stmt->bindParam(":postal_code", $postal_code);
                $stmt->bindParam(":position", $position);
                $stmt->bindParam(":area", $area);
                $stmt->bindParam(":location", $location);
                $stmt->bindParam(":primary_phone", $primary_phone);
                $stmt->bindParam(":second_phone", $alternate_phone);
                $stmt->bindParam(":employee_id", $editing_by);
                $stmt->bindParam(":crew_id", $crew_id);
                $stmt->bindParam(":password", $password);
                $stmt->bindParam(":sec_q", $security_question_id);
                $stmt->bindParam(":answer", $security_answer);
                $stmt->bindParam(":org_id", $people['org_id']);
                $stmt->bindParam(":department", $department);
                $stmt->bindParam(":company", $company);
                $stmt->bindParam(":supervisor_id", $supervisor_id);
                $stmt->bindParam(":classification_id", $classification_id);
                $stmt->bindParam(":group_id", $group_id);
                $stmt->bindParam(":direct_code", $access_code);
                $stmt->bindParam(":operation_type_code", $people['operation']);
                $stmt->execute();
                $result = $stmt->rowCount();
                $group_name=$people['group_name'];
                if ($group_name=="No access"){
                    //echo "no mail as it no access";
                }
                else {
                    SendUserEmail('ActivateUserAccount', $people['newId'],$people['org_id'],$password , $db , $people['language_id']);
                }

                // echo "mail sent";
                // echo $people['group_name'];
                
                 $query2 ="call `stellarhse_auth`.insert_into_hist_employee(:org_id ,:employee_id,:operation ,:updated_by )";
                 $stmt2 = $db->prepare($query2);
                 $stmt2->bindParam(":employee_id", $people['newId']);
                 $stmt2->bindParam(":org_id", $people['org_id']);
                 $stmt2->bindParam(":operation", $people['operation']);
                 $stmt2->bindParam(":updated_by", $editing_by);
                 $stmt2->execute();

                 $success = new Result();
                 if ($result > 0) {
                     $success->success_add = $result;
                 } else {
                     $success->success_add = $result;
                 }
            }

            $db = null;
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
            echo 'warning here PDO';
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    


    $app->post('/deletePeopleFunction', function($request, $response, $args) {
        $error = new errorMessage();
        $db;
        $people;
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $people = $request->getParsedBody();
            $logger->info('deletePeopleFunction', $people);
            $db = $this->db;
            $employee_id= $people['employee_id'] == "" ? null : $people['employee_id'];
            $org_id = $people['org_id'] == "" ? null : $people['org_id'];
            $group_id = $people['city_id'] == "" ? null : $people['group_id'];
            $updated_by  = $people['updated_by'] == "" ? null : $people['updated_by'];
            
            
            
           

            
            $query = "call `stellarhse_auth`.sp_delete_people(:emp_id,:org_id ,:group_id , :update_by );";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":emp_id", $employee_id);
            $stmt->bindParam(":org_id", $org_id);
            $stmt->bindParam(":group_id", $group_id);
            $stmt->bindParam(":update_by", $update_by);
            $result = $stmt->execute();
            
//            $query2 ="call `stellarhse_auth`.insert_into_hist_employee(:org_id ,:employee_id,:operation ,:updated_by )";
//            $stmt2 = $db->prepare($query2);
//            $stmt2->bindParam(":emp_id", $employee_id);
//            $stmt2->bindParam(":org_id", $org_id);
//            $stmt2->bindParam(":operation", 'delete');
//            $stmt2->bindParam(":updated_by", $updated_by);
//            $res= $stmt2->execute();
//            var_dump($res);//            
//            if($result){
//                $result_success = 1;
//            }else{
//                $result_success = 0;
//            }
            $success = new Result();
            $success->success = $result;
            
            $db = null;
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/checkEmail', function($request, $response, $args) {
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {
            $db = $this->db;
            if (isset($post['employee_id']) && $post['employee_id'] != '') {
                $query = "SELECT count(employee_id) as count from stellarhse_auth.`employee` where email=:email and employee_id !=:employee_id; ";
            } else {
                $query = "SELECT count(employee_id) as count from stellarhse_auth.`employee` where email=:email; ";
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $post['email']);
            if (isset($post['employee_id']) && $post['employee_id'] != '') {
                $stmt->bindParam(":employee_id", $post['employee_id']);
            }
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    
    $app->post('/getPeoplesHistory', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getPeoplesHistory', $post);

            $query = "SELECT hist_employee_id, employee_id,concat(first_name ,' ', last_name) as name, email, address, city_name, province_name, country_name, department, company, group_name, date_format( assign_to_group_date,'%m/%d/%Y') AS  assign_to_group_date,
                        org_name, product_name, version_name, postal_code, position, area, supervisor_name, primary_phone, alternate_phone, classification, user_name, is_active,
                        security_question_name, security_answer ,date_format( updated_date,'%m/%d/%Y') AS  updated_date, history_operation_name ,
                        CASE emp_is_active WHEN '0' THEN  'In Active'  WHEN '1' THEN 'Active' END AS emp_is_active
                        FROM `stellarhse_auth`.hist_employee 
                        join `stellarhse_auth`.history_operation ho on ho.history_operation_id = hist_employee.history_operation_id ";


            if ($post['org_id'] != null) {
                $query .='  where org_id =:org_id ';
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post['org_id']);
            } else {
                $stmt = $db->prepare($query);
            }


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

    $app->post('/getProductsByOrg', function($request, $response, $args) {
        $error = new errorMessage();
        $data = $request->getParsedBody();
        try {
            $db = $this->db;
           
            $query = "select distinct product_id as id,(case when product_code in ('Inspection','Training','ABCanTrack')
                then concat('HSE Tracking ',product_name , ' Modules')
                when product_code='MaintenanceManagement' then concat('HSE Tracking Maintenance Modules')
                when product_code='SafetyMeeting' then concat('HSE Tracking Safety Meeting Modules')
                when product_code='Analytics' then concat('Analytics Modules')
                when product_code='HSE' then concat('HSE Program Modules')
                when product_code='Hazard' then concat('HSE Tracking Hazard ID Modules')
                else product_name  end ) as `reportType`, product_code as code
                from stellarhse_auth.product_view where product_version_id in
                (select product_version_id from stellarhse_auth.org_product  where org_id
                =:org_id and is_active = 1) and product_code in ('Hazard','Inspection','Safetymeeting','MaintenanceManagement','ABCanTrack','Training')
                order by product_name";
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

    $app->post('/setOrgAdmin', function($request, $response, $args) { 
        $error = new errorMessage();
        $data = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = "update stellarhse_auth.organization set system_admin_id=:emp_id where org_id=:org_id" ; 
            $stmt = $db->prepare($query);
            $stmt->bindParam(":emp_id",$data['emp_id']);
            $stmt->bindParam(":org_id",$data['org_id']);
            $stmt->execute();
            // var_dump($stmt);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getOrgAdminName',function($request, $response, $args){
        $error = new errorMessage();
        $data = $request->getParsedBody();
        try {
            $db = $this->db;
            $query = "select e.employee_id,concat(e.first_name,' ',e.last_name) as admin_name from stellarhse_auth.employee e 
            join stellarhse_auth.organization o on o.system_admin_id=e.employee_id where o.org_id=:org_id; "; 
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id",$data['org_id']);
            $stmt->execute();
            // var_dump($stmt);
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            // echo $result;
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});

function GenerateRandomChar($x) {

    $alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    $pass = array(); //remember to declare $pass as an array
    $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
    for ($i = 0; $i < $x; $i++) {
        $n = rand(0, $alphaLength);
        $pass[] = $alphabet[$n];
    }
    return implode($pass);
}




function SendEmaill($to, $from, $subject, $message, $file) {
    // var_dump($to , $from, $subject, $message, $file);
     try {
        
          // var_dump ($to);
         // require_once 'php-mailer/class.phpmailer.php';
         $mail = new PHPMailer(true);
 
        // var_dump("phpmailer");
         $mail->IsSMTP();
 
         $user_email = 'account.services@abcanada.com';
         $email_password = 'SnowCity@2014';
         $sender_name = 'ABCanTrack Account Services';
 
         if ($from == '') {
             $from = $user_email;
         }
 
         $mail->Timeout = 180;
         $mail->CharSet = "UTF-8"; // To support special characters in SMTP mail 
         $mail->Host = MAIL_SERVER;
         $mail->SMTPDebug = 1;
         $mail->SMTPAuth = 1;
         $mail->SMTPSecure = 'tls';
         $mail->Username = $user_email;
         $mail->Password = $email_password;
         $mail->SetFrom($from, $sender_name);
         if ($file != '') {
             $mail->AddAttachment($file, '');
         }
         $mail->AddAddress($to);
         
         $mail->Subject = $subject;
         
         $mail->MsgHTML($message);
      
         $result = $mail->send();
         return $result;
     } catch (phpmailerException $ex) {
         throw new Exception($ex->getMessage());
     } catch (Exception $ex) {
         throw new Exception($ex->getMessage());
     }
 }
 


?>

