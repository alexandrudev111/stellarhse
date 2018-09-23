<?php


// Routes v1
class Dropdown {

    public $id;
    public $name;

}

class Dropdowns {
    
}

function findObjectById($array, $id) {
    foreach ($array as $element) {
        if (strtolower($id) == strtolower($element->id)) {
            return $element;
        }
    }
    return false;
}
 
/* local  */
//define("SITE_URL", "http://stellarhse.dev:8080/");

/* live 192.168.12.111 */
define("SITE_URL", "http://dev.stellarhse.com/");

define("MAIL_SERVER", "WEST.EXCH028.serverdata.net");
define("ROOT_PATH", "/data/");

//require_once 'php-mailer/class.phpmailer.php';
//include '../triggers/hazard_helpers.php';
//include '../triggers/incident_helpers.php';
//include '../triggers/inspection_helpers.php';
//include '../triggers/maintenance_helpers.php';
//include '../triggers/safetymeeting_helpers.php';
//include '../triggers/training_helpers.php';

// api files 
require 'Utils.php';
require 'settings.php';
require 'core_report.php';
require 'user.php';
require 'hazard.php';
require 'inspection.php';
require 'safetymeeting.php';
require 'incident.php';
require 'training.php';
require 'core_calls.php';
require 'view_data_tables.php';
require 'maintenance.php';
include_once 'customer.php';
include_once 'chart.php';
include_once 'third_parties.php';
include_once 'locations.php';
include_once 'manage_people.php';
include_once 'manage_notification.php';
include_once 'manage_groups.php';
include_once 'dashboard.php';
include_once 'trainningProvider.php';
include_once 'trainningType.php';
include_once 'equipment.php';
include_once 'hse_documents.php';
include_once 'myAdmin.php';
include_once 'my_recent_report.php';
