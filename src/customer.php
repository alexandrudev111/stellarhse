<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

$app->group('/api/v1', function() use($app) {

    $app->post('/customersgrid', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $user = $request->getParsedBody();
            $db = $this->db;
            $query = "select * from stellarhse_auth.customers_view ;";
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
    
        $app->post('/getCustomerData', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $query = "select * from stellarhse_auth.customers_view  where org_id = :org_id ;";
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

    $app->post('/supervisorlist', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $query = "select distinct e.employee_id, first_name, last_name , concat(first_name, ' ', last_name) as FullName
                    from stellarhse_auth.employee e
                    inner join stellarhse_auth.org_employee oe on oe.employee_id= e.employee_id
                    where oe.org_id= :org_id  and  oe.emp_is_active =1";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
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

    $app->get('/statuslist/{language_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = "select '1'  as item_id, alert_message_description as item_value  from  stellarhse_common.alert_message where
                        alert_message_code  = 'userisactive' -- , 'userisinactive')
                        and language_id=:language_id
                        union
                        select '0'  as item_id, alert_message_description as item_value  from  stellarhse_common.alert_message where
                        alert_message_code  = 'userisinactive' 
                        and language_id=:language_id ;";

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

    $app->get('/languagelist', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = " select * from stellarhse_auth.language where hide = 0";

            $stmt = $db->prepare($query);
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

    $app->get('/productlist', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = " Select distinct  p.product_id, product_code, product_name, product_description, product_list_name, product_list_code
                        From stellarhse_auth.product p 
                        left  join stellarhse_auth.product_version pv on pv.product_id = p.product_id
                        left join stellarhse_auth.org_product op on op.product_version_id = pv.product_version_id
                        left join stellarhse_auth.product_list  pl on pl.product_list_id=p.product_list_id
                        order by p.product_name asc";

            $stmt = $db->prepare($query);
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

    $app->get('/orgproducts/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = "
		SELECT  product_id                   
		FROM stellarhse_auth.organization  org
		join stellarhse_auth.org_product on org_product.org_id = org.org_id
		join stellarhse_auth.product_version on product_version.product_version_id = org_product.product_version_id
		where  org_product.is_active = 1 and  org.org_id = :org_id ; ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
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

    $app->post('/updatecustomer', function($request, $response, $args) {
        $error = new errorMessage();
        $db;
        $customer;
        try {
            $customer = $request->getParsedBody();
            $products = $customer["products"];
            $db = $this->db;
            $query = "select count(*) as count from stellarhse_auth.organization  where is_deleted <> 1 and  org_name =:org_name and   org_id !=:org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $customer['org_id']);
            $stmt->bindParam(":org_name", $customer['org_name']);
            $stmt->execute();
            $result = $stmt->fetchColumn();

            if ($result > 0) {
                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = 2;
            } else {
                $query = "select count(*)as count  from  stellarhse_auth.organization where org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $customer['org_id']);
                $stmt->execute();
                $result = $stmt->fetchColumn();
                $is_active = $customer['is_active'] == "1" ? 1 : 0;
                $show_customer = $customer['show_customer'] == "1" ? 1 : 0;
                $first_billing_date = $customer['first_billing_date'] == "" ? null : Utils::formatMySqlDate($customer['first_billing_date']);
                $last_billing_date = $customer['last_billing_date'] == "" ? null : Utils::formatMySqlDate($customer['last_billing_date']);
                $billing_cycle = $customer['billing_cycle'] == "" ? null : $customer['billing_cycle'];
                $customer['billing_city_id'] = $customer['billing_city_id'] == '' ? null : $customer['billing_city_id'];

                if ($result == 1) {// update mode
                    $operation = 'update';
                    $query = "UPDATE `stellarhse_auth`.`organization`
                                    SET
                                        `org_name` = :org_name,
                                        `address` = :address,
                                        `city_id` = :city_id,
                                        `postal_code` = :postal_code,
                                        `mailing_address` = :mailing_address,
                                        `email` = :email,
                                        `billing_contact` = :billing_contact,
                                        `billing_city_id` = :billing_city_id,
                                        `billing_postal_code` = :billing_postal_code,
                                        `billing_cycle` = :billing_cycle,
                                        `first_billing_date` = :first_billing_date,
                                        `last_billing_date` = :last_billing_date,
                                        `is_active` = :is_active
                                    WHERE `org_id` =:org_id;";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_name", $customer['org_name']);
                    $stmt->bindParam(":address", $customer['address']);
                    $stmt->bindParam(":city_id", $customer['city_id']);
                    $stmt->bindParam(":postal_code", $customer['postal_code']);
                    $stmt->bindParam(":mailing_address", $customer['mailing_address']);
                    $stmt->bindParam(":email", $customer['email']);
                    $stmt->bindParam(":billing_contact", $customer['billing_contact']);
                    $stmt->bindParam(":billing_city_id", $customer['billing_city_id']);
                    $stmt->bindParam(":billing_postal_code", $customer['billing_postal_code']);
                    $stmt->bindParam(":billing_cycle", $billing_cycle);
                    $stmt->bindParam(":first_billing_date", $first_billing_date);
                    $stmt->bindParam(":last_billing_date", $last_billing_date);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":org_id", $customer['org_id']);
                    $stmt->execute();

                    $query = "DELETE FROM `stellarhse_auth`.`org_product`  where org_id = :org_id ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $customer['org_id']);
                    $stmt->execute();
                } else {//add mode 
                    $operation = 'add';
                    $query = "INSERT INTO `stellarhse_auth`.`organization`
                            (`org_id`,`org_name`,`address`,`city_id`,`postal_code`,`creation_date`,`mailing_address`,`email`,
                            `created_by`,`billing_contact`,`billing_city_id`,`billing_postal_code`,`billing_cycle`,`first_billing_date`,`last_billing_date`,`is_active`
                            , `language_id`)
                            VALUES
                            (:org_id,:org_name,:address,:city_id,:postal_code,:creation_date,:mailing_address,
                            :email,:created_by,:billing_contact,:billing_city_id,:billing_postal_code,:billing_cycle,:first_billing_date,:last_billing_date,:is_active
                           ,:language_id);";


                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $customer['org_id']);
                    $stmt->bindParam(":org_name", $customer['org_name']);
                    $stmt->bindParam(":address", $customer['address']);
                    $stmt->bindParam(":city_id", $customer['city_id']);
                    $stmt->bindParam(":postal_code", $customer['postal_code']);
                    $stmt->bindParam(":creation_date", $customer['creation_date']);
                    $stmt->bindParam(":created_by", $customer['created_by']);
                    $stmt->bindParam(":mailing_address", $customer['mailing_address']);
                    $stmt->bindParam(":email", $customer['email']);
                    $stmt->bindParam(":billing_contact", $customer['billing_contact']);
                    $stmt->bindParam(":billing_city_id", $customer['billing_city_id']);
                    $stmt->bindParam(":billing_postal_code", $customer['billing_postal_code']);
                    $stmt->bindParam(":billing_cycle", $billing_cycle);
                    $stmt->bindParam(":first_billing_date", $first_billing_date);
                    $stmt->bindParam(":last_billing_date", $last_billing_date);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":language_id", $customer['language_id']);
                    $stmt->execute();
                }
                //,                      system_admin_id=:system_admin_id

                $IsActive = 1;
                for ($i = 0; $i < count($products); $i++) {
                    $product_id = $products[$i];
                    $query = "select product_version_id from  `stellarhse_auth`.product_version where product_id =:product_id ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":product_id", $product_id);
                    $stmt->execute();
                    $product_version_id = $stmt->fetchColumn();

                    $query = "INSERT INTO   `stellarhse_auth`.`org_product`
                                        (`org_id`, `product_version_id`, `is_active`)
                                 VALUES (:org_id,:product_version_id,:is_active)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $customer['org_id']);
                    $stmt->bindParam(":product_version_id", $product_version_id);
                    $stmt->bindParam(":is_active", $IsActive, PDO::PARAM_INT);
                    $stmt->execute();
                }

                $query = "call stellarhse_auth.insert_into_hist_organization(:org_id,:updated_by_id,:operation);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $customer['org_id']);
                $stmt->bindParam(":updated_by_id", $customer['updated_by_id']);
                $stmt->bindParam(":operation", $operation);
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

    $app->get('/orggroups/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $query = "SELECT * FROM stellarhse_auth.`group` where org_id = :org_id ; ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
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

    $app->post('/addcustomeradmin', function($request, $response, $args) {
        $error = new errorMessage();
        $utils = new Utils();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('addcustomeradmin', $post);
            $query = "select employee.employee_id, org_id, first_name, last_name, email, address, city.city_name, province_name, country_name,
                        postal_code, position, area, primary_phone, alternate_phone,  location
                        from stellarhse_auth.org_employee 
                        join stellarhse_auth.employee on employee.employee_id = org_employee.employee_id
                        left join stellarhse_common.city on city.city_id = employee.city_id
                        left join stellarhse_common.province on province.province_id= city.province_id
                        left join stellarhse_common.country on province.country_id= country.country_id
                        where employee.`email`<> 'dummy@noemail.com' and   employee.`email` = :email
                        group by employee.employee_id ;";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $post['email']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $object = [];
            if (count($result) > 0) {
                $object['employeeinfo'] = $result;
                $object['found'] = true;
            } else {
                /* email not in DB */
                try {
                    $object['found'] = false;
                    $city_id = $post['city_id'] == '' ? null : $post['city_id'];
                    $post['employee_id'] = Utils::getUUID($db);
                    $password = $utils->generateStrongPassword();
                    $query = "INSERT INTO stellarhse_auth.employee 
                                    (employee_id, first_name, last_name, email, user_name, `password`, address, city_id, postal_code, position, area, primary_phone, alternate_phone,  location) 
                             VALUES (:employee_id,:first_name,:last_name,:email,:user_name,:password,:address,:city_id,:postal_code,:position,:area,:primary_phone,:alternate_phone,:location)    ;";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":first_name", $post['first_name']);
                    $stmt->bindParam(":last_name", $post['last_name']);
                    $stmt->bindParam(":email", $post['email']);
                    $stmt->bindParam(":user_name", $post['email']);
                    $stmt->bindParam(":password", $password);
                    $stmt->bindParam(":address", $post['address']);
                    $stmt->bindParam(":city_id", $city_id);
                    $stmt->bindParam(":postal_code", $post['postal_code']);
                    $stmt->bindParam(":position", $post['position']);
                    $stmt->bindParam(":area", $post['area']);
                    $stmt->bindParam(":primary_phone", $post['primary_phone']);
                    $stmt->bindParam(":alternate_phone", $post['alternate_phone']);
                    $stmt->bindParam(":location", $post['location']);
                    $stmt->execute();

                    $emp_is_active = 1;
                    $is_active = 0;
                    $query = "INSERT INTO `stellarhse_auth`.`org_employee`
                            (`employee_id`,`org_id`,`department`,`company`,`emp_is_active`,`direct_access_code`)
                        VALUES
                            (:employee_id,:org_id,:department,:company,:emp_is_active,:direct_access_code);  ";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->bindParam(":department", $post['department']);
                    $stmt->bindParam(":company", $post['company']);
                    $stmt->bindParam(":emp_is_active", $emp_is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":direct_access_code", $post['direct_access_code']);
                    $stmt->execute();


                    $query = " UPDATE  `stellarhse_auth`.organization
                            SET  system_admin_id =:employee_id
                            WHERE org_id =:org_id";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->execute();

                    $assign_to_group_date = date("Y-m-d H:i:s");
                    $query = "INSERT INTO `stellarhse_auth`.`emp_group`
                        (`group_id`, `employee_id`,`assign_to_group_date`,`is_active`)
                        VALUES
                        (:group_id,:employee_id,:assign_to_group_date,:is_active);";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":group_id", $post['group_id']);
                    $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
                    $stmt->bindParam(":assign_to_group_date", $assign_to_group_date);
                    $stmt->execute();

                    $query = "Select * from stellarhse_auth.org_product WHERE  org_id =:org_id;";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->execute();
                    $orgproducts = $stmt->fetchAll(PDO::FETCH_OBJ);
                    if (!empty($orgproducts)) {
                        $query = "DELETE FROM  stellarhse_auth.product_group WHERE group_id =:group_id";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":group_id", $post['group_id']);
                        $stmt->execute();

                        foreach ($orgproducts as $key => $element) {
                            $pid = $element->product_version_id;

                            $PushProduts = "INSERT INTO  stellarhse_auth.product_group
                                               (product_version_id, group_id)
                                        VALUES (:product_version_id,:group_id) ";

                            $stmt = $db->prepare($PushProduts);
                            $stmt->bindParam(":product_version_id", $pid);
                            $stmt->bindParam(":group_id", $post['group_id']);
                            $stmt->execute();
                        }
                    }
                    SendUserEmail('NewSystemAdmin', $post['employee_id'], $post['org_id'], '', $db);
                    $operation = 'add';
                    $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
                    $stmt->bindParam(":operation", $operation);
                    $stmt->execute();

                    $object['employeeinfo'] = $stmt->rowCount();
                } catch (PDOException $ex) {
                    echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
                } catch (Exception $ex) {
                    echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
                }
            }
            return $this->response->withJson($object);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/assignadmintocompany', function($request, $response, $args) {
        $error = new errorMessage();
        $utils = new Utils();

        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $password = $utils->generateStrongPassword();
            $emp_is_active = 1;
            $is_active = 1;

            $query = "INSERT INTO `stellarhse_auth`.`org_employee`
                            (`employee_id`,`org_id`,`department`,`company`,`emp_is_active`,`direct_access_code`)
                        VALUES
                            (:employee_id,:org_id,:department,:company,:emp_is_active,:direct_access_code);  ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":department", $post['department']);
            $stmt->bindParam(":company", $post['company']);
            $stmt->bindParam(":emp_is_active", $emp_is_active, PDO::PARAM_INT);
            $stmt->bindParam(":direct_access_code", $post['direct_access_code']);
            $stmt->execute();

            $query = " UPDATE  `stellarhse_auth`.organization
                            SET  system_admin_id =:employee_id
                            WHERE org_id =:org_id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();

            $assign_to_group_date = date("Y-m-d H:i:s");
            $query = "INSERT INTO `stellarhse_auth`.`emp_group`
                        (`group_id`, `employee_id`,`assign_to_group_date`,`is_active`)
                        VALUES
                        (:group_id,:employee_id,:assign_to_group_date,:is_active);";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":group_id", $post['group_id']);
            $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
            $stmt->bindParam(":assign_to_group_date", $assign_to_group_date);
            $stmt->execute();

            $query = "Select * from stellarhse_auth.org_product WHERE  org_id =:org_id;";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $orgproducts = $stmt->fetchAll(PDO::FETCH_OBJ);
            if (!empty($orgproducts)) {
                $query = "DELETE FROM  stellarhse_auth.product_group WHERE group_id =:group_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":group_id", $post['group_id']);
                $stmt->execute();

                foreach ($orgproducts as $key => $element) {
                    $pid = $element->product_version_id;

                    $PushProduts = "INSERT INTO  stellarhse_auth.product_group
                                               (product_version_id, group_id)
                                        VALUES (:product_version_id,:group_id) ";

                    $stmt = $db->prepare($PushProduts);
                    $stmt->bindParam(":product_version_id", $pid);
                    $stmt->bindParam(":group_id", $post['group_id']);
                    $stmt->execute();
                }


                $query = "select count(employee_id) as PasswrdCount from  stellarhse_auth.employee 
                                    where  `password` is not null and  employee_id =:employee_id";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $post['employee_id']);
                $stmt->execute();
                $result = $stmt->fetchColumn();

                if ($result > 0) {
                    SendUserEmail('AssignedASystemAdmin', $post['employee_id'], $post['org_id'], '', $db);
                } else {
                    $NewPassword = $utils->generateStrongPassword();
                    $query = " Update stellarhse_auth.employee 
                                        set password      =:NewPassword  
                                        where employee_id  =:employee_id ";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":NewPassword", $NewPassword);
                    $stmt->execute();
                    SendUserEmail('NewSystemAdmin', $post['employee_id'], $post['org_id'], '', $db);


                    $operation = 'update';
                    $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":org_id", $post['org_id']);
                    $stmt->bindParam(":employee_id", $post['employee_id']);
                    $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
                    $stmt->bindParam(":operation", $operation);
                    $stmt->execute();
                }
            }

            $result = $stmt->rowCount();
            $success = new Result();
            $success->success = $result;
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->get('/checkactivation/{activationCode}', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;

            $activationCode = substr(substr($args['activationCode'], 0, -1), 1);
            $query = "SELECT distinct CASE emp_group.is_active WHEN '0' THEN '0' WHEN '1' THEN '1' END AS is_active
                        FROM  `stellarhse_auth`.emp_group 
                        join  `stellarhse_auth`.employee on employee.employee_id = emp_group.employee_id 
                        join  `stellarhse_auth`.`group` on `group`.group_id = emp_group.group_id  
                        where employee.`password` =:activationCode ; ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":activationCode", $activationCode);
            $stmt->execute();
            $db = null;
            $result = $stmt->fetchColumn();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/activateaccount', function($request, $response, $args) {
        $error = new errorMessage();
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $code = $post['activationCode'];
            $activationCode = substr(substr($code, 0, -1), 1);

            $query = "SELECT  employee.employee_id, org_employee.org_id  
                            from `stellarhse_auth`.employee
                            join `stellarhse_auth`.org_employee on org_employee.employee_id = employee.employee_id 
                        where employee.`password` =:activationCode ; ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":activationCode", $activationCode);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result) {
                $query = "Update `stellarhse_auth`.employee
                                        set `password`      = :password 
                                        where `password`    = :activationCode ";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":password", $post['password']);
                $stmt->bindParam(":activationCode", $activationCode);
                $stmt->execute();

                $query = "select distinct `group`.group_id
                        from stellarhse_auth.`group` 
                        join  stellarhse_auth.emp_group on emp_group.group_id = `group`.group_id
                        join  stellarhse_auth.org_employee on org_employee.employee_id = emp_group.employee_id 
                        where org_employee.employee_id = :employee_id  and `group`.org_id =:org_id ";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $result['employee_id']);
                $stmt->bindParam(":org_id", $result['org_id']);
                $stmt->execute();

                $group_id = $stmt->fetchColumn();

                $query = "Update stellarhse_auth.emp_group
                            set is_active  = 1 
                            where group_id = :group_id   and  employee_id = :employee_id ";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $result['employee_id']);
                $stmt->bindParam(":group_id", $group_id);
                $stmt->execute();

                $query = "Update stellarhse_auth.org_employee
                            set emp_is_active     = 1 
                            where employee_id    = :employee_id ";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $result['employee_id']);
                $stmt->execute();

                $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";

                $operation = 'activate';
                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $result['employee_id']);
                $stmt->bindParam(":org_id", $result['org_id']);
                $stmt->bindParam(":operation", $operation);
                $stmt->bindParam(":updated_by_id", $result['employee_id']);
                $stmt->execute();
            }
            $result = $stmt->rowCount();
            $success = new Result();
            $success->success = $result;

            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    /*  $app->get('/senduseremail', function($request, $response, $args) {
      $error = new errorMessage();
      try {
      $to = 'rasha.atta@sphinxinfotech.net';
      $from = 'account.services@abcanada.com';
      $subject = 'Test send emails';
      $message = 'This is first test to send emails in stellar.';
      $result = SendEmail($to, $from, $subject, $message, '');
      return $this->response->withJson($result);
      } catch (PDOException $ex) {
      echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
      } catch (Exception $ex) {
      echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
      }
      }); */

    $app->get('/checksystemadmin/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());

        try {
            $result = '';
            $db = $this->db;
            $logger->info('checksystemadmin', $args);
            $query = "SELECT  count( employee_id)  FROM stellarhse_auth.org_employee  where org_id = :org_id ; ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            if ($count == 0) {
                $result = 'AdminForm';
            } else {
                $query = "select count(distinct employee_id) from stellarhse_auth.emp_group where employee_id in
			(select employee_id from stellarhse_auth.org_employee where org_id = :org_id) and `emp_group`.is_active = '1'";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $args['org_id']);
                $stmt->execute();
                $count = $stmt->fetchColumn();
                if ($count == 0) {
                    $result = 'UserForm';
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

    $app->get('/getactiveusers/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());

        try {
            $result = '';
            $db = $this->db;
            $logger->info('getactiveusers', $args);
            $query = "select distinct employee.employee_id,organization.system_admin_id,first_name,last_name, concat(first_name,' ' , last_name) as FullName
                        from   stellarhse_auth.employee 
                        inner join   stellarhse_auth.emp_group on emp_group.employee_id = employee.employee_id 
                        inner join   stellarhse_auth.`group` on `group`.group_id = emp_group.group_id 												
                        join   stellarhse_auth.organization on organization.org_id = `group`.org_id
                        where `group`.org_id =:org_id 
                        and `emp_group`.is_active = '1' ; ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
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

    $app->post('/changesystemadmin', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('changesystemadmin', $post);

            $query = " UPDATE  `stellarhse_auth`.organization
                            SET  system_admin_id =:employee_id
                            WHERE org_id =:org_id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            SendUserEmail('AssignedASystemAdmin', $post['employee_id'], $post['org_id'], '', $db);

            $operation = 'update';

            $query = "call stellarhse_auth.insert_into_hist_organization(:org_id,:updated_by_id,:operation);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
            $stmt->bindParam(":operation", $operation);
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

    $app->post('/deletecustomer', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('deletecustomer', $post);

            $operation = 'delete';
            $query = "call stellarhse_auth.insert_into_hist_organization(:org_id,:updated_by_id,:operation);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
            $stmt->bindParam(":operation", $operation);
            $stmt->execute();

            $is_deleted = 1;
            $query = " UPDATE  `stellarhse_auth`.organization
                            SET  is_deleted =:is_deleted
                            WHERE org_id =:org_id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":is_deleted", $is_deleted);
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

    $app->post('/addorguser', function($request, $response, $args) {
        $error = new errorMessage();
        $utils = new Utils();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('addorguser', $post);

            $NewPassword = $utils->generateStrongPassword();
            $query = " Update stellarhse_auth.employee 
                                set password      =:NewPassword  
                                where employee_id  =:employee_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":NewPassword", $NewPassword);
            $stmt->execute();

            $is_active = 0;
            $assign_to_group_date = date("Y-m-d H:i:s");
            $query = "INSERT INTO `stellarhse_auth`.`emp_group`
                            (`group_id`, `employee_id`,`assign_to_group_date`,`is_active`)
                        VALUES
                            (:group_id,:employee_id,:assign_to_group_date,:is_active);";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":group_id", $post['group_id']);
            $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
            $stmt->bindParam(":assign_to_group_date", $assign_to_group_date);
            $stmt->execute();

            $query = "Update `stellarhse_auth`.`org_employee`
                                set  `direct_access_code` = :direct_access_code
                                where employee_id  =:employee_id and org_id=:org_id ";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":direct_access_code", $post['direct_access_code']);
            $stmt->execute();

            SendUserEmail('NewUserAccount', $post['employee_id'], $post['org_id'], $NewPassword, $db);

            $operation = 'update';
            $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
            $stmt->bindParam(":operation", $operation);
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

    $app->get('/getactiveorgemployees/{org_id}', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());

        try {
            $result = '';
            $db = $this->db;
            $logger->info('getactiveorgemployees', $args);
            $query = "select distinct employee.employee_id,first_name,last_name, concat(first_name,' ' , last_name) as FullName
                        from   stellarhse_auth.employee 
                        inner join   stellarhse_auth.org_employee oe on oe.employee_id = employee.employee_id  
                        where email is not null and email !='' and oe.org_id =:org_id  and oe.emp_is_active= '1'
                        and  employee.employee_id not in(
                        select employee_id from stellarhse_auth.emp_group where group_id in(select group_id from stellarhse_auth.`group` where org_id  = :org_id )) ; ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
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

    $app->post('/getorgadmininfo', function($request, $response, $args) {
        $error = new errorMessage();
        $utils = new Utils();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getorgadmininfo', $post);

            $query = "CALL stellarhse_auth.`OpenEmployee`(:employee_id,:org_id );";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
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
    $app->post('/editcustomeradmin', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('editcustomeradmin', $post);

            $query = "select count(*) as count from stellarhse_auth.employee  where email =:email and   employee_id !=:employee_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $post['email']);
            $stmt->bindParam(":employee_id", $post['employee_id']);
            $stmt->execute();
            $result = $stmt->fetchColumn();

            if ($result > 0) {
                $success = new Result();
                $success->success = 2;
            } else {
                $query = "Update stellarhse_auth.employee 
                            SET 
                            first_name=:first_name, 
                            last_name=:last_name, 
                            email=:email, 
                            user_name=:user_name, 
                            address=:address, 
                            city_id=:city_id, 
                            postal_code=:postal_code, 
                            position=:position, 
                            area=:area, 
                            primary_phone=:primary_phone, 
                            alternate_phone=:alternate_phone,  
                            location=:location
                            where employee_id=:employee_id";

                $city_id = $post['city_id'] == '' ? null : $post['city_id'];
                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $post['employee_id']);
                $stmt->bindParam(":first_name", $post['first_name']);
                $stmt->bindParam(":last_name", $post['last_name']);
                $stmt->bindParam(":email", $post['email']);
                $stmt->bindParam(":user_name", $post['email']);
                $stmt->bindParam(":address", $post['address']);
                $stmt->bindParam(":city_id", $city_id);
                $stmt->bindParam(":postal_code", $post['postal_code']);
                $stmt->bindParam(":position", $post['position']);
                $stmt->bindParam(":area", $post['area']);
                $stmt->bindParam(":primary_phone", $post['primary_phone']);
                $stmt->bindParam(":alternate_phone", $post['alternate_phone']);
                $stmt->bindParam(":location", $post['location']);
                $stmt->execute();

                $query = "Update `stellarhse_auth`.`org_employee`
                            SET 
                            `department`=:department,
                            `company`=:company
                        where employee_id=:employee_id  and org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":employee_id", $post['employee_id']);
                $stmt->bindParam(":org_id", $post['org_id']);
                $stmt->bindParam(":department", $post['department']);
                $stmt->bindParam(":company", $post['company']);
                $stmt->execute();

                $operation = 'update';
                $query = "CALL stellarhse_auth.`insert_into_hist_employee`(:org_id ,:employee_id,:operation ,:updated_by_id);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $post['org_id']);
                $stmt->bindParam(":employee_id", $post['employee_id']);
                $stmt->bindParam(":updated_by_id", $post['updated_by_id']);
                $stmt->bindParam(":operation", $operation);
                $stmt->execute();

                $result = $stmt->rowCount();
                $success = new Result();
                $success->success = $result;
            }
            return $this->response->withJson($success);
        } catch (PDOException $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            $logger->error($ex->getMessage());
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getcustomerhistory', function($request, $response, $args) {
        $error = new errorMessage();
        /* Create the logger */
        $logger = new Logger('stellar_logger');
        /* Now add some handlers */
        $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
        $logger->pushHandler(new FirePHPHandler());
        try {
            $db = $this->db;
            $post = $request->getParsedBody();
            $logger->info('getcustomerhistory', $post);

            $query = "SELECT hist_org_id,org_id,org_name,address,city_name,billing_city_name,date_format( updated_date,'%m/%d/%Y') AS  updated_date,billing_country_name,
                        postal_code,mailing_address,email,discount,billing_contact,billing_postal_code, org_status,
                        billing_cycle_unite,billing_cycle,first_billing_date,last_billing_date,system_admin_name, history_operation_name 
                        FROM `stellarhse_auth`.hist_organization 
                        join `stellarhse_auth`.history_operation ho on ho.history_operation_id = hist_organization.history_operation_id ";


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
});
