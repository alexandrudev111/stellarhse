<?php

$app->group('/api/v1', function() use($app) {

function getRepoChildren($node,$db,$org_id){
    try{
        $query = "select file_id as `id`, file_type as `type`,file_name as `name`,
        file_parent_id as parentid,file_extension as extension, (select 0) as `delete`, org_id 
        from stellarhse_document.`file` where file_parent_id = :parentid and 
        (org_id is null or org_id = :orgid) and file_type = 'folder' order by `order`";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":parentid",$node->id);
        $stmt->bindParam(":orgid",$org_id);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_OBJ);
        $node->children = $results;  
        foreach($node->children as $result){
            getRepoChildren($result, $db, $org_id);
        }
        return $node->children;
    } catch (PDOException $ex) {
        throw new Exception($ex->getLine().":".$ex->getMessage());
    } catch (Exception $ex) {
        throw new Exception($ex->getLine().":".$ex->getMessage());
    }
}

$app->get('/documentsroot/{org_id}', function($request, $response, $args) {
        // $data = $request->getParsedBody();
        $db = $this->db;
        try {
            $query = "select file_id as `id`, file_type as `type`,file_name as `name`,
            file_parent_id as parentid,file_extension as extension, (select 0) as `delete`, org_id 
            from stellarhse_document.`file` where file_parent_id is null order by `order`;";
            $stmt = $db->prepare($query);
            // $stmt->bindParam(':orgid', $args['org_id']);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_OBJ);
            foreach($results as $result){
                    getRepoChildren($result,$db,$args['org_id']);
            }
           return $this->response->withJson($results);
       } catch (Exception $ex) {
           return $this->response->withJson($ex->errorInfo);
       }
});
$app->post('/getfiles', function($request, $response, $args) {
    $post = $request->getParsedBody();
    $db = $this->db;
     try {
         if($post['item']['org_id'] === null || $post['item']['org_id'] === ''){
            $query = "call stellarhse_document.sp_getfiles(:itemid,null)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':itemid', $post['item']['id']);
         }else{
            $query = "call stellarhse_document.sp_getfiles(:itemid,:orgid)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':itemid', $post['item']['id']);
            $stmt->bindParam(':orgid', $post['org_id']);
         }
         $stmt->execute();
         $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        //  foreach ($result as $item) {
        //      $item->children = [];
        //  }
         return $this->response->withJson($result);
     } catch (Exception $ex) {
         return $this->response->withJson($ex->errorInfo);
     }
 });

$app->post('/getversions', function($request, $response, $args) {
    $data = $request->getParsedBody();
    $db = $this->db;
    try {
        $query = "call stellarhse_document.sp_getversions(:filename,:fileparent)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':filename', $data['file_name']);
        $stmt->bindParam(':fileparent', $data['file_parent_id']);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
 });

 $app->post('/deleteversions', function($request, $response, $args) {
    $data = $request->getParsedBody();
    $db = $this->db;
    try {
        $query = "delete from stellarhse_document.`file` where file_name = :filename and 
        file_parent_id = :parentid and file_id != :fileid;";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':fileid', $data['file_id']);
        $stmt->bindParam(":filename", $data['file_name']);
        $stmt->bindParam(":parentid", $data['file_parent_id']);
        $stmt->execute();
        $result = $stmt->rowCount();
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
 });

$app->get('/deletefile/{fileid}',function($request, $response, $args){
    $db = $this->db;
    try {
        $query = "delete from stellarhse_document.file where file_id = :fileid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':fileid', $args['fileid']);
        $stmt->execute();
        $result = new Success();
        $result->success = 1;
        unlink('/data/hseprogram/'.$args['fileid']);
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
});
$app->post('/addfile', function($request, $response, $args) {
    $post = $request->getParsedBody();
    $db = $this->db;
    try {
        // print_r($data);
        // print_r($_FILES['file']);
        // $sw = fopen($rootPath . 'upload_details.txt', 'w');
        // fwrite($sw,print_r($data,true));
        // fwrite($sw,print_r($_FILES['file']['name'],true));
        // fwrite($sw,print_r(' '.$_FILES['file']['type'].' ',true));
        // fclose($sw);
        // $fileinfo = $_FILES['file'];
        // print_r($post);
        if(isset($_FILES['file'])){
            $name_parts = explode('.', $_FILES['file']['name']);
            $ext = strtolower($name_parts[count($name_parts) - 1]);
            if ($ext !== "pdf") {
                $result = new Result();
                $result->success = 0;
                $result->reason = "Some files in the upload are not in the permitted formats";
                return $this->response->withJson($result);
            }
            $ext = $name_parts[count($name_parts) - 1];
            $filename = str_replace("." . $ext, "", $_FILES['file']['name']);
            $filepath = $_FILES['file']['tmp_name'];
        }
        $parent = $post['node']['id'];
        $userid = $post['user_id'];
        if(isset($post['item']['file_id'])){
            $query = "update stellarhse_document.file set file_description = :description,
            file_created_date = now() where file_id = :file_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":file_id", $post['item']['file_id']);
            $stmt->bindParam(":description", $post['summary']);
            $stmt->execute();
            $result = new Result();
            $result->success = 1;
            if(isset($_FILES['file'])){
            $result->success = move_uploaded_file($filepath, '/data/hseprogram/' . $post['item']['file_id'].'.'.$ext);
            }
        } else{
            $query = "select stellarhse_document.myuuid()";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $uuid = $stmt->fetchColumn();
            $query = "insert into stellarhse_document.file (file_id, file_type, file_parent_id, 
            file_name, file_extension, file_description, file_uploaded_by, org_id) values (:uuid,'file',
            :parent,:filename,:ext,:description,:userid, :org_id)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":uuid", $uuid);
            $stmt->bindParam(":parent", $parent);
            $stmt->bindParam(":filename", $filename);
            $stmt->bindParam(":ext", $ext);
            $stmt->bindParam(":description", $post['summary']);
            $stmt->bindParam(":userid", $userid);
            $stmt->bindParam(":org_id", $post['org_id']);
            $stmt->execute();
            $result = new Result();
            $result->success = move_uploaded_file($filepath, '/data/hseprogram/' . $uuid.'.'.$ext);
            
        }
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
 });
$app->post('/addfolder', function($request, $response, $args) {
    $post = $request->getParsedBody();
    $db = $this->db;
    try{
        $query = "select stellarhse_document.myuuid()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $uuid = $stmt->fetchColumn();
        
        $query = "insert into stellarhse_document.`file` (file_id,file_type,file_parent_id,
        file_name,file_uploaded_by,org_id) values (:uuid,'folder',:parent,:name,:userid,:org_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":uuid",$uuid);
        $stmt->bindParam(":parent", $post['parent']);
        $stmt->bindParam(":name", $post['name']);
        $stmt->bindParam(":userid", $post['userid']);
        $stmt->bindParam(":org_id", $post['org_id']);
        $stmt->execute();
        $result = new Result();
        $result->success=1;
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
});

$app->get('/deletefolder/{folderid}', function($request, $response, $args) {
    $db = $this->db;
    try{
        $query = "delete from stellarhse_document.file where file_id = :folderid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":folderid", $args['folderid']);
        $stmt->execute();
        $result = new Result();
        $result->success=1;
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
});

$app->post('/renamefolder', function($request, $response, $args) {
    $post = $request->getParsedBody();
    $db = $this->db;
    try{
        
        $query = "update stellarhse_document.file set file_name = :name where file_id = :nodeid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":nodeid", $post['nodeid']);
        $stmt->bindParam(":name", $post['name']);
        $stmt->execute();
        $result = new Result();
        $result->success=1;
        return $this->response->withJson($result);
    } catch (Exception $ex) {
        return $this->response->withJson($ex->errorInfo);
    }
});

// function getRepoVersions($file){
//     $database = new Database();
//     $error = new ErrorMessage();
//     $db;
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         throw new Exception($ex->getMessage());
//     }
//     try {
//         $query = "call sp_getversions(:filename,:fileparent)";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(':filename', $file->file_name);
//         $stmt->bindParam(':fileparent', $file->file_parent_id);
//         $stmt->execute();
//         $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//         $db = null;
//         return $result;
//     } catch (PDOException $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } 
// }

// function deleteRepoVersions($file){
//     $database = new Database();
//     $error = new ErrorMessage();
//     $db;
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         throw new Exception($ex->getMessage());
//     }
//     try {
//         $query = "call sp_deleteversions(:fileid,:filename,:parentid)";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(':fileid', $file->file_id);
//         $stmt->bindParam(":filename", $file->file_name);
//         $stmt->bindParam(":parentid", $file->file_parent_id);
//         $stmt->execute();
//         $result = $stmt->rowCount();
//         return $result;
//     } catch (PDOException $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } 
// }

// function deleteRepoFile($file){
//     $database = new Database();
//     $error = new ErrorMessage();
//     $db;
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         throw new Exception($ex->getMessage());
//     }
//     try {
//         $query = "delete from `file` where file_id = :fileid";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(':fileid', $file->file_id);
//         $stmt->execute();
//         $result = $stmt->rowCount();
//         unlink('/data/repo/'.$file->file_id);
//         return $result;
//     } catch (PDOException $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         throw new Exception($ex->getMessage());
//     } 
// }
// $app->get('/repoversions/:fileid',function($fileid) use ($app){
//     $database = new Database();
//     $error = new ErrorMessage();
//     $db;
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     }
//     try {
//         $query = "select t.* from item t where t.file_filename = (select file_filename from file where file_id = :fileid) order by t.file_createdate desc";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(':fileid', $fileid);
//         $stmt->execute();
//         $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//         $db = null;
//         echo json_encode($result,JSON_NUMERIC_CHECK);
//     } catch (PDOException $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     } 
// });

// $app->get('/repocustomerlogin/:folderid',function($folderid) use ($app){
//     $database = new Database();
//     $error = new ErrorMessage();
//     $db;
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     }
//     try{
//         $query = "select * from customer_auth where customerfolder_id = :folderid";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(":folderid",$folderid);
//         $stmt->execute();
//         $result = $stmt->fetchAll(PDO::FETCH_OBJ);
//         $db = null;
//         echo json_encode($result,JSON_NUMERIC_CHECK);
//     }catch (PDOException $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     } 
// });

// $app->post('/repomovefolder',function() use ($app){
//     $post;
//     $db;
//     $database = new Database();
//     $error = new ErrorMessage();
//     $utils = new Utils();
//     try{
//         $post = json_decode($app->request()->getBody());
//     } catch (Exception $ex) {
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     }
//     try {
//         $db = $database->getMySQLConnection('repo');
//     } catch (Exception $ex) {
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     }
//     try{
//         $query = "update `file` set file_parentid = :parent_id where file_id = :file_id";
//         $stmt = $db->prepare($query);
//         $stmt->bindParam(":file_id",$post->file_id);
//         $stmt->bindParam(":parent_id", $post->parent_id);
//         $stmt->execute();
//         $db = null;
//         $result = new Result();
//         $result->success=$stmt->rowCount();
//         echo json_encode($result,JSON_NUMERIC_CHECK);
//     } catch (PDOException $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     } catch (Exception $ex) {
//         $db = null;
//         echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
//     }
// });

});