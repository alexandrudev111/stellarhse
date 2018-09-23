<?php

function ReplaceMaintenanceCorrectiveActionsParamters($ca){
    $corrective_action_block = '$Action_Start
        Report Number: $maintenance_number
        Event type : $maintenance_type_name
        Date (mm/dd/yyyy): $maintenance_date
        Priority: $corrective_action_priority_name
        Task Status: $corrective_action_status_name
        Person responsible: $assigned_to_id
        Who else was notified?: $notified_id
        Start date: $start_date
        Target end date: $target_end_date
        Actual end date: $actual_end_date
        Estimated cost: $estimated_cost
        Description of corrective action: $task_description
        Task outcome and follow-up: $out_come_follow_up
        Did the completed task achieve desired results?: $desired_results
        Comments: $comments    
    $Action_End';
    $corrective_action_block = str_replace("$" . "Action_Start", '', $corrective_action_block);
    $corrective_action_block = str_replace("$" . "Action_End", '', $corrective_action_block);
//    foreach($corrective_actions as $ca){
//    var_dump($ca);
        $corrective_action_replace = $corrective_action_block;
        $corrective_action_replace = str_replace("$" . "maintenance_number", $ca->report_number.'<br/>', $corrective_action_replace);
         $corrective_action_replace = str_replace("$" . "maintenance_type_name", $ca->event_type_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "maintenance_date", $ca->report_date.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "corrective_action_priority_name", $ca->priority_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "corrective_action_status_name", $ca->status_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "assigned_to_id", $ca->assigned_to_name.'<br/>', $corrective_action_replace);
         $corrective_action_replace = str_replace("$" . "notified_id", $ca->notified_names.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "start_date", $ca->start_date.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "target_end_date", $ca->target_end_date.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "actual_end_date", $ca->actual_end_date.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "estimated_cost", $ca->estimated_cost.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "task_description", $ca->task_description.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "out_come_follow_up", $ca->out_come_follow_up.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "desired_results", $ca->desired_results.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "comments", $ca->comments.'<br/>', $corrective_action_replace);
        return $corrective_action_replace;
//    }
}

function InsertIntoMaintenanceEmailLog($db, $email_log_id, $corrective_action){
    $query = "INSERT INTO stellarhse_maintenance.`maintenance_email_log`
                        (email_log_id, hist_maintenance_id)
                    VALUES (:email_log_id,:hist_maintenance_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_maintenance_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $result = $stmt->rowCount();
}

function CheckInMaintenanceEmailLog($db, $email_log_id, $corrective_action){
    $query = "select * from stellarhse_maintenance.`maintenance_email_log` where email_log_id = :email_log_id and hist_maintenance_id = :hist_maintenance_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_maintenance_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $report_exist = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $report_exist;
}