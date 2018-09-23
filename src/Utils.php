<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\FirePHPHandler;

class MyError {

    public $file;
    public $line;
    public $message;

}

class FileToSend {

    public $securityKey;
    public $xmlName;
    public $session;
    public $xmlbody;

}

class MyLogger {

    private static $logger = null;

    public static function init() {
        $logger = self::$logger;
        if (!isset(self::$logger)) {
            self::$logger = new Logger('my_logger');
            $log_date = date("m-d-Y");
            $log_file = __DIR__ . '/log/stellar_logger' . $log_date . '.log';
            self::$logger->pushHandler(new StreamHandler($log_file, Logger::DEBUG));
            self::$logger->pushHandler(new FirePHPHandler());
        }
    }

    public static function info($funcName, $IncParams) {
        self::init();
        self::$logger->info($funcName, $IncParams);
    }

    public static function error($error) {
        self::init();
        self::$logger->error($error);
    }

}

class Utils {

    function get_hostname() {
        return HOSTNAME;
    }

    function generateStrongPassword($length = 9, $add_dashes = false, $available_sets = 'lud') {
        $sets = array();
        if (strpos($available_sets, 'l') !== false)
            $sets[] = 'abcdefghjkmnpqrstuvwxyz';
        if (strpos($available_sets, 'u') !== false)
            $sets[] = 'ABCDEFGHJKMNPQRSTUVWXYZ';
        if (strpos($available_sets, 'd') !== false)
            $sets[] = '23456789';
        if (strpos($available_sets, 's') !== false)
            $sets[] = '!@#$%&*?';

        $all = '';
        $password = '';
        foreach ($sets as $set) {
            $password .= $set[array_rand(str_split($set))];
            $all .= $set;
        }

        $all = str_split($all);
        for ($i = 0; $i < $length - count($sets); $i++)
            $password .= $all[array_rand($all)];

        $password = str_shuffle($password);

        if (!$add_dashes)
            return $password;

        $dash_len = floor(sqrt($length));
        $dash_str = '';
        while (strlen($password) > $dash_len) {
            $dash_str .= substr($password, 0, $dash_len) . '-';
            $password = substr($password, $dash_len);
        }
        $dash_str .= $password;
        return $dash_str;
    }

    function generateRandomChar($x) {
        $alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        $pass = array();
        $alphaLength = strlen($alphabet) - 1;
        for ($i = 0; $i < $x; $i++) {
            $n = rand(0, $alphaLength);
            $pass[] = $alphabet[$n];
        }
        return implode($pass);
    }

    function object_to_array($data) {
        if (is_array($data) || is_object($data)) {
            $result = array();
            foreach ($data as $key => $value) {
                $result[$key] = $this->object_to_array($value);
            }
            return $result;
        }
        return $data;
    }

    function getGUID() {
        if (function_exists('com_create_guid')) {
            return com_create_guid();
        } else {
            mt_srand((double) microtime() * 10000); //optional for php 4.2.0 and up.
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45); // "-"
            $uuid = chr(123)// "{"
                    . substr($charid, 0, 8) . $hyphen
                    . substr($charid, 8, 4) . $hyphen
                    . substr($charid, 12, 4) . $hyphen
                    . substr($charid, 16, 4) . $hyphen
                    . substr($charid, 20, 12)
                    . chr(125); // "}"
            return strtolower(str_replace('}', '', str_replace('{', '', $uuid)));
        }
    }

    public static function getUUID($db) {
        $query = "SELECT MyUUID() as MyUUID";
        $stmt = $db->prepare($query);
        $stmt->execute();
        return $stmt->fetchColumn();
    }

    public static function formatMySqlDate($date) {
        $mySqlDate = "";
        if ($date && $date != "")
            $mySqlDate = date('Y-m-d', strtotime(preg_replace('#(\d{2})/(\d{2})/(\d{4})\s(.*)#', '$3-$2-$1 $4', $date)));
        return $mySqlDate;
    }

}

class Result {
    
}

//
//class Error {
//    public $file;
//    public $line;
//    public $message;
//}

class Success {

    public $success;

}

class errorMessage {

    function GetError($file, $line, $message) {
        $error = new MyError();
        $error->line = $line;
        $error->file = $file;
        $error->message = $message;
        return json_encode($error);
    }

}

class SendEMail {

    public $status;
    public $return;
    public $subject;
    public $body;
    public $to;
    public $from;
    public $cc;
    public $bcc;

    function sendmail($email) {
        $mail = new PHPMailer(true);
        $mail->IsSMTP();
        try {
            $mail->Timeout = 180;
            $mail->CharSet = "UTF-8"; // To support special characters in SMTP mail             
            $mail->Host = MAIL_SERVER;
            $mail->SMTPDebug = 1;
            $mail->SMTPAuth = 1;
            $mail->SMTPSecure = 'tls';
            $mail->Port = 587;
            $mail->Username = 'account.services@abcanada.com';
            $mail->Password = 'SnowCity@2014';
            // $mail->AddReplyTo('rasha.atta@sphinxinfotech.net', 'ABCanTrack Account Services');
            $mail->SetFrom('account.services@abcanada.com', 'ABCanTrack Account Services');
            $mail->AddAddress($email->to, $email->fullname);
            if ($email->cc !== null && $email->cc !== '') {
                $cc = explode(',', $email->cc);
                foreach ($cc as $em)
                    $mail->AddCC($em);
            }
            if ($email->attachments !== null && count($email->attachments) !== 0) {
                foreach ($email->attachments as $attachment) {
                    $mail->AddAttachment($attachment->path, $attachment->filename, $attachment->encoding, $attachment->mimetype);
                }
            }
            $mail->Subject = $email->subject;
            $mail->MsgHTML($email->body);
            $result = $mail->send();
            // $this->return = 1;
            return $result;
        } catch (phpmailerException $ex) {
            throw new Exception($ex->getMessage());
        } catch (Exception $ex) {
            throw new Exception($ex->getMessage());
        }
    }

}

function SendUserEmail($TemName, $employee_id, $org_id, $NewPassword, $db) {
    $error = new errorMessage();
    $utils = new Utils();
    try {
        $Site_Url = SITE_URL;
        $queryEmp = "select org_name, oe.org_id,language_id, user_name, `password`, e.email , e.first_name, e.last_name,language_id
                        FROM stellarhse_auth.employee  e
                        inner join stellarhse_auth.org_employee  oe on oe.employee_id = e.employee_id
                        inner join stellarhse_auth.organization   o on o.org_id = oe.org_id
                        where emp_is_active = '1'
                        and e.employee_id = :employee_id ";


        if ($org_id == '') {
            $stmt = $db->prepare($queryEmp);
            $stmt->bindParam(":employee_id", $employee_id);
        } else {
            $queryEmp = $queryEmp . "  and oe.org_id = :org_id ";

            $stmt = $db->prepare($queryEmp);
            $stmt->bindParam(":employee_id", $employee_id);
            $stmt->bindParam(":org_id", $org_id);
        }
        $stmt->execute();
        $EmployeeArray = $stmt->fetch(PDO::FETCH_ASSOC);

        $queryAdmin = "select first_name, last_name, primary_phone, alternate_phone , e.email, org_name
                        FROM `stellarhse_auth`.organization org
                        left join `stellarhse_auth`.employee e on org.system_admin_id = e.employee_id  ";
        if ($org_id == '') {
            $queryAdmin .= "  where org_id=:org_id ";
            $stmt = $db->prepare($queryAdmin);
            $stmt->bindParam(":org_id", $org_id);
        } else {
            $queryAdmin .= "  where org.org_id in(select org_id from `stellarhse_auth`.org_employee where employee_id = :employee_id ) ";
            $stmt = $db->prepare($queryAdmin);
            $stmt->bindParam(":employee_id", $employee_id);
        }
        $stmt->execute();
        $AdminArray = $stmt->fetch(PDO::FETCH_ASSOC);


        $AdminPhone = '';
        $AdminName = $AdminArray["first_name"] . ' ' . $AdminArray["last_name"];
        if ($AdminArray["primary_phone"] != '') {
            $AdminPhone = $AdminArray["primary_phone"];
        } else {
            $AdminPhone = $AdminArray["alternate_phone"];
        }

        $StartChar = $utils->generateRandomChar(1);
        $EndChar = $utils->generateRandomChar(1);
        $Newpassword = $EmployeeArray["password"];

        $ActivationUrl = SITE_URL . "#/accountactiviation/" . $StartChar . $Newpassword . $EndChar . "";

        $link = "<a href='" . $ActivationUrl . "'>Activate</a> ";

        $TemplateArray = GetTemplateParams($TemName, $org_id, $EmployeeArray["language_id"], $db);

        $subject = $TemplateArray["subject"];
        $body = $TemplateArray["body"];

        $subject = str_replace("$" . "Organization_OrgName", $EmployeeArray["org_name"], $subject);

        // if ($TemName == 'ActivateUserAccount') {
        //     $NewPassword = $utils->generateStrongPassword();
        //     $queryUpdate = "Update `stellarhse_auth`.employee  set `password` = :NewPassword  Where employee_id  = :employee_id ";
        //     $stmt = $DB->prepare($queryUpdate);
        //     $stmt->bindParam(":employee_id", $employee_id);
        //     $stmt->bindParam(":NewPassword", $NewPassword);
        //     $stmt->execute();
        // }

        $body = str_replace("$" . "Organization_OrgName", $EmployeeArray["org_name"], $body);
        $body = str_replace("$" . "User_UserName", $EmployeeArray["user_name"], $body);
        $body = str_replace("$" . "User_UserPassword", $NewPassword, $body);
        $body = str_replace("$" . "Site_Url", $Site_Url, $body);
        $body = str_replace("$" . "Organization_AdminName", $AdminName, $body);
        $body = str_replace("$" . "Organization_AdminEmail", $AdminArray["Email"], $body);
        $body = str_replace("$" . "Organization_AdminPhone", $AdminPhone, $body);
        $body = str_replace("$" . "Activate_Link", $link, $body);

        $to = $EmployeeArray["user_name"];
        $result = true;
        // if (SITE_URL != "http://stellarhse.dev:8080/") {
        $from = 'account.services@abcanada.com';
        $result = SendEmail($to, $from, $subject, $body, "");
        // }

        $query = "select employee_id from `stellarhse_auth`.employee where `email` = :to ";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":to", $to);
        $stmt->execute();
        $SendToEmployeeId = $stmt->fetchColumn();
        $from = 'account.services@abcanada.com';

        SaveEmails($from, $SendToEmployeeId, "", $result, $TemName, $subject, $body, "0", $db, $EmployeeArray['language_id']);
    } catch (PDOException $ex) {
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    } catch (Exception $ex) {
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    }
}

function SaveEmails($from, $send_to_employee_id, $cc_employee_id, $is_sent, $email_type_name, $subject, $EmailBody, $IsManual, $db, $language_id) {
    $error = new errorMessage();
    $utils = new Utils();
    /* Create the logger */
    $logger = new Logger('stellar_logger');
    /* Now add some handlers */
    $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
    $logger->pushHandler(new FirePHPHandler());

    try {
        $email_log_id = Utils::getUUID($db);
        $query = "SELECT email_type_id FROM `stellarhse_auth`.email_type where email_type_name =:email_type_name  and language_id =:language_id ";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email_type_name", $email_type_name);
        $stmt->bindParam(":language_id", $language_id);
        $stmt->execute();
        $email_type_id = $stmt->fetchColumn();

        if ($is_sent == null || $is_sent == 'null') {
            $is_sent = 1;
        }

        $cc_employee_id = null;
        $query = "INSERT INTO `stellarhse_auth`.`email_log`
                    (`email_log_id`,`from`, send_to_employee_id, cc_employee_id, is_sent, `error`, email_type_id, `subject`)
                VALUES
                    (:email_log_id,:from ,:send_to_employee_id , null ,1 , null,  :email_type_id , :subject );";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email_log_id", $email_log_id);
        $stmt->bindParam(":from", $from);
        $stmt->bindParam(":send_to_employee_id", $send_to_employee_id);
        $stmt->bindParam(":email_type_id", $email_type_id);
        $stmt->bindParam(":subject", $subject);
        $stmt->execute();

        $file = "emails/" . $email_log_id . ".doc";

        file_put_contents($file, $EmailBody);
    } catch (PDOException $ex) {
        $logger->error($ex->getMessage());
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    } catch (Exception $ex) {
        $logger->error($ex->getMessage());
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    }
}

function GetTemplateParams($TemName, $org_id, $language_id, $db) {
    $error = new errorMessage();
    /* Create the logger */
    $logger = new Logger('stellar_logger');
    /* Now add some handlers */
    $logger->pushHandler(new StreamHandler(__DIR__ . '/stellar.log', Logger::DEBUG));
    $logger->pushHandler(new FirePHPHandler());
    try {
        $info = 'email_type_name:' . $TemName . '    ----    org_id: ' . $org_id . '   ----      language_id: ' . $language_id;
        $logger->info(json_encode($info));
        $query;
        $stmt;
        $query = "select * FROM `stellarhse_auth`.email_template  
                    inner join `stellarhse_auth`.email_type on email_type.email_type_id = email_template.email_type_id 
                    where  email_type_name = :TemName  and email_template.language_id =:language_id ";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":TemName", $TemName);
        $stmt->bindParam(":language_id", $language_id);
        $stmt->execute();
        $TempArray = $stmt->fetch(PDO::FETCH_ASSOC);

        return $TempArray;
    } catch (PDOException $ex) {
        $logger->error($ex->getMessage());
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    } catch (Exception $ex) {
        $logger->error($ex->getMessage());
        echo $error->GetError($ex->getFile(), $ex->getLine(), $ex->getMessage());
    }
}

function SendEmail($to, $from, $subject, $message, $file) {
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
        $mail->AddAddress($to);
        // $mail->AddCC($cc);
        $mail->Subject = $subject;
        $mail->MsgHTML($message);
        $result = $mail->send();
        return $result;
    } catch (phpmailerException $ex) {
        throw new Exception($ex->getMessage());
    } catch (Exception $ex) {
        throw new Exception($ex->getMessage());
    }
}
