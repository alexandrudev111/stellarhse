#!php /data/www/dev/triggers/notification_triggers.php
<?php

require_once __DIR__ . '/../public/php-mailer/class.phpmailer.php';
include 'hazard_helpers.php';
include 'incident_helpers.php';
include 'inspection_helpers.php';
include 'maintenance_helpers.php';
include 'safetymeeting_helpers.php';
include 'training_helpers.php';
define("MAIL_SERVER", "WEST.EXCH028.serverdata.net");

define("ROOT_PATH", "/data/");
$DBs = array("stellarhse_hazard", "stellarhse_inspection", "stellarhse_maintenance","stellarhse_safetymeeting", "stellarhse_training", "stellarhse_incident");

function getDBConnection($dbname) {
    try {
        $dbName = $dbname;
        $host = "localhost";
        $user = "root";
        $pass = '3l3ctr0';
        $dbh = new PDO("mysql:host=$host;dbname=$dbName;charset=utf8", $user, $pass);
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $dbh->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_TO_STRING);
        return $dbh;
    } catch (PDOException $ex) {
        throw new Exception($ex->getMessage());
    }
}
function SendEmail($to, $cc, $from, $subject, $message, $file) {
    try {
        // require_once 'php-mailer/class.phpmailer.php';
        $mail = new PHPMailer(true);
        $mail->IsSMTP();

        $user_email = 'account.services@abcanada.com';
        $email_password = 'SnowCity@2014';
        $sender_name = 'ABCanTrack Account Services';

        if ($from == '') {
            $from = $user_email;
        }

        $mail->Timeout = 180;
        $mail->CharSet = "UTF-8"; // To support special characters in SMTP mail 
        $mail->Host = MAIL_SERVER;
        $mail->SMTPDebug = 1;
        $mail->SMTPAuth = 1;
        $mail->SMTPSecure = 'tls';
        $mail->Username = $user_email;
        $mail->Password = $email_password;
        $mail->SetFrom($from, $sender_name);
        if ($file != '') {
            $mail->AddAttachment($file, '');
        }
        if(isset($to) && $to !== '') 
            if(strpos($to, ',') !== false){
                $to_arr = explode(',', $to);
                foreach($to_arr as $to_address)
                    $mail->AddAddress($to_address);
            } else
                $mail->AddAddress($to);
        if(isset($cc) && $cc !== '') 
            if(strpos($cc, ',') !== false){
                $cc_arr = explode(',', $cc);
                foreach($cc_arr as $cc_address)
                    $mail->AddCC($cc_address);
            } else
                $mail->AddCC($cc);
        $mail->Subject = $subject;
        $msg = "<html><body>".$message."</body></html>";
        $mail->MsgHTML($msg);
        $result = $mail->send();
        return $result;
    } catch (phpmailerException $ex) {
        throw new Exception($ex->getMessage());
    } catch (Exception $ex) {
        throw new Exception($ex->getMessage());
    }
}
function ReplaceCorrectiveActionsParamters($dbname, $ca){
    switch($dbname){
        case 'stellarhse_hazard':
            $corrective_action_replace = ReplaceHazardCorrectiveActionsParamters($ca);
            break;
        case 'stellarhse_incident':
            $corrective_action_replace = ReplaceIncidentCorrectiveActionsParamters($ca);
            break;
        case 'stellarhse_inspection':
            $corrective_action_replace = ReplaceInspectionCorrectiveActionsParamters($ca);
            break;
        case 'stellarhse_maintenance':
            $corrective_action_replace = ReplaceMaintenanceCorrectiveActionsParamters($ca);
            break;
        case 'stellarhse_safetymeeting':
            $corrective_action_replace = ReplaceSafetyMeetingCorrectiveActionsParamters($ca);
            break;
        case 'stellarhse_training':
            $corrective_action_replace = ReplaceTrainingCorrectiveActionsParamters($ca);
            break;
    }
    return $corrective_action_replace;
}
function InsertIntoReportEmailLog($dbname, $db, $email_log_id, $corrective_action){
    switch($dbname){
        case 'stellarhse_hazard':
            InsertIntoHazardEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_incident':
            InsertIntoIncidentEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_inspection':
            InsertIntoInspectionEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_maintenance':
            InsertIntoMaintenanceEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_safetymeeting':
            InsertIntoSafetyMeetingEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_training':
            InsertIntoTrainingEmailLog($db, $email_log_id, $corrective_action);
            break;
    }
}
function CheckInReportEmailLog($dbname, $db, $email_log_id, $corrective_action){
    switch($dbname){
        case 'stellarhse_hazard':
            CheckInHazardEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_incident':
            CheckInIncidentEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_inspection':
            CheckInInspectionEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_maintenance':
            CheckInMaintenanceEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_safetymeeting':
            CheckInSafetyMeetingEmailLog($db, $email_log_id, $corrective_action);
            break;
        case 'stellarhse_training':
            CheckInTrainingEmailLog($db, $email_log_id, $corrective_action);
            break;
    }
}
function SaveEmailOfResposibleToDB ($dbname,$to,$cc,$is_sent,$corrective_action,$subject,$body){
    try {
        $db = getDBConnection($dbname);
    } catch (Exception $ex) {
        throw new Exception($ex->getMessage());
    }
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
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':from',$from);
    $stmt->bindParam(':to',$to);
    $stmt->bindParam(':cc',$cc);
//    $stmt->bindParam(':hist_hazard_id',$hist_hazard_id);
    $stmt->bindParam(':send_to_employee_id',$corrective_action->assigned_to_id);
//    $stmt->bindParam(':cc_employee_id',$corrective_action->notified_id);
    if($is_sent == true)
        $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
    else
        $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
    $stmt->bindParam(':email_type_id',$corrective_action->email_type_id);
    $stmt->bindParam(':subject',$subject);
    $stmt->bindParam(':summary',$summary);
    $stmt->bindParam(':org_id',$corrective_action->org_id);
    $stmt->execute();
    $result = $stmt->rowCount();
    // save email body to the file system
    if($result){
        $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
        fwrite($file, strip_tags($body, '<br/>'));
        fclose($file);
    }
    InsertIntoReportEmailLog($dbname, $db, $email_log_id, $corrective_action);
    $query = "INSERT INTO $dbname.`corr_act_email`
                        (email_log_id, hist_corrective_action_id)
                    VALUES (:email_log_id,:hist_corrective_action_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_corrective_action_id',$corrective_action->hist_corrective_action_id);
    $stmt->execute();
    $result = $stmt->rowCount();
}
function SendToResponsiblePersons($dbname,$subject, $body, $corrective_action){
//    $to = $corrective_action->assigned_email;
//    $cc = $corrective_action->notified_email;
    $to = 'alaa.elsherbiny@procuredox.com';
    $cc = 'alaaouda@gmail.com';
    $from = '';
    $res = SendEmail($to, $cc, $from, $subject, $body, "");
    $saved_result = SaveEmailOfResposibleToDB ($dbname,$to,$cc,$res,$corrective_action,$subject,$body);
}
function SaveCorrectiveActionEmailOfMonitorToDB($dbname,$to,$cc,$is_sent,$corrective_actions,$subject,$body){
    try {
        $db = getDBConnection($dbname);
    } catch (Exception $ex) {
        throw new Exception($ex->getMessage());
    }
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
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':from',$from);
    $stmt->bindParam(':to',$to);
    $stmt->bindParam(':cc',$cc);
//    $stmt->bindParam(':hist_hazard_id',$hist_hazard_id);
    if($corrective_actions[0]->employee_id !== null)
        $stmt->bindParam(':send_to_employee_id',$corrective_actions[0]->employee_id);
    else
        $stmt->bindParam(':send_to_group_id',$corrective_actions[0]->group_id);
//    $stmt->bindValue(':cc_employee_id','');
    if($is_sent == true)
        $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
    else
        $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
    $stmt->bindParam(':email_type_id',$corrective_actions[0]->email_type_id);
    $stmt->bindParam(':subject',$subject);
    $stmt->bindParam(':summary',$summary);
    $stmt->bindParam(':org_id',$corrective_actions[0]->org_id);
    $stmt->execute();
    $query = "update $dbname.`email_to_esc` set last_sent_date = NOW() where email_to_esc_id = :email_to_esc_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_to_esc_id',$corrective_actions[0]->email_to_esc_id);
    $stmt->execute();
    // save email body to the file system
    $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
    fwrite($file, strip_tags($body, '<br/>'));
    fclose($file);
    foreach($corrective_actions as $ca){
        $report_exist = CheckInReportEmailLog($dbname, $db, $email_log_id, $ca);
        if(count($report_exist) === 0){
            InsertIntoReportEmailLog($dbname, $db, $email_log_id, $ca);
        }
        $query = "INSERT INTO $dbname.`corr_act_email`
                            (email_log_id, hist_corrective_action_id)
                        VALUES (:email_log_id,:hist_corrective_action_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email_log_id',$email_log_id);
        $stmt->bindParam(':hist_corrective_action_id',$ca->hist_corrective_action_id);
        $stmt->execute();
    }
}
function SaveEmailOfMonitorToDB($dbname,$to,$cc,$is_sent,$report_data,$subject,$body){
    try {
        $db = getDBConnection($dbname);
    } catch (Exception $ex) {
        throw new Exception($ex->getMessage());
    }
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
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':from',$from);
    $stmt->bindParam(':to',$to);
    $stmt->bindParam(':cc',$cc);
//    $stmt->bindParam(':hist_hazard_id',$hist_hazard_id);
    if($report_data->employee_id !== null)
        $stmt->bindParam(':send_to_employee_id',$report_data->employee_id);
    else
        $stmt->bindParam(':send_to_group_id',$report_data->group_id);
//    $stmt->bindValue(':cc_employee_id','');
    if($is_sent == true)
        $stmt->bindValue(":is_sent", 1, PDO::PARAM_INT);
    else
        $stmt->bindValue(":is_sent", 0, PDO::PARAM_INT);
    $stmt->bindParam(':email_type_id',$report_data->email_type_id);
    $stmt->bindParam(':subject',$subject);
    $stmt->bindParam(':summary',$summary);
    $stmt->bindParam(':org_id',$report_data->org_id);
    $stmt->execute();
    $query = "update $dbname.`email_to_esc` set last_sent_date = NOW() where email_to_esc_id = :email_to_esc_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_to_esc_id',$report_data->email_to_esc_id);
    $stmt->execute();
    // save email body to the file system
    $file = fopen(ROOT_PATH . "emails/$dbname/$email_log_id.doc", 'w');
    fwrite($file, strip_tags($body, '<br/>'));
    fclose($file);
    // missing the following step!!!
//    InsertIntoReportEmailLog($dbname, $db, $email_log_id, $report_data);
}
function SendToNotificationMonitor($dbname, $escalation_type, $subject, $body, $report_data){
    $to = 'alaa.elsherbiny@procuredox.com';
    $cc = '';
    $from = '';
//    $to = $report_data[0]->email_to;
    $res = SendEmail($to, $cc, $from, $subject, $body, "");
    if($escalation_type === 'correctiveaction')
        $saved_result = SaveCorrectiveActionEmailOfMonitorToDB ($dbname,$to,$cc,$res,$report_data,$subject,$body);
    else
        $saved_result = SaveEmailOfMonitorToDB ($dbname,$to,$cc,$res,$report_data,$subject,$body);
}
function SendEscalatedCorrectiveActionEmail(){
    foreach($GLOBALS['DBs'] as $dbname){
        try {
            $db = getDBConnection($dbname);
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
        $query = "SELECT subject,body FROM $dbname.email_template";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $template = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $query = "call $dbname.corrective_action_escalated()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        do {
            if($stmt->rowCount()){
                $corrective_actions = $stmt->fetchAll(PDO::FETCH_OBJ);
                $email_data = $template->body.'<br/>';
                foreach($corrective_actions as $key=>$ca){
                    $body = $template->body.'<br/>';
                    $corrective_action_replace = ReplaceCorrectiveActionsParamters($dbname, $ca);
                    $body .= $corrective_action_replace.'<br/>';
                    $email_data .= '<br/>'.$corrective_action_replace;
                    $subject = 'Expired Corrective Actions';
                    if($key === count($corrective_actions)-1){
                        $escalation_type = 'correctiveaction';
                        SendToNotificationMonitor($dbname, $escalation_type, $subject, $email_data, $corrective_actions);
                    }
                    SendToResponsiblePersons($dbname, $subject, $body, $ca);
                }
            }
        } while ($stmt->nextRowset());
    }
    //    var_dump($ca);
//    $email_data = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
//    $stmt->nextRowSet();
//    $corrective_actions = $stmt->fetchAll(PDO::FETCH_OBJ);
//    $to = $email_data->email_to;
//    return $res;
}
function SendEscalatedInvestigationEmail(){
    $dbname = 'stellarhse_incident';
        try {
            $db = getDBConnection($dbname);
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
        $query = "SELECT subject,body FROM $dbname.email_template";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $template = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $query = "call $dbname.investigation_escalated()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        do {
            if($stmt->rowCount()){
                $investigations = $stmt->fetchAll(PDO::FETCH_OBJ);
                $email_data = $template->body.'<br/>';
                foreach($investigations as $key=>$inv){
                    $body = $template->body.'<br/>';
                    $investigation_replace = ReplaceInvestigationParamters($inv);
                    $body .= $investigation_replace.'<br/>';
                    $email_data .= '<br/>'.$investigation_replace;
                    $subject = 'Expired Investigations';
                    $escalation_type = 'investigation';
                    SendToNotificationMonitor($dbname, $escalation_type, $subject, $body, $inv);
                }
            }
        } while ($stmt->nextRowset());
}
function SendEscalatedTrainingEmail(){
    $dbname = 'stellarhse_training';
        try {
            $db = getDBConnection($dbname);
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
        $query = "SELECT subject,body FROM $dbname.email_template";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $template = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $query = "call $dbname.overdue_escalated()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        do {
            if($stmt->rowCount()){
                $trainings = $stmt->fetchAll(PDO::FETCH_OBJ);
                $email_data = $template->body.'<br/>';
                foreach($trainings as $key=>$training){
                    $body = $template->body.'<br/>';
                    $training_replace = ReplaceTrainingParamters($training);
                    $body .= $training_replace.'<br/>';
                    $email_data .= '<br/>'.$training_replace;
                    $subject = 'Overdue Training';
                    $escalation_type = 'training';
                    SendToNotificationMonitor($dbname, $escalation_type, $subject, $body, $training);
                }
            }
        } while ($stmt->nextRowset());
}
function SendExpiredCertificateEmail(){
    $dbname = 'stellarhse_training';
        try {
            $db = getDBConnection($dbname);
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
        $query = "SELECT subject,body FROM $dbname.email_template";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $template = $stmt->fetchAll(PDO::FETCH_OBJ)[0];
        $query = "call $dbname.expiry_certificate_escalated()";
        $stmt = $db->prepare($query);
        $stmt->execute();
        do {
            if($stmt->rowCount()){
                $trainings = $stmt->fetchAll(PDO::FETCH_OBJ);
                $email_data = $template->body.'<br/>';
                foreach($trainings as $key=>$training){
                    $body = $template->body.'<br/>';
                    $training_replace = ReplaceTrainingParamters($training);
                    $body .= $training_replace.'<br/>';
                    $email_data .= '<br/>'.$training_replace;
                    $subject = 'Expired training certificate';
                    $escalation_type = 'training';
                    SendToNotificationMonitor($dbname, $escalation_type, $subject, $body, $training);
                }
            }
        } while ($stmt->nextRowset());
}
function SendAllEmails(){
    SendEscalatedCorrectiveActionEmail();
    SendEscalatedInvestigationEmail();
    SendEscalatedTrainingEmail();
    SendExpiredCertificateEmail();
}
SendAllEmails();
