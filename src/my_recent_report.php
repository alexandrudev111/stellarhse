<?php

$app->group('/api/v1', function() use($app) {

    $app->post('/getMyRecentReport', function($request, $response, $args) {
        $error = new errorMessage();
        $db = $this->db;
        $post = $request->getParsedBody();

       // print_r($post);
        $query = "CALL stellarhse_common.get_all_report_summary(:report_id,:org_id,:report_code);";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":report_id", $post['report_id']);
        $stmt->bindParam(":org_id", $post['org_id']);
        $stmt->bindParam(":report_code", $post['report_code']);
        $stmt->execute();


        $result->Report_one = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $stmt->nextRowSet();
        $result->Report_two = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->Report_three = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->Report_four = $stmt->fetchAll(PDO::FETCH_OBJ);
         $stmt->nextRowSet();
        $result->Report_five = $stmt->fetchAll(PDO::FETCH_OBJ);
        $stmt->nextRowSet();
        $result->Report_six = $stmt->fetchAll(PDO::FETCH_OBJ);
        


      
//        do {
//            $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//            if ($result) {
//                 //print_r($result, $i);
//                 return $this->response->withJson($result);
//            }
//          
//        } while ($stmt->nextRowset());



        return $this->response->withJson($result);
        
        //return $this->response->withJson($result->Report_three);
        //return $this->response->withJson($result);
    });
});
