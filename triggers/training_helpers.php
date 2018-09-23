<?php

function ReplaceTrainingCorrectiveActionsParamters($ca){
    $corrective_action_block = '$Action_Start
        Report Number: $training_number
        Event type : $training_type_name
        Date (mm/dd/yyyy): $traininy_completed_by
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
        $corrective_action_replace = str_replace("$" . "training_number", $ca->report_number.'<br/>', $corrective_action_replace);
         $corrective_action_replace = str_replace("$" . "training_type_name", $ca->event_type_name.'<br/>', $corrective_action_replace);
        $corrective_action_replace = str_replace("$" . "traininy_completed_by", $ca->report_date.'<br/>', $corrective_action_replace);
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

function InsertIntoTrainingEmailLog($db, $email_log_id, $corrective_action){
    $query = "INSERT INTO stellarhse_training.`training_email_log`
                        (email_log_id, hist_training_id)
                    VALUES (:email_log_id,:hist_training_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_training_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $result = $stmt->rowCount();
}

function CheckInTrainingEmailLog($db, $email_log_id, $corrective_action){
    $query = "select * from stellarhse_training.`training_email_log` where email_log_id = :email_log_id and hist_training_id = :hist_training_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email_log_id',$email_log_id);
    $stmt->bindParam(':hist_training_id',$corrective_action->hist_report_id);
    $stmt->execute();
    $report_exist = $stmt->fetchAll(PDO::FETCH_OBJ);
    return $report_exist;
}

function ReplaceTrainingParamters($training){
    $training_block = '$Training_Start
        Report Number: $training_number
        Event type : $training_type
        Date (mm/dd/yyyy): $traininy_completed_by
        Reason: $training_reason
        Training assigned by: $training_assigned_by_name
        Training assigned to: $assigned_to_name $assigned_to_position, supervised by: $assigned_to_supervisor
        Training provided by: $staff_member $provider_name
        Address: $address $city $state
        Website: $website
        Provider contact name: $provider_contact_name $provider_phone
        Evidence of completion: $evidence_of_completion
        Training completed date: $completed_date
        Level achieved: $level_achieved
        Course mark: $course_mark
        Recertificate/expiry date: $expiry_date
        Training Quality: $training_quality
        Comments: $comments
        Trainee observed post-training to verify competence: $is_trainee_observed_post
        Date observed: $observed_date
        Observed by: $observed_by
        Observations: $observations
    $Training_End';
    $training_block = str_replace("$" . "Training_Start", '', $training_block);
    $training_block = str_replace("$" . "Training_End", '', $training_block);
        $training_replace = $training_block;
        $training_replace = str_replace("$" . "training_number", $training->training_number.'<br/>', $training_replace);
         $training_replace = str_replace("$" . "training_type", $training->training_type.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "traininy_completed_by", $training->traininy_completed_by.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "training_reason", $training->training_reason.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "training_assigned_by_name", $training->training_assigned_by_name.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "assigned_to_name", $training->assigned_to_name, $training_replace);
         $training_replace = str_replace("$" . "assigned_to_position", $training->assigned_to_position, $training_replace);
        $training_replace = str_replace("$" . "assigned_to_supervisor", $training->assigned_to_supervisor.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "staff_member", $training->staff_member.',', $training_replace);
        $training_replace = str_replace("$" . "provider_name", $training->provider_name.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "address", $training->address.',', $training_replace);
        $training_replace = str_replace("$" . "city", $training->city.',', $training_replace);
        $training_replace = str_replace("$" . "state", $training->state.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "website", $training->website.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "provider_contact_name", $training->provider_contact_name.',', $training_replace);
        $training_replace = str_replace("$" . "provider_phone", $training->provider_phone.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "evidence_of_completion", $training->evidence_of_completion.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "completed_date", $training->completed_date.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "level_achieved", $training->level_achieved.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "course_mark", $training->course_mark.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "expiry_date", $training->expiry_date.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "training_quality", $training->training_quality.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "comments", $training->comments.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "is_trainee_observed_post", $training->is_trainee_observed_post.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "observed_date", $training->observed_date.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "observed_by", $training->observed_by.'<br/>', $training_replace);
        $training_replace = str_replace("$" . "observations", $training->observations.'<br/>', $training_replace);
        return $training_replace;
}