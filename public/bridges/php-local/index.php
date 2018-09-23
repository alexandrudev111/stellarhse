<?php

namespace AngularFilemanager\LocalBridge;

/**
 *  PHP Local filesystem bridge for angular-filemanager
 *
 *  @author Jakub Ďuraš <jakub@duras.me>
 *  @version 0.2.0
 */
include 'LocalBridge/Response.php';
include 'LocalBridge/Rest.php';
include 'LocalBridge/Translate.php';
include 'LocalBridge/FileManagerApi.php';


/**
 * Takes two arguments
 * - base path without last slash (default: '$currentDirectory/../files')
 * - language (default: 'en'); mute_errors (default: true, will call ini_set('display_errors', 0))
 */
session_start();
if(isset($_SESSION['temp_path'])){
    $path = $_SESSION['temp_path'];
}else{
    $path = '/data/report_documents/attachments/';
}

if (is_dir($path) === false) {
    mkdir($path,0775,true);
}
    
$fileManagerApi = new FileManagerApi($path);

$rest = new Rest();
$rest->post([$fileManagerApi, 'postHandler'])
        ->get([$fileManagerApi, 'getHandler'])
        ->handle();

// 
//if(isset($_SESSION['report_type'])&& isset($_SESSION['user_id'])&& isset($_SESSION['org_id']) && isset($_SESSION['report']) ){
//    if(isset($_SESSION['report_id'])){
//        $path_draft= '/data/report_documents/stellarhse_hazard/'.$_SESSION['org_id'].'/draft/'.$_SESSION['user_id'].'/';
//        if (is_dir($path_draft) === false) {
//            mkdir($path_draft, 0775, true);
//        }
//    }
//    recurse_copy($path, $path_draft);
//}




