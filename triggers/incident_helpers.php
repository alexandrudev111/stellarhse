<?php

function ReplaceIncidentCorrectiveActionsParamters($ca){
    $corrective_action_block = '$Action_Start
        Report Number: $incident_number
        Event type : $incident_event_type_name
        Date (mm/dd/yyyy): $incident_date
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
        $corrective_action_replace = str_replace("$" . "incident_number", $ca->report_number.'<br/>', $corrective_action_replace);
         $corrective_action_replace = str_replace("$" . "incident_event_type_name", $ca->event_type_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "incident_date", $ca->report_date.'<br/>', $corrective_action_replace);
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

function InsertIntoIncidentEmailLog($db, $email_log_id, $corrective_action){
    $query = "INSERT INTO stellarhse_incident.`incident_email_log`
                        (email_log_id, hist_incident_id)
                    VALUES (:email_log_id,:hist_incident_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_incident_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $result = $stmt->rowCount();
}

function CheckInIncidentEmailLog($db, $email_log_id, $corrective_action){
    $query = "select * from stellarhse_incident.`incident_email_log` where email_log_id = :email_log_id and hist_incident_id = :hist_incident_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_incident_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $report_exist = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $report_exist;
}

function ReplaceInvestigationParamters($inv){
    $investigation_block = '$Incident_Start
        Investigation status: $inv_status_name
        Report Number: $incident_number
        Event type : $incident_event_type_name
        Date (mm/dd/yyyy): $incident_date
        Date of Investigation: $investigation_date
        Investigation Summary: $investigation_summary
        Follow-up notes: $investigation_follow_up_note
        Lead Investigator: $investigator_name1
        Investigators 2: $investigator_name2
        Investigators 3: $investigator_name3
        Response costs: $investigation_response_cost
        Repair costs: $investigation_repair_cost
        Insurance costs: $investigation_insurance_cost
        WCB costs: $investigation_wcb_cost
        Other costs: $investigation_other_cost
        TOTAL COSTS: $investigation_total_cost
        Risk of recurrence: $risk_of_recurrence_name
        Incident Severity: $severity_name
        Sources of information accessed for this investigation: $inv_source_name
        Details of sources accessed: $investigation_source_details
        Investigation signed off by: $investigation_sign_off_name
        Date investigation signed off: $investigation_sign_off_date
    $Incident_End';
    $investigation_block = str_replace("$" . "Incident_Start", '', $investigation_block);
    $investigation_block = str_replace("$" . "Incident_End", '', $investigation_block);
        $investigation_replace = $investigation_block;
        $investigation_replace = str_replace("$" . "inv_status_name", $inv->inv_status_name.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "incident_number", $inv->incident_number.'<br/>', $investigation_replace);
         $investigation_replace = str_replace("$" . "incident_event_type_name", $inv->event_type_name.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "incident_date", $inv->incident_date.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_date", $inv->investigation_date.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_summary", $inv->investigation_summary.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_follow_up_note", $inv->investigation_follow_up_note.'<br/>', $investigation_replace);
         $investigation_replace = str_replace("$" . "investigator_name1", $inv->investigator_name1.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigator_name2", $inv->investigator_name2.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigator_name3", $inv->investigator_name3.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_response_cost", $inv->investigation_response_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_repair_cost", $inv->investigation_repair_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_insurance_cost", $inv->investigation_insurance_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_wcb_cost", $inv->investigation_wcb_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_other_cost", $inv->investigation_other_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_total_cost", $inv->investigation_total_cost.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "risk_of_recurrence_name", $inv->risk_of_recurrence_name.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "severity_name", $inv->severity_name.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "inv_source_name", $inv->investigation_source_name.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_source_details", $inv->investigation_source_details.'<br/>', $investigation_replace);
//        $investigation_replace = str_replace("$" . "root_cause_name", $inv->root_cause_name.'<br/>', $investigation_replace);
//        $investigation_replace = str_replace("$" . "investigation_root_cause_note", $inv->investigation_root_cause_note.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_sign_off_date", $inv->investigation_sign_off_date.'<br/>', $investigation_replace);
        $investigation_replace = str_replace("$" . "investigation_sign_off_name", $inv->investigation_sign_off_name.'<br/>', $investigation_replace);
        return $investigation_replace;
}