<?php

include_once("Utils.php");

try {
     $rootPath = '/tmp/';
    //local
//    $rootPath = '/data/';
print_r($_POST);
print_r($_FILES['file']);
    $sw = fopen($rootPath . 'upload_details.txt', 'w');
    fwrite($sw,print_r($_POST,true));
    fwrite($sw,print_r($_FILES['file']['name'][0],true));
    fwrite($sw,print_r(' '.$_FILES['file']['type'][0].' ',true));
//    fwrite($sw,print_r($_FILES['file'],true));
    fclose($sw);
    // $uiniqueid = uniqid('', true);
    // $folderpath = $rootPath . $uiniqueid . "/";
                
    // mkdir($folderpath);

    // for ($x = 0; $x < count($_POST['filenames']); $x++) {
    //     $name_parts = explode('.', $_POST['filenames'][$x]['filename']);
    //     $extension = $name_parts[count($name_parts) - 1];
    // if ($fileinfo->isDot() || preg_match('/^__MACOSX.*$/', $fileinfo->getFilename()) 
    // || $fileinfo->getExtension() === "zip")
    // continue;
    $fileinfo = $_FILES['file'];
$ext = strtolower($fileinfo->getExtension());
if ($ext !== "pdf") {
    $result = new Result();
    $result->success = 0;
    $result->reason = "Some files in the upload are not in the permitted formats";
    return $result;
}
$parent = $post['node']['id'];
$ext = $fileinfo->getExtension();
$filename = str_replace("." . $ext, "", $fileinfo->getFilename());
$filepath = $fileinfo->getPathname();
$userid = $post['user']['user_id'];
$query = "select stellarhse_document.myuuid()";
$stmt = $db->prepare($query);
$stmt->execute();
$uuid = $stmt->fetchColumn();
$query = "insert into stellarhse_document.file (file_id, file_type, file_parentid, file_filename, file_extension, file_createdate, file_uploadby) values (:uuid,'file',:parent,:filename,:ext,now(),:userid)";
$stmt = $db->prepare($query);
$stmt->bindParam(":uuid", $uuid);
$stmt->bindParam(":parent", $parent);
$stmt->bindParam(":filename", $filename);
$stmt->bindParam(":ext", $ext);
$stmt->bindParam(":userid", $userid);
$stmt->execute();
copy($filepath, '/data/hseprogram/' . $uuid);

        switch ($_FILES['file']['type'][0]) {
            case "application/pdf": {
                $fileExt = ".pdf";
                // switch ($_POST['db']) {
                //     case "workorder": {
                //             $filename = $_FILES['file']['name'][$x];
                //             $tmpname = $filename;
                //             $realname = $_POST['filenames'][$x]['filename'];
                //             if ($_POST['append'] !== '')
                //                 $realname.=" - " . $_POST['append'];
                //             $realname.=$fileExt;
                //             copy($_FILES['file']['tmp_name'][$x], $folderpath . $realname);
                //             break;
                //         }
                //     default: {
                copy($_FILES['file']['tmp_name'][0], $folderpath . $_FILES['file']['name'][0]);
                //             break;
                //         }
                // }
                // break;
            }
        }
    // }
    // $result = null;
    // $result = process_upload_hrprogram($folderpath, $_POST, $db);
    

    echo json_encode($result, JSON_NUMERIC_CHECK);
} catch (Exception $ex) {
    $response = new Result();
    $response->success = 0;
    $response->reason = "File: " . $ex->getFile() . "Line: " . $ex->getLine() . "Message: " . $ex->getMessage();
    echo json_encode($response, JSON_NUMERIC_CHECK);
}


function process_upload_hrprogram($fileinfo, $post, $db) {
    try {
        // foreach (new DirectoryIterator($folderpath) as $fileinfo) {
            if ($fileinfo->isDot() || preg_match('/^__MACOSX.*$/', $fileinfo->getFilename()) || $fileinfo->getExtension() === "zip")
                continue;
            $ext = strtolower($fileinfo->getExtension());
            if ($ext !== "pdf") {
                $result = new Result();
                $result->success = 0;
                $result->reason = "Some files in the upload are not in the permitted formats";
                return $result;
            }
            $parent = $post['node']['id'];
            $ext = $fileinfo->getExtension();
            $filename = str_replace("." . $ext, "", $fileinfo->getFilename());
            $filepath = $fileinfo->getPathname();
            $userid = $post['user']['user_id'];
            $query = "select stellarhse_document.myuuid()";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $uuid = $stmt->fetchColumn();
            $query = "insert into stellarhse_document.file (file_id, file_type, file_parentid, file_filename, file_extension, file_createdate, file_uploadby) values (:uuid,'file',:parent,:filename,:ext,now(),:userid)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":uuid", $uuid);
            $stmt->bindParam(":parent", $parent);
            $stmt->bindParam(":filename", $filename);
            $stmt->bindParam(":ext", $ext);
            $stmt->bindParam(":userid", $userid);
            $stmt->execute();
            copy($filepath, '/data/hseprogram/' . $uuid);
        // }
        // $db = null;
        $result = new Success();
        $result->success = 1;
        return $result;
    } catch (PDOException $ex) {
        $result = new Result();
        $result->success = 0;
        $result->reason = "File: ".$ex->getFile()."Line: ".$ex->getLine()."Message: ".$ex->getMessage();
        return $result;
    } catch (Exception $ex) {
        $result = new Result();
        $result->success = 0;
        $result->reason = "File: ".$ex->getFile()."Line: ".$ex->getLine()."Message: ".$ex->getMessage();
        return $result;
    }
}