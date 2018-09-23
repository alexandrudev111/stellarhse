<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/getgroupsgrid', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "SELECT * FROM stellarhse_auth.groups_users_view where org_id = :org_id order by group_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
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

    $app->post('/deletegroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select count(*) as Count from stellarhse_auth.emp_group where group_id = :group_id ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group']['group_id']);
            $stmt->execute();
            $group_users = $stmt->fetch(PDO::FETCH_COLUMN);
            if ($group_users > 0) {
                $result = 'has users';
            } else {
                $query = "DELETE FROM stellarhse_auth.product_group where group_id = :group_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group']['group_id']);
                $stmt->execute();
                $query = "DELETE FROM stellarhse_auth.group_permission where group_id = :group_id  ";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group']['group_id']);
                $stmt->execute();
                $query = "DELETE FROM stellarhse_auth.group where group_id = :group_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group']['group_id']);
                $stmt->execute();
                $result = $stmt->rowCount();
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

    $app->post('/activategroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "UPDATE stellarhse_auth.group set is_active = 1 where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group']['group_id']);
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

    $app->post('/deactivategroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "UPDATE stellarhse_auth.group set is_active = 0 where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group']['group_id']);
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

    // $app->post('/getorgemployeesbygroup', function($request, $response, $args) {
    //     $result = [];
    //     $data = $request->getParsedBody();
    //     $db = $this->db;
    //     $error = new errorMessage();
    //     try {
    //         $query = "select * from stellarhse_auth.get_user_info where org_id = :org_id and group_id <> :group_id AND emp_grp_is_active = 1 order by full_name ";
    //         $stmt = $db->prepare($query);
    //         $stmt->bindParam(":org_id", $data['org_id']);
    //         $stmt->bindParam(":group_id", $data['group_id']);
    //         $stmt->execute();
    //         $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    //         return $this->response->withJson($result);
    //     } catch (PDOException $ex) {
    //         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    //     } catch (Exception $ex) {
    //         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    //     }
    // });

    $app->post('/assignusertogroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "Delete from stellarhse_auth.emp_group where employee_id = :employee_id and group_id in 
            (select group_id from stellarhse_auth.`group` where org_id = :org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':employee_id', $data['employee_id']);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->execute();

            $query = "insert into stellarhse_auth.emp_group (group_id, employee_id, is_active) values (:group_id, :employee_id, 1)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->bindParam(':employee_id', $data['employee_id']);
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

    $app->post('/getmoduletypes', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select distinct product_id as id,(case when product_code in ('Inspection','Training','ABCanTrack')
            then concat('HSE Tracking: ',product_name , ' Modules')
            when product_code='MaintenanceManagement' then concat('HSE Tracking: Maintenance Modules')
            when product_code='SafetyMeeting' then concat('HSE Tracking: Safety Meeting Modules')
            when product_code='Analytics' then concat('Analytics Modules')
            when product_code='HSE' then concat('HSE Program Modules')
            when product_code='Hazard' then concat('HSE Tracking: Hazard ID Modules')
            else product_name  end ) as `name`, product_code as code
            from stellarhse_auth.product_view where product_version_id in
            (select product_version_id from stellarhse_auth.org_product
             where org_id = :org_id and product_code != 'Notifications' and is_active = 1)
            order by product_name;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
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

    $app->post('/getgrouptypes', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select distinct group_type_id as id, group_type_name as `name`, field_code as code from stellarhse_auth.
            group_type where org_id = :org_id order by `order`";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $data['org_id']);
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

    $app->post('/getdefaultpermissions', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "SELECT * FROM stellarhse_auth.permission_new where permission_category_id = 
            (select permission_category_id from stellarhse_auth.permission_category where permission_category_code = 'default') 
            and language_id = :language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':language_id', $data['language_id']);
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
    
    $app->post('/getproductspermissions', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            foreach($data['products'] as $key=>$product){
                if((!isset($data['general']) || count($data['general']) === 0) && 
                in_array($product['code'], array('Hazard', 'ABCanTrack', 'Inspection', 'SafetyMeeting', 'Training', 'MaintenanceManagement'))){
                    $data['general'] = new stdClass();
                    $query = "select * from stellarhse_auth.permission_category where permission_category_code like 'general%'
                    and language_id = :language_id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':language_id', $data['language_id']);
                    $stmt->execute();
                    $data['general']->categories = $stmt->fetchAll(PDO::FETCH_OBJ);
                    foreach($data['general']->categories as $key2=>$category){
                        $query = "select * from stellarhse_auth.permission_new where permission_category_id = :permission_category_id order by `order`";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':permission_category_id', $category->permission_category_id);
                        $stmt->execute();
                        $data['general']->categories[$key2]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach($data['general']->categories[$key2]->permissions as $key3=>$permission){
                            $query = "select * from stellarhse_auth.permission_new where parent_id = :parent_id order by `order`";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':parent_id', $permission->permission_id);
                            $stmt->execute();
                            $data['general']->categories[$key2]->permissions[$key3]->children = $stmt->fetchAll(PDO::FETCH_OBJ);
                        }
                    }

                    // $query = "SELECT * FROM stellarhse_auth.permission_new where permission_category_id in 
                    // (select permission_category_id from stellarhse_auth.permission_category where permission_category_code like 'general%') 
                    // and language_id = :language_id";
                }
                $query = "SELECT * FROM stellarhse_auth.permission_category where product_id = :product_id and language_id = 
                :language_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':product_id', $product['id']);
                $stmt->bindParam(':language_id', $data['language_id']);
                $stmt->execute();
                $data['products'][$key]['permissions_categories'] = $stmt->fetchAll(PDO::FETCH_OBJ);

                foreach($data['products'][$key]['permissions_categories'] as $key2=>$category){
                    $query = "select * from stellarhse_auth.permission_new where permission_category_id = :permission_category_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':permission_category_id', $category->permission_category_id);
                    $stmt->execute();
                    $data['products'][$key]['permissions_categories'][$key2]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                    foreach($data['products'][$key]['permissions_categories'][$key2]->permissions as $key3=>$permission){
                        $query = "select * from stellarhse_auth.permission_new where parent_id = :parent_id order by `order`";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':parent_id', $permission->permission_id);
                        $stmt->execute();
                        $data['products'][$key]['permissions_categories'][$key2]->permissions[$key3]->children = $stmt->fetchAll(PDO::FETCH_OBJ);
                    }
                }
            }
            return $this->response->withJson($data);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getorgemployeesnothavegroup', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_auth.get_org_user where user_name is not null
            and password is not null and org_id =:org_id and emp_is_active = 1";
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

    $app->post('/submitgroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select stellarhse_auth.myuuid()";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $group_id = $stmt->fetchColumn();

            $query = "insert into stellarhse_auth.`group` (group_id, org_id, group_type_id, language_id, group_name, description, 
            is_active) values (:group_id, :org_id, :group_type_id, :language_id, :group_name, :description, 1)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $group_id);
            $stmt->bindParam(':org_id', $data['org_id']);
            $stmt->bindParam(':group_type_id', $data['group_type_id']);
            $stmt->bindParam(':language_id', $data['language_id']);
            $stmt->bindParam(':group_name', $data['group_name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->execute();
            $result = $stmt->rowCount();

            // change the relation of group_permission to be with permission_new or use old table called permission
            foreach($data['defaultPermissions'] as $permission){
                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $group_id);
                $stmt->bindParam(':permission_id', $permission['permission_id']);
                $stmt->execute();
            }
            if(isset($data['general'])){
                foreach($data['general']['categories'] as $category){
                    foreach($category['permissions'] as $permission){
                        if($permission['checked']){
                            $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':group_id', $group_id);
                            $stmt->bindParam(':permission_id', $permission['permission_id']);
                            $stmt->execute();
                        }
                        foreach($permission['children'] as $perm){
                            if($perm['checked']){
                                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':group_id', $group_id);
                                $stmt->bindParam(':permission_id', $perm['permission_id']);
                                $stmt->execute();
                            }
                        }
                    }
                }
            }

            foreach($data['moduleTypes'] as $product){
                $query = "insert into stellarhse_auth.`product_group` (group_id, 
                product_version_id) values (:group_id, (select product_version_id from 
                stellarhse_auth.product_version where product_id = :product_id))";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $group_id);
                $stmt->bindParam(':product_id', $product['id']);
                $stmt->execute();
                foreach($product['permissions_categories'] as $category){
                    foreach($category['permissions'] as $permission){
                        if($permission['checked']){
                            $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':group_id', $group_id);
                            $stmt->bindParam(':permission_id', $permission['permission_id']);
                            $stmt->execute();
                        }
                        foreach($permission['children'] as $perm){
                            if($perm['checked']){
                                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':group_id', $group_id);
                                $stmt->bindParam(':permission_id', $perm['permission_id']);
                                $stmt->execute();
                            }
                        }
                    }
                }
            }

            // insert group users
            foreach($data['users'] as $user){
                $query = "Delete from stellarhse_auth.emp_group where employee_id = :employee_id and group_id in 
                (select group_id from stellarhse_auth.`group` where org_id = :org_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':employee_id', $user['employee_id']);
                $stmt->bindParam(':org_id', $user['org_id']);
                $stmt->execute();
    
                $query = "insert into stellarhse_auth.emp_group (group_id, employee_id, 
                is_active) values (:group_id, :employee_id, 1)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $group_id);
                $stmt->bindParam(':employee_id', $user['employee_id']);
                $stmt->execute();
                $result = $stmt->rowCount();
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

    $app->post('/getgroupinfo', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;
            $query = "select * from stellarhse_auth.group where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];

            // select group products
            $query = "select product_id as id, product_name as name, product_code as code 
            from stellarhse_auth.`product_view` where group_id = :group_id order by product_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();
            $result->products = $stmt->fetchAll(PDO::FETCH_OBJ);

            // select group default permissions
            $query = "SELECT * FROM stellarhse_auth.permissions_view where permission_id in 
            (select permission_id from stellarhse_auth.permissions_view where permission_category_code = 'default') 
            and group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            // $stmt->bindParam(':language_id', $data['language_id']);
            $stmt->execute();
            $result->defaultPermissions = $stmt->fetchAll(PDO::FETCH_OBJ);

            // select group products' permissions
            foreach($result->products as $key=> $product){
                if((!isset($result->generalPermissions) || count($result->generalPermissions) === 0) && 
                in_array($product->code, array('Hazard', 'ABCanTrack', 'Inspection', 'SafetyMeeting', 'Training', 'MaintenanceManagement'))){
                    $result->generalPermissions = new stdClass();
                    $query = "SELECT distinct permission_category_id, permission_category_name,permission_category_code FROM stellarhse_auth.
                    permissions_view where permission_category_code like 'general%' and group_id = :group_id";
                    // $query = "select * from stellarhse_auth.permission_category where permission_category_code like 'general%'
                    // and language_id = :language_id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':group_id', $data['group_id']);
                    // $stmt->bindParam(':language_id', $data['language_id']);
                    $stmt->execute();
                    $result->generalPermissions->categories = $stmt->fetchAll(PDO::FETCH_OBJ);
                    foreach($result->generalPermissions->categories as $key2=>$category){
                        $query = "select * from stellarhse_auth.permissions_view where 
                        permission_category_id = :permission_category_id and group_id = :group_id order by `order`";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':group_id', $data['group_id']);
                        $stmt->bindParam(':permission_category_id', $category->permission_category_id);
                        $stmt->execute();
                        $result->generalPermissions->categories[$key2]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach($result->generalPermissions->categories[$key2]->permissions as $key3=>$permission){
                            $query = "select * from stellarhse_auth.permissions_view where 
                            parent_id = :parent_id and group_id = :group_id order by `order`";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':group_id', $data['group_id']);
                            $stmt->bindParam(':parent_id', $permission->permission_id);
                            $stmt->execute();
                            $result->generalPermissions->categories[$key2]->permissions[$key3]->children = $stmt->fetchAll(PDO::FETCH_OBJ);
                        }
                    }
                }
                $query = "SELECT distinct permission_category_id, permission_category_name,permission_category_code FROM stellarhse_auth.
                permissions_view where permission_category_id in 
                (select permission_category_id from stellarhse_auth.permission_category where product_id = :product_id) 
                and group_id = :group_id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group_id']);
                $stmt->bindParam(':product_id', $product->id);
                // $stmt->bindParam(':language_id', $data['language_id']);
                $stmt->execute();
                $result->products[$key]->permissions_categories = $stmt->fetchAll(PDO::FETCH_OBJ);
                
                foreach($result->products[$key]->permissions_categories as $key2=>$category){
                    // if(!isset($result->products[$key]->permissions_categories[$key2]->permissons))
                    //     $result->products[$key]->permissions_categories[$key2]->permissons = new stdClass();
                    $query = "SELECT distinct permission_id, permission_name, permission_code, permission_definition from stellarhse_auth.permissions_view where 
                    permission_category_id = :permission_category_id and group_id = :group_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':permission_category_id', $category->permission_category_id);
                    $stmt->bindParam(':group_id', $data['group_id']);
                    $stmt->execute();
                    // print_r($stmt->fetchAll(PDO::FETCH_OBJ));return;
                    $result->products[$key]->permissions_categories[$key2]->permissions = $stmt->fetchAll(PDO::FETCH_OBJ);
                    foreach($result->products[$key]->permissions_categories[$key2]->permissions as $key3=>$permission){
                        $query = "select * from stellarhse_auth.permissions_view where 
                        parent_id = :parent_id and group_id = :group_id order by `order`";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(':parent_id', $permission->permission_id);
                        $stmt->bindParam(':group_id', $data['group_id']);
                        $stmt->execute();
                        $result->products[$key]->permissions_categories[$key2]->permissions[$key3]->children = $stmt->fetchAll(PDO::FETCH_OBJ);
                    }
                }
            }

            // select group users
            $query = "select * from stellarhse_auth.get_user_info where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();
            $result->users = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });


    $app->post('/updategroup', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler('/data/stellar_logs/manage_groups.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $data = $request->getParsedBody();
            $db = $this->db;

            $query = "update stellarhse_auth.`group` set group_type_id = :group_type_id, 
            group_name = :group_name, description = :description where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->bindParam(':group_type_id', $data['group_type_id']);
            $stmt->bindParam(':group_name', $data['group_name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->execute();
            $result = $stmt->rowCount();

            $query = "delete from stellarhse_auth.`group_permission` where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();
            $query = "delete from stellarhse_auth.`product_group` where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();
            // change the relation of group_permission to be with permission_new or use old table called permission
            foreach($data['defaultPermissions'] as $permission){
                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group_id']);
                $stmt->bindParam(':permission_id', $permission['permission_id']);
                $stmt->execute();
            }
            if(isset($data['general'])){
                foreach($data['general']['categories'] as $category){
                    foreach($category['permissions'] as $permission){
                        if($permission['checked']){
                            $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':group_id', $data['group_id']);
                            $stmt->bindParam(':permission_id', $permission['permission_id']);
                            $stmt->execute();
                        }
                        foreach($permission['children'] as $perm){
                            if($perm['checked']){
                                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':group_id', $data['group_id']);
                                $stmt->bindParam(':permission_id', $perm['permission_id']);
                                $stmt->execute();
                            }
                        }
                    }
                }
            }

            foreach($data['moduleTypes'] as $product){
                $query = "insert into stellarhse_auth.`product_group` (group_id, 
                product_version_id) values (:group_id, (select product_version_id from 
                stellarhse_auth.product_version where product_id = :product_id))";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':group_id', $data['group_id']);
                $stmt->bindParam(':product_id', $product['id']);
                $stmt->execute();
                foreach($product['permissions_categories'] as $category){
                    foreach($category['permissions'] as $permission){
                        if($permission['checked']){
                            $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(':group_id', $data['group_id']);
                            $stmt->bindParam(':permission_id', $permission['permission_id']);
                            $stmt->execute();
                        }
                        foreach($permission['children'] as $perm){
                            if($perm['checked']){
                                $query = "insert into stellarhse_auth.`group_permission` (group_id, permission_id) values (:group_id, :permission_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(':group_id', $data['group_id']);
                                $stmt->bindParam(':permission_id', $perm['permission_id']);
                                $stmt->execute();
                            }
                        }
                    }
                }
            }

            $query = "Delete from stellarhse_auth.emp_group where group_id = :group_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':group_id', $data['group_id']);
            $stmt->execute();

            // insert group users
            foreach($data['users'] as $user){
                $query = "Delete from stellarhse_auth.emp_group where employee_id = :employee_id and group_id in 
                (select group_id from stellarhse_auth.`group` where org_id = :org_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':employee_id', $user['employee_id']);
                $stmt->bindParam(':org_id', $user['org_id']);
                $stmt->execute();

                if(!isset($user['is_deleted']) || !$user['is_deleted']){
                    $query = "insert into stellarhse_auth.emp_group (group_id, employee_id, 
                    is_active) values (:group_id, :employee_id, :is_active)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':group_id', $data['group_id']);
                    $stmt->bindParam(':employee_id', $user['employee_id']);
                    $stmt->bindValue(':is_active', $user['emp_grp_is_active'], PDO::PARAM_INT);
                    $stmt->execute();
                    $result = $stmt->rowCount();
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
});