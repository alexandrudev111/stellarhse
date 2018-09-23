<?php

$app->group('/api/v1', function() use($app) {

    $app->post('/getUserDetails', function($request, $response, $args) {
        $error = new errorMessage();
        $db = $this->db;
        $post = $request->getParsedBody();


        $query = "CALL stellarhse_auth.sp_get_user(:org_id,:emp_id );";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":org_id", $post['org_id']);
        $stmt->bindParam(":emp_id", $post['employee_id']);
        $stmt->execute();

        $result = $stmt->fetchObject();
        //print_r($result);
        return $this->response->withJson($result);
    });

    $app->post('/getCrews', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        $post = $request->getParsedBody();

        try {
            $query = "select crew_id, crew_name from stellarhse_auth.crew where org_id = :org_id and "
                    . "`hide` = 0 order by `order`,crew_name";
            $stmt = $db->prepare($query);
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

    $app->get('/getClassificationList', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {

            $query = "select * from `stellarhse_auth`.classification";

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
    
    $app->post('/getDepartments', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {

            $query = "select department_responsible_id,department_responsible_name  from stellarhse_auth.department_responsible where org_id=:org_id and hide <>1;";

            $stmt = $db->prepare($query);
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
    
    $app->post('/getUserGroup', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {

            $query = "select group_id,group_name,field_code from stellarhse_auth.`group`where org_id=:org_id and  is_active=1;";

            $stmt = $db->prepare($query);
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
    
    
    $app->post('/getRole', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        $post = $request->getParsedBody();
        try {

            $query = "select role_id,role_name,field_code  from stellarhse_auth.role where org_id=:org_id and hide <>1;";

            $stmt = $db->prepare($query);
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
    
    
    $app->post('/getSupervisors', function($request, $response, $args) {
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
    
    
    $app->post('/updateMyProfile', function($request, $response, $args) {
        // var_dump($request->getParsedBody());
        // exit;
        $db = $this->db;
        $error = new errorMessage();
        $people = $request->getParsedBody();
        //print_r($people);
        try {

            
//            $employee_id = $people['employee_id'] == "" ? null : $people['employee_id'];
//            $first_name = $people['first_name'] == "" ? null : $people['first_name'];
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
            $password = $people['newPass'] == "" ? null : $people['newPass'];
            $security_question_id = $people['security_question_id'] == "" ? null : $people['security_question_id'];
            $security_answer = $people['security_answer'] == "" ? null : $people['security_answer'];
            $access_code = $people['direct_access_code'] == "" ? null : $people['direct_access_code'];
            $company = $people['company'] == "" ? null : $people['company'];
            $department = $people['department'] == "" ? null : $people['department'];
            $classification_id = $people['classification_id'] == "" ? null : $people['classification_id'];


                $query = "call `stellarhse_auth`.sp_update_user(:id,:first_name,:last_name,:emp_id,:email,
                        :address,:city_id,:postal_code,:position ,:role_id,:primary_phone,:second_phone,:crew_id,:password,
                       :department,:org_id,:company,:classification_id,:supervisor_id,:updated_by_id);";
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
                $stmt->bindParam(":role_id", $people['role_id']);
//                $stmt->bindParam(":area", $area);
//                $stmt->bindParam(":location", $location);
                $stmt->bindParam(":primary_phone", $primary_phone);
                $stmt->bindParam(":second_phone", $alternate_phone);
//                $stmt->bindParam(":employee_id", $editing_by);
                $stmt->bindParam(":crew_id", $crew_id);
                $stmt->bindParam(":password", $password);
//                $stmt->bindParam(":sec_q", $security_question_id);
//                $stmt->bindParam(":answer", $security_answer);
//                $stmt->bindParam(":org_id", $people['org_id']);
                $stmt->bindParam(":department",$people['department'] ); //
                $stmt->bindParam(":org_id", $people['org_id']);
                $stmt->bindParam(":company", $company);
//                $stmt->bindParam(":supervisor_id", $supervisor_id);
                $stmt->bindParam(":classification_id", $classification_id);
                $stmt->bindParam(":supervisor_id", $supervisor_id);
//                $stmt->bindParam(":group_id", $group_id);
//                $stmt->bindParam(":old_group", $people['old_group']);
//                $stmt->bindParam(":direct_code", $access_code);
//                $stmt->bindParam(":operation_type_code", $people['operation']);
                $stmt->bindParam(":updated_by_id", $people['employee_id']);
                
                $stmt->execute();

                $result = $stmt->rowCount();

                $success = new Result();
                if ($result > 0) {
                    $success->success_edit = $result;
                } else {
                    $success->success_edit = $result;
                }

            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
            echo 'warning here PDO';
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
});
