<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getcolumnslabels', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $data = $request->getParsedBody();
            $db = $this->db;

            $where = " where org_field.org_id ='cs4sql-a592668d-dc76-11e4-b362-5254000a52fa'  ";
            if ($data['TabName'] !== "") {
                $where .= " and  sub_tab.field_code =:TabName ";
            }
            $query = "SELECT org_field.field_id as FieldId, field_name as FieldName,   TRIM(field_label) as FieldLabel , is_statistical as IsStatistical, sub_tab_label as SubTabLabel,
            CASE org_field.is_mandatory WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsMandatory,
            CASE field.is_mandatory WHEN '0' THEN '0' WHEN '1' THEN '1' END AS DefaultMandatory,
            CASE org_field.is_hidden WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsHidden, 
            CASE field.is_editable   WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsEditable
            FROM ". $data["dbname"] .".org_field
            left join ". $data["dbname"] .".field on field.field_id = org_field.field_id   
            left join ". $data["dbname"] .".sub_tab on sub_tab.sub_tab_id= field.sub_tab_id
            " . $where . " and field.language_id='cs4sql-3daf2a4e-dc78-11e4-b362-5254000a52fa'  order by sub_tab.`order` asc";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":OrgId", $data['OrgId']);
            $stmt->bindParam(":LanguageId", $data['LanguageId']);
            if ($data['TabName'] !== "") {
                $stmt->bindParam(":TabName", $data['TabName']);
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

    $app->get('/userpermissions/{org_id}/{employee_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $data = $request->getParsedBody();
            $db = $this->db;

            $query = "Select  permission_name as PermissionName,permission_code as PermissionCode, permission_definition as PermissionDefinition
            From stellarhse_auth.permission_new
                        inner join stellarhse_auth.group_permission on group_permission.permission_id = permission_new.permission_id
                        inner join stellarhse_auth.`group` on `group`.group_id = group_permission.group_id                   
                        inner join stellarhse_auth.emp_group on emp_group.group_id = `group`.group_id
                        inner join stellarhse_auth.employee on employee.employee_id = emp_group.employee_id
                        where `group`.org_id = :OrgId 
                        and employee.employee_id =:EmployeeId";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":OrgId", $args['org_id']);
            $stmt->bindParam(":EmployeeId", $args['employee_id']);
            $stmt->execute();
            $UserPermissionsArray = $stmt->fetchAll(PDO::FETCH_OBJ);

            return $this->response->withJson($UserPermissionsArray);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    
    $app->post('/login', function($request, $response, $args) { 
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $user = $request->getParsedBody();
            $logger->info('login', $user);
            $db = $this->db;

            $query = "select * from  stellarhse_auth.get_user_info where user_name =:user_name and `password` =:password AND emp_grp_is_active = 1 limit 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_name", $user['user_name']);
            $stmt->bindParam(":password", $user['password']);

            $stmt->execute();
            $result = $stmt->fetchObject();

            if ($result && property_exists($result, 'first_name')) {

                $query = "Select permission_code From stellarhse_auth.permissions_view where permission_category_code = 'Default' and 
                group_id=:group_id and employee_id = :employee_id ;";
               $stmt = $db->prepare($query);
               $stmt->bindParam(":group_id", $result->group_id);
               $stmt->bindParam(":employee_id", $result->employee_id);
               $stmt->execute();
               $result->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);

                $query = "select p.product_id,p.product_code,p.product_name from stellarhse_auth.product_group pg
                join stellarhse_auth.product_version pv on pv.product_version_id= pg.product_version_id
                join stellarhse_auth.product p on p.product_id = pv.product_id
                where pg.group_id=:group_id order by product_name";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $result->group_id);
                $stmt->execute();
                
                $result->products = $stmt->fetchAll(PDO::FETCH_OBJ);
                foreach($result->products as $key=>$product){
                    $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=:group_id
                     and employee_id = :employee_id and ((parent_id is null and product_code = :product_code) or parent_id in (
                         select permission_id from stellarhse_auth.permissions_view where product_code = :product_code
                     ));";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":group_id", $result->group_id);
                    $stmt->bindParam(":employee_id", $result->employee_id);
                    $stmt->bindParam(":product_code", $product->product_code);
                    $stmt->execute();
                    $result->products[$key]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                }
                // get general hse tracking permissions
                $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=:group_id
                and employee_id = :employee_id and permission_category_id in (select permission_category_id from stellarhse_auth.permission_category 
                where permission_category_code like 'general%')";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $result->group_id);
                $stmt->bindParam(":employee_id", $result->employee_id);
                $stmt->execute();
                $generalPerm = new stdClass();
                $generalPerm->product_code = 'general';
                $generalPerm->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                array_push($result->products, $generalPerm);

                $query = "select org_id, employee_id, org_name, concat('logo/',org_id,'.gif') as logourl from  stellarhse_auth.get_user_info where  user_name =:user_name and `password` =:password AND emp_grp_is_active = 1";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":user_name", $user['user_name']);
                $stmt->bindParam(":password", $user['password']);
                $stmt->execute();
                $result->userOrganizations = $stmt->fetchAll(PDO::FETCH_OBJ);
                session_destroy();
                session_start();
                $_SESSION['temp_path']='/data/report_documents/attachments/'.$result->employee_id.'/';
//                var_dump($_SESSION);
                
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
    
    $app->post('/sitelogin', function($request, $response, $args) { 
        $error = new errorMessage();
        $utils = new Utils();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $user = $request->getParsedBody();
            $logger->info('login', $user);
            $db = $this->db;

            $query = "select * from  stellarhse_auth.get_user_info where user_name =:user_name and `password` =:password AND emp_grp_is_active = 1 limit 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":user_name", $user['username']);
            $stmt->bindParam(":password", $user['password']);
            $stmt->execute();
            $result = $stmt->fetchObject();
            
            if (property_exists($result, 'employee_id')) {
//                $start_char = $utils->generateRandomChar(1);
//                $end_char = $utils->generateRandomChar(1);
//                $activation_code = $start_char . $result->password . $end_char;
                $activation_code = $utils->generateRandomChar(10);
                $result->activation_code = $activation_code;
                $query = "update stellarhse_auth.employee set activation_code = :activation_code where employee_id = :employee_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":activation_code", $activation_code);
                $stmt->bindParam(":employee_id", $result->employee_id);
                $stmt->execute();
                return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson($result);
            } else {
                return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson(0);
            }
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    
    $app->get('/siteuserlogin/{activ_code}', function($request, $response, $args) { 
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
//            $user = $request->getParsedBody();
//            $logger->info('login', $user);
            $db = $this->db;
//            $activationCode = substr(substr($args['activ_code'], 0, -1), 1);
            $query = "select * from  stellarhse_auth.get_user_info where `activation_code` =:activation_code AND emp_grp_is_active = 1 limit 1 ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":activation_code", $args['activ_code']);
            $stmt->execute();
            $result = $stmt->fetchObject();
            
            if ($result && property_exists($result, 'first_name')) {

                $query = "Select permission_code From stellarhse_auth.permissions_view where permission_category_code = 'Default' and 
                group_id=:group_id and employee_id = :employee_id ;";
               $stmt = $db->prepare($query);
               $stmt->bindParam(":group_id", $result->group_id);
               $stmt->bindParam(":employee_id", $result->employee_id);
               $stmt->execute();
               $result->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);

                $query = "select p.product_id,p.product_code,p.product_name from stellarhse_auth.product_group pg
                join stellarhse_auth.product_version pv on pv.product_version_id= pg.product_version_id
                join stellarhse_auth.product p on p.product_id = pv.product_id
                where pg.group_id=:group_id order by product_name";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $result->group_id);
                $stmt->execute();
                
                $result->products = $stmt->fetchAll(PDO::FETCH_OBJ);
                foreach($result->products as $key=>$product){
                    $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=:group_id
                     and employee_id = :employee_id and ((parent_id is null and product_code = :product_code) or parent_id in (
                         select permission_id from stellarhse_auth.permissions_view where product_code = :product_code
                     ));";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":group_id", $result->group_id);
                    $stmt->bindParam(":employee_id", $result->employee_id);
                    $stmt->bindParam(":product_code", $product->product_code);
                    $stmt->execute();
                    $result->products[$key]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                }
                // get general hse tracking permissions
                $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=:group_id
                and employee_id = :employee_id and permission_category_id in (select permission_category_id from stellarhse_auth.permission_category 
                where permission_category_code like 'general%')";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $result->group_id);
                $stmt->bindParam(":employee_id", $result->employee_id);
                $stmt->execute();
                $generalPerm = new stdClass();
                $generalPerm->product_code = 'general';
                $generalPerm->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                array_push($result->products, $generalPerm);

                $query = "select org_id, employee_id, org_name, concat('logo/',org_id,'.gif') as logourl from  stellarhse_auth.get_user_info where  user_name =:user_name and `password` =:password AND emp_grp_is_active = 1";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":user_name", $user['user_name']);
                $stmt->bindParam(":password", $user['password']);
                $stmt->execute();
                $result->userOrganizations = $stmt->fetchAll(PDO::FETCH_OBJ);
                session_destroy();
                session_start();
                $_SESSION['temp_path']='/data/report_documents/attachments/'.$result->employee_id.'/';
//                var_dump($_SESSION);
                
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

    $app->post('/forgetpassword', function($request, $response, $args) {
        $useremail = $request->getParsedBody();
        $error = new errorMessage();
        $utils = new Utils();

        $db = $this->db;
        try{
//        $query = "select * from stellarhse_auth.employee where email = :email";
            $query = "select distinct e.employee_id, CASE oe.emp_is_active WHEN '0' THEN '0' WHEN '1' THEN '1' END AS emp_is_active, oe.org_id  
                        from stellarhse_auth.employee e
                        join stellarhse_auth.org_employee oe on oe.employee_id = e.employee_id
                        where e.email =:email";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $useremail['username']);
            $stmt->execute();
            $user_data = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
            $count = $stmt->rowCount();
            if($count === 0){
                return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson(0);
            } else {
                $query = "select count(*) as count from stellarhse_auth.emp_group eg
                          join stellarhse_auth.employee e on e.employee_id= eg.employee_id
                          where e.email =:email and eg.is_active='1'";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":email", $useremail['username']);
                $stmt->execute();
                $user_data2 = $stmt->fetch(PDO::FETCH_ASSOC);
                if($user_data2['count'] === 0){
                    return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson(2);
                } else {
                    if ($user_data->emp_is_active == '1') {
                        $new_password = $utils->generateRandomChar(10);

                        $queryUpdate = "Update stellarhse_auth.employee
                                        set password = :new_password  
                                        Where employee_id  =:employee_id ";
                        $stmt = $db->prepare($queryUpdate);
                        $stmt->bindParam(":new_password", $new_password);
                        $stmt->bindParam(":employee_id", $user_data->employee_id);
                        $stmt->execute();


                        // send the user email with the new password
                        SendUserEmail('ForgotPassword', $user_data->employee_id, $user_data->org_id, $new_password, $db);
                        return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson(1);
                    } else {
                        return $this->response->withHeader("Access-Control-Allow-Origin", "*")->withJson(3);
                    }
                }
            }
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/getorginfo/{org_id}', function($request, $response, $args) {
        $user = $request->getParsedBody();
        $db = $this->db;
        $query = "select * from  stellarhse_auth.organization where org_id =:org_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":org_id", $args['org_id']);
        $stmt->execute();
        $result = $stmt->fetchObject();
        return $this->response->withJson($result);
    });


    $app->post('/switchuser', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $user = $request->getParsedBody();
            $logger->info('switchuser', $user);
            $db = $this->db;

            $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id  and employee_id = :employee_id AND emp_grp_is_active = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $user['org_id']);
            $stmt->bindParam(":employee_id", $user['employee_id']);

            $stmt->execute();
            $result = $stmt->fetchObject();

            $query = "Select permission_code From stellarhse_auth.permissions_view where permission_category_code = 'Default' and 
            group_id=:group_id and employee_id = :employee_id  ;";
           $stmt = $db->prepare($query);
           $stmt->bindParam(":group_id", $result->group_id);
        //    $stmt->bindParam(":org_id", $result->org_id);
           $stmt->bindParam(":employee_id", $result->employee_id);
           $stmt->execute();
           $result->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);

           $query = "select p.product_id,p.product_code,p.product_name from stellarhse_auth.product_group pg
           join stellarhse_auth.product_version pv on pv.product_version_id= pg.product_version_id
           join stellarhse_auth.product p on p.product_id = pv.product_id
           where pg.group_id=:group_id order by product_name";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":group_id", $result->group_id);
            $stmt->execute();
            $result->products = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach($result->products as $key=>$product){
                $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=
                :group_id and employee_id = :employee_id  and ((parent_id is null and product_code = :product_code) or parent_id in (
                    select permission_id from stellarhse_auth.permissions_view where product_code = :product_code
                ));";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $result->group_id);
                // $stmt->bindParam(":org_id", $result->org_id);
                $stmt->bindParam(":employee_id", $result->employee_id);
                $stmt->bindParam(":product_code", $product->product_code);
                $stmt->execute();
                $result->products[$key]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            // get general hse tracking permissions
            $query = "Select permission_code From stellarhse_auth.permissions_view where group_id=
            :group_id and employee_id = :employee_id and permission_category_id in (select permission_category_id from stellarhse_auth.permission_category 
            where permission_category_code like 'general%')";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":group_id", $result->group_id);
            // $stmt->bindParam(":org_id", $result->org_id);
            $stmt->bindParam(":employee_id", $result->employee_id);
            $stmt->execute();
            $generalPerm = new stdClass();
            $generalPerm->product_code = 'general';
            $generalPerm->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
            array_push($result->products, $generalPerm);

            // $query = "Select permission_code
            //                 From stellarhse_auth.permission p
            //                 inner join stellarhse_auth.group_permission gp on gp.permission_id = p.permission_id
            //                 inner join stellarhse_auth.`group` g on g.group_id = gp.group_id               
            //                 inner join stellarhse_auth.emp_group eg on eg.group_id = g.group_id       
            //                 inner join stellarhse_auth.employee  e on e.employee_id = eg.employee_id
            //                 where stellarhse_auth.`g`.org_id =  :org_id 
            //                 and e.employee_id = :employee_id ;";
            // $stmt = $db->prepare($query);
            // $stmt->bindParam(":org_id", $user['org_id']);
            // $stmt->bindParam(":employee_id", $user['employee_id']);
            // $stmt->execute();
            // $result->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);

            // $query = "select p.product_id,p.product_code,p.product_name from stellarhse_auth.org_product op
            //             join stellarhse_auth.product_version pv on pv.product_version_id= op.product_version_id
            //             join stellarhse_auth.product p on p.product_id = pv.product_id
            //             where op.org_id=:org_id;";

            // $stmt = $db->prepare($query);
            // $stmt->bindParam(":org_id", $user['org_id']);
            // $stmt->execute();
            // $result->products = $stmt->fetchAll(PDO::FETCH_OBJ);

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