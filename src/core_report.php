<?php

ini_set('error_reporting', E_STRICT);

$app->group('/api/v1', function() use($app) {

    $app->post('/getyesnovalues', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_common.yes_no where org_id =:org_id and language_id =:language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getemployees', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        $where = " and " . $data['query'];
        try {
            $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id AND emp_grp_is_active = 1" . $where;
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
    $app->post('/getemployeesbyorgid', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id and emp_is_active = 1 AND emp_grp_is_active = 1";
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

    $app->post('/howinvolvedfield', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * FROM stellarhse_common.how_involved_field where org_id =:org_id and language_id =:language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getthirdpartyinfo', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        $where = " and " . $data['query'];
        $keyword = "" . $data['query'] . "%";
        try {
            $query = "select * from get_third_party_info where org_id =:org_id " . $where;
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result->data = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/locations1', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select location1_id, location1_name from stellarhse_common.location_view where org_id = :org_id and location1_name like concat('%',(:letters),'%') group by(location1_name)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":letters", $data['letters']);
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
/*    $app->post('/locations2', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if (!isset($data['location1_id']) || $data['location1_id'] === null) {
                $query = "select location2_id, location2_name, location1_id, location1_name from stellarhse_common.location_view where org_id = :org_id and location2_name like concat('%',(:letters),'%') group by(location2_name)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $query = "select location2_id, location2_name, location1_id, location1_name from stellarhse_common.location_view where org_id = :org_id and location1_id = :location1_id and location2_name like concat('%',(:letters),'%') group by(location2_name)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":location1_id", $data['location1_id']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });*/
    $app->post('/locations2', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if (!isset($data['location1_id']) || $data['location1_id'] === null) {
                $query = "select tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (select location2_id ,concat(location2_name,parent_name) as location2_name,location1_id,replace(replace(parent_name, '(',''),')','') as location1_name from stellarhse_common.location2_view where org_id=:org_id ) as tbl
                    where  tbl.location2_name like concat('%',(:letters),'%') group by(location2_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $query = "select tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (select location2_id ,concat(location2_name,parent_name) as location2_name,location1_id,replace(replace(parent_name, '(',''),')','') as location1_name from stellarhse_common.location2_view where org_id=:org_id and location1_id=:location1_id) as tbl
                where  tbl.location2_name like concat('%',(:letters),'%') group by(location2_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":location1_id", $data['location1_id']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/locations3', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if (!isset($data['location2_id']) || $data['location2_id'] === null) {
                $query = "select tbl.location3_id,location3_name, tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (
                select location3_id ,concat(location3_name,'(',location2_name,')') as location3_name,location2_id,
                concat(location2_name,'(',location1_name,')')as location2_name,location1_id, location1_name from stellarhse_common.location3_view where org_id=:org_id ) as tbl
                where  tbl.location3_name like concat('%',(:letters),'%') group by(location3_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $query = "select tbl.location3_id,location3_name, tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (
                select location3_id ,concat(location3_name,'(',location2_name,')') as location3_name,location2_id, concat(location2_name,'(',location1_name,')')as location2_name,location1_id, location1_name from stellarhse_common.location3_view where org_id=:org_id and location2_id=:location2_id ) as tbl
                where  tbl.location3_name like concat('%',(:letters),'%') group by(location3_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":location2_id", $data['location2_id']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/locations4', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if (!isset($data['location3_id']) || $data['location3_id'] === null) {
                $query = "select tbl.location4_id,location4_name,tbl.location3_id,location3_name, tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (
                select location4_id ,concat(location4_name,'(',location3_name,')') as location4_name,
                location3_id,concat(location3_name,'(',location2_name,')')as location3_name ,
                location2_id, concat(location2_name,'(',location1_name,')')as location2_name,
                location1_id, location1_name from stellarhse_common.location4_view where org_id=:org_id ) as tbl
                where  tbl.location4_name like concat('%',(:letters),'%') group by(location4_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $query = "select tbl.location4_id,location4_name,tbl.location3_id,location3_name, tbl.location2_id,tbl.location2_name,tbl.location1_id,tbl.location1_name from (
                select location4_id ,concat(location4_name,'(',location3_name,')') as location4_name,
                location3_id,concat(location3_name,'(',location2_name,')')as location3_name ,
                location2_id, concat(location2_name,'(',location1_name,')')as location2_name,
                location1_id, location1_name from stellarhse_common.location4_view where org_id=:org_id and location3_id=:location3_id) as tbl
                where  tbl.location4_name like concat('%',(:letters),'%') group by(location4_name);";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":letters", $data['letters']);
                $stmt->bindParam(":location3_id", $data['location3_id']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getOrgLocationLevel', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select location_level from stellarhse_auth.organization where org_id= :org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchColumn();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/operationtypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select operation_type_id, operation_type_name from stellarhse_common.operation_type where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`,operation_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->get('/equipments/{org_id}/{letters}', function($request, $response, $args) {
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_common.equipment where org_id = :org_id and equipment_name like concat('%',(:letters),'%') and `hide` = 0 ";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $args['org_id']);
            $stmt->bindParam(":letters", $args['letters']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/crews', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select crew_id, crew_name from stellarhse_auth.crew where org_id = :org_id and language_id= :language_id and "
                    . "`hide` = 0 order by `order`,crew_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/hazardstatuses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select status_id, status_Name from stellarhse_common.status where org_id = :org_id and language_id= :language_id "
                    . "and `hide` = 0 order by `order`,status_Name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/impacttypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if ($data['potential'] == 0) {
                $query = "select impact_type_id, impact_type_name, impact_type_code from stellarhse_common.impact_type where "
                        . "org_id = :org_id and language_id= :language_id and `hide` = 0 order by `order`,impact_type_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->bindParam(":language_id", $data['language_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            } else {
                $query = "select impact_type_id, impact_type_name, impact_type_code from stellarhse_common.impact_type where "
                        . "org_id = :org_id and language_id= :language_id and is_potential = 0 and hide = 0 order by `order`,impact_type_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->bindParam(":language_id", $data['language_id']);
                $stmt->execute();
                $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/impactsubtypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select impact_sub_type_id, impact_sub_type_name from stellarhse_common.impact_sub_type where "
                    . "impact_type_id = :impact_type_id and hide = 0 order by `order`, impact_sub_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":impact_type_id", $data['impact_type_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/riskcontrols', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select risk_control_id, risk_control_name from stellarhse_common.risk_control where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`,risk_control_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    /*$app->post('/risklevels', function($request, $response, $args) {
        $result = new Result();
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_common.risk_level where org_id = :org_id and language_id= :language_id and "
                    . "risk_level_key = 'hazard_exist' and `hide` = 0 order by `order`,risk_level_value";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result->hazard_exist = $stmt->fetchAll(PDO::FETCH_OBJ);
            $query = "select * from stellarhse_common.risk_level where org_id = :org_id and language_id= :language_id and "
                    . "risk_level_key = 'worker_exposure' and `hide` = 0 order by `order`,risk_level_value";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result->worker_exposure = $stmt->fetchAll(PDO::FETCH_OBJ);
            $query = "select * from stellarhse_common.risk_level where org_id = :org_id and language_id= :language_id and "
                    . "risk_level_key = 'potential_consequences' and `hide` = 0 order by `order`,risk_level_value";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result->potential_consequences = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });*/
    $app->post('/risklevels', function($request, $response, $args) {
        $result = new Result();
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from  stellarhse_common.risk_level_type where org_id = :org_id and language_id= :language_id and `hide` = 0";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $riskLevels = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($riskLevels as $riskLevelType ) {
                $query = "select * from  stellarhse_common.risk_level_sup_type where  language_id= :language_id and `hide` = 0 and risk_level_type_id = :risk_level_type_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":language_id", $data['language_id']);
                $stmt->bindParam(":risk_level_type_id", $riskLevelType->risk_level_type_id);
                $stmt->execute();
                $risk_level_type_code = $riskLevelType->risk_level_type_code;
                $result->$risk_level_type_code = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/effectstypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select effects_type_id, effects_type_name from stellarhse_common.effects_type where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`,effects_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($result as $effect_type) {
                $query = "select effects_sub_type_id, effects_sub_type_name from stellarhse_common.effects_sub_type where "
                        . "effects_type_id = :effects_type_id and `hide` = 0 order by `order`,effects_sub_type_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":effects_type_id", $effect_type->effects_type_id);
                $stmt->execute();
                $effect_type->effects_sub_types = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/causetypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select cause_types_id, cause_types_name from stellarhse_common.cause_types where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`,cause_types_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($result as $cause_type) {
                $query = "select cause_sub_types_id, cause_sub_types_name from stellarhse_common.cause_sub_types where "
                        . "cause_types_id = :cause_types_id and `hide` = 0 order by `order`,cause_sub_types_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":cause_types_id", $cause_type->cause_types_id);
                $stmt->execute();
                $cause_type->cause_sub_types = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/correctiveactionemployees', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            if ($data['type'] === 'assigntoname' || $data['type'] === 'notifytoname') {
                $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id and (email != '' or email is NOT NULL) and full_name like concat('%',(:letters),'%') AND emp_grp_is_active = 1";
            } else {
                $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id and (email != '' or email is NOT NULL) and supervisor_name like concat('%',(:letters),'%') AND emp_grp_is_active = 1";
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":letters", $data['letters']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/correctiveactionpriorities', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select corrective_action_priority_id, corrective_action_priority_name from "
                    . "stellarhse_common.corrective_action_priority where org_id = :org_id and language_id =:language_id and "
                    . "`hide` = 0 order by `order`,corrective_action_priority_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/correctiveactionstatuses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select field_code, corrective_action_status_id, corrective_action_status_name from "
                    . "stellarhse_common.corrective_action_status where org_id = :org_id and language_id =:language_id and "
                    . "`hide` = 0 order by `order`,corrective_action_status_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getpeoplecertificates', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * FROM stellarhse_common.certificate where org_id =:org_id and language_id =:language_id and "
                    . "`hide` = 0 order by `order`,certificate_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/getpeopleactingas', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * FROM stellarhse_common.acting where org_id =:org_id and language_id =:language_id and `hide` = 0 "
                    . "order by `order`,acting_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/investigatorsemployees', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "select * from stellarhse_auth.get_user_info where org_id =:org_id and full_name like concat('%',(:letters),'%') AND emp_grp_is_active = 1";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":letters", $data['letters']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getreportdata', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $version_no = 0;
            switch ($data['type']) {
                case 'hazard':
                    $result = getHazardData($db, $data);
                    break;
                case 'incident':
                    $result = getIncidentData($db, $data);
                    break;
                case 'safetymeeting':
                    $result = getSafetyMeetingData($db, $data);
                    break;
                case 'inspection':
                    $result = getInspectionData($db, $data);
                    break;
                case 'maintenance':
                    $result = getMaintenanceData($db, $data);
                    break;
                case 'training':
                    $result = getTrainingData($db, $data);
                    break;
            }
//            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getreportfields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        //        $result = new stdClass();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = getNotificationFields($db, $data, $dbname);
//             $result = getReportFields($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });


    $app->post('/getdatatablesreportfields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        //        $result = new stdClass();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            // $result = getFields($db, $data, $dbname);
            $result = getReportFields($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getDataTablesReportCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = getReportCustomFields($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });


    $app->post('/getfieldvalues', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = getFieldValues($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    $app->post('/getfieldsubvalues', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = getFieldSubValues($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    $app->post('/savefield', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = saveField($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/deletefieldvalue', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = deleteFieldValue($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/savefieldvalue', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = saveFieldValue($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getTrainingProviders', function($request, $response, $args) {
        $result = [];
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        $where = " and " . $data['query'];
        try {
            $query = "select * from stellarhse_training.provider where org_id =:org_id " . $where;
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


    $app->post('/deleteTempFiles', function($request, $response, $args) {
        $result = FALSE;
        $error = new errorMessage();
        try {
            
            if(isset($_SESSION['temp_path'])){
                $attchpath = $_SESSION['temp_path'];
            }else{
                $attchpath = '/data/report_documents/attachments/';
            }
            if (is_dir($attchpath) === false) {
                mkdir($attchpath, 0775, true);
            }
            deleteDirectory($attchpath);
            mkdir($attchpath, 0775, true);

            if (is_dir_empty($attchpath)) {
                $result = TRUE;
            } else {
                $result = FALSE;
            }
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/setDraftFiles', function($request, $response, $args) {
        session_start();
        $data = $request->getParsedBody();
        $_SESSION["report_type"] = $data['report_type'];
        $_SESSION["user_id"] = $data['user_id'];
        $_SESSION["report"] = $data['report'];
        $_SESSION["org_id"] = $data['org_id'];
        $_SESSION["report_id"] = $data['report_id'];
        var_dump($_SESSION);
    });
    
    

    $app->post('/copyReportFilesToTemp', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        
        if(isset($_SESSION['temp_path'])){
            $attchpath = $_SESSION['temp_path'];
        }else{
            $attchpath = '/data/report_documents/attachments/';
        }
        if (is_dir($attchpath) === false) {
            mkdir($attchpath, 0775, true);
        }

        try {
            $version_no = 0;
            switch ($data['type']) {
                case 'hazard':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetHazardVersion($db, $data);
                    }
                    $path = '/data/report_documents/stellarhse_hazard/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'incident':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetIncidentVersion($db, $data);
                    }

                    $path = '/data/report_documents/stellarhse_incident/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'safetymeeting':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetSafetymeetingVersion($db, $data);
                    }
                    $path = '/data/report_documents/stellarhse_safetymeeting/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'inspection':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetInspectionVersion($db, $data);
                    }
                    $path = '/data/report_documents/stellarhse_inspection/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'maintenance':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetMaintenanceVersion($db, $data);
                    }
                    $path = '/data/report_documents/stellarhse_maintenance/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'training':
                    if (isset($data['version_no']) && isset($data['version_no']) != NULL) {
                        $version_no = $data['version_no'];
                    } else {
                        $version_no = GetTrainingVersion($db, $data);
                    }
                    $path = '/data/report_documents/stellarhse_training/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
            }
            if ($version_no != 0) {
                if (is_dir($path) === false) {
                    mkdir($path, 0775, true);
                }
                recurse_copy($path, $attchpath);
            }
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/submitReportFiles', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        if(isset($_SESSION['temp_path'])){
            $attchpath = $_SESSION['temp_path'];
        }else{
            $attchpath = '/data/report_documents/attachments/';
        }
        if (is_dir($attchpath) === false) {
            mkdir($attchpath, 0775, true);
        }

        try {
            $version_no = 0;
            switch ($data['type']) {
                case 'hazard':
                    $report_id  = GetHazardIdByNumber($db, $data);
                    $version_no = GetHazardVersion($db, $data);
                    $result = sp_update_version_file_manager_hazard($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetHazardVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('hazard', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);
                    break;
                case 'incident':
                    $report_id  = GetIncidentIdByNumber($db, $data);
                    $version_no = GetIncidentVersion($db, $data);
                    $result = sp_update_version_file_manager_incident($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetIncidentVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('incident', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);
                    break;
                case 'safetymeeting':
                    $report_id  = GetSafetymeetingIdByNumber($db, $data);
                    $version_no = GetSafetymeetingVersion($db, $data);
                    $result = sp_update_version_file_manager_safetymeeting($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetSafetymeetingVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('safetymeeting', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);
                    $path = '/data/report_documents/stellarhse_safetymeeting/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'inspection':
                    $report_id  = GetInspectionIdByNumber($db, $data);
                    $version_no = GetInspectionVersion($db, $data);
                    $result = sp_update_version_file_manager_inspection($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetInspectionVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('inspection', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);
                    $path = '/data/report_documents/stellarhse_inspection/' . $data['org_id'] . '/' . $data['report_number'] . '/' . $version_no . '/';
                    break;
                case 'maintenance':
                    $report_id  = GetMaintenanceIdByNumber($db, $data);
                    $version_no = GetMaintenanceVersion($db, $data);
                    $result = sp_update_version_file_manager_maintenance($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetMaintenanceVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('maintenance', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);
                    break;
                case 'training':
                    $report_id  = GetTrainingIdByNumber($db, $data);
                    $version_no = GetTrainingVersion($db, $data);
                    $result = sp_update_version_file_manager_training($db, $report_id, $data['clientTimeZoneOffset'],$data['edit_by']);
                    $version_num = GetTrainingVersion($db, $data);
                    $hist_id = $result[0]->new_version_id;
                    $res = AddReportFile('training', $hist_id,$data['org_id'], $data['report_number'],$version_num,$db);

                    break;
            }
           return $this->response->withJson($res);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/dirSize', function($request, $response, $args) {
        
        if(isset($_SESSION['temp_path'])){
            $attchpath = $_SESSION['temp_path'];
        }else{
            $attchpath = '/data/report_documents/attachments/';
        }
        if (is_dir($attchpath) === false) {
            mkdir($attchpath, 0775, true);
        }
        $size = dirSize($attchpath);
        if ($size > 10000000) {
            $result = FALSE;
        } else {
            $result = TRUE;
        }
        return $this->response->withJson($result);
    }); 
    $app->post('/getAllTypeReportNo', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $query = 'select distinct hazard_number as report_number  from stellarhse_hazard.hazard  where org_id=:org_id order By report_number asc;';
                    break;
                 case 'incident':
                    $query = 'select distinct incident_number as report_number  from stellarhse_incident.incident where org_id=:org_id  order By report_number asc;';
                    break;
                case 'safetymeeting':
                    $query = 'select distinct safetymeeting_number as report_number  from stellarhse_safetymeeting.safetymeeting where org_id=:org_id order By report_number asc;';
                    break;
                case 'inspection':
                    $query = 'select distinct inspection_number as report_number  from stellarhse_inspection.inspection where org_id=:org_id order By report_number asc;';
                    break;
                case 'maintenance':
                    $query = 'select distinct maintenance_number as report_number  from stellarhse_maintenance.maintenance where org_id=:org_id order By report_number asc;';
                    break;
                case 'training':
                    $query = 'select distinct training_number as report_number  from stellarhse_training.training where org_id=:org_id order By report_number asc;';
                    break;
            }
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
        
    });
    
    


    $app->post('/submitDraftReport', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        //        $result = new stdClass();
        try {
            switch ($data['type']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    $report_id = 'hazard_id';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    $report_id = 'incident_id';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $result = saveDraftReport($db, $data, $dbname, $report_id);
            // $result = getReportFields($db, $data, $dbname);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/checkDraftExists', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "call stellarhse_common.sp_check_draft_exists(:report_id, :org_id, :emp_id, :product_code)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_id", $data['report_id']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":emp_id", $data['employee_id']);
            $stmt->bindParam(":product_code", $data['product_code']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    $app->post('/deleteDraft', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            switch ($data['product_code']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    $report_type = "hazard_id";
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    $report_type = "incident_id";
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $query = "delete from $dbname.`drafts` WHERE $report_type =:report_id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_id", $data['report_id']);

            $result = $stmt->execute();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/updateEditingBy', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            
            $query = "call stellarhse_common.sp_update_editing_by(:employee_id, :report_id, :product_code , :status)";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":employee_id", $data['employeeId']);
            $stmt->bindParam(":report_id", $data['reportId']);
            $stmt->bindParam(":product_code", $data['productCode']);
            $stmt->bindParam(":status", $data['status']);
            
            $result = $stmt->execute();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/checkEditingBy', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        $reportNumber = (int)$data['reportNum'] ;
        try {
            switch ($data['product_code']) {
                case 'hazard':
                    $dbname = 'stellarhse_hazard';
                    $tableName = 'hazard';
                    $colName = 'hazard_number';
                    break;
                case 'incident':
                    $dbname = 'stellarhse_incident';
                    $tableName = 'incident';
                    $colName = 'incident_number';
                    break;
                case 'safetymeeting':
                    $dbname = 'stellarhse_safetymeeting';
                    break;
                case 'inspection':
                    $dbname = 'stellarhse_inspection';
                    break;
                case 'maintenance':
                    $dbname = 'stellarhse_maintenance';
                    break;
                case 'training':
                    $dbname = 'stellarhse_training';
                    break;
            }
            $query = "SELECT editing_by from $dbname.$tableName WHERE $colName =:report_number";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_number", $reportNumber);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });
    
    $app->post('/getTabCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $org_id = $data['org_id'];
            $sub_tab_name = $data['tab_name'];
            $report_id = $data['report_id'];
            $report_type = $data['report_type'];
            $query = "call stellarhse_common.sp_get_custom_fields(:org_id,:sub_tab_name,:report_type)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $org_id);
            $stmt->bindParam(':sub_tab_name', $sub_tab_name);
            $stmt->bindParam(':report_type', $report_type);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->closeCursor();

            $customs = [];
            
            foreach ($result as $key => $custom_field) {
                $query2 = "call stellarhse_common.sp_get_field_options(:org_id,:report_type);";
                $stmt2 = $db->prepare($query2);
                $stmt2->bindParam(':org_id', $org_id);
                $stmt2->bindParam(':report_type', $report_type);
                $stmt2->execute();
                $result2 = $stmt2->fetchAll(PDO::FETCH_OBJ);
                $stmt2->closeCursor();
                $options = [];
                if ($result2 != NULL) {
                    foreach ($result2 as $option) {
                        if($custom_field->field_id == $option->field_id){
                            $options[$option->option_id]= $option->option_name;
                        }
                    }
                }
                $field_option = [];
                $field_value = '';
                if(isset($report_id) && $report_id != NULL ){
                    if($data['tab_name']=='Follows'){
                        $data['tab_name'] ="Actions";
                    }
                    
                    if($report_type=='Hazard'){
                        $query_value = "SELECT * FROM stellarhse_hazard.field_value where field_id =:field_id and hazard_id=:report_id ";
                    }else if($report_type=='ABCanTrack'){
                        $query_value = "SELECT * FROM stellarhse_incident.field_value where field_id =:field_id and incident_id=:report_id ";
                    }else if($report_type=='Inspection'){
                        $query_value = "SELECT * FROM stellarhse_inspection.field_value where field_id =:field_id and inspection_id=:report_id ";
                    }else if($report_type=='SafetyMeeting'){
                        $query_value = "SELECT * FROM stellarhse_safetymeeting.field_value where field_id =:field_id and safetymeeting_id=:report_id ";
                    }else if($report_type=='Training'){
                        $query_value = "SELECT * FROM stellarhse_training.field_value where field_id =:field_id and training_id=:report_id ";
                    }else if($report_type=='MaintenanceManagement'){
                        $query_value = "SELECT * FROM stellarhse_maintenance.field_value where field_id =:field_id and maintenance_id=:report_id ";
                    }
                    if(isset($data['table_key_value'])&& $data['table_key_value'] != ''){
                        $where = " and table_key_value=:table_key_value and  table_key_id =:table_key_id; ";
                        $query_value .=$where;
                    }
                    $stmt_value = $db->prepare($query_value);
                    $stmt_value->bindParam(':field_id', $custom_field->field_id);
                    $stmt_value->bindParam(':report_id', $report_id);
                    if(isset($data['table_key_value'])&& $data['table_key_value'] != ''){
                        $stmt_value->bindParam(':table_key_value', $data['tab_name']);
                        $stmt_value->bindParam(':table_key_id', $data['table_key_value']);
                    }
                    $stmt_value->execute();
                    $result_value = $stmt_value->fetchAll(PDO::FETCH_OBJ);
                    if ($result_value != NULL) {
                        if($custom_field->field_type_code =='textbox' || $custom_field->field_type_code =='calendar' ||$custom_field->field_type_code =='textarea'){
                            $field_value = $result_value[0]->field_value;
                        }else if($custom_field->field_type_code =='select' || $custom_field->field_type_code =='radiobutton'){
                            $field_value = $result_value[0]->option_id;
                        }else if($custom_field->field_type_code =='checkbox'){
                            foreach ($result_value as $value) {
                                $field_option[$value->option_id]= TRUE;
                            }
                        }
                    }
                }
                if($custom_field->is_mandatory ==1){
                    $required =TRUE;
                }
                if($custom_field->is_mandatory ==0){
                    $required =FALSE;
                }
                if($custom_field->field_type_code =='textbox' || $custom_field->field_type_code =='calendar' ||$custom_field->field_type_code =='textarea'||$custom_field->field_type_code =='select' || $custom_field->field_type_code =='radiobutton'){
                    $field = [
                        'name' => $custom_field->field_name,
                        'id' => $custom_field->field_id,
                        'component' => $custom_field->field_type_code,
                        'label' => $custom_field->field_label,
                        'placeholder' => $custom_field->help_me_name,
                        'description' => $custom_field->help_me_description,
                        'options' => $options,
                        'choice'=> $field_value,
                        required => $required
                    ]; 
                }else if($custom_field->field_type_code =='checkbox'){
                    if($field_option !=NULL){
                        $field = [
                            'name' => $custom_field->field_name,
                            'id' => $custom_field->field_id,
                            'component' => $custom_field->field_type_code,
                            'label' => $custom_field->field_label,
                            'placeholder' => $custom_field->help_me_name,
                            'description' => $custom_field->help_me_description,
                            'options' => $options,
                            'choice'=> $field_option,
                            required =>$required
                        ]; 
                    }else{
                        $field = [
                            'name' => $custom_field->field_name,
                            'id' => $custom_field->field_id,
                            'component' => $custom_field->field_type_code,
                            'label' => $custom_field->field_label,
                            'placeholder' => $custom_field->help_me_name,
                            'description' => $custom_field->help_me_description,
                            'options' => $options,
                            required => $required
                        ]; 
                    }
                }
                array_push($customs, $field);
            }
            return $this->response->withJson($customs);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    $app->post('/getRiskLevelTotal', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT result from stellarhse_common.risk_level_matrix WHERE impact_code =:impact_code and likelyodd_code =:likelyodd_code";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":impact_code", $data['impact']);
            $stmt->bindParam(":likelyodd_code", $data['likelyhood']);
            $stmt->execute();
            $result = $stmt->fetchObject();
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getReportStatus', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * from stellarhse_common.report_status WHERE org_id =:org_id and language_id =:language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getReportDepartments', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * from stellarhse_auth.department_responsible WHERE org_id =:org_id and language_id =:language_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getRelatedHazard', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "call stellarhse_common.sp_get_related_hazard(:hazardDetalsIDs,:org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":hazardDetalsIDs", $data['hazardDetalsIDs']);
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
    $app->post('/getCorrectiveActionsResultStatus', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "SELECT * from stellarhse_common.status WHERE language_id=:language_id and org_id=:org_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $data['language_id']);
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
    $app->post('/getReportOwners', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $org_id = $data['org_id'];
            $query = "select metrics_scope_id as id , (case when field_code not in ('contractor','customer','all') then  :org_name
                else metrics_scope_name end) as name from stellarhse_common.metrics_scope where language_id=:language_id and field_code <>'all' and org_id='$org_id' and hide=0
                 order by name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->bindParam(":org_name", $data['org_name']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (PDOException $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        } catch (Exception $ex) {
            echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
        }
    });

    $app->post('/getStatusLable', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $error = new errorMessage();
        try {
            $query = "call stellarhse_incident.get_status_label(:report_id, :lableType)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_id", $data['report_id']);
            $stmt->bindParam(":lableType", $data['lableType']);
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

function saveDraftReport($db, $data, $dbname, $report_id) {
    // var_dump($data);exit;
    if ($data['opreationType'] == "update") {

        $query = "UPDATE $dbname.`drafts`
                            SET `Json_txt` =:Json_txt
                        WHERE $report_id =:report_id ";
    } else {
        if ($data['report_id'] == undefined || $data['report_id'] == null) {
            $data['report_id'] = Utils::getUUID($db);
        }
        $query = "INSERT INTO $dbname.`drafts`
                            (`org_id`, $report_id, `employee_id`, `Json_txt`)
                        VALUES (:org_id, :report_id, :employee_id, :Json_txt)";
    }

    $stmt = $db->prepare($query);
    if ($data['opreationType'] != "update") {
        $stmt->bindParam(":org_id", $data['org_id']);
        $stmt->bindParam(":employee_id", $data['employee_id']);
    }
    $stmt->bindParam(":report_id", $data['report_id']);
    $stmt->bindParam(":Json_txt", $data['report']);
    $stmt->execute();
    $result = $stmt->rowCount();
    return $result;
}

function getFields($db, $data, $dbname) {
    $query = "select "
            . "of.org_id,"
            . "of.field_id,"
            . "f.field_name,f.table_name,f.table_field_name,f.language_id,f.default_field_label,f.field_description,"
            . "f.admin_notes,f.field_key,"
            . "CASE `f`.`is_editable` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_editable`,"
            . "ft.field_type_name,"
            . "st.sub_tab_name,"
            . "st.sub_tab_label,"
            . "of.field_label,"
            . "of.help_me_name,"
            . "of.help_me_description,"
            . "CASE `of`.`is_mandatory` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_mandatory`,"
            . "CASE `of`.`is_hidden` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_hidden` "
            . "from $dbname.org_field `of` "
            . "join $dbname.field f on f.field_id=of.field_id "
            . "join stellarhse_common.field_type ft on ft.field_type_id=f.field_type_id "
            . "join $dbname.sub_tab st on st.sub_tab_id=f.sub_tab_id "
            . "where of.org_id=:org_id and f.language_id = :language_id order by st.`order`";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":language_id", $data['language_id']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}
function getNotificationFields($db, $data, $dbname) {
    $query = "select "
            . "of.org_id,"
            . "of.field_id,"
            . "f.field_name,f.table_name,f.table_field_name,f.language_id,f.default_field_label,f.field_description,f.is_custom,"
            . "f.admin_notes,f.field_key,"
            . "CASE `f`.`is_editable` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_editable`,"
            . "CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom`, "
            . "ft.field_type_name,"
            . "st.sub_tab_name,"
            . "st.sub_tab_label,"
            . "of.field_label,"
            . "of.help_me_name,"
            . "of.help_me_description,"
            . "CASE `of`.`is_mandatory` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_mandatory`,"
            . "CASE `of`.`is_hidden` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_hidden` "
            . "from $dbname.org_field `of` "
            . "join $dbname.field f on f.field_id=of.field_id "
            . "join stellarhse_common.field_type ft on ft.field_type_id=f.field_type_id "
            . "join $dbname.sub_tab st on st.sub_tab_id=f.sub_tab_id "
            . "where of.org_id=:org_id and f.language_id = :language_id and f.hide = 0 
            and f.field_name not in ('locked_id', 'third_party_name', 'third_party_type', 'third_party_job_number', 'third_party_representative_name', 'deleted_by', 'deletion_date', 'deletion_reason', 'version_date', 'sent_date', 'updated_by_id', 'hazard_type', 'hazard_sup_type', 'classification_type', 'type', 'sup_type', 'cause_type','cause_sub_type') order by st.`order`";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":language_id", $data['language_id']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}
function getReportFields($db, $data, $dbname) {
    $query = "SELECT org_field.field_id, field_name,
            (case when field_label = '' or field_label is null then field_name else TRIM(field_label) END) as FieldLabel , is_statistical, sub_tab_label,sub_tab.sub_tab_id,
            CASE org_field.is_mandatory WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsMandatory,
            CASE field.is_mandatory WHEN '0' THEN '0' WHEN '1' THEN '1' END AS DefaultMandatory,
            CASE org_field.is_hidden WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsHidden,
            CASE field.is_editable   WHEN '0' THEN '0' WHEN '1' THEN '1' END AS IsEditable
        FROM $dbname.org_field
            left join $dbname.field on field.field_id = org_field.field_id
            left join $dbname.sub_tab on sub_tab.sub_tab_id= field.sub_tab_id
        where org_field.org_id =:org_id and field.language_id=:language_id and field.is_custom=0 and  field.hide = 0
        Order by sub_tab.order";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":language_id", $data['language_id']);
    $stmt->bindParam(":org_id", $data['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
   // var_dump($result);exit;
    return $result;
}
function getReportCustomFields($db, $data, $dbname) {

    $query = "SELECT org_field.field_id, field_name,
            (case when field_label = NULL or field_label is null then field_name else TRIM(field_label) END) as FieldLabel ,
            is_statistical,(select replace(ifnull(f.default_field_label,og.field_label) ,':','') from $dbname.org_field  og join  $dbname.field f  on f.field_id=og.field_id and f.field_name like '%custom_field%' and f.org_id is null  limit 1)as sub_tab_label,
            CASE org_field.is_mandatory WHEN 0 THEN 0 WHEN 1 THEN 1 END AS IsMandatory,
            CASE field.is_mandatory WHEN 0 THEN 0 WHEN 1 THEN 1 END AS DefaultMandatory,
            CASE org_field.is_hidden WHEN 0 THEN 0 WHEN 1 THEN 1 END AS IsHidden,
            CASE field.is_editable   WHEN 0 THEN 0 WHEN 1 THEN 1 END AS IsEditable
        FROM $dbname.org_field
           left join $dbname.field on field.field_id = org_field.field_id and field.org_id is not null
        where org_field.org_id =:org_id  and  field.hide = 0
        order by FieldLabel asc ";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":org_id", $data['org_id']);
     //   var_dump($stmt);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function getFieldValues($db, $data, $dbname) {
//    $result = new stdClass();
    $field = $data['field'];
    if (strpos($field['table_name'], 'stellarhse_common') === false && strpos($field['table_name'], 'stellarhse_auth') === false) {
        $field['table_name'] = $dbname . "." . $field['table_name'];
    }
    $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
            . "and hide = 0 order by `order`," . $field['table_field_name'];
    if ($field['field_name'] === 'potential_impact_of_hazard') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
                . "and hide = 0 and is_potential = 0 order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'probability_of_hazard') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
                . "and hide = 0 and risk_level_key = 'hazard_exist' order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'report_owner') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id";
    }else if ($field['field_name'] === 'corrective_action_status_id') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
            . "and hide = 0 and corrective_action_status_code!='Closed' order by `order`," . $field['table_field_name'];
    }else if ($field['field_name'] === 'inv_status_id') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
            . "and hide = 0 and inv_status_code!='Closed' order by `order`," . $field['table_field_name'];
    }else if ($field['field_name'] === 'risk_level_type_id') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
            . "and hide = 0 and risk_level_type_name='Impact'";
    }else if ($field['field_name'] === 'risk_level_sup_type_id') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
            . "and hide = 0 and risk_level_type_name='Likelyhood'";
    } else if ($field['field_name'] === 'frequency_of_worker_exposure') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
                . "and hide = 0 and risk_level_key = 'worker_exposure' order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'severity_of_potential_consequences') {
        $query = "select * from " . $field['table_name'] . " where language_id = :language_id and org_id = :org_id "
                . "and hide = 0 and risk_level_key = 'potential_consequences' order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'energy_form') {
        $query = "select *, CASE `is_multi` WHEN '0' THEN 'Single Selection' WHEN '1' THEN 'Multiple Selection' END as "
                . "`is_multi` from " . $field['table_name'] . " where hide = 0 and parent_id is null and "
                . "observation_and_analysis_id = (select observation_and_analysis_id from stellarhse_incident.observation_analysis "
                . "where observation_and_analysis_code = 'EnergyForm' and language_id = :language_id and org_id = :org_id) "
                . "order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'substandard_actions') {
        $query = "select * from " . $field['table_name'] . " where hide = 0 and parent_id is null and "
                . "observation_and_analysis_id = (select observation_and_analysis_id from stellarhse_incident.observation_analysis "
                . "where observation_and_analysis_code = 'SubActions' and language_id = :language_id and org_id = :org_id) "
                . "order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'substandard_conditions') {
        $query = "select * from " . $field['table_name'] . " where hide = 0 and parent_id is null and "
                . "observation_and_analysis_id = (select observation_and_analysis_id from stellarhse_incident.observation_analysis "
                . "where observation_and_analysis_code = 'SubConditions' and language_id = :language_id and org_id = :org_id) "
                . "order by `order`," . $field['table_field_name'];
    } else if ($field['field_name'] === 'underlying_causes_title') {
        $query = "select *, CASE `is_multi` WHEN '0' THEN 'Single Selection' WHEN '1' THEN 'Multiple Selection' END as "
                . "`is_multi` from " . $field['table_name'] . " where hide = 0 and parent_id is null and "
                . "observation_and_analysis_id = (select observation_and_analysis_id from stellarhse_incident.observation_analysis "
                . "where observation_and_analysis_code = 'UnderLyingCauses' and language_id = :language_id and org_id = :org_id) "
                . "order by `order`," . $field['table_field_name'];
    }
    $stmt = $db->prepare($query);
    $stmt->bindParam(":language_id", $field['language_id']);
    $stmt->bindParam(":org_id", $field['org_id']);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function getFieldSubValues($db, $data, $dbname) {
    if (strpos($data['subTypeTableName'], 'stellarhse_common') === false && strpos($data['subTypeTableName'], 'stellarhse_auth') === false) {
        $data['subTypeTableName'] = $dbname . "." . $data['subTypeTableName'];
    }
    if (strpos($data['mainTable'], 'stellarhse_common') === false && strpos($data['mainTable'], 'stellarhse_auth') === false) {
        $data['mainTable'] = $dbname . "." . $data['mainTable'];
    }
    if (isset($data['mainValueId']) && $data['mainValueId'] === 'All') {
        $query = "select s.*,m.$data[mainFieldName] from $data[subTypeTableName] s join $data[mainTable] m on s.$data[mainTypeKey] = "
                . "m.$data[mainTypeKey] where s.language_id = :language_id and s.hide = 0 and m.org_id = :org_id "
                . "order by m.$data[mainFieldName], `order`, s.$data[subTypeName]";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":language_id", $data['language_id']);
        $stmt->bindParam(":org_id", $data['field']['org_id']);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    } else if ($data['field_name'] === 'energy_form' || $data['field_name'] === 'underlying_causes_title') {
        $query = "select s.*,m.$data[mainFieldName] as main_category from $data[subTypeTableName] s join $data[mainTable] m on s.$data[mainTypeKey] = "
                . "m.observation_and_analysis_param_id where s.$data[mainTypeKey] = :mainTypeKey and s.language_id = :language_id and s.hide = 0 "
                . "order by `order`, s.$data[subTypeName]";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mainTypeKey", $data['mainValueId']);
        $stmt->bindParam(":language_id", $data['language_id']);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    } else {
        $query = "select s.*,m.$data[mainFieldName] from $data[subTypeTableName] s join $data[mainTable] m on s.$data[mainTypeKey] = "
                . "m.$data[mainTypeKey] where s.$data[mainTypeKey] = :mainTypeKey and s.language_id = :language_id and s.hide = 0 "
                . "order by `order`, s.$data[subTypeName]";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mainTypeKey", $data['mainValueId']);
        $stmt->bindParam(":language_id", $data['language_id']);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    }
    return $result;
}

function saveField($db, $data, $dbname) {
    $field = $data['field'];
    $query = "update $dbname.org_field set field_label = :field_label, is_mandatory = :is_mandatory, "
            . "is_hidden = :is_hidden, help_me_name = :help_me_name, help_me_description = :help_me_description "
            . "where field_id = :field_id and org_id = :org_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":field_id", $field['field_id']);
    $stmt->bindParam(":org_id", $field['org_id']);
    $stmt->bindParam(":field_label", $field['field_label']);
    $stmt->bindParam(":help_me_name", $field['help_me_name']);
    $stmt->bindParam(":help_me_description", $field['help_me_description']);
    if ($field['is_mandatory'] === 'Yes')
        $stmt->bindValue(":is_mandatory", 1, PDO::PARAM_INT);
    else
        $stmt->bindValue(":is_mandatory", 0, PDO::PARAM_INT);
    if ($field['is_hidden'] === 'Yes')
        $stmt->bindValue(":is_hidden", 1, PDO::PARAM_INT);
    else
        $stmt->bindValue(":is_hidden", 0, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->rowCount();
    return $result;
}

function deleteFieldValue($db, $data, $dbname) {
//    $result = new stdClass();
    $field = $data['fieldValue'];
    if (strpos($data['table_name'], 'stellarhse_common') === false && strpos($data['table_name'], 'stellarhse_auth') === false) {
        $data['table_name'] = $dbname . "." . $data['table_name'];
    }
    $query = "update $data[table_name] set hide = 1 where $data[field_key] = :key";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":key", $field[$data['field_key']]);
    $stmt->execute();
    $result = $stmt->rowCount();
    return $result;
}

function saveFieldValue($db, $data, $dbname) {
    if (strpos($data['table_name'], 'stellarhse_common') === false && strpos($data['table_name'], 'stellarhse_auth') === false) {
        $data['table_name'] = $dbname . "." . $data['table_name'];
    }
    $fieldKey = $data['fieldKey'];
    $fieldValue = $data['fieldValue'];
    if (isset($fieldValue['operation']) && $fieldValue['operation'] === 'add') {
        $query = "select myuuid()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $key_id = $stmt->fetchColumn();
        $values = [];
        $keys = [];
        $keys[] = "`$data[field_key]`";
        $values[] = "'" . $key_id . "'";
        $fieldKey = $data['fieldKey'];
        $fieldValue = $data['fieldValue'];
        foreach ($fieldKey as $index => $key) {
            $keys[] = "`$key[name]`";
            if ($fieldValue[$key['name']] === '' || $fieldValue[$key['name']] === null)
                $values[] = "NULL";
            else
            if ($key['name'] === 'is_multi') {
                if ($fieldValue[$key['name']] === 'Multiple Selection')
                    $values[] = 1;
                else if ($fieldValue[$key['name']] === 'Single Selection')
                    $values[] = 0;
            } else
                $values[] = "'" . $fieldValue[$key['name']] . "'";
        }
        if ($data['field_name'] === 'probability_of_hazard') {
            $keys[] = "`risk_level_key`";
            $values[] = "'hazard_exist'";
        } else if ($data['field_name'] === 'frequency_of_worker_exposure') {
            $keys[] = "`risk_level_key`";
            $values[] = "'worker_exposure'";
        } else if ($data['field_name'] === 'severity_of_potential_consequences') {
            $keys[] = "`risk_level_key`";
            $values[] = "'potential_consequences'";
        }
        $query = "insert into $data[table_name] (" . implode(',', $keys) . ",hide) values (" . implode(',', $values) . ",0)";
        $stmt = $db->prepare($query);
    } else {
        $update = "";
        foreach ($fieldKey as $index => $key) {
            if ($fieldValue[$key['name']] === '' || $fieldValue[$key['name']] === null)
                $value = "NULL";
            else
                $value = "'" . $fieldValue[$key['name']] . "'";
            if ($key['name'] === 'is_multi')
                if ($fieldValue[$key['name']] === 'Multiple Selection')
                    $value = 1;
                else if ($fieldValue[$key['name']] === 'Single Selection')
                    $value = 0;
            $update .= "`$key[name]` = $value";
            if ($index < count($fieldKey) - 1)
                $update .= ',';
        }
        $query = "update $data[table_name] set $update where $data[field_key] = :key";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":key", $fieldValue[$data[field_key]]);
    }
    $stmt->execute();
    $result = $stmt->rowCount();
    return $result;
}

function ReplaceCorrectiveActionsParamters($db, $dbname, $report_data, $report_values, $ca, $index) {
    switch ($dbname) {
        case 'stellarhse_hazard':
            $corrective_action_replace = ReplaceHazardCorrectiveActionsParamters($db, $report_data, $report_values, $ca, $index);
            break;
        case 'stellarhse_incident':
            $corrective_action_replace = ReplaceIncidentCorrectiveActionsParamters($db, $report_data, $report_values, $ca, $index);
            break;
        case 'stellarhse_inspection':
            $corrective_action_replace = ReplaceInspectionCorrectiveActionsParamters($report_data, $report_values, $ca, $index);
            break;
        case 'stellarhse_maintenance':
            $corrective_action_replace = ReplaceMaintenanceCorrectiveActionsParamters($report_data, $report_values, $ca, $index);
            break;
        case 'stellarhse_safetymeeting':
            $corrective_action_replace = ReplaceSafetyMeetingCorrectiveActionsParamters($report_data, $report_values, $ca, $index);
            break;
        case 'stellarhse_training':
            $corrective_action_replace = ReplaceTrainingCorrectiveActionsParamters($report_data, $report_values, $ca, $index);
            break;
    }
    return $corrective_action_replace;
}

function ReplaceReportParamters($db, $dbname, $report_data, $report_values, $body, $notification) {
    switch ($dbname) {
        case 'stellarhse_hazard':
            $report_replace = ReplaceHazardReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
        case 'stellarhse_incident':
            $report_replace = ReplaceIncidentReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
        case 'stellarhse_inspection':
            $report_replace = ReplaceInspectionReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
        case 'stellarhse_maintenance':
            $report_replace = ReplaceMaintenanceReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
        case 'stellarhse_safetymeeting':
            $report_replace = ReplaceSafetyMeetingReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
        case 'stellarhse_training':
            $report_replace = ReplaceTrainingReportParamters($db, $report_data, $report_values, $body, $notification);
            break;
    }
    return $report_replace;
}

function SendWhoIdentifiedEmail($db, $dbname, $report_data, $report_values, $template) {
    if (isset($report_data['whoIdentified']['rep_supervisor_notify']) && $report_data['whoIdentified']['rep_supervisor_notify']) {
        $body = $template->body . '<br/><br/>';
//            $corrective_action_replace = ReplaceCorrectiveActionsParamters($db, $dbname, $report_data, $report_values, $ca, $key);
//            $body .= $corrective_action_replace . '<br/>';
        $subject = 'User under your supervision is identified the report';
        SendToWhoIdentifiedPerson($db, $dbname, $subject, $body, $template->email_type_id, $report_data, $report_values);
    }
}
function SendToWhoIdentifiedPerson($db, $dbname, $subject, $body, $email_type_id, $report_data, $report_values) {
    if(isset($report_data['whoIdentified']['supervisor_email']) && $report_data['whoIdentified']['supervisor_email'] !== ''){
        $cc = '';
        $to = $report_data['whoIdentified']['supervisor_email'];
        $email = new SendEMail();
        $email->to = $to;
        $email->from = '';
        $email->cc = $cc;
        $email->subject = $subject;
        $email->body = $body;
        $res = $email->sendmail($email);
        return SaveEmailOfWhoIdentifiedToDB($db, $dbname, $to, $cc, $res, $subject, $body, $email_type_id, $report_data, $report_values);
    }
}

function SaveEmailOfWhoIdentifiedToDB($db, $dbname, $to, $cc, $is_sent, $subject, $body, $email_type_id, $report_data, $report_values) {
    try {
        $summary = substr($body, 0, 200);
        $from = 'account.services@abcanada.com';
        $query = "select $dbname.myuuid()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $email_log_id = $stmt->fetchColumn();
        $query = "INSERT INTO $dbname.`email_log`
                            (email_log_id,`from`, `to`, `c_c`, send_to_employee_id,cc_employee_id, is_sent, error, email_type_id, `subject`,summary, org_id)
                        VALUES (:email_log_id,:from,:to, :cc,:send_to_employee_id,NULL,:is_sent,NULL,:email_type_id,:subject,:summary,:org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id', $email_log_id);
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
        $stmt->bindParam(':cc', $cc);
        $stmt->bindParam(':send_to_employee_id', $report_data['whoIdentified']['supervisor_id']);
        if ($is_sent == true)
            $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
        else
            $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
        $stmt->bindParam(':email_type_id', $email_type_id);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':summary', $summary);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->rowCount();
        // save email body to the file system
        if ($result) {
            $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
            fwrite($file, strip_tags($body, '<br/>'));
            fclose($file);
        }
        InsertIntoReportEmailLog($dbname, $db, $email_log_id, $report_values);
        return true;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function SendCorrectiveActionEmail($db, $dbname, $report_data, $report_values, $corrective_actions, $template) {
    // $query = "SELECT subject,body FROM $dbname.email_template order by `order`";
    // $stmt = $db->prepare($query);
    // $stmt->execute();
    // $template = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
    foreach ($corrective_actions as $key => $ca) {
        if (isset($ca['assigned_to']['email'])) {
            $body = $template->body . '<br/><br/>';
            $corrective_action_replace = ReplaceCorrectiveActionsParamters($db, $dbname, $report_data, $report_values, $ca, $key);
            $body .= $corrective_action_replace . '<br/>';
            $subject = 'Corrective Actions assigned to you';
            $report_values->correctiveActions[$key]->hist_report_id = $report_values->hist_report_id;
            SendToResponsiblePersons($db, $dbname, $subject, $body, $ca, $template->email_type_id, $report_data['org_id'], $report_values->correctiveActions[$key]);
        }
    }
}

function SendToResponsiblePersons($db, $dbname, $subject, $body, $corrective_action, $email_type_id, $org_id, $ca_values) {
    $cc = '';
    $to = $corrective_action['assigned_to']['email'];
    foreach ($corrective_action['notified_to'] as $key => $notify) {
        if (isset($notify['email'])) {
            $cc .= $notify['email'];
            if ($key !== count($corrective_action['notified_to']) - 1)
                $cc .= ',';
        }
        if ($corrective_action['supervisor_notify']){
            if (isset($corrective_action['assigned_to']['supervisor_email']) && $corrective_action['assigned_to']['supervisor_email'] !== '') {
                if($cc === '')
                    $cc .= $corrective_action['assigned_to']['supervisor_email'];
                else
                    $cc .= ','.$corrective_action['assigned_to']['supervisor_email'];
            }
        }
    }
//    $to = 'alaa.elsherbiny@procuredox.com';
//    $cc = 'alaaouda@gmail.com';

    $email = new SendEMail();
    $email->to = $to;
    $email->from = '';
    $email->cc = $cc;
    $email->subject = $subject;
    $email->body = $body;
    $res = $email->sendmail($email);
    return SaveEmailOfResposibleToDB($db, $dbname, $to, $cc, $res, $corrective_action, $subject, $body, $email_type_id, $org_id, $ca_values);
}

function SaveEmailOfResposibleToDB($db, $dbname, $to, $cc, $is_sent, $corrective_action, $subject, $body, $email_type_id, $org_id, $ca_values) {
    try {
        $summary = substr($body, 0, 200);
        $from = 'account.services@abcanada.com';
        $query = "select $dbname.myuuid()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $email_log_id = $stmt->fetchColumn();
        $query = "INSERT INTO $dbname.`email_log`
                            (email_log_id,`from`, `to`, `c_c`, send_to_employee_id,cc_employee_id, is_sent, error, email_type_id, `subject`,summary, org_id)
                        VALUES (:email_log_id,:from,:to, :cc,:send_to_employee_id,NULL,:is_sent,NULL,:email_type_id,:subject,:summary,:org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id', $email_log_id);
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
        $stmt->bindParam(':cc', $cc);
        $stmt->bindParam(':send_to_employee_id', $corrective_action['assigned_to']['employee_id']);
        if ($is_sent == true)
            $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
        else
            $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
        $stmt->bindParam(':email_type_id', $email_type_id);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':summary', $summary);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->rowCount();
        // save email body to the file system
        if ($result) {
            $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
            fwrite($file, strip_tags($body, '<br/>'));
            fclose($file);
        }
        InsertIntoReportEmailLog($dbname, $db, $email_log_id, $ca_values);
        $query = "INSERT INTO $dbname.`corr_act_email`
                            (email_log_id, hist_corrective_action_id)
                        VALUES (:email_log_id,:hist_corrective_action_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id', $email_log_id);
        $stmt->bindParam(':hist_corrective_action_id', $ca_values->hist_corrective_action_id);
        $stmt->execute();
        $result = $stmt->rowCount();
        return true;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function SendToNotificationMonitor($db, $dbname, $subject, $body, $report_data, $org_id, $report_values, $notification) {
    $to = $notification[0]->email_to;
//    print_r($to);
//    $to = 'alaa.elsherbiny@procuredox.com';
//    $cc = 'alaaouda@gmail.com';
    $email = new SendEMail();
    $email->to = $to;
    $email->from = '';
    $email->cc = '';
    $email->subject = $subject;
    $email->body = $body;
    $res = $email->sendmail($email);
    return SaveEmailOfMonitorToDB($db, $dbname, $to, $cc, $res, $report_data, $subject, $body, $org_id, $report_values, $notification);
}

function SaveEmailOfMonitorToDB($db, $dbname, $to, $cc, $is_sent, $report_data, $subject, $body, $org_id, $report_values, $notification) {
    try {
        $summary = substr($body, 0, 200);
        $from = 'account.services@abcanada.com';
        $query = "select $dbname.myuuid()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $email_log_id = $stmt->fetchColumn();
        $query = "INSERT INTO $dbname.`email_log`
                            (email_log_id,`from`, `to`, `c_c`, send_to_employee_id,cc_employee_id, is_sent, error, email_type_id, `subject`,summary, org_id)
                        VALUES (:email_log_id,:from,:to, :cc,:send_to_employee_id,NULL,:is_sent,NULL,:email_type_id,:subject,:summary,:org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id', $email_log_id);
        $stmt->bindParam(':from', $from);
        $stmt->bindParam(':to', $to);
        $stmt->bindParam(':cc', $cc);
        if ($notification[0]->employee_id !== null)
            $stmt->bindParam(':send_to_employee_id', $notification[0]->employee_id);
        else
            $stmt->bindParam(':send_to_group_id', $notification[0]->group_id);
        if ($is_sent == true)
            $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
        else
            $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
        $stmt->bindParam(':email_type_id', $notification[0]->email_type);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':summary', $summary);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->rowCount();
        // save email body to the file system
        if ($result) {
            $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
            fwrite($file, strip_tags($body, '<br/>'));
            fclose($file);
        }
        InsertIntoReportEmailLog($dbname, $db, $email_log_id, $report_values);
        return true;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function SendNotificationEmail($db, $dbname, $report_data, $report_values, $template) {
    try {
        $notifications = array();
        $query = "call $dbname.sp_identified_notifications_email(:report_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':report_id', $report_data['report_id']);
        $stmt->execute();
        do {
//        print_r($stmt->fetchAll(PDO::FETCH_OBJ));
            if ($stmt->rowCount() > 0) {
                $notifications[] = $stmt->fetchAll(PDO::FETCH_OBJ);
                $stmt->nextRowset();
//        print_r($stmt->fetchAll(PDO::FETCH_OBJ));
            }
        } while ($stmt->rowCount());
//        print_r($notifications);
        foreach ($notifications as $notification) {
//        print_r($notification);
            $body = $template->body . "<br/>";
            $report_replace = ReplaceReportParamters($db, $dbname, $report_data, $report_values, $body, $notification);
//        print_r($report_replace);
            $subject = $template->subject;
//                $stmt->closeCursor();
            SendToNotificationMonitor($db, $dbname, $subject, $report_replace, $report_data, $report_data['org_id'], $report_values, $notification);
        }
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function InsertIntoReportEmailLog($dbname, $db, $email_log_id, $report_data) {
    switch ($dbname) {
        case 'stellarhse_hazard':
            InsertIntoHazardEmailLog($db, $email_log_id, $report_data);
            break;
        case 'stellarhse_incident':
            InsertIntoIncidentEmailLog($db, $email_log_id, $report_data);
            break;
        case 'stellarhse_inspection':
            InsertIntoInspectionEmailLog($db, $email_log_id, $report_data);
            break;
        case 'stellarhse_maintenance':
            InsertIntoMaintenanceEmailLog($db, $email_log_id, $report_data);
            break;
        case 'stellarhse_safetymeeting':
            InsertIntoSafetyMeetingEmailLog($db, $email_log_id, $report_data);
            break;
        case 'stellarhse_training':
            InsertIntoTrainingEmailLog($db, $email_log_id, $report_data);
            break;
    }
}

function AddReportFile($report_type, $report_id, $org_id, $report_num, $version_number, $db) {
    switch ($report_type) {
        case 'hazard':
            $path = '/data/report_documents/stellarhse_hazard/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Hazard';
            break;
        case 'incident':
            $path = '/data/report_documents/stellarhse_incident/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'ABCanTrack';
            break;
        case 'safetymeeting':
            $path = '/data/report_documents/stellarhse_safetymeeting/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'SafetyMeeting';
            break;
        case 'inspection':
            $path = '/data/report_documents/stellarhse_inspection/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Inspection';
            break;
        case 'maintenance':
            $path = '/data/report_documents/stellarhse_maintenance/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'MaintenanceManagement';
            break;
        case 'training':
            $path = '/data/report_documents/stellarhse_training/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Training';
            break;
    }
    if (is_dir($path) === false) {
        mkdir($path, 0775, true);
    }
    if(isset($_SESSION['temp_path'])){
        $attchpath = $_SESSION['temp_path'];
    }else{
        $attchpath = '/data/report_documents/attachments/';
    }
    $res = recurse_copy_submit($attchpath, $path, $type, $report_id, $version_number, $db);
    return $res;
}

function EditReportFile($report_type, $report_id, $org_id, $report_num, $version_number, $db) {
    switch ($report_type) {
        case 'hazard':
            $path = '/data/report_documents/stellarhse_hazard/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Hazard';
            break;
        case 'incident':
            $path = '/data/report_documents/stellarhse_incident/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'ABCanTrack';
            break;
        case 'safetymeeting':
            $path = '/data/report_documents/stellarhse_safetymeeting/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'SafetyMeeting';
            break;
        case 'inspection':
            $path = '/data/report_documents/stellarhse_inspection/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Inspection';
            break;
        case 'maintenance':
            $path = '/data/report_documents/stellarhse_maintenance/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'MaintenanceManagement';
            break;
        case 'training':
            $path = '/data/report_documents/stellarhse_training/' . $org_id . '/' . $report_num . '/' . $version_number . '/';
            $type = 'Training';
            break;
    }
    if (is_dir($path) === TRUE) {
        deleteDirectory($path);
    }

    mkdir($path, 0775, true);
    
    if(isset($_SESSION['temp_path'])){
        $attchpath = $_SESSION['temp_path'];
    }else{
        $attchpath = '/data/report_documents/attachments/';
    }
    $res = recurse_copy_submit($attchpath, $path, $type, $report_id, $version_number, $db);
    return $res;
}

function recurse_copy($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while (false !== ( $file = readdir($dir))) {
        if (( $file != '.' ) && ( $file != '..' )) {

            if (is_dir($src . '/' . $file)) {
                recurse_copy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }

    closedir($dir);
}

function recurse_copy_submit($src, $dst, $report_type, $report_id, $version_number, $db) {
    $dir = opendir($src);
    @mkdir($dst);
    $success =TRUE;
    while (false !== ( $file = readdir($dir))) {
        if (( $file != '.' ) && ( $file != '..' )) {

            if (is_dir($src . '/' . $file)) {
                recurse_copy_submit($src . '/' . $file, $dst . '/' . $file, $report_type, $report_id, $version_number, $db);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
                // Add attachment to db
                $path_parts = pathinfo($src . '/' . $file);
                $dir_name = explode($src . '/', $path_parts['dirname']);
                if ($dir_name[1] != NULL) {
                    $filename = $dir_name[1] . '/' . $path_parts['filename'];
                } else {
                    $filename = $path_parts['filename'];
                }
                $extension = $path_parts['extension'];
                $file_size = formatSizeUnits(filesize($src . '/' . $file));
                $result_submit = submitReportAttchment($db, $report_id, $version_number, $filename, $extension, $file_size, $report_type);
                if($result_submit == FALSE){
                   $success =FALSE; 
                }
            }
        }
    }
    
    if(isset($_SESSION['temp_path'])){
        $attchpath = $_SESSION['temp_path'];
    }else{
        $attchpath = '/data/report_documents/attachments/';
    }
    if (is_dir($attchpath) === false) {
        mkdir($attchpath, 0775, true);
    }
    deleteDirectory($attchpath);
    mkdir($attchpath, 0775, true);

    if (is_dir_empty($attchpath)) {
        $result = TRUE;
    } else {
        $result = FALSE;
    }
    closedir($dir);
    return $success;
}

function submitReportAttchment($db, $report_id, $version_number, $filename, $extension, $file_size, $report_type) {
    try {
        $query = "call stellarhse_common.sp_add_attachments(:report_id,:version_no,:filename,:extension,:file_size,:product_code )";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":report_id", $report_id);
        $stmt->bindParam(":version_no", $version_number);
        $stmt->bindParam(":filename", $filename);
        $stmt->bindParam(":extension", $extension);
        $stmt->bindParam(":file_size", $file_size);
        $stmt->bindParam(":product_code", $report_type);
        $res = $stmt->execute();
        if($res ==1 ){
            return TRUE;
        }else{
            return FALSE;
        }
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function deleteDirectory($dirPath) {
    $it = new RecursiveDirectoryIterator($dirPath, RecursiveDirectoryIterator::SKIP_DOTS);
    $files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($files as $file) {
        if ($file->isDir()) {
            rmdir($file->getRealPath());
        } else {
            unlink($file->getRealPath());
        }
    }
    rmdir($dirPath);
}

function dirSize($directory) {
    $size = 0;
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory)) as $file) {
        $size+=$file->getSize();
    }
    return $size;
}

function is_dir_empty($dir) {
    if (!is_readable($dir))
        return NULL;
    return (count(scandir($dir)) == 2);
}

function formatSizeUnits($bytes) {
    if ($bytes >= 1073741824) {
        $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        $bytes = number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        $bytes = number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes > 1) {
        $bytes = $bytes . ' bytes';
    } elseif ($bytes == 1) {
        $bytes = $bytes . ' byte';
    } else {
        $bytes = '0 bytes';
    }

    return $bytes;
}

function AddCustomFieldValues($db,$report_id,$custom_values,$product_code,$table_key_value,$table_key_id){
 try {    
     
//            if ($operation_type === 'add') {
                foreach ($custom_values as $custom_value) {
//                    var_dump($whatCustomField);
                    $component = $custom_value['component'];
                    if($component =='textbox' || $component =='calendar' ||$component =='textarea'){
                        $field_id =$custom_value['id'];
                        $field_value = $custom_value['choice'];
                        if($component =='calendar'){
                            if($field_value!=''){
                                $field_value = date("Y-m-d", strtotime($field_value));
                            }
                        }
                        if($field_value !='' &&$field_value != NULL){
                            $query = "call stellarhse_common.insert_into_field_value(:field_id,:option_id,:hazard_id,:field_value,:table_key_value,:table_key_id,:product_code);";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":field_id",$field_id);
                            $stmt->bindValue(":option_id", NULL);
                            $stmt->bindParam(":hazard_id", $report_id);
                            $stmt->bindParam(":field_value", $field_value);
                            $stmt->bindParam(":table_key_value", $table_key_value);
                            $stmt->bindParam(":table_key_id", $table_key_id);
                            $stmt->bindParam(":product_code", $product_code);
                            $stmt->execute();
                        }
                    }else if($component =='select' || $component =='radiobutton'){
                        $field_id =$custom_value['id'];
                        $field_option = $custom_value['choice'];
                        if($field_option !='' && $field_option != NULL){
                            $query = "call stellarhse_common.insert_into_field_value(:field_id,:option_id,:hazard_id,:field_value,:table_key_value,:table_key_id,:product_code);";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":field_id",$field_id);
                            $stmt->bindParam(":option_id", $field_option);
                            $stmt->bindParam(":hazard_id", $report_id);
                            $stmt->bindValue(":field_value", NULL);
                            $stmt->bindParam(":table_key_value", $table_key_value);
                            $stmt->bindParam(":table_key_id", $table_key_id);
                            $stmt->bindParam(":product_code", $product_code);
                            $stmt->execute();
                        }
                    }else if($component =='checkbox'){
                        $field_id = $custom_value['id'];
                        $field_options = $custom_value['choice'];
                        foreach($field_options as $option=> $value){
                            if($value ==true){
                                $query = "call stellarhse_common.insert_into_field_value(:field_id,:option_id,:hazard_id,:field_value,:table_key_value,:table_key_id,:product_code);";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(":field_id",$field_id);
                                $stmt->bindParam(":option_id", $option);
                                $stmt->bindParam(":hazard_id", $report_id);
                                $stmt->bindValue(":field_value", NULL);
                                $stmt->bindParam(":table_key_value", $table_key_value);
                                $stmt->bindParam(":table_key_id", $table_key_id);
                                $stmt->bindParam(":product_code", $product_code);
                                $stmt->execute();
                            }
                        }
                    }
                }
//            }
        } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}