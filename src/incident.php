<?php

$app->group('/api/v1', function() use($app) {
    
    $app->post('/getincidenttypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select incident_event_type_id as id,incident_event_type_name as name from "
                    . "stellarhse_incident.incident_event_type where org_id = :org_id and language_id= :language_id and "
                    . "hide = 0 order by `order`, incident_event_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    $app->post('/getenvconditions', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select *,CASE is_multi WHEN '0' THEN '0' WHEN '1' THEN '1' END as is_multi from "
                    . "stellarhse_incident.env_condition where org_id = :org_id and language_id= :language_id and hide = 0 "
                    . "order by `order`, env_condition_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($result as $cond) {
                $query = "select * from stellarhse_incident.env_cond_parameter where env_condition_id = :env_condition_id order by `order`, env_cond_parameter_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":env_condition_id", $cond->env_condition_id);
                $stmt->execute();
                $cond->parameters = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getoedepartments', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select oe_department_id, oe_department_name from stellarhse_auth.oe_department where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, oe_department_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getobservationandanalysis', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select observation_and_analysis_id, observation_and_analysis_name, observation_and_analysis_code from "
                    . "stellarhse_incident.observation_analysis where org_id = :org_id and language_id= :language_id and `hide` = 0 "
                    . "order by `order`, observation_and_analysis_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($result as $observ) {
                $query = "select * from stellarhse_incident.observation_analysis_param where observation_and_analysis_id = "
                        . ":observation_and_analysis_id and parent_id is null and `hide` = 0 order by `order`, observation_and_analysis_param_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":observation_and_analysis_id", $observ->observation_and_analysis_id);
                $stmt->execute();
                $observ->parameters = $stmt->fetchAll(PDO::FETCH_OBJ);
                foreach ($observ->parameters as $param) {
                    $query = "select * from stellarhse_incident.observation_analysis_param where parent_id = "
                            . ":parent_id and `hide` = 0  order by `order`, observation_and_analysis_param_name";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":parent_id", $param->observation_and_analysis_param_id);
                    $stmt->execute();
                    $param->parameters = $stmt->fetchAll(PDO::FETCH_OBJ);
                }
            }
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getexternalagencies', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select ext_agency_id, ext_agency_name from stellarhse_incident.external_agency where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`, ext_agency_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinvstatus', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select inv_status_id, inv_status_name, field_code from stellarhse_incident.inv_status where org_id = :org_id "
                    . "and language_id= :language_id and `hide` = 0 order by `order`, inv_status_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinvriskofrecurrence', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select risk_of_recurrence_id, risk_of_recurrence_name, field_code from stellarhse_incident.risk_of_recurrence "
                    . "where org_id = :org_id and language_id= :language_id and `hide` = 0 order by `order`, risk_of_recurrence_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinvseverity', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select severity_id, severity_name, field_code from stellarhse_incident.severity where org_id = :org_id and "
                    . "language_id= :language_id and `hide` = 0 order by `order`, severity_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinvsource', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select inv_source_id, inv_source_name, field_code from stellarhse_incident.inv_source where org_id = :org_id "
                    . "and language_id= :language_id and `hide` = 0 order by `order`, inv_source_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinvrootcauses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select root_cause_id, root_cause_name, field_code from stellarhse_incident.root_cause where org_id = :org_id "
                    . "and language_id= :language_id and hide = 0 order by `order`, root_cause_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach ($result as $cond) {
                $query = "select root_cause_param_id, root_cause_param_name, field_code from stellarhse_incident.root_cause_param "
                        . "where root_cause_id = :root_cause_id and hide = 0 order by `order`, root_cause_param_name";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":root_cause_id", $cond->root_cause_id);
                $stmt->execute();
                $cond->parameters = $stmt->fetchAll(PDO::FETCH_OBJ);
            }
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getspillreleasesource', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select spill_release_source_id, spill_release_source_name, field_code from "
                    . "stellarhse_incident.spill_release_source where org_id = :org_id and language_id= :language_id and hide = 0 "
                    . "order by `order`, spill_release_source_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getspillreleaseagency', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select spill_release_agency_id, spill_release_agency_name, field_code from "
                    . "stellarhse_incident.spill_release_agency where org_id = :org_id and language_id= :language_id and hide = 0 "
                    . "order by `spill_release_agency_name`, spill_release_agency_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getdurationunit', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select duration_unit_id, duration_unit_name, field_code from stellarhse_incident.duration_unit where "
                    . "org_id = :org_id and language_id= :language_id and hide = 0 order by `order`, duration_unit_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getquantityunit', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select quantity_unit_id, quantity_unit_name, field_code from stellarhse_incident.quantity_unit where "
                    . "org_id = :org_id and language_id= :language_id and hide = 0 order by `order`, quantity_unit_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getvehicletypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select vehicle_type_id, vehicle_type_name, field_code from stellarhse_incident.vehicle_type where "
                    . "org_id = :org_id and language_id= :language_id and hide = 0 order by `order`, vehicle_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinititaltreatments', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select initial_treatment_id, initial_treatment_name from stellarhse_incident.initial_treatment where "
                    . "org_id = :org_id and language_id= :language_id and hide = 0 order by `order`, initial_treatment_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getsymptoms', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select symptoms_id, description from stellarhse_incident.symptoms where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, description";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getrestrictedwork', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select restricted_work_id, restricted_work_name from stellarhse_incident.restricted_work where "
                    . "org_id = :org_id and language_id= :language_id and hide = 0 order by `order`, restricted_work_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjuryrecordable', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select recordable_id, recordable_name from stellarhse_incident.injury_recordable where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, recordable_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjurybodyparts', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select body_part_id, body_part_name from stellarhse_incident.body_part where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, body_part_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjurycontactcodes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select contact_code_id, contact_code_name from stellarhse_incident.contact_code where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, contact_code_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjurytypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select injury_type_id, injury_type_name from stellarhse_incident.injury_type where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, injury_type_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjurycontactagencies', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select contact_agency_id, contact_agency_name from stellarhse_incident.contact_agency where org_id = :org_id "
                    . "and language_id= :language_id and hide = 0 order by `order`, contact_agency_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getinjurybodyareas', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select body_area_id, body_area_name from stellarhse_incident.body_area where org_id = :org_id and "
                    . "language_id= :language_id and hide = 0 order by `order`, body_area_name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":language_id", $data['language_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getscatcontacttypes', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "call stellarhse_incident.get_energy_items(:org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getscatdirectcauses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $result = [];
        try {
            $query = "call stellarhse_incident.get_Immediate_causes_from_energy(:id, :org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data['id']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
        }
    });
    $app->post('/getscatbasiccauses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        $result = [];
        try {
            $query = "call stellarhse_incident.get_Basic_causes_from_Immediate_causes(:id, :org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data['id']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result['data'] = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowset();
            $result['type'] = $stmt->fetchColumn();
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/getscatsubcauses', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "call stellarhse_incident.get_sub_causes_from_Basic_causes(:id, :org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data['id']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result['data'] = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowset();
            $result['type'] = $stmt->fetchColumn();
            return $this->response->withJson($result);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    $app->post('/submitincidentreport', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $result = [];
        $db = $this->db;
        $whoIdentified = $data['whoIdentified'];
        if (isset($data['report_date'])) {
            $h_date = $data['report_date'];
            $incident_date = (isset($h_date) && $h_date != 'undefined' && $h_date != "") ? Utils::formatMySqlDate($h_date) : null;
        }
        try {
            $db->beginTransaction();

            /* $query = "select max(incident_number) from stellarhse_incident.`incident` where org_id = :org_id";
              $stmt = $db->prepare($query);
              $stmt->bindParam(":org_id", $data['org_id']);
              $stmt->execute();

              $incident_number = $stmt->fetchColumn();
              if ($incident_number === '' || $incident_number === null) {
              $incident_number = 1;
              } else {
              $incident_number += 1;
              }
             */

            if ($data['process_type'] === 'edit') {
                $query = "select max(version_number) from stellarhse_incident.`incident` where incident_number = :incident_number and org_id=:org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":incident_number", $data['incident_number']);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $version_number = $stmt->fetchColumn();
                if ($version_number === '' || $version_number === null) {
                    $version_number = 1;
                } else {
                    $version_number += 1;
                }
                $incident_number = $data['incident_number'];
            } else {
                $query = "select max(incident_number) from stellarhse_incident.`incident` where org_id = :org_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":org_id", $data['org_id']);
                $stmt->execute();
                $incident_number = $stmt->fetchColumn();
                if ($incident_number === '' || $incident_number === null) {
                    $incident_number = 1;
                } else {
                    $incident_number += 1;
                }
                $version_number = 1;
            }

            $data['report_number'] = $incident_number;
            $data['version_number'] = $version_number;

            $incident_id = Utils::getUUID($db);
            $data['report_id'] = $incident_id;

            $invest_date = $data['investigation_date'];
            $investigation_date = (isset($invest_date) && $invest_date != 'undefined' && $invest_date != "") ? Utils::formatMySqlDate($invest_date) : null;

            $invest_sign_off_date = $data['investigation_sign_off_date'];
            $investigation_sign_off_date = (isset($invest_sign_off_date) && $invest_sign_off_date != 'undefined' && $invest_sign_off_date != "") ? Utils::formatMySqlDate($invest_sign_off_date) : null;
            $investigators = $data['investigators'];

            $query = "insert into stellarhse_incident.incident ("
                    . "incident_id,event_type_id,other_event_type,org_id,report_owner,cont_cust_id,sponser_id,creator_id,modifier_id,incident_date,incident_hour,incident_minute,incident_status_id,reporter_id,"
                    . "rep_name,rep_emp_id,rep_crew,rep_department,rep_email,rep_position,rep_company,rep_primary_phone,rep_alternate_phone,"
                    . "rep_supervisor,rep_supervisor_notify,location1_id,location2_id,location3_id,location4_id,other_location,operation_type_id,"
                    . "crew_involved,is_emergency_response,event_sequence,incident_description,env_condition_note,should_work_stopped,"
                    . "energy_form_note,sub_standard_action_note,sub_standard_condition_note,under_lying_cause_note,incident_number,version_number,department_responsible_id,"
                    . "inv_status_id,investigation_date,investigation_summary,investigation_follow_up_note,investigation_response_cost,investigation_repair_cost,"
                    . "investigation_insurance_cost,investigation_wcb_cost,investigation_other_cost,investigation_total_cost,"
                    . "sign_off_investigator_id,sign_off_investigator_name,investigation_risk_of_recurrence_id,investigation_severity_id,"
                    . "investigation_source_details,investigation_root_cause_note,investigation_sign_off_date,"
                    ."other_behaviours,other_actions,other_inactions,other_conditions,"
                    . "investigator_id1,investigator_name1,investigator_id2,investigator_name2,investigator_id3,investigator_name3)"
                    . " values "
                    . "(:incident_id,:event_type_id,:other_event_type,:org_id,:report_owner,:cont_cust_id,:sponser_id,:creator_id,:modifier_id,:incident_date,:incident_hour,:incident_minute,:incident_status_id,:reporter_id,"
                    . ":rep_name,:rep_emp_id,:rep_crew,:rep_department,:rep_email,:rep_position,:rep_company,:rep_primary_phone,:rep_alternate_phone,"
                    . ":rep_supervisor,:rep_supervisor_notify,:location1_id,:location2_id,:location3_id,:location4_id,:other_location,:operation_type_id,"
                    . ":crew_involved,:is_emergency_response,:event_sequence,:incident_description,:env_condition_note,:should_work_stopped,"
                    . ":energy_form_note,:sub_standard_action_note,:sub_standard_condition_note,:under_lying_cause_note,:incident_number,:version_number,:department_responsible_id,"
                    . ":inv_status_id,:investigation_date,:investigation_summary,:investigation_follow_up_note,:investigation_response_cost,:investigation_repair_cost,"
                    . ":investigation_insurance_cost,:investigation_wcb_cost,:investigation_other_cost,:investigation_total_cost,"
                    . ":sign_off_investigator_id,:sign_off_investigator_name,:investigation_risk_of_recurrence_id,:investigation_severity_id,"
                    . ":investigation_source_details,:investigation_root_cause_note,:investigation_sign_off_date,"
                    .":other_behaviours,:other_actions,:other_inactions,:other_conditions,"
                    . ":investigator_id1,:investigator_name1,:investigator_id2,:investigator_name2,:investigator_id3,:investigator_name3)";

            $stmt = $db->prepare($query);

            $stmt->bindParam(":incident_id", $incident_id);
            if (isset($data['report_type_id']) && $data['report_type_id'] !== '' && $data['report_type_id'] !== null)
            $stmt->bindParam(":event_type_id", $data['report_type_id']);
            else
                return "Please choose type of incident";
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->bindParam(":report_owner", $data['report_owner']);
            if (isset($data['cont_cust_id']) && $data['cont_cust_id'] !== '' && $data['cont_cust_id'] !== null)
                $stmt->bindParam(":cont_cust_id", $data['cont_cust_id']);
            else
                $stmt->bindValue(":cont_cust_id", NULL );
            if (isset($data['sponser_id']) && $data['sponser_id'] !== '' && $data['sponser_id'] !== null)
                $stmt->bindParam(":sponser_id", $data['sponser_id']);
            else
                $stmt->bindValue(":sponser_id", NULL );
            $stmt->bindParam(":other_event_type", $data['other_event_type']);
           $stmt->bindParam(":creator_id", $data['creator_id']);
            $stmt->bindParam(":incident_date", $incident_date);
            $stmt->bindParam(":incident_hour", $data['report_hour']);
            $stmt->bindParam(":incident_minute", $data['report_min']);
             if (isset($data['report_status_id']) && $data['report_status_id'] !== '' && $data['report_status_id'] !== null)
                $stmt->bindParam(":incident_status_id", $data['report_status_id']);
            else
                $stmt->bindValue(":incident_status_id", NULL );
          //  $stmt->bindParam(":incident_status_id", $data['report_status_id']);
            if (isset($whoIdentified['employee_id']) && $whoIdentified['employee_id'] !== '' && $whoIdentified['employee_id'] !== null) {
                $stmt->bindParam(":reporter_id", $whoIdentified['employee_id']);
                $stmt->bindParam(":rep_name", $whoIdentified['full_name']);
            } else {
                $stmt->bindValue(":reporter_id", NULL);
                $stmt->bindValue(":rep_name", NULL);
            }
            $stmt->bindParam(":rep_emp_id", $whoIdentified['emp_id']);
            $stmt->bindParam(":rep_crew", $whoIdentified['crew_id']);            
            $stmt->bindParam(":rep_department", $whoIdentified['department_id']);
            $stmt->bindParam(":rep_email", $whoIdentified['email']);
            $stmt->bindParam(":rep_position", $whoIdentified['position']);
            $stmt->bindParam(":rep_company", $whoIdentified['company']);
            $stmt->bindParam(":rep_primary_phone", $whoIdentified['primary_phone']);
            $stmt->bindParam(":rep_alternate_phone", $whoIdentified['alternate_phone']);
            $stmt->bindParam(":rep_supervisor", $whoIdentified['supervisor_name']);
            if ($whoIdentified['rep_supervisor_notify'])
                $stmt->bindValue(":rep_supervisor_notify", 1, PDO::PARAM_INT);
            else
                $stmt->bindValue(":rep_supervisor_notify", 0, PDO::PARAM_INT);
            if (isset($data['location1']['location1_id']) && $data['location1']['location1_id'] !== '' && $data['location1']['location1_id'] !== null)
                $stmt->bindParam(":location1_id", $data['location1']['location1_id']);
            else
                $stmt->bindValue(":location1_id", NULL);
            if (isset($data['location2']['location2_id']) && $data['location2']['location2_id'] !== '' && $data['location2']['location2_id'] !== null)
                $stmt->bindParam(":location2_id", $data['location2']['location2_id']);
            else
                $stmt->bindValue(":location2_id", NULL);
            if (isset($data['location3']['location3_id']) && $data['location3']['location3_id'] !== '' && $data['location3']['location3_id'] !== null)
                $stmt->bindParam(":location3_id", $data['location3']['location3_id']);
            else
                $stmt->bindValue(":location3_id", NULL);
            if (isset($data['location4']['location4_id']) && $data['location4']['location4_id'] !== '' && $data['location4']['location4_id'] !== null)
                $stmt->bindParam(":location4_id", $data['location4']['location4_id']);
            else
                $stmt->bindValue(":location4_id", NULL);
            $stmt->bindParam(":other_location", $data['other_location']);
            if (isset($data['operation_type_id']) && $data['operation_type_id'] !== '' && $data['operation_type_id'] !== null)
                $stmt->bindParam(":operation_type_id", $data['operation_type_id']);
            else
                $stmt->bindValue(":operation_type_id", NULL);
            $stmt->bindParam(":crew_involved", $data['crew_id']);
    //      $stmt->bindParam(":is_emergency_response", intval($data['is_emergency_response']));
            if ($data['is_emergency_response'] == '1')
                $stmt->bindValue(":is_emergency_response", 1, PDO::PARAM_INT);
            else
                $stmt->bindValue(":is_emergency_response", 0, PDO::PARAM_INT);
            $stmt->bindParam(":event_sequence", $data['event_sequence']);
            $stmt->bindParam(":incident_description", $data['report_description']);
            $stmt->bindParam(":env_condition_note", $data['env_condition_note']);

            // $should_work_stopped = intval($data['should_work_stopped']);

            if(isset($data['should_work_stopped']) && $data['should_work_stopped'] !== '')
                $stmt->bindParam(":should_work_stopped", $data['should_work_stopped'] );
            else
                $stmt->bindValue(":should_work_stopped", NULL);
            //////////////////////////////////////
            foreach ($data['observationAndAnalysis'] as $observ) {
                if ($observ['observation_and_analysis_code'] === 'EnergyForm')
                    $stmt->bindParam(":energy_form_note", $observ['note']);
                if ($observ['observation_and_analysis_code'] === 'SubActions')
                    $stmt->bindParam(":sub_standard_action_note", $observ['note']);
                if ($observ['observation_and_analysis_code'] === 'SubConditions')
                    $stmt->bindParam(":sub_standard_condition_note", $observ['note']);
                if ($observ['observation_and_analysis_code'] === 'UnderLyingCauses')
                    $stmt->bindParam(":under_lying_cause_note", $observ['note']);
            }
            /// ****** investigation
            $stmt->bindParam(":inv_status_id", $data['inv_status_id']);
            $stmt->bindParam(":investigation_date", $investigation_date);
            $stmt->bindParam(":investigation_summary", $data['investigation_summary']);
            $stmt->bindParam(":investigation_follow_up_note", $data['investigation_follow_up_note']);
            $investigation_response_cost = floatval($data['investigation_response_cost']);
            $stmt->bindParam(":investigation_response_cost", $investigation_response_cost);
            $investigation_repair_cost = floatval($data['investigation_repair_cost']);
            $stmt->bindParam(":investigation_repair_cost", $investigation_repair_cost );
            $investigation_insurance_cost = floatval($data['investigation_insurance_cost']);
            $stmt->bindParam(":investigation_insurance_cost", $investigation_insurance_cost);
            $investigation_wcb_cost = floatval($data['investigation_wcb_cost']);
            $stmt->bindParam(":investigation_wcb_cost", $investigation_wcb_cost);
            $investigation_other_cost = floatval($data['investigation_other_cost']);
            $stmt->bindParam(":investigation_other_cost", $investigation_other_cost);
            $investigation_total_cost = floatval($data['investigation_total_cost']);
            $stmt->bindParam(":investigation_total_cost",$investigation_total_cost );
            if (isset($data['investigation_risk_of_recurrence_id']) && $data['investigation_risk_of_recurrence_id'] !== '' && $data['investigation_risk_of_recurrence_id'] !== null)
                $stmt->bindParam(":investigation_risk_of_recurrence_id", $data['investigation_risk_of_recurrence_id']);
            else
                $stmt->bindValue(":investigation_risk_of_recurrence_id", NULL);
            if (isset($data['investigation_severity_id']) && $data['investigation_severity_id'] !== '' && $data['investigation_severity_id'] !== null)
                $stmt->bindParam(":investigation_severity_id", $data['investigation_severity_id']);
            else
                $stmt->bindValue(":investigation_severity_id", NULL);
            $stmt->bindParam(":investigation_source_details", $data['investigation_source_details']);
            $stmt->bindParam(":investigation_root_cause_note", $data['investigation_root_cause_note']);
            if (isset($data['sign_off_investigator']['employee_id']) && $data['sign_off_investigator']['employee_id'] !== '' && $data['sign_off_investigator']['employee_id'] !== null) {
                $stmt->bindParam(":sign_off_investigator_id", $data['sign_off_investigator']['employee_id']);
                $stmt->bindParam(":sign_off_investigator_name", $data['sign_off_investigator']['full_name']);
            } else {
                $stmt->bindValue(":sign_off_investigator_id", NULL);
                $stmt->bindValue(":sign_off_investigator_name", NULL);
            }
            $stmt->bindParam(":investigation_sign_off_date", $investigation_sign_off_date);
            $stmt->bindParam(":other_behaviours", $data['other_behaviours']);
            $stmt->bindParam(":other_actions", $data['other_actions']);
            $stmt->bindParam(":other_inactions", $data['other_inactions']);
            $stmt->bindParam(":other_conditions", $data['other_conditions']);
            if ((isset($investigators[1]['employee_id']) && $investigators[1]['employee_id'] !== '' && $investigators[1]['employee_id'] !== null) &&(isset($investigators[2]['employee_id']) && $investigators[2]['employee_id'] !== '' && $investigators[2]['employee_id'] !== null)&&(isset($investigators[3]['employee_id']) && $investigators[3]['employee_id'] !== '' && $investigators[3]['employee_id'] !== null)) {
                if ($investigators[1]['employee_id'] == $investigators[2]['employee_id'] || $investigators[1]['employee_id'] == $investigators[3]['employee_id']|| $investigators[2]['employee_id']==$investigators[3]['employee_id']) 
                {
                    return $this->response->withJson('You can not add the same investigator twice.');
                }
            }
            if (isset($investigators[1]['employee_id']) && $investigators[1]['employee_id'] !== '' && $investigators[1]['employee_id'] !== null) {
                $stmt->bindParam(":investigator_id1", $investigators[1]['employee_id']);
                $stmt->bindParam(":investigator_name1", $investigators[1]['full_name']);
            } else {
                $stmt->bindValue(":investigator_id1", NULL);
                $stmt->bindValue(":investigator_name1", NULL);
            }
            if (isset($investigators[2]['employee_id']) && $investigators[2]['employee_id'] !== '' && $investigators[2]['employee_id'] !== null) {
                $stmt->bindParam(":investigator_id2", $investigators[2]['employee_id']);
                $stmt->bindParam(":investigator_name2", $investigators[2]['full_name']);
            } else {
                $stmt->bindValue(":investigator_id2", NULL);
                $stmt->bindValue(":investigator_name2", NULL);
            }
            if (isset($investigators[3]['employee_id']) && $investigators[3]['employee_id'] !== '' && $investigators[3]['employee_id'] !== null) {
                $stmt->bindParam(":investigator_id3", $investigators[3]['employee_id']);
                $stmt->bindParam(":investigator_name3", $investigators[3]['full_name']);
            } else {
                $stmt->bindValue(":investigator_id3", NULL);
                $stmt->bindValue(":investigator_name3", NULL);
            }


    /// ******
    //            $stmt->bindValue(":modifier_id", NULL);
            $stmt->bindParam(":incident_number", $incident_number);
            $stmt->bindParam(":version_number", $version_number);
            if(isset($data['department_responsible_id']) && $data['department_responsible_id'] !== '')
                $stmt->bindParam(":department_responsible_id", $data['department_responsible_id'] );
            else
                $stmt->bindValue(":department_responsible_id", NULL);

    //            $stmt->bindValue(":is_deleted", 0);
            if ($data['process_type'] === 'edit') {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindParam(":modifier_id", $data['modifier_id']);
            } else {
                $stmt->bindParam(":creator_id", $data['creator_id']);
                $stmt->bindValue(":modifier_id", NULL);
            }
    //            $stmt->bindValue(":editing_by", NULL);
    //            $stmt->bindValue(":hide", 0);
            $stmt->execute();

            $result = $stmt->rowCount();

            $oeDepartments = $data['oeDepartments'];
            foreach ($oeDepartments as $dept) {
                if (isset($dept['department_choice']) && $dept['department_choice'] == true) {
                    //                        $incident_acting_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_incident.incident_oe_department "
                            . "(incident_id,oe_department_id)"
                            . " values "
                            . "(:incident_id,:oe_department_id)";


                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_id", $incident_id);
                    $stmt->bindParam(":oe_department_id", $dept['oe_department_id']);

                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }

            $envConditions = $data['envConditions'];
            foreach ($envConditions as $cond) {
                foreach ($cond['parameters'] as $param) {
                    if (isset($param['parameter_choice']) && $param['parameter_choice'] != false) {

                        //echo "   ". $param['env_cond_parameter_name'];
                        $query = "insert into stellarhse_incident.incident_env_cond "
                                . "(incident_id,env_cond_parameter_id)"
                                . " values "
                                . "(:incident_id,:env_cond_parameter_id)";


                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":incident_id", $incident_id);
                        $stmt->bindParam(":env_cond_parameter_id", $param['env_cond_parameter_id']);

                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
            }

            $invRootCauses = $data['invRootCauses'];

            foreach ($invRootCauses as $type) {
                foreach ($type['parameters'] as $subtype) {

                    if (isset($subtype['causeChoice']) && $subtype['causeChoice'] == true) {
                        $query = "insert into stellarhse_incident.incident_root_cause "
                                . "(incident_id,root_cause_param_id)"
                                . " values "
                                . "(:incident_id,:root_cause_param_id)";

                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":incident_id", $incident_id);
                        $stmt->bindParam(":root_cause_param_id", $subtype['root_cause_param_id']);

    //                        $stmt->bindParam(":other", $subtype['other']);

                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
            }



            $incidentInvSources = $data['invsources'];
            foreach ($incidentInvSources as $invSource) {

                if (isset($invSource['sourceChoice']) && $invSource['sourceChoice'] == true) {
                    $query = "insert into stellarhse_incident.incident_inv_source "
                            . "(incident_id,inv_source_id)"
                            . " values "
                            . "(:incident_id,:inv_source_id)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_id", $incident_id);
                    $stmt->bindParam(":inv_source_id", $invSource['inv_source_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }


            $incidentCauses = $data['incidentCauses'];
            foreach ($incidentCauses as $cause) {
                if(isset($cause['scat_items_params_id']) && isset($cause['scat_direct_cause_id']) && 
                isset($cause['scat_basic_cause_id']) && isset($cause['scat_sub_cause_id'])){
                    $scat_analysis_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_incident.scat_analysis "
                            . "(scat_analysis_id,incident_id,type_of_energy_id,immediate_cause_id,"
                            . "basic_cause_id,sub_cause_id,immdeiate_cause_type,basic_cause_type,comment)"
                            . " values "
                            . "(:scat_analysis_id,:incident_id,:type_of_energy_id,:immediate_cause_id,"
                            . ":basic_cause_id,:sub_cause_id,:immdeiate_cause_type,:basic_cause_type,:comment)";

                    $stmt = $db->prepare($query);


                    $stmt->bindParam(":scat_analysis_id", $scat_analysis_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    // if (isset($cause['scat_items_params_id']))
                        $stmt->bindParam(":type_of_energy_id", $cause['scat_items_params_id']);
                    // else
                        //if it can be open it must be handeled 
                        //return "Please choose type of contact - SCAT Analysis";
                        // $stmt->bindValue(":type_of_energy_id", null);
                    // if (isset($cause['scat_direct_cause_id']))
                        $stmt->bindParam(":immediate_cause_id", $cause['scat_direct_cause_id']);
                    // else
                        //return "Please choose immediate cause - SCAT Analysis";
                        // $stmt->bindValue(":immediate_cause_id", null);
                    // if (isset($cause['scat_basic_cause_id']))
                        $stmt->bindParam(":basic_cause_id", $cause['scat_basic_cause_id']);
                    // else
                        //return "Please choose basic underlying cause - SCAT Analysis";
                        // $stmt->bindValue(":basic_cause_id", null);
                    // if (isset($cause['scat_sub_cause_id']))
                        $stmt->bindParam(":sub_cause_id", $cause['scat_sub_cause_id']);
                    // else{
                        //return "Please choose sub cause - SCAT Analysis";
                        // $stmt->bindValue(":sub_cause_id", null);
                    // }

                    if (isset($cause['scatDirectCauseType']))
                        $stmt->bindParam(":immdeiate_cause_type", $cause['scatDirectCauseType']);
                    else
                        $stmt->bindValue(":immdeiate_cause_type", null);
                    if (isset($cause['scatBasicCauseType']))
                        $stmt->bindParam(":basic_cause_type", $cause['scatBasicCauseType']);
                    else
                        $stmt->bindValue(":basic_cause_type", null);
                    if (isset($cause['comment']))
                        $stmt->bindParam(":comment", $cause['comment']);
                    else
                        $stmt->bindValue(":comment", null);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }

            $riskControls = $data['riskControls'];
            foreach ($riskControls as $riskControl) {
                if (isset($riskControl['risk_control_choice']) && $riskControl['risk_control_choice'] == true) {
                    $incident_risk_control_id = Utils::getUUID($db);
                    $query = "insert into stellarhse_incident.incident_risk_control "
                            . "(incident_risk_control_id,incident_id,risk_control_id)"
                            . " values "
                            . "(:incident_risk_control_id,:incident_id,:risk_control_id)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_risk_control_id", $incident_risk_control_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    $stmt->bindParam(":risk_control_id", $riskControl['risk_control_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }



            $riskLevels = $data['riskLevels'];
            if (isset($riskLevels['impactId']) && $riskLevels['impactId']!= undefined ) {
                $incident_risk_level_id = Utils::getUUID($db);
                $query = "insert into stellarhse_incident.incident_risk_level "
                        . "(incident_risk_level_id,incident_id,risk_level_sup_impact_id,risk_level_sup_likelyhood_id,result)"
                        . " values "
                        . "(:incident_risk_level_id,:incident_id,:risk_level_sup_impact_id,:risk_level_sup_likelyhood_id,:result)";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":incident_risk_level_id", $incident_risk_level_id);
                $stmt->bindParam(":incident_id", $incident_id);
                $stmt->bindParam(":risk_level_sup_impact_id", $riskLevels['impactId']);
                $stmt->bindParam(":risk_level_sup_likelyhood_id", $riskLevels['likelyhoodId']);
                $riskResult = intval($riskLevels['result']);
                $stmt->bindParam(":result", $riskResult);
                $stmt->execute();
            }


            $incident_third_party = $data['report_third_party'];
            foreach ($incident_third_party as $person) {
                // $incident_third_party_id = Utils::getUUID($db);
                if (isset($person['third_party_id']) && $person['third_party_id'] !== '' && $person['third_party_id'] !== null){
                $query = "insert into stellarhse_incident.`incident_third_party` "
                        . "(incident_id,third_party_id ,jop_number,contact_name)"
                        . " values "
                        . "(:incident_id,:third_party_id,:jop_number,:contact_name)";
                $stmt = $db->prepare($query);
                //$stmt->bindParam(":incident_third_party_id", $incident_third_party_id);
                $stmt->bindParam(":incident_id", $incident_id);
                    $stmt->bindParam(":third_party_id", $person['third_party_id']);
                $stmt->bindParam(":jop_number", $person['jop_number']);
                $stmt->bindParam(":contact_name", $person['contact_name']);

                $stmt->execute();
                $result = $stmt->rowCount();
                }
            }

            $equipment_involved = $data['equipment_involved'];

            foreach ($equipment_involved as $equipment) {
                $incident_equipment_id = Utils::getUUID($db);
                if (isset($equipment['equipment_id'])) {
                    $query = "insert into stellarhse_incident.incident_equipment "
                            . "(incident_equipment_id,incident_id,equipment_id)"
                            . " values "
                            . "(:incident_equipment_id,:incident_id,:equipment_id)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_equipment_id", $incident_equipment_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    $stmt->bindParam(":equipment_id", $equipment['equipment_id']);
                    $stmt->execute();
                    $result = $stmt->rowCount();
                }
            }

            $observationAndAnalysis = $data['observationAndAnalysis'];
            foreach ($observationAndAnalysis as $observ) {

                if ($observ['observation_and_analysis_code'] !== 'SubActions' && $observ['observation_and_analysis_code'] !== 'SubConditions') {
                    foreach ($observ['parameters'] as $param) {
                        foreach ($param['parameters'] as $childparam) {
                            if (isset($childparam['paramChoice']) && $childparam['paramChoice'] == true) {
    //                        $incident_acting_id = Utils::getUUID($db);
                                $query = "insert into stellarhse_incident.incident_observation_analysis "
                                        . "(incident_id,observation_and_analysis_param_id)"
                                        . " values "
                                        . "(:incident_id,:observation_and_analysis_param_id)";

                                $stmt = $db->prepare($query);
                                $stmt->bindParam(":incident_id", $incident_id);
                                $stmt->bindParam(":observation_and_analysis_param_id", $childparam['observation_and_analysis_param_id']);

                                $stmt->execute();
                                $result = $stmt->rowCount();
                            }
                        }
                    }
                } else {
                    foreach ($observ['parameters'] as $param) {
                        if (isset($param['paramChoice']) && $param['paramChoice'] == true) {
    //                        $incident_acting_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.incident_observation_analysis "
                                    . "(incident_id,observation_and_analysis_param_id)"
                                    . " values "
                                    . "(:incident_id,:observation_and_analysis_param_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":incident_id", $incident_id);
                            $stmt->bindParam(":observation_and_analysis_param_id", $param['observation_and_analysis_param_id']);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                }
            }

            $peopleInvolved = $data['peopleInvolved'];
            foreach ($peopleInvolved as $person) {
                if ($person['title'] != '' && $person['title'] != 'New Person') {
                    $people_involved_id = Utils::getUUID($db);

                    $query = "insert into stellarhse_incident.`incident_people_involved` "
                            . "(people_involved_id,incident_id,people_id ,third_party_id,people_involved_name,company,supervisor,position,email,primary_phone,alternate_phone,"
                            . "exp_in_current_postion,exp_over_all,age,crew,how_he_involved,role_description,editing_by,hide,original_people_involved_id,department)"
                            . " values "
                            . "(:people_involved_id,:incident_id,:people_id,:third_party_id,:people_involved_name,:company,:supervisor,:position,:email,:primary_phone,:alternate_phone,"
                            . ":exp_in_current_postion,:exp_over_all,:age,:crew,:how_he_involved,:role_description,:editing_by,:hide,:original_people_involved_id,:department)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":people_involved_id", $people_involved_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($person['type']) && ($person['type'] == 'whoidentified' || $person['type'] == 'investigator1' ||
                            $person['type'] == 'investigator2' || $person['type'] == 'investigator3' || $person['type'] == 'investigator')) {
                        $stmt->bindParam(":people_id", $person['employee_id']);
                        $stmt->bindValue(":third_party_id", NULL, PDO::PARAM_STR);
                        $stmt->bindParam(":people_involved_name", $person['full_name']);
                    } else if (isset($person['type']) && $person['type'] == 'thirdparty') {
                        $stmt->bindValue(":people_id", NULL, PDO::PARAM_STR);
                        $stmt->bindParam(":third_party_id", $person['third_party_id']);
                        $stmt->bindParam(":people_involved_name", $person['full_name']);
                    } else {
                        $stmt->bindValue(":people_id", NULL, PDO::PARAM_STR);
                        $stmt->bindValue(":third_party_id", NULL, PDO::PARAM_STR);
                        $stmt->bindValue(":people_involved_name", NULL, PDO::PARAM_STR);
                    }
                    $stmt->bindParam(":company", $person['company']);
                    $stmt->bindParam(":supervisor", $person['supervisor_name']);
                    $stmt->bindParam(":position", $person['position']);
                    $stmt->bindParam(":email", $person['email']);
                    $stmt->bindParam(":primary_phone", $person['primary_phone']);
                    $stmt->bindParam(":alternate_phone", $person['alternate_phone']);
                    $exp_in_current_postion = intval($person['exp_in_current_postion']);
                    $stmt->bindParam(":exp_in_current_postion", $exp_in_current_postion);
                    $exp_over_all= intval($person['exp_over_all']);
                    $stmt->bindParam(":exp_over_all", $exp_over_all);
                    $age = intval($person['age']);
                    $stmt->bindParam(":age", $age);
                    $stmt->bindParam(":crew", $person['crew']);
                    $stmt->bindParam(":how_he_involved", $person['how_he_involved']);
                    $stmt->bindParam(":role_description", $person['role_description']);
                    $stmt->bindValue(":editing_by", NULL);
                    $stmt->bindValue(":hide", 0);
                    if(isset($person['original_people_involved_id']) && $person['original_people_involved_id'] !='' && $person['original_people_involved_id']!=NULL){
                        $stmt->bindParam(":original_people_involved_id", $person['original_people_involved_id']);
                    }else{
                        $stmt->bindParam(":original_people_involved_id", $people_involved_id);
                    }
                    $stmt->bindParam(":department", $person['department']);

                    $stmt->execute();
                    $result = $stmt->rowCount();

                    $certificates = $person['certifications'];
                    foreach ($certificates as $certificate) {
                        if (isset($certificate['certificate_choice']) && $certificate['certificate_choice'] == true) {
                            $incident_certificate_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.`incident_certificate` "
                                    . "(incident_certificate_id,people_involved_id,certificate_id)"
                                    . " values "
                                    . "(:incident_certificate_id,:people_involved_id,:certificate_id)";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":incident_certificate_id", $incident_certificate_id);
                            $stmt->bindParam(":certificate_id", $certificate['certificate_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    $actingAs = $person['actingAs'];
                    foreach ($actingAs as $acting) {
                        if (isset($acting['acting_choice']) && $acting['acting_choice'] == true) {
                            $incident_acting_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.incident_acting "
                                    . "(incident_acting_id,people_involved_id,acting_id)"
                                    . " values "
                                    . "(:incident_acting_id,:people_involved_id,:acting_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":incident_acting_id", $incident_acting_id);
                            $stmt->bindParam(":acting_id", $acting['acting_id']);
                            $stmt->bindParam(":people_involved_id", $people_involved_id);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    $person_custom = $person['peopleCustomField'];
                    if ($person_custom){
                        AddCustomFieldValues($db, $incident_id, $person_custom,'ABCanTrack','People',$people_involved_id);
                    }
               }
            }
            $impactTypes = $data['incidentImpactTypes'];

            foreach ($impactTypes as $impact) {
                if(isset($impact['impact_type_id']) && isset($impact['impact_sub_type_id'])){
                //if (isset($impact['impact_choice']) && $impact['impact_choice'] == true) {
                if ($impact['impact_type_code'] === 'Illness') {
                    $incident_illness_id = Utils::getUUID($db);
                    $individuals = $impact['individuals'];

                    $incident_impact_custom_id = $incident_illness_id;
                    $time_start = $impact['illness']['lost_time_start'];
                    $lost_time_start = (isset($time_start) && $time_start != 'undefined' && $time_start != "") ? Utils::formatMySqlDate($time_start) : null;
                    $time_end = $impact['illness']['lost_time_end'];
                    $lost_time_end = (isset($time_end) && $time_end != 'undefined' && $time_end != "") ? Utils::formatMySqlDate($time_end) : null;

                    $query = "insert into stellarhse_incident.incident_illness "
                            . "(incident_illness_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . "primary_responder_id,primary_responder_name,estimated_cost,personal_afflicted_id,personal_afflicted_name,"
                            . "initial_treatment_id,lost_time_start,lost_time_end,adjustment_days,total_days_off, illness_description)"
                            . " values "
                            . "(:incident_illness_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . ":primary_responder_id,:primary_responder_name,:estimated_cost,:personal_afflicted_id,:personal_afflicted_name,"
                            . ":initial_treatment_id,:lost_time_start,:lost_time_end,:adjustment_days,:total_days_off,:illness_description)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_illness_id", $incident_illness_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else{
                        //return $this->response->withJson('Please choose impact type and subtype');
                        $impact_sub_type_id = null;
                        $stmt->bindParam(":impact_sub_type_id", $impact_sub_type_id);
                       // var_dump($impact_sub_type_id);exit;
                    }

                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $estimated_cost = floatval($impact['estimated_cost']);
                    $stmt->bindParam(":estimated_cost", $estimated_cost);
                    if (isset($impact['illness']['personal_afflicted']['employee_id']) && $impact['illness']['personal_afflicted']['employee_id'] !== null && $impact['illness']['personal_afflicted']['employee_id'] !== '')
                        $stmt->bindParam(":personal_afflicted_id", $impact['illness']['personal_afflicted']['employee_id']);
                    else
                        $stmt->bindValue(":personal_afflicted_id", NULL);
                    $stmt->bindParam(":personal_afflicted_name", $impact['illness']['personal_afflicted']['full_name']);
                    if (isset($impact['illness']['initial_treatment_id']) && $impact['illness']['initial_treatment_id'] !== null && $impact['illness']['initial_treatment_id'] !== '')
                        $stmt->bindParam(":initial_treatment_id", $impact['illness']['initial_treatment_id']);
                    else
                        $stmt->bindValue(":initial_treatment_id", NULL);
                    /*if (isset($impact['illness']['restricted_work_id']) && $impact['illness']['restricted_work_id'] !== null && $impact['illness']['restricted_work_id'] !== '')
                        $stmt->bindParam(":restricted_work_id", $impact['illness']['restricted_work_id']);
                    else
                        $stmt->bindValue(":restricted_work_id", NULL);*/
                    $stmt->bindParam(":lost_time_start", $lost_time_start);
                    $stmt->bindParam(":lost_time_end", $lost_time_end);
                    $adjustment_days = intval($impact['illness']['adjustment_days']);
                    $stmt->bindParam(":adjustment_days", $adjustment_days);
                    $total_days_off = intval($impact['illness']['total_days_off']);
                    $stmt->bindParam(":total_days_off", $total_days_off);
                    $stmt->bindParam(":illness_description", $impact['illness']['illness_description']);
                    //                    $stmt->bindValue(":editing_by", NULL);
                    //                    $stmt->bindValue(":hide", 0);
                    $stmt->execute();
                    $result = $stmt->rowCount();

                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,illness_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:illness_id,:ext_agency_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":illness_id", $incident_illness_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                    foreach ($impact['illness']['symptoms'] as $symptom) {
                        if (isset($symptom['symptom_choice']) && $symptom['symptom_choice'] == true) {
                            $query = "insert into stellarhse_incident.incident_illness_symptoms "
                                    . "(incident_illness_id,symptoms_id)"
                                    . " values "
                                    . "(:incident_illness_id,:symptoms_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":incident_illness_id", $incident_illness_id);
                            $stmt->bindParam(":symptoms_id", $symptom['symptoms_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                } else if ($impact['impact_type_code'] === 'Injury') {

                    $incident_injury_id = Utils::getUUID($db);
                    $individuals = $impact['individuals'];

                    $incident_impact_custom_id = $incident_injury_id;
                    $time_start = $impact['injury']['lost_time_start'];
                    $lost_time_start = (isset($time_start) && $time_start != 'undefined' && $time_start != "") ? Utils::formatMySqlDate($time_start) : null;
                    $time_end = $impact['injury']['lost_time_end'];
                    $lost_time_end = (isset($time_end) && $time_end != 'undefined' && $time_end != "") ? Utils::formatMySqlDate($time_end) : null;

                    $query = "insert into stellarhse_incident.incident_injury "
                            . "(incident_injury_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . "primary_responder_id,primary_responder_name,estimated_cost,personal_injured_id,personal_injured_name,"
                            . "initial_treatment_id,contact_code_id,contact_agency_id,recordable_id,injury_description,"
                            . "lost_time_start,lost_time_end,adjustment_days,total_days_off)"
                            . " values "
                            . "(:incident_injury_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . ":primary_responder_id,:primary_responder_name,:estimated_cost,:personal_injured_id,:personal_injured_name,"
                            . ":initial_treatment_id,:contact_code_id,:contact_agency_id,:recordable_id,:injury_description,"
                            . ":lost_time_start,:lost_time_end,:adjustment_days,:total_days_off)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_injury_id", $incident_injury_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else
                        //return $this->response->withJson('Please choose impact type and subtype');
                        $stmt->bindParam(":impact_sub_type_id", null);
                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $estimated_cost = floatval($impact['estimated_cost']);
                    $stmt->bindParam(":estimated_cost", $estimated_cost);
                    if (isset($impact['injury']['personal_afflicted']['employee_id']) && $impact['injury']['personal_afflicted']['employee_id'] !== null && $impact['injury']['personal_afflicted']['employee_id'] !== '')
                        $stmt->bindParam(":personal_injured_id", $impact['injury']['personal_afflicted']['employee_id']);
                    else
                        $stmt->bindValue(":personal_injured_id", NULL);
                    $stmt->bindParam(":personal_injured_name", $impact['injury']['personal_afflicted']['full_name']);
                    if (isset($impact['injury']['initial_treatment_id']) && $impact['injury']['initial_treatment_id'] !== null && $impact['injury']['initial_treatment_id'] !== '')
                        $stmt->bindParam(":initial_treatment_id", $impact['injury']['initial_treatment_id']);
                    else
                        $stmt->bindValue(":initial_treatment_id", NULL);
                    if (isset($impact['injury']['contact_code_id']) && $impact['injury']['contact_code_id'] !== null && $impact['injury']['contact_code_id'] !== '')
                        $stmt->bindParam(":contact_code_id", $impact['injury']['contact_code_id']);
                    else
                        $stmt->bindValue(":contact_code_id", NULL);
                    if (isset($impact['injury']['contact_agency_id']) && $impact['injury']['contact_agency_id'] !== null && $impact['injury']['contact_agency_id'] !== '')
                        $stmt->bindParam(":contact_agency_id", $impact['injury']['contact_agency_id']);
                    else
                        $stmt->bindValue(":contact_agency_id", NULL);
                    if (isset($impact['injury']['recordable_id']) && $impact['injury']['recordable_id'] !== null && $impact['injury']['recordable_id'] !== '')
                        $stmt->bindParam(":recordable_id", $impact['injury']['recordable_id']);
                    else
                        $stmt->bindValue(":recordable_id", NULL);
                    $stmt->bindParam(":injury_description", $impact['injury']['injury_description']);
                    /*if (isset($impact['injury']['restricted_work_id']) && $impact['injury']['restricted_work_id'] !== null && $impact['injury']['restricted_work_id'] !== '')
                        $stmt->bindParam(":restricted_work_id", $impact['injury']['restricted_work_id']);
                    else
                        $stmt->bindValue(":restricted_work_id", NULL);*/
                    $stmt->bindParam(":lost_time_start", $lost_time_start);
                    $stmt->bindParam(":lost_time_end", $lost_time_end);
                    $adjustment_days = intval($impact['injury']['adjustment_days']);
                    $stmt->bindParam(":adjustment_days", $adjustment_days);
                    $total_days_off = intval($impact['injury']['total_days_off']);
                    $stmt->bindParam(":total_days_off", $total_days_off );
                    $stmt->execute();
                    $result = $stmt->rowCount();


                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,injury_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:injury_id,:ext_agency_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":injury_id", $incident_injury_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    foreach ($impact['injury']['injuryBodyParts'] as $bodyPart) {
                        if (isset($bodyPart['body_part_choice']) && $bodyPart['body_part_choice'] == true) {
                            $query = "insert into stellarhse_incident.impact_injury_body_part "
                                    . "(injury_id,body_part_id) values (:injury_id,:body_part_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":injury_id", $incident_injury_id);
                            $stmt->bindParam(":body_part_id", $bodyPart['body_part_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    foreach ($impact['injury']['injuryTypes'] as $type) {
                        if (isset($type['type_choice']) && $type['type_choice'] == true) {
                            $query = "insert into stellarhse_incident.impact_injury_type "
                                    . "(injury_id,injury_type_id) values (:injury_id,:injury_type_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":injury_id", $incident_injury_id);
                            $stmt->bindParam(":injury_type_id", $type['injury_type_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }

                    foreach ($impact['injury']['injuryBodyAreas'] as $bodyArea) {
                        if (isset($bodyArea['body_area_choice']) && $bodyArea['body_area_choice'] == true) {
                            $query = "insert into stellarhse_incident.impact_injury_body_area "
                                    . "(injury_id,body_area_id) values (:injury_id,:body_area_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":injury_id", $incident_injury_id);
                            $stmt->bindParam(":body_area_id", $bodyArea['body_area_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                } else if ($impact['impact_type_code'] === 'SpillRelease') {
                    $incident_spill_release_id = Utils::getUUID($db);
                    $individuals = $impact['individuals'];
                    
                    $incident_impact_custom_id = $incident_spill_release_id;
                    $query = "insert into stellarhse_incident.incident_spill_release "
                            . "(incident_spill_release_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . "primary_responder_id,primary_responder_name,estimated_cost,spill_release_source_id,duration_value,"
                            . "duration_unit_id,quantity_value,quantity_unit_id,quantity_recovered_value,quantity_recovered_unit_id,"
                            . "what_was_spill_release,how_spill_release_occur,is_reportable,spill_release_agency_id)"
                            . " values "
                            . "(:incident_spill_release_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . ":primary_responder_id,:primary_responder_name,:estimated_cost,:spill_release_source_id,:duration_value,"
                            . ":duration_unit_id,:quantity_value,:quantity_unit_id,:quantity_recovered_value,:quantity_recovered_unit_id,"
                            . ":what_was_spill_release,:how_spill_release_occur,:is_reportable,:spill_release_agency_id)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_spill_release_id", $incident_spill_release_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else
                        //return $this->response->withJson('Please choose impact type and subtype');
                        $stmt->bindParam(":impact_sub_type_id", null);
                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $estimated_cost = floatval($impact['estimated_cost']);
                    $stmt->bindParam(":estimated_cost", $estimated_cost);
                    if (isset($impact['spillRelease']['spill_release_source_id']) && $impact['spillRelease']['spill_release_source_id'] !== null && $impact['spillRelease']['spill_release_source_id'] !== '')
                        $stmt->bindParam(":spill_release_source_id", $impact['spillRelease']['spill_release_source_id']);
                    else
                        $stmt->bindValue(":spill_release_source_id", NULL);
                    $duration_value  = floatval($impact['spillRelease']['duration_value']);
                    $stmt->bindParam(":duration_value", $duration_value  );
                    if (isset($impact['spillRelease']['duration_unit_id']) && $impact['spillRelease']['duration_unit_id'] !== null && $impact['spillRelease']['duration_unit_id'] !== '')
                        $stmt->bindParam(":duration_unit_id", $impact['spillRelease']['duration_unit_id']);
                    else
                        $stmt->bindValue(":duration_unit_id", NULL);
                    $quantity_value = floatval($impact['spillRelease']['quantity_value']);
                    $stmt->bindParam(":quantity_value", $quantity_value);
                    if (isset($impact['spillRelease']['quantity_unit_id']) && $impact['spillRelease']['quantity_unit_id'] !== null && $impact['spillRelease']['quantity_unit_id'] !== '')
                        $stmt->bindParam(":quantity_unit_id", $impact['spillRelease']['quantity_unit_id']);
                    else
                        $stmt->bindValue(":quantity_unit_id", NULL);
                    $stmt->bindParam(":quantity_recovered_value", floatval($impact['spillRelease']['quantity_recovered_value']));
                    if (isset($impact['spillRelease']['quantity_recovered_unit_id']) && $impact['spillRelease']['quantity_recovered_unit_id'] !== null && $impact['spillRelease']['quantity_recovered_unit_id'] !== '')
                        $stmt->bindParam(":quantity_recovered_unit_id", $impact['spillRelease']['quantity_recovered_unit_id']);
                    else
                        $stmt->bindValue(":quantity_recovered_unit_id", NULL);
                    $stmt->bindParam(":what_was_spill_release", $impact['spillRelease']['what_was_spill_release']);
                    $stmt->bindParam(":how_spill_release_occur", $impact['spillRelease']['how_spill_release_occur']);
                    if ($impact['spillRelease']['is_reportable'] == '1')
                        $stmt->bindValue(":is_reportable", 1, PDO::PARAM_INT);
                    else
                        $stmt->bindValue(":is_reportable", 0, PDO::PARAM_INT);
                    if (isset($impact['spillRelease']['spill_release_agency_id']) && $impact['spillRelease']['spill_release_agency_id'] !== null && $impact['spillRelease']['spill_release_agency_id'] !== '')
                        $stmt->bindParam(":spill_release_agency_id", $impact['spillRelease']['spill_release_agency_id']);
                    else
                        $stmt->bindValue(":spill_release_agency_id", NULL);
                    $stmt->execute();
                    $result = $stmt->rowCount();


                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,spill_release_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:spill_release_id,:ext_agency_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":spill_release_id", $incident_spill_release_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                } else if ($impact['impact_type_code'] === 'VehicleDamage') {
                    $incident_vehicle_damage_id = Utils::getUUID($db);
                    $individuals = $impact['individuals'];
                    
                    $incident_impact_custom_id = $incident_vehicle_damage_id;
                    $query = "insert into stellarhse_incident.incident_vehicle_damage "
                            . "(incident_vehicle_damage_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . "primary_responder_id,primary_responder_name,estimated_cost,driver_id,driver_name,driver_licence,"
                            . "vehicle_type_id,vehicle_licence,how_did_that_occur,damage_description)"
                            . " values "
                            . "(:incident_vehicle_damage_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . ":primary_responder_id,:primary_responder_name,:estimated_cost,:driver_id,:driver_name,:driver_licence,"
                            . ":vehicle_type_id,:vehicle_licence,:how_did_that_occur,:damage_description)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_vehicle_damage_id", $incident_vehicle_damage_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else
                       // return $this->response->withJson('Please choose impact type and subtype');
                        $stmt->bindParam(":impact_sub_type_id", null);
                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $stmt->bindParam(":estimated_cost", floatval($impact['estimated_cost']));
                    if (isset($impact['vehicleDamage']['driver']['employee_id']) && $impact['vehicleDamage']['driver']['employee_id'] !== null && $impact['vehicleDamage']['driver']['employee_id'] !== '')
                        $stmt->bindParam(":driver_id", $impact['vehicleDamage']['driver']['employee_id']);
                    else
                        $stmt->bindValue(":driver_id", NULL);
                    $stmt->bindParam(":driver_name", $impact['vehicleDamage']['driver']['full_name']);
                    $stmt->bindParam(":driver_licence", $impact['vehicleDamage']['driver_licence']);
                    if (isset($impact['vehicleDamage']['vehicle_type_id']) && $impact['vehicleDamage']['vehicle_type_id'] !== null && $impact['vehicleDamage']['vehicle_type_id'] !== '')
                        $stmt->bindParam(":vehicle_type_id", $impact['vehicleDamage']['vehicle_type_id']);
                    else
                        $stmt->bindValue(":vehicle_type_id", NULL);
                    $stmt->bindParam(":vehicle_licence", $impact['vehicleDamage']['vehicle_licence']);
                    $stmt->bindParam(":how_did_that_occur", $impact['vehicleDamage']['how_did_that_occur']);
                    $stmt->bindParam(":damage_description", $impact['vehicleDamage']['damage_description']);
                    $stmt->execute();
                    $result = $stmt->rowCount();


                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,vehicle_damage_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:vehicle_damage_id,:ext_agency_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":vehicle_damage_id", $incident_vehicle_damage_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                } else if ($impact['impact_type_code'] === 'TrafficViolation') {
                    $incident_traffic_violation_id = Utils::getUUID($db);
                    
                    $incident_impact_custom_id = $incident_traffic_violation_id;
                    $individuals = $impact['individuals'];
                    $query = "insert into stellarhse_incident.incident_traffic_violation "
                            . "(incident_traffic_violation_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . "primary_responder_id,primary_responder_name,estimated_cost,driver_id,driver_name,driver_licence,"
                            . "vehicle_type_id,vehicle_licence,value_of_fine,ticket_number,how_did_that_occur,damage_description)"
                            . " values "
                            . "(:incident_traffic_violation_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . ":primary_responder_id,:primary_responder_name,:estimated_cost,:driver_id,:driver_name,:driver_licence,"
                            . ":vehicle_type_id,:vehicle_licence,:value_of_fine,:ticket_number,:how_did_that_occur,:damage_description)";

                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_traffic_violation_id", $incident_traffic_violation_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else
                        //return $this->response->withJson('Please choose impact type and subtype');
                        $stmt->bindParam(":impact_sub_type_id", null);
                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $stmt->bindParam(":estimated_cost", floatval($impact['estimated_cost']));
                    if (isset($impact['trafficViolation']['driver']['employee_id']) && $impact['trafficViolation']['driver']['employee_id'] !== null && $impact['trafficViolation']['driver']['employee_id'] !== '')
                        $stmt->bindParam(":driver_id", $impact['trafficViolation']['driver']['employee_id']);
                    else
                        $stmt->bindValue(":driver_id", NULL);
                    $stmt->bindParam(":driver_name", $impact['trafficViolation']['driver']['full_name']);
                    $stmt->bindParam(":driver_licence", $impact['trafficViolation']['driver_licence']);
                    if (isset($impact['vehicleDamage']['vehicle_type_id']) && $impact['vehicleDamage']['vehicle_type_id'] !== null && $impact['vehicleDamage']['vehicle_type_id'] !== '')
                        $stmt->bindParam(":vehicle_type_id", $impact['trafficViolation']['vehicle_type_id']);
                    else
                        $stmt->bindValue(":vehicle_type_id", NULL);
                    $stmt->bindParam(":vehicle_licence", $impact['trafficViolation']['vehicle_licence']);
                    $stmt->bindParam(":value_of_fine", floatval($impact['trafficViolation']['value_of_fine']));
                    $stmt->bindParam(":ticket_number", $impact['trafficViolation']['ticket_number']);
                    $stmt->bindParam(":how_did_that_occur", $impact['trafficViolation']['how_did_that_occur']);
                    $stmt->bindParam(":damage_description", $impact['trafficViolation']['damage_description']);
                    $stmt->execute();
                    $result = $stmt->rowCount();


                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,traffic_violation_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:traffic_violation_id,:ext_agency_id)";

                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":traffic_violation_id", $incident_traffic_violation_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);
                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                } else {
                    $incident_impact_id = Utils::getUUID($db);
                    $individuals = $impact['individuals'];
                    
                    $incident_impact_custom_id = $incident_impact_id;
                    $query = "insert into stellarhse_incident.incident_impact "
                            . "(incident_impact_id,incident_id,impact_sub_type_id,impact_description,initial_employee_id1,initial_employee_name1,initial_employee_dept1,"
                            . "initial_employee_id2,initial_employee_name2,initial_employee_dept2,initial_employee_id3,initial_employee_name3,initial_employee_dept3,"
                            . " primary_responder_id,primary_responder_name,estimated_cost)"
                            . " values "
                            . "(:incident_impact_id,:incident_id,:impact_sub_type_id,:impact_description,:initial_employee_id1,:initial_employee_name1,:initial_employee_dept1,"
                            . ":initial_employee_id2,:initial_employee_name2,:initial_employee_dept2,:initial_employee_id3,:initial_employee_name3,:initial_employee_dept3,"
                            . " :primary_responder_id,:primary_responder_name,:estimated_cost)";


                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":incident_impact_id", $incident_impact_id);
                    $stmt->bindParam(":incident_id", $incident_id);
                    if (isset($impact['impact_sub_type_id']) && $impact['impact_sub_type_id'] !== null && $impact['impact_sub_type_id'] !== '')
                        $stmt->bindParam(":impact_sub_type_id", $impact['impact_sub_type_id']);
                    else{
                        //return $this->response->withJson('Please choose impact type and subtype');
                        $impact_sub_type_id = null;
                        $stmt->bindParam(":impact_sub_type_id", $impact_sub_type_id);
                       // var_dump($impact_sub_type_id);exit;
                    }

                    $stmt->bindParam(":impact_description", $impact['impact_description']);
                    if (isset($individuals[1]['employee_id']) && $individuals[1]['employee_id'] !== null && $individuals[1]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id1", $individuals[1]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id1", NULL);
                    $stmt->bindParam(":initial_employee_name1", $individuals[1]['full_name']);
                    $stmt->bindParam(":initial_employee_dept1", $individuals[1]['department']);
                    if (isset($individuals[2]['employee_id']) && $individuals[2]['employee_id'] !== null && $individuals[2]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id2", $individuals[2]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id2", NULL);
                    $stmt->bindParam(":initial_employee_name2", $individuals[2]['full_name']);
                    $stmt->bindParam(":initial_employee_dept2", $individuals[2]['department']);
                    if (isset($individuals[3]['employee_id']) && $individuals[3]['employee_id'] !== null && $individuals[3]['employee_id'] !== '')
                        $stmt->bindParam(":initial_employee_id3", $individuals[3]['employee_id']);
                    else
                        $stmt->bindValue(":initial_employee_id3", NULL);
                    $stmt->bindParam(":initial_employee_name3", $individuals[3]['full_name']);
                    $stmt->bindParam(":initial_employee_dept3", $individuals[3]['department']);
                    if (isset($impact['primary_responser']['employee_id']) && $impact['primary_responser']['employee_id'] !== null && $impact['primary_responser']['employee_id'] !== '')
                        $stmt->bindParam(":primary_responder_id", $impact['primary_responser']['employee_id']);
                    else
                        $stmt->bindValue(":primary_responder_id", NULL);
                    $stmt->bindParam(":primary_responder_name", $impact['primary_responser']['full_name']);
                    $estimated_cost = floatval($impact['estimated_cost']);
                    $stmt->bindParam(":estimated_cost", $estimated_cost);
                    //                    $stmt->bindValue(":editing_by", NULL);
                    //                    $stmt->bindValue(":hide", 0);
                    $stmt->execute();
                    $result = $stmt->rowCount();

                    foreach ($impact['externalAgencies'] as $agency) {
                        if (isset($agency['agency_choice']) && $agency['agency_choice'] == true) {
                            $impacts_ext_agency_id = Utils::getUUID($db);
                            $query = "insert into stellarhse_incident.impacts_ext_agency "
                                    . "(impacts_ext_agency_id,impact_id,ext_agency_id)"
                                    . " values "
                                    . "(:impacts_ext_agency_id,:impact_id,:ext_agency_id)";


                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":impacts_ext_agency_id", $impacts_ext_agency_id);
                            $stmt->bindParam(":impact_id", $incident_impact_id);
                            $stmt->bindParam(":ext_agency_id", $agency['ext_agency_id']);

                            $stmt->execute();
                            $result = $stmt->rowCount();
                        }
                    }
                }
            }
            $impact_custom = $impact['impactCustomField'];
            if ($impact_custom){
                AddCustomFieldValues($db, $incident_id, $impact_custom,'ABCanTrack','Impacts',$incident_impact_custom_id);
            } 
        }


            $correctiveActions = $data['correctiveActions'];
            foreach ($correctiveActions as $action) {
                $incident_corrective_action_id = Utils::getUUID($db);
                $start_date = $action['start_date'];
                $action_start_date = (isset($start_date) && $start_date != 'undefined' && $start_date != "") ? Utils::formatMySqlDate($start_date) : null;

                $target_end_date = $action['target_end_date'];
                $action_target_end_date = (isset($target_end_date) && $target_end_date != 'undefined' && $target_end_date != "") ? Utils::formatMySqlDate($target_end_date) : null;

                $actual_end_date = $action['actual_end_date'];
                $action_actual_end_date = (isset($actual_end_date) && $actual_end_date != 'undefined' && $actual_end_date != "") ? Utils::formatMySqlDate($actual_end_date) : null;

                $query = "insert into stellarhse_incident.incident_corrective_action "
                        . "(incident_corrective_action_id,incident_id,corrective_action_status_id,corrective_action_priority_id,assigned_to_id,supervisor,supervisor_notify,start_date,target_end_date,"
                        . "actual_end_date,estimated_cost,actual_cost,task_description,out_come_follow_up,desired_results,comments,original_corrective_action_id)"
                        . " values "
                        . "(:incident_corrective_action_id,:incident_id,:corrective_action_status_id,:corrective_action_priority_id,:assigned_to_id,:supervisor,:supervisor_notify,:start_date,:target_end_date,"
                        . ":actual_end_date,:estimated_cost,:actual_cost,:task_description,:out_come_follow_up,:desired_results,:comments,:original_corrective_action_id)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":incident_corrective_action_id", $incident_corrective_action_id);
                $stmt->bindParam(":incident_id", $incident_id);
                $stmt->bindParam(":corrective_action_status_id", $action['corrective_action_status_id']);
                if (isset($action['corrective_action_priority_id']) && $action['corrective_action_priority_id'] !== null && $action['corrective_action_priority_id'] !== '')
                        $stmt->bindParam(":corrective_action_priority_id", $action['corrective_action_priority_id']);
                    else
                        $stmt->bindValue(":corrective_action_priority_id", null);
                $stmt->bindParam(":assigned_to_id", $action['assigned_to']['employee_id']);
                $stmt->bindParam(":supervisor", $action['assigned_to']['supervisor_name']);
                if ($action['supervisor_notify'])
                    $stmt->bindValue(":supervisor_notify", 1, PDO::PARAM_INT);
                else
                    $stmt->bindValue(":supervisor_notify", 0, PDO::PARAM_INT);
                $stmt->bindParam(":start_date", $action_start_date);
                $stmt->bindParam(":target_end_date", $action_target_end_date);
                $stmt->bindParam(":actual_end_date", $action_actual_end_date);
                $estimated_cost = floatval($action['estimated_cost']);
                $stmt->bindParam(":estimated_cost", $estimated_cost);
                $actual_cost = floatval($action['actual_cost']);
                $stmt->bindParam(":actual_cost", $actual_cost);
                $stmt->bindParam(":task_description", $action['task_description']);
                $stmt->bindParam(":out_come_follow_up", $action['out_come_follow_up']);
                if ($action['desired_results'] == '1')
                    $stmt->bindValue(":desired_results", 1, PDO::PARAM_INT);
                else
                    $stmt->bindValue(":desired_results", 0, PDO::PARAM_INT);
                $stmt->bindParam(":comments", $action['comments']);
                if(isset($action['original_corrective_action_id']) && $action['original_corrective_action_id'] !='' && $action['original_corrective_action_id']!=NULL){
                    $stmt->bindParam(":original_corrective_action_id", $action['original_corrective_action_id']);
                }else{
                    $stmt->bindParam(":original_corrective_action_id", $incident_corrective_action_id);
                }
                $stmt->execute();
                $result = $stmt->rowCount();

                foreach ($action['notified_to'] as $notify) {
                    if (isset($notify['employee_id'])) {
                        $query = "insert into stellarhse_incident.incident_corrective_action_notified "
                                . "(incident_corrective_action_id,notified_id) "
                                . "values (:incident_corrective_action_id,:notified_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":incident_corrective_action_id", $incident_corrective_action_id);
                        $stmt->bindParam(":notified_id", $notify['employee_id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    } else if (isset($notify['notified_id'])) {
                        $query = "insert into stellarhse_incident.incident_corrective_action_notified "
                                . "(incident_corrective_action_id,notified_id) "
                                . "values (:incident_corrective_action_id,:notified_id)";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":incident_corrective_action_id", $incident_corrective_action_id);
                        $stmt->bindParam(":notified_id", $notify['notified_id']);
                        $stmt->execute();
                        $result = $stmt->rowCount();
                    }
                }
                
                $action_custom = $action['actionCustomField'];
                if ($action_custom){
                    AddCustomFieldValues($db, $incident_id, $action_custom,'ABCanTrack','Actions',$incident_corrective_action_id);
                }
            }

            // }
            $db->commit();
            
            AddCustomFieldValues($db, $incident_id, $data['whatCustomField'],'ABCanTrack','ABCanTrack','');
            AddCustomFieldValues($db, $incident_id, $data['observationCustomField'],'ABCanTrack','ABCanTrack','');
            AddCustomFieldValues($db, $incident_id, $data['analysisCustomField'],'ABCanTrack','ABCanTrack','');
            AddCustomFieldValues($db, $incident_id, $data['investigationCustomField'],'ABCanTrack','ABCanTrack','');
            
            if($data['process_type'] === 'add'){
                $res = InsertIntoIncidentHistory($db,$incident_id,$data['clientTimeZoneOffset'],$data['creator_id'],$data['process_type']);

                sleep(1);
                $version_number =1;
                $hist_incident_id = GetHistIncidentData($db, $data['org_id'], $incident_number,$version_number);
                AddReportFile('incident', $hist_incident_id,$data['org_id'], $incident_number,$version_number,$db);
            }


            if($data['process_type'] === 'edit'){
                $data['process_type'] = 'update';
                $res = InsertIntoIncidentHistory($db,$incident_id,$data['clientTimeZoneOffset'],$data['modifier_id'],$data['process_type']);
                sleep(1);
                $hist_incident_id = GetHistIncidentData($db, $data['org_id'], $incident_number,$version_number);
                AddReportFile('incident', $hist_incident_id,$data['org_id'], $incident_number,$version_number,$db);
            }
            
            // finish the submitting request & process the rest of this function in the background sodecrease consuming time for the user
                fastcgi_finish_request();
                if ($data['process_type'] === 'add' || $data['notify'] === 'notify') {
                    $report_values = GetIncidentFieldsValues($db,$incident_id,$data['org_id']);
    //                    print_r($report_values);
                    $query = "SELECT subject,`body` FROM stellarhse_incident.email_template where org_id = :org_id order by `order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':org_id', $data['org_id']);
                    $stmt->execute();
                    $templates = $stmt->fetchAll(PDO::FETCH_OBJ);
                    if($data['notify'] === 'notify')
                        $templates[1]->subject = "Incident Report #".$data['report_number']." has been updated";
                        // sending report emails
    //                SendWhoIdentifiedEmail($db, 'stellarhse_incident', $data, $report_values, $templates[0]);
                    if($data['process_type'] === 'add')
                        SendCorrectiveActionEmail($db, 'stellarhse_incident', $data, $report_values, $correctiveActions, $templates[0]);
                    SendNotificationEmail($db, 'stellarhse_incident',$data,$report_values, $templates[1]);
                }
           return $this->response->withJson(1);


        } catch (Exception $ex) {
            return $this->response->withJson($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
        }
    });
    
    $app->post('/saveIncidentCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $user_id = $data['user_id'];
            
            // what tab
            $what_incident_custom = $data['what_incident'];
            $what_incident_tab = GetIncidentSubTabId($db, 'whathappened', $language_id);
            $all_what_fields = [];
            for ($i = 0; $i < count($what_incident_custom); $i++) {
                if (isset($what_incident_custom[$i]["id"]) && $what_incident_custom[$i]["id"] != NULL) {
                    array_push($all_what_fields, $what_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_what_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $what_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            // details Tab
            $impact_incident_custom = $data['impact_incident'];
            $impacts_incident_tab = GetIncidentSubTabId($db, 'impacts', $language_id);
            $all_details_fields = [];
            for ($i = 0; $i < count($impact_incident_custom); $i++) {
                if (isset($impact_incident_custom[$i]["id"]) && $impact_incident_custom[$i]["id"] != NULL) {
                    array_push($all_details_fields, $impact_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_details_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $impacts_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            
            // people Tab
            $people_incident_custom = $data['people_incident'];
            $people_incident_tab = GetIncidentSubTabId($db, 'people', $language_id);
            $all_people_fields = [];
            for ($i = 0; $i < count($people_incident_custom); $i++) {
                if (isset($people_incident_custom[$i]["id"]) && $people_incident_custom[$i]["id"] != NULL) {
                    array_push($all_people_fields, $people_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_people_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $people_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            
            // action Tab
            $action_incident_custom = $data['action_incident'];
            $action_incident_tab = GetIncidentSubTabId($db, 'actions', $language_id);
            $all_action_fields = [];
            for ($i = 0; $i < count($action_incident_custom); $i++) {
                if (isset($action_incident_custom[$i]["id"]) && $action_incident_custom[$i]["id"] != NULL) {
                    array_push($all_action_fields, $action_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_action_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $action_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            // analysis Tab
            $analysis_incident_custom = $data['analysis_incident'];
            $analysis_incident_tab = GetIncidentSubTabId($db, 'scatanalysis', $language_id);
            $all_analysis_fields = [];
            for ($i = 0; $i < count($analysis_incident_custom); $i++) {
                if (isset($analysis_incident_custom[$i]["id"]) && $analysis_incident_custom[$i]["id"] != NULL) {
                    array_push($all_analysis_fields, $analysis_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_analysis_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $analysis_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            
            // observation Tab
            $observation_incident_custom = $data['observation_incident'];
            $observation_incident_tab = GetIncidentSubTabId($db, 'observation', $language_id);
            $all_observation_fields = [];
            for ($i = 0; $i < count($observation_incident_custom); $i++) {
                if (isset($observation_incident_custom[$i]["id"]) && $observation_incident_custom[$i]["id"] != NULL) {
                    array_push($all_observation_fields, $observation_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_observation_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $observation_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            // investigation Tab
            $investigation_incident_custom = $data['investigation_incident'];
            $investigation_incident_tab = GetIncidentSubTabId($db, 'investigation', $language_id);
            $all_investigation_fields = [];
            for ($i = 0; $i < count($investigation_incident_custom); $i++) {
                if (isset($investigation_incident_custom[$i]["id"]) && $investigation_incident_custom[$i]["id"] != NULL) {
                    array_push($all_investigation_fields, $investigation_incident_custom[$i]["id"]);
                }
            }
            $fields_array = '("' . implode('", "', $all_investigation_fields) . '")';
            $query_delete_fields = "select field_id from stellarhse_incident.`field`  where language_id=:language_id and org_id=:org_id and sub_tab_id =:sub_tab_id and field_id NOT IN $fields_array";
            $stmt_delete_fields = $db->prepare($query_delete_fields);
            $stmt_delete_fields->bindParam(":language_id", $language_id);
            $stmt_delete_fields->bindParam(":org_id", $org_id);
            $stmt_delete_fields->bindParam(":sub_tab_id", $investigation_incident_tab);
            $stmt_delete_fields->execute();
            $res = $stmt_delete_fields->fetchAll(PDO::FETCH_OBJ);
            if ($res != NUll) {
                DeleteIncidentCustomField($db, $res);
            }
            
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $what_incident_tab,'WhatHappened', $what_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $impacts_incident_tab,'impacts', $impact_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $people_incident_tab,'people', $people_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $action_incident_tab,'actions', $action_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $analysis_incident_tab,'scatanalysis', $analysis_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $observation_incident_tab,'observation', $observation_incident_custom);
            AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $investigation_incident_tab,'investigation', $investigation_incident_custom);
            
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });

    
    $app->post('/getIncidentTabCustomFields', function($request, $response, $args) {
        $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $language_id = $data['language_id'];
            $org_id = $data['org_id'];
            $sub_tab_name = $data['tab_name'];
            $sub_tab_id = GetIncidentSubTabId($db, $sub_tab_name, $language_id);
            $query = "SELECT * FROM stellarhse_incident.field where org_id =:org_id and language_id=:language_id and sub_tab_id=:sub_tab_id order by `order` asc";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id', $org_id);
            $stmt->bindParam(':language_id', $language_id);
            $stmt->bindParam(':sub_tab_id', $sub_tab_id);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
            $customs = [];
            foreach ($result as $key => $custom_field) {

                $component = GetIncidentFieldTypeName($db, $custom_field->field_type_id, $language_id);
                if ($custom_field->is_mandatory == 1) {
                    $IsMandatory = true;
                } else {
                    $IsMandatory = false;
                }
                $query2 = "select option_id ,option_name  from stellarhse_incident.`option` where field_id=:field_id";
                $stmt2 = $db->prepare($query2);
                $stmt2->bindParam(':field_id', $custom_field->field_id);
                $stmt2->execute();
                $result2 = $stmt2->fetchAll(PDO::FETCH_OBJ);

                if ($result2 != NULL) {
                    $options = [];
                    foreach ($result2 as $option) {
                        array_push($options, $option->option_name);
                    }

                    $field = [
                        'id' => $custom_field->field_id,
                        'component' => $component,
                        'label' => $custom_field->default_field_label,
                        'description' => $custom_field->default_help_me_description,
                        'placeholder' => $custom_field->default_help_me_name,
                        'options' => $options,
                        required => $IsMandatory
                    ];
                } else {
                    $options_array = [];
                    $field = [
                        'id' => $custom_field->field_id,
                        'component' => $component,
                        'label' => $custom_field->default_field_label,
                        'description' => $custom_field->default_help_me_description,
                        'placeholder' => $custom_field->default_help_me_name,
                        'options' => $options_array,
                        required => $IsMandatory
                    ];
                }
                array_push($customs, $field);
            }
            return $this->response->withJson($customs);
        } catch (Exception $ex) {
            return $this->response->withJson($ex->errorInfo);
        }
    });
    
    

    function getIncidentData($db, $data) {
        try {
            $query = "call stellarhse_incident.incident_reload_data(:report_number,:org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_number", $data['report_number']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
            $stmt->nextRowSet();
            $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->equipment_involved = $stmt->fetchAll(PDO::FETCH_OBJ);
                        /*            $stmt->nextRowSet();

            $result->risk_levels = $stmt->fetchAll(PDO::FETCH_OBJ)[0];*/
            $stmt->nextRowSet();
            $result->envConditions = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->oeDepartments = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->risk_controls = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);

            $stmt->nextRowSet();
            $result->incidentCauses = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
            $result->observation_analysis = $stmt->fetchAll(PDO::FETCH_OBJ);
            $stmt->nextRowSet();
    //            $result->investigators = $stmt->fetchAll(PDO::FETCH_OBJ);
    //            $stmt->nextRowSet();
            $result->invRootCauses = $stmt->fetchAll(PDO::FETCH_OBJ);

            $incidentImpactTypes = array();
            $query = "call stellarhse_incident.impact_reload_data(:report_number,:org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":report_number", $data['report_number']);
            $stmt->bindParam(":org_id", $data['org_id']);
            $stmt->execute();
            $i = 0;
            while ($stmt->columnCount()) {
                $incidentImpactTypes[$i] = $stmt->fetchAll(\PDO::FETCH_OBJ)[0];
                $i++;
                $stmt->nextRowset();
            }
            $result->incidentImpactTypes = $incidentImpactTypes;
            return $result;
        } catch (Exception $ex) {
            return $ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage();
        }
    }
    

});

function GetIncidentVersion($db, $data){
    $query2 = "select max(version_number) from stellarhse_incident.incident where incident_number = :incident_number";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":incident_number", $data['report_number']);
    $stmt2->execute();
    $version_number = $stmt2->fetchColumn();
    return $version_number;
}

function GetIncidentIdByNumber($db, $data){
    $query2 = "select distinct incident_id as report_id from stellarhse_incident.incident where incident_number = :incident_number and org_id= :org_id   ORDER BY last_update_date desc limit  1";
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":incident_number", $data['report_number']);
    $stmt2->bindParam(":org_id", $data['org_id']);
    $stmt2->execute();
    $report_id = $stmt2->fetchColumn();
    return $report_id;
}

function sp_update_version_file_manager_incident($db, $report_id,$clientTimeZoneOffset,$edit_by){
    $query = "call stellarhse_incident.sp_update_version_file_manager(:report_id,:clientTimeZoneOffset,:edit_by,'update');";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":report_id", $report_id);
    $stmt->bindParam(":clientTimeZoneOffset", $clientTimeZoneOffset);
    $stmt->bindParam(":edit_by", $edit_by);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $result;
}

function GetHistIncidentData($db, $org_id,$incident_number,$version_number){
    $query = "select hist_incident_id from stellarhse_incident.hist_incident where org_id=:org_id and incident_number=:incident_number and version_number=:version_number";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":org_id", $org_id);
    $stmt->bindParam(":incident_number", $incident_number);
    $stmt->bindParam(":version_number", $version_number);
    $stmt->execute();
    $hist_incident_id = $stmt->fetchColumn();
    return $hist_incident_id;
}

function GetIncidentFieldsValues($db,$incident_id,$org_id){
    try{
        $query = "call stellarhse_incident.emails_data(:incident_id, :org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':incident_id', $incident_id);
        $stmt->bindParam(':org_id', $org_id);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $stmt->nextRowSet();
        $result->report_third_party = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->equipment_involved = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->risk_levels = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->envConditions = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->oeDepartments = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->risk_controls = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->peopleInvolved = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActions = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->correctiveActionsNotified = $stmt->fetchAll(PDO::FETCH_OBJ);

        $stmt->nextRowSet();
        $result->incidentCauses = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->observation_analysis = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->invRootCauses = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->customFields = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->attachments = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $incidentImpactTypes = array();
        $query = "call stellarhse_incident.impact_email_data(:incident_id,:org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':incident_id', $incident_id);
        $stmt->bindParam(":org_id", $data['org_id']);
        $stmt->execute();
        $i = 0;
        while ($stmt->columnCount()) {
            $incidentImpactTypes[$i] = $stmt->fetchAll(\PDO::FETCH_OBJ)[0];
            $i++;
            $stmt->nextRowset();
        }
        $result->incidentImpactTypes = $incidentImpactTypes;
        return $result;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function InsertIntoIncidentHistory($db,$incident_id,$client_timezone,$updated_by_id,$operation_type){
    try{
        $query = "call stellarhse_incident.sp_move_incident_to_hist(:incident_id, :client_timezone, :updated_by_id, :operation_type)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':incident_id', $incident_id);
        $stmt->bindParam(':client_timezone', $client_timezone);
        $stmt->bindParam(':updated_by_id', $updated_by_id);
        $stmt->bindParam(':operation_type', $operation_type);
        $stmt->execute();
        $result = $stmt->rowCount();
        return $result;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function ReplaceIncidentCorrectiveActionsParamters($db,$report_data, $report_values, $ca, $index){
    try{
        $corrective_action_replace = '
            <ul style="list-style-type: circle;">
                <li>Report Number: $incident_number</li>
                <li>Event type : $incident_type_name</li>
                <li>Date: $incident_date</li>
            ';
        $corrective_action_replace = str_replace("$" . "incident_number", $report_data['report_number'].'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "incident_type_name", $report_values->event_type_id.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "incident_date", $report_values->date.'<br/>', $corrective_action_replace);
        
        $action_custom = new stdClass();
        // Custom fields
        foreach($report_values->customFields as $key=>$value){
            if(strpos($value->field_name, 'actions') === 0)
                $action_custom->{$value->field_name} = $value->field_value;
        }
        
        $query = "select of.field_label, f.table_field_name, f.field_name,
            CASE `f`.`is_custom` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END as `is_custom` from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id and f.language_id = :language_id and f.field_type_id <> (select field_type_id from field_type where field_type_code = 'Subheading' and language_id = :language_id) order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam('org_id',$report_data['org_id']);
        $stmt->bindParam('language_id',$report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        foreach($res as $key2=>$f){
            if($f->field_name === 'notified_id'){
                $notifiedNames = '';
                foreach ($ca['notified_to'] as $notify) {
                    $notifiedNames .= $notify['full_name'] . ',';
                }
                $corrective_action_replace .= "<li>".$f->field_label." ".$notifiedNames."</li>";
            }else{
                if($f->is_custom === 'Yes')
                    $corrective_action_replace .= "<li>".$f->field_label . " " . $action_custom->{$f->field_name} . "</li>";
                else 
                if(isset($report_values->correctiveActions[$index]->{$f->table_field_name}))
                    $corrective_action_replace .=  "<li>".$f->field_label." ".$report_values->correctiveActions[$index]->{$f->table_field_name}."</li>";
                else
                    $corrective_action_replace .=  "<li>".$f->field_label." </li>";
            }
        }
        $corrective_action_replace .= ' </ul>';
        return $corrective_action_replace;
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
//    }
}

function InsertIntoIncidentEmailLog($db, $email_log_id, $report_data){
    try{
        $query = "INSERT INTO stellarhse_incident.`incident_email_log`
                            (email_log_id, hist_incident_id)
                        VALUES (:email_log_id,:hist_incident_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id',$email_log_id);
        $stmt->bindParam(':hist_incident_id',$report_data->hist_report_id);
        $stmt->execute();
        $result = $stmt->rowCount();
    } catch (Exception $ex) {
        throw new Exception($ex->getFile() . ' ' . $ex->getLine() . ' ' . $ex->getMessage());
    }
}

function ReplaceIncidentReportParamters($db, $report_data, $report_values, $email_body, $notification){
    $whoIdentified = $report_data['whoIdentified'];
    $email_body = str_replace("$" . "incident_number", $report_data['report_number'], $email_body);
    $email_body = str_replace("$" . "incident_event_type_name", $report_values->event_type_id, $email_body);
    $email_body = str_replace("$" . "incident_date", $report_values->date, $email_body);
    $email_body = str_replace("$" . "hour", $report_data['report_hour'].':', $email_body);
    $email_body = str_replace("$" . "min", $report_data['report_min'], $email_body);
    $email_body = str_replace("$" . "rep_name", $whoIdentified['full_name'], $email_body);
    $email_body = str_replace("$" . "rep_emp_id", $whoIdentified['emp_id'], $email_body);
    $email_body = str_replace("$" . "rep_position", $whoIdentified['position'], $email_body);
    $email_body = str_replace("$" . "rep_email", $whoIdentified['email'], $email_body);
    $email_body = str_replace("$" . "rep_company", $whoIdentified['org_name'], $email_body);
    $email_body = str_replace("$" . "rep_primary_phone", $whoIdentified['primary_phone'], $email_body);
    $email_body = str_replace("$" . "rep_alternate_phone", $whoIdentified['alternate_phone'], $email_body);
    $email_body = str_replace("$" . "rep_crew", $whoIdentified['crew_name'], $email_body);
    $email_body = str_replace("$" . "rep_department", $whoIdentified['department'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor", $whoIdentified['supervisor_name'], $email_body);
    $email_body = str_replace("$" . "rep_supervisor_notify ", $report_values->rep_supervisor_notify, $email_body);
    $email_body = str_replace("$" . "incident_description", $report_data['report_description'], $email_body);
    if($report_values->cont_cust_name !== '' && $report_values->cont_cust_name !== null){
        if($report_values->sponser_id !== '' && $report_values->sponser_id !== null)
            $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name.', '.$report_values->sponser_id, $email_body);
        else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name.': '.$report_values->cont_cust_name, $email_body);
    }else
        $email_body = str_replace("$" . "metrics_scope_name", $report_values->metrics_scope_name, $email_body);
    
    $email_body = str_replace("$" . "location1_name", $report_values->location1_id, $email_body);
    $email_body = str_replace("$" . "location2_name", $report_values->location2_id, $email_body);
    $email_body = str_replace("$" . "location3_name", $report_values->location3_id, $email_body);
    $email_body = str_replace("$" . "location4_name", $report_values->location4_id, $email_body);
    $email_body = str_replace("$" . "other_location", $report_data['other_location'], $email_body);
    $email_body = str_replace("$" . "crew_name", $report_values->crew_name, $email_body);
    $email_body = str_replace("$" . "department_responsible_name", $report_values->department_responsible_name, $email_body);
//    $email_body = str_replace("$" . "status_name", $report_values->status_id, $email_body);
    $email_body = str_replace("$" . "creator_name", $report_values->creator_name, $email_body);
    $email_body = str_replace("$" . "operation_type_name", $report_values->operation_type_name, $email_body);
    
    $email_body = str_replace("$" . "risk_level_value", $report_values->risk_levels[0]->risk_level_result.'/25', $email_body);
    if($report_data['should_work_stopped'] == 1)
        $email_body = str_replace("$" . "should_work_stopped", 'Yes', $email_body);
    else if($report_data['should_work_stopped'] == 0)
        $email_body = str_replace("$" . "should_work_stopped", 'No', $email_body);
    else
        $email_body = str_replace("$" . "should_work_stopped", '', $email_body);
    
    $people_custom = new stdClass();
    $action_custom = new stdClass();
    // Custom fields
    foreach($report_values->customFields as $key=>$value){
        if(strpos($value->field_name, 'people') === 0)
            $people_custom->{$value->field_name} = $value->field_value;
        else if(strpos($value->field_name, 'actions') === 0)
            $action_custom->{$value->field_name} = $value->field_value;
        else
            $email_body = str_replace('$'.$value->field_name, $value->field_value, $email_body);
    }
    
    // Risk Control part
    $risk_control = '';
    foreach($report_values->risk_controls as $key=>$control){
        $risk_control .= $control->risk_control_id;
        if($key !== count($report_values->risk_controls) - 1)
            $risk_control .= ', ';
    }
    $email_body = str_replace("$" . "risk_control_name", $risk_control, $email_body);
    
    // OE departments part
    $oeDepartments = '';
    foreach($report_values->oeDepartments as $key=>$dept){
        $oeDepartments .= $dept->oe_department_name;
        if($key !== count($report_values->oeDepartments) - 1)
            $oeDepartments .= ', ';
    }
    $email_body = str_replace("$" . "oe_department_name", $oeDepartments, $email_body);
    
    // Env conditions part
    $envConditions = '';
    foreach($report_values->envConditions as $key=>$cond){
        $envConditions .= $cond->env_condition_type.":".$cond->env_condition_sub_type;
        if($key !== count($report_values->envConditions) - 1)
            $envConditions .= ', ';
    }
    $email_body = str_replace("$" . "env_condition_name", $envConditions, $email_body);
    
    $email_body = str_replace("$" . "version_number", $report_data['version_number'], $email_body);
    $email_body = str_replace("$" . "modifier_id", '', $email_body);
    $email_body = str_replace("$" . "env_condition_note", $report_data['env_condition_note'], $email_body);
    $email_body = str_replace("$" . "event_sequence", $report_data['event_sequence'], $email_body);
    $email_body = str_replace("$" . "is_emergency_response", $report_values->is_emergency_response, $email_body);
    
    // Investigation Part
    $email_body = str_replace("$" . "investigation_date", $report_data['investigation_date'], $email_body);
    $email_body = str_replace("$" . "investigator_id1", $report_values->investigator_name1, $email_body);
    $email_body = str_replace("$" . "investigator_id2", $report_values->investigator_name2, $email_body);
    $email_body = str_replace("$" . "investigator_id3", $report_values->investigator_name3, $email_body);
    $email_body = str_replace("$" . "investigation_summary", $report_data['investigation_summary'], $email_body);
    $email_body = str_replace("$" . "investigation_follow_up_note", $report_data['investigation_follow_up_note'], $email_body);
    $email_body = str_replace("$" . "investigation_response_cost", $report_data['investigation_response_cost'], $email_body);
    $email_body = str_replace("$" . "investigation_repair_cost", $report_data['investigation_repair_cost'], $email_body);
    $email_body = str_replace("$" . "investigation_insurance_cost", $report_data['investigation_insurance_cost'], $email_body);
    $email_body = str_replace("$" . "investigation_wcb_cost", $report_data['investigation_wcb_cost'], $email_body);
    $email_body = str_replace("$" . "investigation_other_cost", $report_data['investigation_other_cost'], $email_body);
    $email_body = str_replace("$" . "investigation_total_cost", $report_data['investigation_total_cost'], $email_body);
    $email_body = str_replace("$" . "inv_source_name", $report_values->inv_source_name, $email_body);
    $email_body = str_replace("$" . "investigation_source_details", $report_data['investigation_source_details'], $email_body);
    $email_body = str_replace("$" . "investigation_root_cause_note", $report_data['investigation_root_cause_note'], $email_body);
    $email_body = str_replace("$" . "sign_off_investigator_id", $report_values->sign_off_investigator_id, $email_body);
    $email_body = str_replace("$" . "investigation_sign_off_date", $report_data['investigation_sign_off_date'], $email_body);
    $email_body = str_replace("$" . "risk_of_recurrence_name", $report_values->risk_of_recurrence_name, $email_body);
    $email_body = str_replace("$" . "inv_status_name", $report_values->inv_status_id, $email_body);
    $email_body = str_replace("$" . "severity_name", $report_values->severity_id, $email_body);
    
    // Root Causes part
    $invRootCauses = '';
    foreach($report_values->invRootCauses as $key=>$cause){
        $invRootCauses .= $cause->cause_name.': '.$cause->root_cause_param_names.'<br/>';
    }
    $email_body = str_replace("$" . "root_cause_name", $invRootCauses, $email_body);
    
    // Observation & Analysis Part
    $energy_form = '';
    $underlying_cause = '';
    $sub_action = '';
    $sub_condition = '';
    foreach($report_values->observation_analysis as $key=>$type){
        if($type->observation_and_analysis_code === 'EnergyForm')
            $energy_form .= $type->parent_name.': '.$type->sub_type.'<br/>';
        else if($type->observation_and_analysis_code === 'SubActions')
            $sub_action .= $type->sub_type.'<br/>';
        else if($type->observation_and_analysis_code === 'SubConditions')
            $sub_condition .= $type->sub_type.'<br/>';
        else if($type->observation_and_analysis_code === 'UnderLyingCauses')
            $underlying_cause .= $type->parent_name.': '.$type->sub_type.'<br/>';
    }
    $email_body = str_replace("$" . "observation_and_analysis_param_name_jop", $energy_form, $email_body);
    $email_body = str_replace("$" . "energy_form_note", $report_values->energy_form_note, $email_body);
    $email_body = str_replace("$" . "observation_and_analysis_param_name_action", $sub_action, $email_body);
    $email_body = str_replace("$" . "sub_standard_action_note", $report_values->sub_standard_action_note, $email_body);
    $email_body = str_replace("$" . "observation_and_analysis_param_name_condition", $sub_condition, $email_body);
    $email_body = str_replace("$" . "sub_standard_condition_note", $report_values->sub_standard_condition_note, $email_body);
    $email_body = str_replace("$" . "observation_and_analysis_param_name", $underlying_cause, $email_body);
    $email_body = str_replace("$" . "under_lying_cause_note", $report_values->under_lying_cause_note, $email_body);
    
    // email footer
    $email_body = str_replace("$" . "Site_Url", SITE_URL, $email_body);
    $email_body = str_replace("$" . "Organization_AdminName", $notification[0]->first_name.' '.$notification[0]->last_name, $email_body);
    $email_body = str_replace("$" . "Organization_AdminEmail", $notification[0]->email, $email_body);
    $email_body = str_replace("$" . "Organization_AdminPhone", $notification[0]->primary_phone, $email_body);
    
    // replace people involved block
    $people_index = strpos($email_body, '$PersonInvolved_Start', 0);
    $people_index2 = strpos($email_body, '$PersonInvolved_End', 0);
    if($people_index){
        $body11 = substr($email_body, 0, $people_index);
        $body12 = substr($email_body, $people_index+1, $people_index2-1);
        $body13 = substr($email_body, $people_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$PersonInvolved_End', '', $body13);
        $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'People' and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);

        $people = $report_values->peopleInvolved;
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($people as $key=>$person){
            foreach($res as $key2=>$f){
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $people_custom->{$f->field_name} . "<br/>";
                else if(isset($person->{$f->table_field_name}))
                    $body12 .= $f->field_label . " " . $person->{$f->table_field_name} . "<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                $body12 .=  $f->field_label." ".$person->{$f->table_field_name}."<br/>";
//                if($key === count($res)-1)
//                    $body12 .= "</li>";
            }
            $body12 .=  "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace equipment part
    $equip = $report_values->equipment_involved;
    $equip_index = strpos($email_body, '$Equipment_Start', 0);
    $equip_index2 = strpos($email_body, '$Equipment_End', 0);
    if($equip_index){
        $query = "select of.field_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id where f.field_name = 'equipment_id' and of.org_id = :org_id and f.language_id = :language_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body11 = substr($email_body, 0, $equip_index);
        $body12 = substr($email_body, $equip_index+1, $equip_index2-1);
        $body13 = substr($email_body, $equip_index2);
//        $body12 = str_replace('$PersonInvolved_Start', '', $body12);
        $body13 = str_replace('$Equipment_End', '', $body13);

        $body12 =  $res[0]->field_label." ";
        foreach($equip as $key=>$eq){
            $body12 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace customer part
    $cust = $report_values->report_third_party;
    $cust_index = strpos($email_body, '$Customer_Start', 0);
    $cust_index2 = strpos($email_body, '$Customer_End', 0);
    if($cust_index){
        $body11 = substr($email_body, 0, $cust_index);
        $body12 = substr($email_body, $cust_index+1, $cust_index2-1);
        $body13 = substr($email_body, $cust_index2);
        $body13 = str_replace('$Customer_End', '', $body13);

        $query = "select of.field_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id where (f.field_name = 'customer_id' or f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id and f.language_id = :language_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
        foreach($cust as $key=>$c){
            if($c->third_party_type_code === 'Customer'){
                $body12 .=  $res[0]->field_label." ".$c->third_party."<br/>".$res[1]->field_label.' '.$c->jop_number."<br/>".$res[2]->field_label.' '.$c->contact_name."<br/>";
            }
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace contractor part
    $cont = $report_values->report_third_party;
    $cont_index = strpos($email_body, '$Contractor_Start', 0);
    $cont_index2 = strpos($email_body, '$Contractor_End', 0);
    if($cont_index){
        $body11 = substr($email_body, 0, $cont_index);
        $body12 = substr($email_body, $cont_index+1, $cont_index2-1);
        $body13 = substr($email_body, $cont_index2);
        $body13 = str_replace('$Contractor_End', '', $body13);

        $query = "select of.field_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id where (f.field_name = 'contractor_id' or f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id and f.language_id = :language_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
        foreach($cont as $key=>$c){
            if($c->third_party_type_code === 'Contractor'){
                $body12 .=  $res[0]->field_label." ".$c->third_party."<br/>".$res[1]->field_label.' '.$c->jop_number."<br/>".$res[2]->field_label.' '.$c->contact_name."<br/>";
            }
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace attachments part
    $attachments = $report_values->attachments;
    $attachment_index = strpos($email_body, '$SupportingDocuments_Start', 0);
    $attachment_index2 = strpos($email_body, '$SupportingDocuments_End', 0);
    if($attachment_index){
        $body11 = substr($email_body, 0, $attachment_index);
        $body12 = substr($email_body, $attachment_index+1, $attachment_index2-1);
        $body13 = substr($email_body, $attachment_index2);
        $body13 = str_replace('$SupportingDocuments_End', '', $body13);
        
        $query = "select of.field_label from stellarhse_hazard.org_field of join stellarhse_hazard.field f on of.field_id = f.field_id where (f.field_name = 'attachment_name' or f.field_name = 'attachment_size') and of.org_id = :org_id order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
//        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = '';
//        print_r($attachments);
        foreach($attachments as $key=>$att){
            $body12 .=  $res[0]->field_label." ".$att->attachment_name."<br/>".$res[1]->field_label.' '.$att->attachment_size."<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace corrective action part
    $actions = $report_values->correctiveActions;
    $action_index = strpos($email_body, '$Action_Start', 0);
    $action_index2 = strpos($email_body, '$Action_End', 0);
    if($action_index){
        $body11 = substr($email_body, 0, $action_index);
        $body12 = substr($email_body, $action_index+1, $action_index2-1);
        $body13 = substr($email_body, $action_index2);
        $body13 = str_replace('$Action_End', '', $body13);

        $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($actions as $key=>$action){
            foreach($res as $key2=>$f){
                if($f->is_custom === 'Yes')
                    $body12 .= $f->field_label . " " . $action_custom->{$f->field_name} . "<br/>";
                else if(isset($action->{$f->table_field_name}))
                    $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
                else
                    $body12 .= $f->field_label . " <br/>";
//                $body12 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
//                        if($key === count($res)-1)
//                            $body1 .= "</li>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    
    // replace SCAT part
    $scat_causes = $report_values->incidentCauses;
    $cause_index = strpos($email_body, '$Cause_Start', 0);
    $cause_index2 = strpos($email_body, '$Cause_End', 0);
    if($cause_index){
        $body11 = substr($email_body, 0, $cause_index);
        $body12 = substr($email_body, $cause_index+1, $cause_index2-1);
        $body13 = substr($email_body, $cause_index2);
        $body13 = str_replace('$Cause_End', '', $body13);

        $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'SCATAnalysis' and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':org_id',$report_data['org_id']);
        $stmt->bindParam(":language_id", $report_data['language_id']);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        
        $body12 = $res[0]->sub_tab_label."<br/>";
        foreach($scat_causes as $key=>$cause){
            foreach($res as $key2=>$f){
                $body12 .=  $f->field_label." ".$cause->{$f->table_field_name}."<br/>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    // replace impact part
    $impacts = $report_values->incidentImpactTypes;
    $impact_index = strpos($email_body, '$IncidentImpact_Start ', 0);
    $impact_index2 = strpos($email_body, '$IncidentImpact_End', 0);
    if($impact_index){
        $body11 = substr($email_body, 0, $impact_index);
        $body12 = substr($email_body, $impact_index+1, $impact_index2-1);
        $body13 = substr($email_body, $impact_index2);
        $body13 = str_replace('$IncidentImpact_End', '', $body13);
        $body12 = '';

        foreach($impacts as $key=>$impact){
            if($impact->impact_type_code === 'ImpactDL' || $impact->impact_type_code === 'Impact')
                $tab_name = 'Impacts';
            else 
                $tab_name = $impact->impact_type_code;
            $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where (s.sub_tab_name = '".$tab_name."' or s.sub_tab_name = 'Impacts') and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':org_id',$report_data['org_id']);
            $stmt->bindParam(":language_id", $report_data['language_id']);
            $stmt->execute();
            $res = $stmt->fetchAll(PDO::FETCH_OBJ);

            foreach($res as $key2=>$f){
                if(isset($impact->{$f->table_field_name}))
                    $body12 .=  $f->field_label." ".$impact->{$f->table_field_name}."<br/>";
            }
            $body12 .= "<br/>";
        }
        $email_body = $body11.$body12.$body13;
    }
    
    $index = strpos($email_body, "</ul>", 0);
    $body1 = substr($email_body, 0, $index);
    $body2 = substr($email_body, $index);
//    $email_body = str_replace("</ul>", "", $email_body);
    foreach($notification as $field){
        if($field->field_name === 'equipment_id'){
            if(!$equip_index){
                $body1 .=  "<li>".$field->field_label." ";
                foreach($equip as $key=>$eq){
                    $body1 .=  $eq->equipment_name.', '.$eq->equipment_number.', '.$eq->equipment_type.', '.$eq->equipment_category_name;
                    if($key === count($equip)-1)
                        $body1 .= "</li>";
                    else
                        $body1 .= ",<br/>";
                }
            }
        }
        else if($field->field_name === 'customer_id'){
            if(!$cust_index){
                $query = "select of.field_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id where (f.field_name = 'customer_contact_name' or f.field_name = 'customer_job_number') and of.org_id = :org_id and f.language_id = :language_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->bindParam(":language_id", $report_data['language_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cust = $report_values->report_third_party;
                foreach($cust as $key=>$c){
                    if($c->third_party_type_code === 'Customer'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cust)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        } 
        else if($field->field_name === 'contractor_id'){
            if(!$cont_index){
                $query = "select of.field_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id where (f.field_name = 'contractor_contact_name' or f.field_name = 'contractor_jop_number') and of.org_id = :org_id and f.language_id = :language_id order by `order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->bindParam(":language_id", $report_data['language_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $cont = $report_values->report_third_party;
                foreach($cont as $key=>$c){
                    if($c->third_party_type_code === 'Contractor'){
                        $body1 .=  "<li>".$field->field_label." ".$c->third_party."<br/>";
                        $body1 .=  $res[0]->field_label.' '.$c->jop_number."<br/>".$res[1]->field_label.' '.$c->contact_name;
                        if($key === count($cont)-1)
                            $body1 .= "</li>";
                        else
                            $body1 .= ",<br/>";
                    }
                }
            }
        }
        else if($field->field_name === 'CorrectiveActionsHeader'){
            if(!$action_index){
                $query = "select of.field_label, f.table_field_name from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where s.sub_tab_name = 'Actions' and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
                $stmt = $db->prepare($query);
                $stmt->bindParam('org_id',$report_data['org_id']);
                $stmt->bindParam(":language_id", $report_data['language_id']);
                $stmt->execute();
                $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                $actions = $report_values->correctiveActions;
                $body1 .=  "<li>".$field->field_label."<br/>";
                foreach($actions as $key=>$action){
                    foreach($res as $key2=>$f){
                        $body1 .=  $f->field_label." ".$action->{$f->table_field_name}."<br/>";
    //                        if($key === count($res)-1)
    //                            $body1 .= "</li>";
                    }
                    $body1 .= "<br/>";
                }
            }
        }
        else if($field->field_name === 'impact_type_id'){
            if(!$impact_index){
                foreach($impacts as $key=>$impact){
                    if($impact->impact_type_code === 'ImpactDL' || $impact->impact_type_code === 'Impact')
                        $tab_name = 'Impacts';
                    else 
                        $tab_name = $impact->impact_type_code;
                    $query = "select of.field_label, f.table_field_name, s.sub_tab_label from stellarhse_incident.org_field of join stellarhse_incident.field f on of.field_id = f.field_id join stellarhse_incident.sub_tab s on s.sub_tab_id = f.sub_tab_id where (s.sub_tab_name = '".$tab_name."' or s.sub_tab_name = 'Impacts') and of.org_id = :org_id and f.language_id = :language_id and f.is_custom = 0 order by f.`order`";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':org_id',$report_data['org_id']);
                    $stmt->bindParam(":language_id", $report_data['language_id']);
                    $stmt->execute();
                    $res = $stmt->fetchAll(PDO::FETCH_OBJ);

                    foreach($res as $key2=>$f){
                        if(isset($impact->{$f->table_field_name}))
                            $body1 .=  "<li>".$f->field_label." ".$impact->{$f->table_field_name}."<br/>";
        //                        if($key === count($res)-1)
        //                            $body1 .= "</li>";
                    }
                    $body1 .= "<br/>";
                }
            }
        }
        else if($field->field_name !== 'location1_id' && $field->field_name !== 'location2_id' && $field->field_name !== 'location3_id' && $field->field_name !== 'location4_id' && $field->field_name !== 'risk_level' && $field->field_name !== 'event_type_id' && $field->field_name !== 'impact_sub_type_id')
        $body1 .=  "<li>".$field->field_label." ".$report_values->{$field->table_field_name}."</li>";
    }
    $email_body = $body1.$body2;
    return $email_body;
//    }
}

function GetIncidentSubTabId($db, $tab_name, $language_id) {
    $query = "select sub_tab_id,sub_tab_name from stellarhse_incident.sub_tab where field_code= :field_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_code', $tab_name);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0]->sub_tab_id;
}

function GetIncidentFieldTypeId($db, $field_code, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_code= :field_type_code and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_code', $field_code);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $res[0];
}

function GetIncidentFieldTypeName($db, $field_id, $language_id) {
    $query = "SELECT field_type_id,field_type_code FROM stellarhse_common.field_type where field_type_id= :field_type_id and language_id=:language_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam('field_type_id', $field_id);
    $stmt->bindParam('language_id', $language_id);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_OBJ);
    switch ($res[0]->field_type_code) {
        case 'textbox':
            $field_type_name = 'textInput';
            break;
        case 'textarea':
            $field_type_name = 'textArea';
            break;
        case 'checkbox':
            $field_type_name = 'checkbox';
            break;
        case 'radiobutton':
            $field_type_name = 'radio';
            break;
        case 'select':
            $field_type_name = 'select';
            break;
        case 'calendar':
            $field_type_name = 'date';
            break;
    }
    return $field_type_name;
}

function DeleteIncidentCustomField($db, $array_fields) {
    foreach ($array_fields as $value) {
        $field_id = $value->field_id;
        $query = "delete from  stellarhse_incident.favorite_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.template_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.field_value  WHERE option_id IN (SELECT option_id FROM stellarhse_incident.`option` WHERE field_id =  :field_id);";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.field_value  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.`option`  where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.org_field where field_id =  :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_incident.favorite_field 
            where favorite_table_id in(SELECT favorite_table_id from stellarhse_incident.favorite_table  WHERE order_by_id = :field_id); ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = " DELETE from  stellarhse_incident.favorite_table  WHERE order_by_id = :field_id; ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $query = "delete from  stellarhse_incident.field where field_id = :field_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":field_id", $field_id);
        $stmt->execute();
        $res = true;
    }
}

function DeleteIncidentFieldOptions($db, $array_options) {
    foreach ($array_options as $value) {
        $option_id = $value->option_id;
        $query = "delete FROM stellarhse_incident.`option` WHERE option_id =  :option_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":option_id", $option_id);
        $stmt->execute();
    }
}

function AddIncidentTabCustomField($db, $org_id, $language_id, $user_id, $sub_tab_id,$tab_name, $custom_array) {

    if ($custom_array != NULL) {
        for ($i = 0; $i < count($custom_array); $i++) {
            switch ($custom_array[$i]['component']) {
                case 'textInput':
                    $fieldType = GetIncidentFieldTypeId($db, 'textbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'textArea':
                    $fieldType = GetIncidentFieldTypeId($db, 'textarea', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'checkbox':
                    $fieldType = GetIncidentFieldTypeId($db, 'checkbox', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'radio':
                    $fieldType = GetIncidentFieldTypeId($db, 'radiobutton', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'select':
                    $fieldType = GetIncidentFieldTypeId($db, 'select', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
                case 'date':
                    $fieldType = GetIncidentFieldTypeId($db, 'calendar', $language_id);
                    $field_type_id = $fieldType->field_type_id;
                    $field_type_code = $fieldType->field_type_code;
                    break;
            }

            $IsEditable = 1;
            $IsCustom = 1;
            $IsHidden = 0;
            if ($custom_array[$i]["required"] == true) {
                $IsMandatory = 1;
            } else {
                $IsMandatory = 0;
            }
            $field_name = $tab_name."_". $field_type_code . "_" . $custom_array[$i]["index"];


            if (isset($custom_array[$i]["id"]) && $custom_array[$i]["id"] != NULL) {
                $query = "UPDATE stellarhse_incident.field
                               SET  default_field_label =:default_field_label,
                                    field_name=:field_name,
                                    default_help_me_name =:default_help_me_name,
                                    `order`             =:order,
                                    default_help_me_description =:default_help_me_description,
                                    is_mandatory=:is_mandatory,
                                    editing_by=:editing_by
                                    WHERE field_id = :field_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":default_field_label", $custom_array[$i]["label"]);
                $stmt->bindParam(":field_name", $field_name);
                $stmt->bindParam(":default_help_me_name", $custom_array[$i]["placeholder"]);
                $stmt->bindParam(":default_help_me_description", $custom_array[$i]["description"]);
                $stmt->bindParam(":order", $custom_array[$i]["index"]);
                $stmt->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt->bindParam(":editing_by", $user_id);
                $stmt->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt->execute();
                $query_check_field_in_org = "select * from  stellarhse_incident.org_field WHERE org_id= :org_id  and field_id= :field_id";
                $stmt_check_field_in_org = $db->prepare($query_check_field_in_org);
                $stmt_check_field_in_org->bindParam(":org_id", $org_id);
                $stmt_check_field_in_org->bindParam(":field_id", $custom_array[$i]["id"]);
                $stmt_check_field_in_org->execute();
                $res_check_field = $stmt_check_field_in_org->fetchAll(PDO::FETCH_OBJ);
                if($res_check_field !=NULL){
//                    var_dump('$res_check_field');
                    $query_org_field ="UPDATE  stellarhse_incident.org_field
                                    SET  field_label         = :field_label,
                                        is_mandatory        = :is_mandatory,
                                        is_hidden           = :is_hidden,
                                        help_me_name         = :help_me_name,
                                        help_me_description  = :help_me_description
                                    WHERE org_id             = :org_id  
                                      and field_id           = :field_id";
                    $stmt_org_field = $db->prepare($query_org_field);
                    $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                    $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                    $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                    $stmt_org_field->bindParam(":org_id", $org_id);
                    $stmt_org_field->bindParam(":field_id", $custom_array[$i]["id"]);
                    $stmt_org_field->execute();
                }else{
                    $query_org_field = "INSERT INTO stellarhse_incident.org_field
                                  (org_id,field_id,field_label,help_me_name,help_me_description,is_mandatory,is_hidden)
                              VALUES
                                  (:org_id,:field_id,:field_label,:help_me_name,:help_me_description,:is_mandatory,:is_hidden)";
                    $stmt_org_field = $db->prepare($query_org_field);
                    $stmt_org_field->bindParam(":org_id", $org_id);
                    $stmt_org_field->bindParam(":field_id", $custom_array[$i]["id"]);
                    $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                    $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                    $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                    $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                    $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                    $stmt_org_field->execute();

                }
                if (isset($custom_array[$i]["options"]) && $custom_array[$i]["options"] != NULL) {
                    $count = 0;
                    if ($custom_array[$i]["options"] != NULL) {
                        $count = count($custom_array[$i]["options"]) - 1;
                        //                            $options = '("'.implode('", "', $custom_array[$i]["options"]).'");';
                        //                            $query_delete_option = "select * from stellarhse_incident.`option` where field_id=:field_id and option_name NOT IN $options";

                        $query_delete_option = "select * from stellarhse_incident.`option` where field_id=:field_id and `order` > :count";
                        $stmt_delete_option = $db->prepare($query_delete_option);
                        $stmt_delete_option->bindParam(":field_id", $custom_array[$i]["id"]);
                        $stmt_delete_option->bindParam(":count", $count);
                        $stmt_delete_option->execute();
                        $field_options = $stmt_delete_option->fetchAll(PDO::FETCH_OBJ);
                        //                            var_dump($field_options);
                        if ($field_options != NULL) {
                            DeleteFieldOptions($db, $field_options);
                        }
                        $option_order = 0;
                        foreach ($custom_array[$i]["options"] as $option) {
                            //                                $query_check_option ="select option_id from stellarhse_incident.`option` where field_id=:field_id and option_name =:option_name";

                            $query_check_option = "select option_id from stellarhse_incident.`option` where field_id=:field_id and `order` =:order";
                            $stmt_check_option = $db->prepare($query_check_option);
                            $stmt_check_option->bindParam(":field_id", $custom_array[$i]["id"]);
                            $stmt_check_option->bindParam(":order", $option_order);
                            $stmt_check_option->execute();
                            $option_data = $stmt_check_option->fetchAll(PDO::FETCH_OBJ);
                            if ($option_data != NULL) {
                                $option_data[0]->option_id;
                                $query_add_option = "UPDATE stellarhse_incident.option
                                                    SET  option_name=:option_name,
                                                        `order` =:order
                                                        WHERE option_id = :option_id";

                                $stmt_add_option = $db->prepare($query_add_option);
                                $stmt_add_option->bindParam(":option_id", $option_data[0]->option_id);
                                $stmt_add_option->bindParam(":option_name", $option);
                                $stmt_add_option->bindParam(":order", $option_order);
                                $stmt_add_option->execute();
                            } else {
                                $option_id = Utils::getUUID($db);
                                $query_option = "INSERT INTO stellarhse_incident.option
                                               (option_id,option_name,field_id,`order`)
                                           VALUES
                                                (:option_id,:option_name,:field_id,:order)";
                                $stmt_option = $db->prepare($query_option);
                                $stmt_option->bindParam(":option_id", $option_id);
                                $stmt_option->bindParam(":option_name", $option);
                                $stmt_option->bindParam(":field_id", $custom_array[$i]["id"]);
                                $stmt_option->bindParam(":order", $option_order);
                                $stmt_option->execute();
                            }
                            $option_order ++;
                        }
                    }
                }
            } else {
                // insert new custom field
                $field_id = Utils::getUUID($db);
                $query = "INSERT INTO stellarhse_incident.field
                                  (field_id,language_id,field_name,default_field_label,field_type_id,org_id,sub_tab_id, is_editable,default_help_me_name,default_help_me_description,is_mandatory,is_custom,`order`)
                              VALUES
                                  (:field_id,:language_id,:field_name,:default_field_label,:field_type_id,:org_id,:sub_tab_id,:IsEditable ,:default_help_me_name,:default_help_me_description,:is_mandatory,:is_custom,:order)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":field_id", $field_id);
                $stmt->bindParam(":language_id", $language_id);
                $stmt->bindParam(":field_name", $field_name);
                $stmt->bindParam(":default_field_label", $custom_array[$i]["label"]);
                $stmt->bindParam(":field_type_id", $field_type_id);
                $stmt->bindParam(":org_id", $org_id);
                $stmt->bindParam(":sub_tab_id", $sub_tab_id);
                $stmt->bindParam(":IsEditable", $IsEditable, PDO::PARAM_BOOL);
                $stmt->bindParam(":default_help_me_name", $custom_array[$i]["placeholder"]);
                $stmt->bindParam(":default_help_me_description", $custom_array[$i]["description"]);
                $stmt->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt->bindParam(":is_custom", $IsCustom, PDO::PARAM_BOOL);
                $stmt->bindParam(":order", $custom_array[$i]["index"]);
                $stmt->execute();
                $query_org_field = "INSERT INTO stellarhse_incident.org_field
                                  (org_id,field_id,field_label,help_me_name,help_me_description,is_mandatory,is_hidden)
                              VALUES
                                  (:org_id,:field_id,:field_label,:help_me_name,:help_me_description,:is_mandatory,:is_hidden)";
                $stmt_org_field = $db->prepare($query_org_field);
                $stmt_org_field->bindParam(":org_id", $org_id);
                $stmt_org_field->bindParam(":field_id", $field_id);
                $stmt_org_field->bindParam(":field_label", $custom_array[$i]["label"]);
                $stmt_org_field->bindParam(":help_me_name", $custom_array[$i]["placeholder"]);
                $stmt_org_field->bindParam(":help_me_description", $custom_array[$i]["description"]);
                $stmt_org_field->bindParam(":is_mandatory", $IsMandatory, PDO::PARAM_BOOL);
                $stmt_org_field->bindParam(":is_hidden", $IsHidden, PDO::PARAM_BOOL);
                $stmt_org_field->execute();
                if (isset($custom_array[$i]["options"]) && $custom_array[$i]["options"] != NULL) {
                    $order = 0;
                    foreach ($custom_array[$i]["options"] as $value) {
                        $option_id = Utils::getUUID($db);
                        $query_option = "INSERT INTO stellarhse_incident.option
                                       (option_id,option_name,field_id,`order`)
                                   VALUES
                                        (:option_id,:option_name,:field_id,:order)";
                        $stmt_option = $db->prepare($query_option);
                        $stmt_option->bindParam(":option_id", $option_id);
                        $stmt_option->bindParam(":option_name", $value);
                        $stmt_option->bindParam(":field_id", $field_id);
                        $stmt_option->bindParam(":order", $order);
                        $stmt_option->execute();
                        $order ++;
                    }
                }
            }
        }
    }
}            

