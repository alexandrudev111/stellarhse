<?php

uploadlog();

function uploadlog() {

    try {
        $folderpath = '/data/logo/';
        $org_id = $_POST['org_id'];
        $result = copy($_FILES['file']['tmp_name'], $folderpath . $org_id . '.gif');
        echo json_encode($result, JSON_NUMERIC_CHECK);
        
        
    } catch (Exception $ex) {
        $response = new Result();
        $response->success = 0;
        $response->reason = "File: " . $ex->getFile() . "Line: " . $ex->getLine() . "Message: " . $ex->getMessage();
        echo json_encode($response, JSON_NUMERIC_CHECK);
    }
}
