<?php
   


    function GenerateIncidentReport($IncParams, $path) {
        error_reporting(0);

        try {
            MyLogger::info('GenerateIncidentReport', $IncParams);
            $EmployeeId = $IncParams['EmployeeId'];
            $OrgId = $IncParams['OrgId'];
            $OrgName = $IncParams['OrgName'];
            $IncidentId = $IncParams['IncidentId'];
            $Json = $IncParams['postedJson'];
            $paramsJson = $IncParams['paramsJson'];
            $invFound = false;
            $obserFound = false;
            require_once 'classes/PhpWord/Autoloader.php';
            \PhpOffice\PhpWord\Autoloader::register();
            $PHPWord = new \PhpOffice\PhpWord\PhpWord();
            $DB = $this->db->getDBConnection();
            $query;
            $stmt;
            $query = "CALL IncidentReport(:IncidentId)";
            $stmt = $DB->prepare($query);
            $stmt->bindParam(":IncidentId", $IncidentId);
            $stmt->execute();
            $IncidentArray = $stmt->fetch(PDO::FETCH_ASSOC);
            $LanguageId = $this->GetLanguageIdByCode($IncParams['LanguageCode']);
            $query = "SELECT distinct FieldName,  trim(FieldLabel) as FieldLabel, SubTabName, SubTabLabel, sub_tab.FieldCode
                            from org_field
                            inner join field on field.FieldId = org_field.FieldId 
                            join sub_tab on sub_tab.SubTabId= field.SubTabId
                            where  org_field.OrgId=:OrgId  and field.LanguageId=:LanguageId   and org_field.IsHidden =0
                        union
                        select FieldName,DefaultFieldLabel as FieldLabel,null as SubTabName,null as SubTabLabel, null as FieldCode 
                        from `field` where IsCustom = 1
                            and field.LanguageId=:LanguageId   and orgId is null  ;";
            $stmt = $DB->prepare($query);
            $stmt->bindParam(":OrgId", $OrgId);
            $stmt->bindParam(":LanguageId", $LanguageId);
            $stmt->execute();
            $fArray = $stmt->fetchAll(PDO::FETCH_OBJ);
            $query2 = "SELECT distinct FieldName,  trim(FieldLabel) as FieldLabel, SubTabName, SubTabLabel, sub_tab.FieldCode, (case org_field.IsHidden when '0' then 0 when '1' then 1 end ) as IsHidden
                            from org_field
                            inner join field on field.FieldId = org_field.FieldId 
                            join sub_tab on sub_tab.SubTabId= field.SubTabId
                            where  org_field.OrgId=:OrgId  and field.LanguageId=:LanguageId
                       and FieldName in('WhatHappenedCustomField','PeopleCustomField','ObservationCustomField','InvestigationCustomField',
                       'ActionCustomField','IllnessCustomField','SpillReleaseCustomField','TrafficViolationCustomField','VehicleDamageCustomField',
                       'ImpactCustomField','InjuryCustomField');";
            $stmt = $DB->prepare($query2);
            $stmt->bindParam(":OrgId", $OrgId);
            $stmt->bindParam(":LanguageId", $LanguageId);
            $stmt->execute();
            $CustFArray = $stmt->fetchAll(PDO::FETCH_OBJ);
            /*
              $query = "SELECT  DATE_FORMAT(UpdatedDate, '%b %d %Y') as UpdatedDate,
              concat (FirstName,'  ',LastName) as UpdatedBy,
              IncDescription,
              EventSequence,
              EnvConditionNote,
              EnergyFormNote,
              SubStandardActionNote ,
              SubStandardConditionNote,
              UnderLyingCauseNote,
              InvSummary,
              FollowUpNote,
              SourceDetails,
              RootCauseNote
              from hist_incident
              inner join employee on employee.EmployeeId = hist_incident.UpdatedById
              where IncidentId = :IncidentId   order by VersionNumber asc ";
              $stmt = $DB->prepare($query);
              $stmt->bindParam(":IncidentId", $IncidentId);
              $stmt->execute();
              $textHistoryArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
             */
            $headerStyle['name'] = 'Arial Narrow';
            $headerStyle['size'] = 16;
            $headerStyle['bold'] = true;
            $headerStyle['align'] = 'right';
            $dateStyle['name'] = 'Arial Narrow';
            $dateStyle['size'] = 14;
            $dateStyle['bold'] = false;
            $footerStyle['name'] = 'Arial Narrow';
            $footerStyle['size'] = 11;
            $footerStyle['bold'] = true;
            $cellTextStyle['name'] = 'Arial Narrow';
            $cellTextStyle['size'] = 10;
            $cellTextStyle['bold'] = false;
            $boldRight['bold'] = true;
            $boldRight['align'] = 'right';
            $tabsStyles['name'] = 'Arial Narrow';
            $tabsStyles['size'] = 14;
            $tabsStyles['bold'] = true;
            $tabsStyles['color'] = 'c0504d';
            $lablesStyles['name'] = 'Arial Narrow';
            $lablesStyles['size'] = 12;
            $lablesStyles['bold'] = true;
            $valuesStyles['name'] = 'Arial Narrow';
            $valuesStyles['size'] = 12;
            $valuesStyles['bold'] = false;
            $lablesSectionStyles['name'] = 'Arial Narrow';
            $lablesSectionStyles['size'] = 12;
            $lablesSectionStyles['bold'] = true;
            $lablesSectionStyles['spaceAfter'] = 0;
            $valuesSectionStyles['name'] = 'Arial Narrow';
            $valuesSectionStyles['size'] = 12;
            $valuesSectionStyles['bold'] = false;
            $valuesSectionStyles['spaceAfter'] = 0;
            $valuesSectionStyles['underline'] = 'single';
            $table_block_format = array('borderSize' => 6, 'valign' => 'center', 'marginLeft' => 50, 'marginRight' => 50);
            $PHPWord->addLinkStyle('NLink', array('color' => '0000FF', 'underline' => \PhpOffice\PhpWord\Style\Font::UNDERLINE_SINGLE, 'bold' => false, 'size' => 11, 'name' => 'Arial Narrow'));
            $PHPWord->addTableStyle('myTable', $table_block_format, array('align' => 'center'));
            /* add header */
            $table_header_format = array(
                'cellMarginTop' => 0,
                'cellMarginLeft' => 0,
                'cellMarginRight' => 0,
                'cellMarginBottom' => 0,
                'valign' => 'top');
            $PHPWord->addTableStyle('headerTable', $table_header_format);
            $section = $PHPWord->createSection();
            $header = $section->createHeader();
            $table = $header->addTable('headerTable');
            $table->addRow();
            $imageStyle = array(
                //  'width' => 200,
                //'height' => 80,
                'align' => 'left',
//                'marginTop' => -1,
//                'marginLeft' => -1,
//                'marginbottom' => 10,
                'wrappingStyle' => 'inline'
            );
            $cellStyle = array(
//                'valign' => 'top',
                // 'height' => 300,
//                'align' => 'left',
                'marginTop' => 20,
                'marginLeft' => 20
            );
            $cell = $table->addCell(8000);
            // $cell->addImage(Common_ROOT_PATH . $OrgId . '.gif', $imageStyle);
            $logoPath = Common_ROOT_PATH . $OrgId . '.gif';
            if (file_exists($logoPath)) {
                $logoPath = Common_ROOT_PATH . $OrgId . '.gif';
            } else {
                $logoPath = Common_ROOT_PATH . 'DefaultCompany.jpg';
            }
            $cell->addImage($logoPath, $imageStyle);
            $fieldLabel1 = $this->GetFieldLabelFromArray('WordHeader1', $fArray);
            $fieldLabel2 = $this->GetFieldLabelFromArray('WordHeader2', $fArray);
            $fieldLabel3 = $this->GetFieldLabelFromArray('WordHeader3', $fArray);
            $cell = $table->addCell(30000, array('valign' => 'top'));
            $cell->addText($fieldLabel1, $headerStyle, array('align' => 'right'));
            $cell->addText($fieldLabel2 . " " . $IncidentArray['IncidentNumber'], $headerStyle, array('align' => 'right'));
            $cell->addText($fieldLabel3 . " " . date("m/d/Y"), $dateStyle, array('align' => 'right'));
            /* Add footer   */
            $footer = $section->createFooter();
            $table2 = $footer->addTable('myTable');
            $table2->addRow(100);
            $cell = $table2->addCell(10000, $cellStyle);
            $textrun = $cell->createTextRun();
            $fieldLabel = $this->GetFieldLabelFromArray('WordFooter1', $fArray);
            $textrun->addText($fieldLabel . ' ', array('bold' => true));
            $fieldLabel = $this->GetFieldLabelFromArray('WordFooter2', $fArray);
            $textrun->addText($fieldLabel, $cellTextStyle, array('align' => 'left'));
            $fieldLabel = $this->GetFieldLabelFromArray('WordFooter3', $fArray);
            $fieldLabel2 = $this->GetFieldLabelFromArray('WordFooter4', $fArray);
            $table2->addCell(1400)->addPreserveText($fieldLabel . ' {PAGE} ' . $fieldLabel2 . ' {NUMPAGES}', $footerStyle, $boldRight);
            $styleTable = array('borderSize' => 1,
                'borderBottomColor' => 'ffffff',
                'borderRightColor' => 'ffffff',
                'borderLeftColor' => 'ffffff',
                'borderTopColor' => '000000',
                'cellMargin' => 0,
                'spaceBefore' => 0,
                'spaceAfter' => 0,
                'spacing' => 0
            );
            $PHPWord->addTableStyle('myOwnTableStyle', $styleTable);
            // Add table
            $table11 = $section->addTable('myOwnTableStyle');
            $section->addTextBreak(1);
            $table11->addRow();
            $table11->addCell(80000)->addText('');
            /* Default report data  */
            $textrun = $section->createTextRun();
            $subTabName = $this->GetSubTabLabelFromArray('whathappened', $fArray);
            $textrun->addText($subTabName, $tabsStyles);
            $textrun = $section->createTextRun();
            $textrun->addText($this->GetFieldLabelFromArray('ReportEnteredBy', $fArray) . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['CreatorName'], $valuesStyles);
            $textrun = $section->createTextRun();
            $textrun->addText($this->GetFieldLabelFromArray('LastModified', $fArray) . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['UpdatedByName'], $valuesStyles);
            $textrun = $section->createTextRun();
            $fieldLabel = $this->GetFieldLabelFromArray('IncidentId', $fArray);
            $textrun->addText($fieldLabel . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['IncidentNumber'] . "." . $IncidentArray['VersionNumber'], $valuesStyles);
            $incDate = $IncidentArray['IncidentDate'] . " " . $IncidentArray['IncidentHour'] . ":" . $IncidentArray['IncidentMinute'];
            $textrun = $section->createTextRun();
            $textrun->addText($this->GetFieldLabelFromArray('IncidentDate', $fArray) . ' ', $lablesStyles);
            $textrun->addText($incDate, $valuesStyles);
            $textrun = $section->createTextRun();
            $textrun->addText($this->GetFieldLabelFromArray('EventTypeId', $fArray) . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['EventTypeId'], $valuesStyles);
            $textrun = $section->createTextRun();
            $label = $this->GetFieldLabelFromArray('ReportedBy', $fArray);
            $textrun->addText($label . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['RepName'], $valuesStyles);
            if ($IncidentArray['RepPosition'] != null) {
                $textrun->addText(", " . $IncidentArray['RepPosition'], $valuesStyles);
            }
            if ($IncidentArray['RepEmail'] != null) {
                $textrun->addText(", ", $valuesStyles);
                $textrun->addLink($IncidentArray['RepEmail'], null, 'NLink');
            }
            if ($IncidentArray['RepCompany'] != null) {
                $textrun->addText(", " . $IncidentArray['RepCompany'], $valuesStyles);
            }
            if ($IncidentArray['RepPrimaryPhone'] != null) {
                $textrun->addText(", " . $IncidentArray['RepPrimaryPhone'], $valuesStyles);
            }
            if ($IncidentArray['RepAlternatePhone'] != null) {
                $textrun->addText(", " . $IncidentArray['RepAlternatePhone'], $valuesStyles);
            }
            $textrun = $section->createTextRun();
            $label = $this->GetFieldLabelFromArray('IncidentLocation', $fArray);
            $textrun->addText($label . ' ', $lablesStyles);
            $textrun->addText($IncidentArray['Location1Id'] . ", " . $IncidentArray['Location2Id'], $valuesStyles);
            if ($IncidentArray['Location3Id'] != '' && $IncidentArray['Location3Id'] != null) {
                $textrun->addText(", " . $IncidentArray['Location3Id'], $valuesStyles);
            }
            if ($IncidentArray['Location4Id'] != '' && $IncidentArray['Location4Id'] != null) {
                $textrun->addText(", " . $IncidentArray['Location4Id'], $valuesStyles);
            }
            if ($IncidentArray['OtherLocation'] != '' && $IncidentArray['OtherLocation'] != null) {
                $textrun->addText(", " . $IncidentArray['OtherLocation'], $valuesStyles);
            }
            $textrun = $section->createTextRun();
            $textrun->addText($this->GetFieldLabelFromArray('IncDescription', $fArray) . ' ', $lablesStyles);
            $value = $IncidentArray['IncDescription'];
            // $textrun->addText($text, $valuesStyles);
            $textlines = explode("<br><br>", $value);
            $oldVal = '';
            $descArray = Array();
            foreach ($textlines as $line) {
                $part = explode("<pr>", $line);
                $line = $part[1];
                if ($oldVal != $line) {
                    if (($line) != '') {
                        $oldVal = $line;
                        array_push($descArray, ($part[0] . $part[1]));
                    }
                }
            }
            for ($n = count($descArray) - 1; $n >= 0; $n--) {
                $textrun = $section->createTextRun();
                $textrun->addText($descArray[$n], $valuesStyles);
            }
            $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($PHPWord, 'Word2007');
            $objWriter->save($path);
            /* Dinamic body start   */
            $impactTitleFound = false;
            $query;
            $stmt;
            $impactFound = false;
            $foundImpactCustomField = false;
            $foundWhatHappened = false;
            $foundObservation = false;
            $foundInvestigation = false;
            $foundActions = false;
            $foundPeople = false;
            $foundCost = false;
            for ($i = 0; $i < count($Json); $i++) {
                $FieldName = addslashes($Json[$i]);
                $fieldItems = '';
                if ($paramsJson !== '') {
                    for ($x = 0; $x < count($paramsJson); $x++) {
                        if ($paramsJson[$x]['FieldName'] == $FieldName) {
                            $fieldItems = $paramsJson[$x]['FieldParamName'];
                        }
                    }
                }
                if ($FieldName == 'IncidentNumber' || $FieldName == 'VersionNumber' || $FieldName == 'IncidentDate' || $FieldName == 'EventTypeId' || $FieldName == 'RepName' || $FieldName == 'RepPosition' || $FieldName == 'RepEmail' || $FieldName == 'RepCompany' || $FieldName == 'RepPrimaryPhone' || $FieldName == 'Location1Id' || $FieldName == 'Location2Id' || $FieldName == 'Location3Id' || $FieldName == 'Location4Id' || $FieldName == 'OtherLocation' || $FieldName == 'IncDescription' || $FieldName == 'UpdatedByName' || $FieldName == 'CreatorName'
                ) {
                    
                } else if ($FieldName == "CustomerId") {
                    $fieldLabel = $this->GetFieldLabelFromArray('CustomerInvolved', $fArray);
                    $section->addText($fieldLabel, $lablesSectionStyles);
                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM inc_third_party 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            /*  Customers involved section */
                            $queryCustomer = "SELECT  ThirdPartyName as CustomerId,  JobNumber as CustomerJobNumber, inc_third_party.ContactName as CustName
                                FROM inc_third_party 
                                inner join third_party on third_party.ThirdPartyId = inc_third_party.ThirdPartyId
                                inner join third_party_type on third_party_type.ThirdPartyTypeId = third_party.ThirdPartyTypeId					
                                where ThirdPartyTypeCode ='Customer' and IncidentId =:IncidentId";
                            $stmt = $DB->prepare($queryCustomer);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->execute();
                            $CustomerArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            if (count($CustomerArray) > 0) {
                                $cc = 0;
                                $custLabels = array('CustomerId', 'CustomerJobNumber', 'CustName');
                                if ($fieldItems !== '') {
                                    $arr = explode(',', $fieldItems);
                                }
                                if ($fieldItems !== '') {
                                    $custLabels = $arr;
                                }
                                for ($a = 0; $a < count($CustomerArray); $a++) {
                                    $textrun = $section->createTextRun();
                                    for ($x = 0; $x < count($custLabels); $x++) {
                                        if ($cc != 0) {
                                            $textrun->addText(', ');
                                        }
                                        $FieldName = $custLabels[$x];
                                        $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                        if (strpos($label, ':') == false && $label != '') {
                                            $label = $label . ':';
                                        }
                                        $value = $CustomerArray[$a][$FieldName];
                                        $textrun->addText($label . ' ', $lablesStyles);
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $cc++;
                                    }
                                    $cc = 0;
                                }
//           
                                $objWriter->save($path);
                            }
                        }
                    }
                } else if ($FieldName == "ContractorId") {
                    /*  Contractors involved section  */
                    $queryContractor = "SELECT  ThirdPartyName as ContractorId,  JobNumber as ContractorJobNumber, inc_third_party.ContactName as ContName
                                    FROM inc_third_party 
                                        inner join third_party on third_party.ThirdPartyId = inc_third_party.ThirdPartyId
                                        inner join third_party_type on third_party_type.ThirdPartyTypeId = third_party.ThirdPartyTypeId					
                                    where ThirdPartyTypeCode ='Contractor' and IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryContractor);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $ContractorArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $fieldLabel = $this->GetFieldLabelFromArray('ContractorsInvolved', $fArray);
                    $section->addText($fieldLabel, $lablesSectionStyles);
                    if (count($ContractorArray) > 0) {
                        $gg = 0;
                        $custLabels = array('ContractorId', 'ContractorJobNumber', 'ContName');
                        if ($fieldItems !== '') {
                            $arr = explode(',', $fieldItems);
                        }
                        if ($fieldItems !== '') {
                            $custLabels = $arr;
                        }
                        for ($g = 0; $g < count($ContractorArray); $g++) {
                            $textrun = $section->createTextRun();
                            for ($y = 0; $y < count($custLabels); $y++) {
                                if ($gg != 0) {
                                    $textrun->addText(', ');
                                }
                                $FieldName = $custLabels[$y];
                                $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if (strpos($label, ':') == false && $label != '') {
                                    $label = $label . ':';
                                }
                                $value = $ContractorArray[$g][$FieldName];
                                $textrun->addText($label . ' ', $lablesStyles);
                                if ($value != '' && $value != null) {
                                    $textrun->addText($value, $valuesStyles);
                                }
                                $gg++;
                            }
                            $gg = 0;
                        }
//   
                        $objWriter->save($path);
                    }
                } else if ($FieldName == "EnvConditions") {
                    /*  Contractors involved section  */
                    $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                    if (strpos($label, ':') == false && $label != '') {
                        $label = $label . ':';
                    }
                    $section->addText($label, $lablesSectionStyles);
                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM inc_env_cond 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            $queryEnvConditions = "SELECT  EnvConditionName, group_concat(EnvCondParameterName separator '; ')  as EnvCondParameterName
                                                    FROM inc_env_cond 
                                                    inner join env_cond_parameter on env_cond_parameter.EnvCondParameterId = inc_env_cond.EnvCondParameterId
                                                    inner join env_condition on env_condition.EnvConditionId = env_cond_parameter.EnvConditionId					
                                                    where IncidentId =:IncidentId
                                                    group by env_condition.EnvConditionId
                                                    order by env_condition.`EnvConditionName` asc , env_cond_parameter.`EnvCondParameterName` asc ;";
                            $stmt = $DB->prepare($queryEnvConditions);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->execute();
                            $EnvConditionsArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            if (count($EnvConditionsArray) > 0) {
                                $value = '';
                                for ($o = 0; $o < count($EnvConditionsArray); $o++) {
                                    $textrun = $section->createTextRun();
                                    $textrun->addText($EnvConditionsArray[$o]['EnvConditionName'] . ': ', $lablesStyles);
                                    $value = $EnvConditionsArray[$o]['EnvCondParameterName'];
//                                    $value = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $value);
                                    if ($value != '' && $value != null) {
                                        $textrun->addText($value, $valuesStyles);
                                    }
                                }
                            }
                        }
//   
                        $objWriter->save($path);
                    }
                } else if ($FieldName == "PeopleInvolvedName") {
                    /* Peoples involved section  */
                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM `people_involved` 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            /*  $queryPeople = "select PeopleInvolvedId, PeopleInvolvedName,Company,Position,Email,PrimaryPhone,AlternatePhone,ExpInCurrentPostion,ExpOverAll,Age,HowHeInvolved,RoleDescription,CertificateId 
                              from incident_people_involved_view
                              where IncidentId  =:IncidentId";
                             */
                            $queryPeople = "select   p.PeopleInvolvedId, p.PeopleInvolvedName,p.Company,p.Position,p.Email,p.PrimaryPhone,p.AlternatePhone,p.ExpInCurrentPostion,p.ExpOverAll, p.HowHeInvolved,getRoleDescription(hp.PeopleInvolvedId, hp.OriginalPeopleInvolvedId) as RoleDescription,CertificateName as CertificateId, p.Age
                                            from  people_involved p
                                            left join hist_people_involved hp on hp.PeopleInvolvedId = p.PeopleInvolvedId
                                            where p.IncidentId    =:IncidentId   group by PeopleInvolvedId;";
                            $stmt = $DB->prepare($queryPeople);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->execute();
                            $PeopleArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            $table18 = $section->addTable('myOwnTableStyle');
                            $table18->addRow(1);
                            $table18->addCell(80000)->addText('');
                            $subTabName = $this->GetSubTabLabelFromArray('people', $fArray);
                            $section->addText($subTabName, $tabsStyles);
                            if (count($PeopleArray) > 0) {
                                $pp = 0;
                                $Labels = array('PeopleInvolvedName', 'Position', 'Email', 'PrimaryPhone', 'AlternatePhone', 'Company', 'ExpInCurrentPostion', 'ExpOverAll', 'CertificateId', 'HowHeInvolved', 'RoleDescription');
                                if ($fieldItems !== '') {
                                    $arr = explode(',', $fieldItems);
                                }
                                if ($fieldItems !== '') {
                                    $Labels = $arr;
                                }
                                for ($a = 0; $a < count($PeopleArray); $a++) {
                                    $foundPeople = false;
                                    for ($x = 0; $x < count($Labels); $x++) {
                                        $FieldName = $Labels[$x];
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $value = $PeopleArray[$a][$FieldName];
                                                if (strpos($label, ':') == false) {
                                                    $label = $label . ':';
                                                }
                                                if ($FieldName == 'RoleDescription') {
                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                } else if ($FieldName == 'CertificateId') {
                                                    $textrun = $section->createTextRun();
                                                    $value = str_replace(';|', ';', $value);
                                                    $textrun->addText($label . ' ', $lablesStyles);
                                                    if ($value != '' && $value != null) {
                                                        $textrun->addText($value, $valuesStyles);
                                                    }
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'PeopleInvolvedName') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                    }
                                                    if ($FieldName == 'Email') {
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addLink($value, null, 'NLink');
                                                        }
                                                    } else if ($FieldName == 'PeopleInvolvedName') {
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('PeopleCustomField', $CustFArray);
                                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                                $query = "SELECT FieldName,  trim(FieldLabel) as FieldLabel
                                                            from org_field
                                                            inner join field on field.FieldId = org_field.FieldId
                                                            join sub_tab on sub_tab.SubTabId= field.SubTabId
                                                            join tab on tab.TabId= sub_tab.TabId
                                                            where field.OrgId is not null and  tab.FieldCode='People' and org_field.IsHidden =0
                                                            and org_field.OrgId=:OrgId";
                                                $stmt = $DB->prepare($query);
                                                $stmt->bindParam(":OrgId", $OrgId);
                                                $stmt->execute();
                                                $personFArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                            from field_value tbl1
                                            left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                            join field on field.FieldId= tbl1.FieldId
                                            where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                                $stmt = $DB->prepare($query);
                                                $stmt->bindParam(":IncidentId", $IncidentId);
                                                $stmt->bindParam(":TableKeyId", $PeopleArray[$a]['PeopleInvolvedId']);
                                                $stmt->execute();
                                                $personResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                                if (!$foundPeople) {
                                                    $CustomFieldHeader = $this->GetFieldLabelFromArray('PeopleCustomField', $fArray);
                                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                                    $foundPeople = true;
                                                }
//                                    foreach ($personFArray as $key => $element) {
                                                $personFieldName = $FieldName; // $element->FieldName;
                                                $value = '';
                                                $value = $this->GetImpactFieldValue($personFieldName, $personResults);
//                                    if ($value != '' && $value != null) {
                                                $label = $this->GetFieldLabelFromArray($personFieldName, $personFArray);
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '' && $value != null) {
                                                    $textrun->addText($value, $valuesStyles);
                                                }
//                                    }
                                            }
                                        }
                                    }
                                }
                            }
                        }
//   
                        $objWriter->save($path);
                    }
                } else if ($FieldName == 'ImpactSubTypeId' || $FieldName == 'PersonalInjured' || $FieldName == 'Illness_PersonalInjured' || $FieldName == 'SourceId' || $FieldName == 'TrafficDriverName' || $FieldName == 'DamageDriverName') {
                    /* Impacts section  */
                    if (!$impactTitleFound) {
                        $table13 = $section->addTable('myOwnTableStyle');
                        $table13->addRow(1);
                        $table13->addCell(80000)->addText('');
                        $subTabName = $this->GetSubTabLabelFromArray('impacts', $fArray);
                        $section->addText($subTabName, $tabsStyles);
                        $impactTitleFound = true;
                        $query = "SELECT FieldName,  trim(FieldLabel) as FieldLabel, SubTabName,sub_tab.FieldCode
                                    from org_field
                                    inner join field on field.FieldId = org_field.FieldId
                                    join sub_tab on sub_tab.SubTabId= field.SubTabId
                                    join tab on tab.TabId= sub_tab.TabId
                                    where field.OrgId is not null and  tab.FieldCode='Impacts' and org_field.IsHidden =0
				and org_field.OrgId=:OrgId";
                        $stmt = $DB->prepare($query);
                        $stmt->bindParam(":OrgId", $OrgId);
                        $stmt->execute();
                        $impFArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                    }
                    $commonLabels = array('ImpactTypeId', 'ImpactSubTypeId', 'ImpactDescription', 'ExtAgencyId', 'IntEmployeeName1', 'PrimRespondName', 'ImpactEstimatedCost');
                    $illnessLabels = array('Illness_PersonalInjured', 'Illness_InitialTreatmentId', 'SymptomsId', 'IllnessDescription', 'Illness_RestrictedWorkId', 'Illness_LostTimeStart', 'Illness_LostTimeEnd', 'Illness_AdjustmentDays', 'Illness_TotalDaysOff');
                    $injuryLabels = array('PersonalInjured', 'InitialTreatmentId', 'BodyPartId', 'ContactCodeId', 'InjuryTypeId', 'InjuryExtAgencyId', 'BodyAreaId', 'RecordableId', 'InjuryDescription', 'Injury_RestrictedWorkId', 'LostTimeStart', 'LostTimeEnd', 'AdjustmentDays', 'TotalDaysOff');
                    $spillLabels = array('SourceId', 'DurationValue', 'QuantityValue', 'QuantityRecoveredValue', 'WhatWasIt', 'HowDidSROccur', 'IsReportable', 'ImpactsExtAgencyId');
                    // $traficLabels = array('TrafficDriverName', 'TrafficDriverLicence', 'TrafficVehicleTypeId', 'TrafficVehicleLicence', 'Details', 'ValueOfFine', 'TicketNumber', 'HowDidThatOccur');
                    //  $damageLabels = array('DamageDriverName', 'DamageVehicleTypeId', 'DamageVehicleLicence', 'HowDidThatDone', 'DamageDescription');
                    $traficLabels = array('TrafficDriverName', 'TrafficDriverLicence', 'TrafficVehicleTypeId', 'TrafficVehicleLicence', 'Details', 'ValueOfFine', 'HowDidThatOccur', 'TicketNumber');
                    $damageLabels = array('DamageDriverName', 'DamageDriverLicence', 'DamageVehicleTypeId', 'DamageVehicleLicence', 'HowDidThatDone', 'DamageDescription');
                    if ($FieldName == 'ImpactSubTypeId') {
                        $queryImp = "Call openTextImpacts(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $ImpArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($ImpArray as $key => $val) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val->OldImpactDescription;
                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /*
                                                      $value = $val->OldImpactDescription;
                                                      $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $oldVal = '';
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                                    if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                        if (!$foundImpactCustomField) {
                                            $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                            $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                            $foundImpactCustomField = true;
                                        }
                                        $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
								from field_value tbl1
								left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
								join field on field.FieldId= tbl1.FieldId
								where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                        $stmt = $DB->prepare($query);
                                        $stmt->bindParam(":IncidentId", $IncidentId);
                                        $stmt->bindParam(":TableKeyId", $val->ImpactId);
                                        $stmt->execute();
                                        $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                        /* custom fields for impacts *///                                            
                                        $impFieldName = $FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false && $label != '') {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($FieldName == 'PersonalInjured') {
                        $queryImp = "Call openTextInjury(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $InjArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($InjArray as $key => $val1) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val1->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val1->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val1->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val1->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val1->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val1->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val1->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val1->OldImpactDescription;
                                                    //$value='Feb 21 2017 (Emerson Arnold): <pr>Driver will seek medical treatment and evaluation.<br><br>Feb 21 2017 (Emerson Arnold): <pr>Driver will seek medical treatment and evaluation.<br><br>Feb 21 2017 (Emerson Arnold): <pr>Driver will seek medical treatment and evaluation.<br><br>Feb 21 2017 (Jason Johnson): <pr>Driver will seek medical treatment and evaluation.';
                                                    //$textrun->addText($label . ' ', $lablesStyles);
                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /* if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $textlines = explode("<br><br>", $value);
                                                      $descArray = Array();
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
								from field_value tbl1
								left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
								join field on field.FieldId= tbl1.FieldId
								where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":IncidentId", $IncidentId);
                                $stmt->bindParam(":TableKeyId", $val1->InjuryId);
                                $stmt->execute();
                                $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                foreach ($impFArray as $key => $element) {
                                    if ($element->FieldCode == 'impacts') {
                                        $impFieldName = $element->FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false && $label != '') {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        foreach ($InjArray as $key => $val) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'PersonalInjured') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $injuryLabels = $arr;
                            }
                            for ($x = 0; $x < count($injuryLabels); $x++) {
                                $FieldName = $injuryLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                    if ($label != '' && $label != null) {
                                        if ($FieldName != 'Injury_RestrictedWorkId') {
                                            $value = $val->$FieldName;
                                        } else {
                                            $value = $val->RestrictedWorkId;
                                        }

                                        $label = utf8_decode($label);
                                        if (strpos($label, '’') == false) {
                                            $label = str_replace('’', '\’', $label);
                                        }
                                        if (strpos($label, ':') == false && $label != '') {
                                            $label = $label . ':';
                                        }
                                        $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                        $label = str_replace('</span>', '', $label);
                                        if ($FieldName == 'InjuryDescription') {
                                            $value = $val->OldImpactTypeDescription;
                                            $section->addText($label, $lablesStyles);
                                            $textlines = explode("<br><br>", $value);
                                            $descArray = Array();
                                            $oldVal = '';
                                            foreach ($textlines as $line) {
                                                $part = explode("<pr>", $line);
                                                $line = $part[1];
                                                if ($oldVal != trim($line)) {
                                                    if (trim($line) != '') {
                                                        $oldVal = trim($line);
                                                        array_push($descArray, ($part[0] . $part[1]));
                                                    }
                                                }
                                            }
                                            for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($descArray[$n], $valuesStyles);
                                            }
                                            /*
                                              $value = $val->OldImpactTypeDescription;
                                              $textrun->addText($label . ' ', $lablesStyles);
                                              if ((strpos($value, '<br><br>') === false)) {
                                              $value = str_replace('<pr>', '', $value);
                                              if ($value != '' && $value != null) {
                                              $textrun->addText($value, $valuesStyles);
                                              }
                                              } else {
                                              $textlines = explode("<br><br>", $value);
                                              $descArray = Array();
                                              $oldVal = '';
                                              foreach ($textlines as $line) {
                                              $part = explode("<pr>", $line);
                                              $line = $part[1];
                                              if ($oldVal != $line) {
                                              if (($line) != '') {
                                              $oldVal = $line;
                                              array_push($descArray, ($part[0] . $part[1]));
                                              }
                                              }
                                              }
                                              for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                              $textrun = $section->createTextRun();
                                              $textrun->addText($descArray[$n], $valuesStyles);
                                              }
                                              } */
                                        } else {
                                            $textrun = $section->createTextRun();
                                            if ($FieldName == 'ImpactTypeId') {
                                                $textrun->addText($label . ' ', $lablesSectionStyles);
                                                $textrun->addText($value, $valuesSectionStyles);
                                            } else {
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '' && $value != null) {
                                                    $textrun->addText($value, $valuesStyles);
                                                }
                                            }
                                        }
//                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('InjuryCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $foundCustomFields = $this->CheckCustomFieldsScetion('injury', $impFArray);
                                if ($foundCustomFields == 1 || $foundCustomFields == '1') {
                                    $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
								from field_value tbl1
								left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
								join field on field.FieldId= tbl1.FieldId
								where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                    $stmt = $DB->prepare($query);
                                    $stmt->bindParam(":IncidentId", $IncidentId);
                                    $stmt->bindParam(":TableKeyId", $val->InjuryId);
                                    $stmt->execute();
                                    $impResults2 = $stmt->fetchAll(PDO::FETCH_OBJ);
                                    /* custom fields for impacts */
                                    $CustomFieldHeader = 'InjuryCustomField';
                                    $CustomFieldHeader = $this->GetFieldLabelFromArray($CustomFieldHeader, $fArray);
                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                    foreach ($impFArray as $key => $element) {
                                        if ($val->ImpactTypeCode == 'Injury' && $element->FieldCode == 'injury') {
                                            $impFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($impFieldName, $impResults2);
                                            $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '') {
                                                    $textrun->addText(strip_tags($value), $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($FieldName == 'Illness_PersonalInjured') {
                        $queryImp = "Call openTextIllness(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $IllnessArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($IllnessArray as $key => $val12) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val12->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val12->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val12->OldImpactDescription;

                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /* $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
								from field_value tbl1
								left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
								join field on field.FieldId= tbl1.FieldId
								where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":IncidentId", $IncidentId);
                                $stmt->bindParam(":TableKeyId", $val12->IllnessId);
                                $stmt->execute();
                                $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                foreach ($impFArray as $key => $element) {
                                    if ($element->FieldCode == 'impacts') {
                                        $impFieldName = $element->FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false && $label != '') {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        foreach ($IllnessArray as $key => $val13) {
                            if ($fieldItems !== '') {
                                for ($x = 0; $x < count($paramsJson); $x++) {
                                    if ($paramsJson[$x]['FieldName'] == 'Illness_PersonalInjured') {
                                        $fieldItems = $paramsJson[$x]['FieldParamName'];
                                    }
                                }
                                $arr = explode(',', $fieldItems);
                                $illnessLabels = $arr;
                                //                                            print_r($illnessLabels);
                            }
                            for ($x = 0; $x < count($illnessLabels); $x++) {
                                $FieldName = $illnessLabels[$x];
                                $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if ($label != '' && $label != null) {

                                    if ($FieldName != 'Illness_InitialTreatmentId' && $FieldName != 'IllnessDescription' && $FieldName != 'Illness_RestrictedWorkId' && $FieldName != 'Illness_LostTimeStart' && $FieldName != 'Illness_LostTimeEnd' && $FieldName != 'Illness_AdjustmentDays' && $FieldName != 'Illness_TotalDaysOff') {
                                        $value = $val13->$FieldName;
                                    }
                                    if ($FieldName == 'Illness_InitialTreatmentId') {
                                        $value = $val13->InitialTreatmentId;
                                    } else if ($FieldName == 'Illness_RestrictedWorkId') {
                                        $value = $val13->RestrictedWorkId;
                                    } else if ($FieldName == 'Illness_LostTimeStart') {
                                        $value = $val13->LostTimeStart;
                                        // $FieldName == 'PersonalInjured') {
                                    } else if ($FieldName == 'Illness_LostTimeEnd') {
                                        $value = $val13->LostTimeEnd;
                                    } else if ($FieldName == 'Illness_AdjustmentDays') {
                                        $value = $val13->AdjustmentDays;
                                    } else if ($FieldName == 'Illness_TotalDaysOff') {
                                        $value = $val13->TotalDaysOff;
                                    }
                                    $label = utf8_decode($label);
                                    if (strpos($label, '’') == false) {
                                        $label = str_replace('’', '\’', $label);
                                    }
                                    if (strpos($label, ':') == false && $label != '') {
                                        $label = $label . ':';
                                    }
                                    if ($FieldName == 'IllnessDescription') {
                                        $value = $val13->OldImpactTypeDescription;
                                        $section->addText($label, $lablesStyles);
                                        $textlines = explode("<br><br>", $value);
                                        $descArray = Array();
                                        $oldVal = '';
                                        foreach ($textlines as $line) {
                                            $part = explode("<pr>", $line);
                                            $line = $part[1];
                                            if ($oldVal != trim($line)) {
                                                if (trim($line) != '') {
                                                    $oldVal = trim($line);
                                                    array_push($descArray, ($part[0] . $part[1]));
                                                }
                                            }
                                        }
                                        for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($descArray[$n], $valuesStyles);
                                        }
                                        /* $textrun->addText($label . ' ', $lablesStyles);
                                          if ((strpos($value, '<br><br>') === false)) {
                                          $value = str_replace('<pr>', '', $value);
                                          if ($value != '' && $value != null) {
                                          $textrun->addText($value, $valuesStyles);
                                          }
                                          } else {
                                          $descArray = Array();
                                          $textlines = explode("<br><br>", $value);
                                          $oldVal = '';
                                          foreach ($textlines as $line) {
                                          $part = explode("<pr>", $line);
                                          $line = $part[1];
                                          if ($oldVal != $line) {
                                          if (($line) != '') {
                                          $oldVal = $line;
                                          array_push($descArray, ($part[0] . $part[1]));
                                          }
                                          }
                                          }
                                          for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                          $textrun = $section->createTextRun();
                                          $textrun->addText($descArray[$n], $valuesStyles);
                                          }
                                          } */
                                    } else {
                                        $textrun = $section->createTextRun();
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '' && $value != null) {
                                                $textrun->addText($value, $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('IllnessCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $foundCustomFields = $this->CheckCustomFieldsScetion('illness', $impFArray);
                                if ($foundCustomFields == 1 || $foundCustomFields == '1') {
                                    $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
								from field_value tbl1
								left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
								join field on field.FieldId= tbl1.FieldId
								where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                    $stmt = $DB->prepare($query);
                                    $stmt->bindParam(":IncidentId", $IncidentId);
                                    $stmt->bindParam(":TableKeyId", $val13->IllnessId);
                                    $stmt->execute();
                                    $impResults2 = $stmt->fetchAll(PDO::FETCH_OBJ);
                                    /* custom fields for impacts */
                                    $CustomFieldHeader = 'IllnessCustomField';
                                    $CustomFieldHeader = $this->GetFieldLabelFromArray($CustomFieldHeader, $fArray);
                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                    foreach ($impFArray as $key => $element) {
                                        if ($val13->ImpactTypeCode == 'Illness' && $element->FieldCode == 'illness') {
                                            $impFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($impFieldName, $impResults2);
                                            $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '') {
                                                    $textrun->addText(strip_tags($value), $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($FieldName == 'SourceId') {
                        $queryImp = "Call openTextSpill_release(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $SpillArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($SpillArray as $key => $val12) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val12->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val12->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val12->OldImpactDescription;

                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /* $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                    from field_value tbl1
                                    left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                    join field on field.FieldId= tbl1.FieldId
                                    where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":IncidentId", $IncidentId);
                                $stmt->bindParam(":TableKeyId", $val12->SpillReleaseId);
                                $stmt->execute();
                                $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                foreach ($impFArray as $key => $element) {
                                    if ($element->FieldCode == 'impacts') {
                                        $impFieldName = $element->FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false && $label != '') {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        foreach ($SpillArray as $key => $val13) {
                            if ($fieldItems !== '') {
                                for ($x = 0; $x < count($paramsJson); $x++) {
                                    if ($paramsJson[$x]['FieldName'] == 'SourceId') {
                                        $fieldItems = $paramsJson[$x]['FieldParamName'];
                                    }
                                }
                                $arr = explode(',', $fieldItems);
                                $spillLabels = $arr;
                            }
                            for ($x = 0; $x < count($spillLabels); $x++) {
                                $FieldName = $spillLabels[$x];
                                $value = $val13->$FieldName;
                                $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if ($label != '' && $label != null) {

                                    $label = utf8_decode($label);
                                    if (strpos($label, '’') == false) {
                                        $label = str_replace('’', '\’', $label);
                                    }
                                    if (strpos($label, ':') == false && $label != '') {
                                        $label = $label . ':';
                                    }
                                    if ($FieldName == 'WhatWasIt' || $FieldName == 'HowDidSROccur') {
                                        $name = 'Old' . $FieldName;
                                        $value = $val13->$name;
                                        $section->addText($label, $lablesStyles);
                                        $textlines = explode("<br><br>", $value);
                                        $descArray = Array();
                                        $oldVal = '';
                                        foreach ($textlines as $line) {
                                            $part = explode("<pr>", $line);
                                            $line = $part[1];
                                            if ($oldVal != trim($line)) {
                                                if (trim($line) != '') {
                                                    $oldVal = trim($line);
                                                    array_push($descArray, ($part[0] . $part[1]));
                                                }
                                            }
                                        }
                                        for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($descArray[$n], $valuesStyles);
                                        }
                                        /* $textrun->addText($label . ' ', $lablesStyles);
                                          if ((strpos($value, '<br><br>') === false)) {
                                          $value = str_replace('<pr>', '', $value);
                                          if ($value != '' && $value != null) {
                                          $textrun->addText($value, $valuesStyles);
                                          }
                                          } else {
                                          $descArray = Array();
                                          $textlines = explode("<br><br>", $value);
                                          $oldVal = '';
                                          foreach ($textlines as $line) {
                                          $part = explode("<pr>", $line);
                                          $line = $part[1];
                                          if ($oldVal != $line) {
                                          if (($line) != '') {
                                          $oldVal = $line;
                                          array_push($descArray, ($part[0] . $part[1]));
                                          }
                                          }
                                          }
                                          for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                          $textrun = $section->createTextRun();
                                          $textrun->addText($descArray[$n], $valuesStyles);
                                          }
                                          } */
                                    } else {
                                        $textrun = $section->createTextRun();
                                        if ($FieldName == 'DurationValue') {
                                            $value = round($value);
                                            $value .= ' ' . $val13->DurationUnitId;
                                        } else if ($FieldName == 'QuantityValue') {
                                            $value = round($value);
                                            $value .= ' ' . $val13->QuantityUnitId;
                                        } else if ($FieldName == 'QuantityRecoveredValue') {
                                            $value = round($value);
                                            $value .= ' ' . $val13->RecoveredUnitId;
                                        } else if ($FieldName == 'ImpactsExtAgencyId') {
                                            $value = $val13->ExtAgencyId;
                                        }
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '' && $value != null) {
                                                $textrun->addText($value, $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('SpillReleaseCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $foundCustomFields = $this->CheckCustomFieldsScetion('spillrelease', $impFArray);
                                if ($foundCustomFields == 1 || $foundCustomFields == '1') {
                                    $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                    from field_value tbl1
                                    left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                    join field on field.FieldId= tbl1.FieldId
                                    where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                    $stmt = $DB->prepare($query);
                                    $stmt->bindParam(":IncidentId", $IncidentId);
                                    $stmt->bindParam(":TableKeyId", $val13->SpillReleaseId);
                                    $stmt->execute();
                                    $impResults2 = $stmt->fetchAll(PDO::FETCH_OBJ);
                                    /* custom fields for impacts */
                                    $CustomFieldHeader = 'SpillReleaseCustomField';
                                    $CustomFieldHeader = $this->GetFieldLabelFromArray($CustomFieldHeader, $fArray);
                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                    foreach ($impFArray as $key => $element) {
                                        if ($val13->ImpactTypeCode == 'SpillRelease' && $element->FieldCode == 'spillrelease') {
                                            $impFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($impFieldName, $impResults2);
                                            $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '') {
                                                    $textrun->addText(strip_tags($value), $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($FieldName == 'TrafficDriverName') {
                        $queryImp = "Call openTextTraffic_violation(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $TrafficArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($TrafficArray as $key => $val12) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val12->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val12->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val12->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {

                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val12->OldImpactDescription;

                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /* $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
			from field_value tbl1
			left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
			join field on field.FieldId= tbl1.FieldId
			where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":IncidentId", $IncidentId);
                                $stmt->bindParam(":TableKeyId", $val12->TrafficViolationId);
                                $stmt->execute();
                                $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                foreach ($impFArray as $key => $element) {
                                    if ($element->FieldCode == 'impacts') {
                                        $impFieldName = $element->FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false && $label != '') {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        foreach ($TrafficArray as $key => $val13) {
                            if ($fieldItems !== '') {
                                for ($x = 0; $x < count($paramsJson); $x++) {
                                    if ($paramsJson[$x]['FieldName'] == 'TrafficDriverName') {
                                        $fieldItems = $paramsJson[$x]['FieldParamName'];
                                    }
                                }
                                $arr = explode(',', $fieldItems);
                                $traficLabels = $arr;
                            }
                            for ($x = 0; $x < count($traficLabels); $x++) {
                                $FieldName = $traficLabels[$x];
                                $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if ($label != '' && $label != null) {
                                    if ($FieldName != 'TrafficDriverName' && $FieldName != 'TrafficDriverLicence' &&
                                            $FieldName != 'TrafficVehicleTypeId' && $FieldName != 'TrafficVehicleLicence') {
                                        $value = $val13->$FieldName;
                                    }

                                    if ($FieldName == 'TrafficDriverName') {
                                        $value = $val13->DriverName;
                                    } else if ($FieldName == 'TrafficDriverLicence') {
                                        $value = $val13->DriverLicence;
                                    } else if ($FieldName == 'TrafficVehicleTypeId') {
                                        $value = $val13->VehicleTypeId;
                                    } else if ($FieldName == 'TrafficVehicleLicence') {
                                        $value = $val13->VehicleLicence;
                                    }
                                    $label = utf8_decode($label);
                                    if (strpos($label, '’') == false) {
                                        $label = str_replace('’', '\’', $label);
                                    }
                                    if (strpos($label, ':') == false && $label != '') {
                                        $label = $label . ':';
                                    }
                                    if ($FieldName == 'Details' || $FieldName == 'HowDidThatOccur') {
                                        $name = 'Old' . $FieldName;
                                        $value = $val13->$name;
                                        $section->addText($label, $lablesStyles);
                                        $textlines = explode("<br><br>", $value);
                                        $descArray = Array();
                                        $oldVal = '';
                                        foreach ($textlines as $line) {
                                            $part = explode("<pr>", $line);
                                            $line = $part[1];
                                            if ($oldVal != trim($line)) {
                                                if (trim($line) != '') {
                                                    $oldVal = trim($line);
                                                    array_push($descArray, ($part[0] . $part[1]));
                                                }
                                            }
                                        }
                                        for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($descArray[$n], $valuesStyles);
                                        }
                                        /* $textrun->addText($label . ' ', $lablesStyles);
                                          if ((strpos($value, '<br><br>') === false)) {
                                          $value = str_replace('<pr>', '', $value);
                                          if ($value != '' && $value != null) {
                                          $textrun->addText($value, $valuesStyles);
                                          }
                                          } else {
                                          $descArray = Array();
                                          $textlines = explode("<br><br>", $value);
                                          $oldVal = '';
                                          foreach ($textlines as $line) {
                                          $part = explode("<pr>", $line);
                                          $line = $part[1];
                                          if ($oldVal != $line) {
                                          if (($line) != '') {
                                          $oldVal = $line;
                                          array_push($descArray, ($part[0] . $part[1]));
                                          }
                                          }
                                          }
                                          for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                          $textrun = $section->createTextRun();
                                          $textrun->addText($descArray[$n], $valuesStyles);
                                          }
                                          } */
                                    } else {
                                        $textrun = $section->createTextRun();
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '' && $value != null) {
                                                $textrun->addText($value, $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('TrafficViolationCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $foundCustomFields = $this->CheckCustomFieldsScetion('trafficviolation', $impFArray);
                                if ($foundCustomFields == 1 || $foundCustomFields == '1') {
                                    $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                from field_value tbl1
                                left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                join field on field.FieldId= tbl1.FieldId
                                where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                    $stmt = $DB->prepare($query);
                                    $stmt->bindParam(":IncidentId", $IncidentId);
                                    $stmt->bindParam(":TableKeyId", $val13->TrafficViolationId);
                                    $stmt->execute();
                                    $impResults2 = $stmt->fetchAll(PDO::FETCH_OBJ);
                                    /* custom fields for impacts */
                                    $CustomFieldHeader = 'TrafficViolationCustomField';
                                    $CustomFieldHeader = $this->GetFieldLabelFromArray($CustomFieldHeader, $fArray);
                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                    foreach ($impFArray as $key => $element) {
                                        if ($val13->ImpactTypeCode == 'TrafficViolation' && $element->FieldCode == 'trafficviolation') {
                                            $impFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($impFieldName, $impResults2);
                                            $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '') {
                                                    $textrun->addText(strip_tags($value), $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($FieldName == 'DamageDriverName') {
                        $queryImp = "Call openTextVehicle_damage(:IncidentId);";
                        $stmt = $DB->prepare($queryImp);
                        $stmt->bindParam(":IncidentId", $IncidentId);
                        $stmt->execute();
                        $VehicleArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                        foreach ($VehicleArray as $key => $val15) {
                            for ($x = 0; $x < count($paramsJson); $x++) {
                                if ($paramsJson[$x]['FieldName'] == 'ImpactSubTypeId') {
                                    $fieldItems = $paramsJson[$x]['FieldParamName'];
                                }
                            }
                            if ($fieldItems !== '') {
                                $arr = explode(',', $fieldItems);
                                $commonLabels = $arr;
                            }
                            for ($x = 0; $x < count($commonLabels); $x++) {
                                $FieldName = $commonLabels[$x];
                                if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                    $value = $val15->$FieldName;
                                    if ($FieldName == 'IntEmployeeName1') {
                                        $textrun = $section->createTextRun();
                                        $fieldLabel = $this->GetFieldLabelFromArray('InternalIndividuals', $fArray);
                                        $textrun->addText($fieldLabel . ' ', $lablesStyles);
                                        $value = $val15->IntEmployeeName1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText($value, $valuesStyles);
                                        }
                                        $value = $val15->IntEmployeeDept1;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val15->IntEmployeeName2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val15->IntEmployeeDept2;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                        $value = $val15->IntEmployeeName3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText("; " . $value, $valuesStyles);
                                        }
                                        $value = $val15->IntEmployeeDept3;
                                        if ($value != '' && $value != null) {
                                            $textrun->addText(", " . $value, $valuesStyles);
                                        }
                                    } else {
                                        if ((trim($FieldName) == '$IntEmployeeDept1; $IntEmployeeName2') || (trim($FieldName) == '$IntEmployeeDept2; $IntEmployeeName3') || (trim($FieldName) == '$IntEmployeeDept3')) {
                                            
                                        } else {

                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {
                                                $label = utf8_decode($label);
                                                if (strpos($label, '’') == false) {
                                                    $label = str_replace('’', '\’', $label);
                                                }
                                                if (strpos($label, ':') == false) {
                                                    $label = $label . ':';
                                                }
                                                $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                                $label = str_replace('</span>', '', $label);
                                                if ($FieldName == 'ImpactDescription') {
                                                    $value = $val15->OldImpactDescription;

                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /*   $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != $line) {
                                                      if (($line) != '') {
                                                      $oldVal = $line;
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    if ($FieldName == 'ImpactTypeId') {
                                                        $textrun->addText($label . ' ', $lablesSectionStyles);
                                                        $textrun->addText($value, $valuesSectionStyles);
                                                    } else {
                                                        $textrun->addText($label . ' ', $lablesStyles);
                                                        if ($value != '' && $value != null) {
                                                            $textrun->addText($value, $valuesStyles);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ImpactCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $CustomFieldHeader = $this->GetFieldLabelFromArray('ImpactCustomField', $fArray);
                                $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
			from field_value tbl1
			left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
			join field on field.FieldId= tbl1.FieldId
			where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":IncidentId", $IncidentId);
                                $stmt->bindParam(":TableKeyId", $val15->VehicleDamageId);
                                $stmt->execute();
                                $impResults = $stmt->fetchAll(PDO::FETCH_OBJ);
                                foreach ($impFArray as $key => $element) {
                                    if ($element->FieldCode == 'impacts') {
                                        $impFieldName = $element->FieldName;
                                        $value = '';
                                        $value = $this->GetImpactFieldValue($impFieldName, $impResults);
                                        $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                        if ($label != '' && $label != null) {
                                            if (strpos($label, ':') == false) {
                                                $label = $label . ':';
                                            }
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '') {
                                                $textrun->addText(strip_tags($value), $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        foreach ($VehicleArray as $key => $val14) {
                            if ($fieldItems !== '') {
                                for ($x = 0; $x < count($paramsJson); $x++) {
                                    if ($paramsJson[$x]['FieldName'] == 'DamageDriverName') {
                                        $fieldItems = $paramsJson[$x]['FieldParamName'];
                                    }
                                }
                                $arr = explode(',', $fieldItems);
                                $damageLabels = $arr;
                            }
                            for ($x = 0; $x < count($damageLabels); $x++) {
                                $FieldName = $damageLabels[$x];
                                $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if ($label != '' && $label != null) {
                                    if ($FieldName != 'DamageDriverName' && $FieldName != 'DamageDescription' &&
                                            $FieldName != 'DamageVehicleTypeId' && $FieldName != 'DamageVehicleLicence' && $FieldName != 'DamageDriverLicence') {
                                        $value = $val->$FieldName;
                                    }
                                    // if ($value != '' && $value != null) {

                                    if ($FieldName == 'DamageDriverName') {
                                        $value = $val14->DriverName;
                                    } else if ($FieldName == 'DamageVehicleTypeId') {
                                        $value = $val14->VehicleTypeId;
                                    } else if ($FieldName == 'DamageVehicleLicence') {
                                        $value = $val14->VehicleLicence;
                                    } else if ($FieldName == 'DamageDriverLicence') {
                                        $value = $val14->DriverLicence;
                                    }
                                    $label = utf8_decode($label);
                                    if (strpos($label, '’') == false) {
                                        $label = str_replace('’', '\’', $label);
                                    }
                                    if (strpos($label, ':') == false) {
                                        $label = $label . ':';
                                    }
                                    $label = str_replace('<span style="font-weight: normal; float: none;">', '', $label);
                                    $label = str_replace('</span>', '', $label);
                                    if ($FieldName == 'HowDidThatDone' || $FieldName == 'DamageDescription') {
                                        if ($FieldName == 'HowDidThatDone') {
                                            $name = 'Old' . $FieldName;
                                            $value = $val14->$name;
                                        }
                                        if ($FieldName == 'DamageDescription') {
                                            $value = $val14->OldImpactTypeDescription;
                                        }
                                        $section->addText($label, $lablesStyles);
                                        $textlines = explode("<br><br>", $value);
                                        $descArray = Array();
                                        $oldVal = '';
                                        foreach ($textlines as $line) {
                                            $part = explode("<pr>", $line);
                                            $line = $part[1];
                                            if ($oldVal != trim($line)) {
                                                if (trim($line) != '') {
                                                    $oldVal = trim($line);
                                                    array_push($descArray, ($part[0] . $part[1]));
                                                }
                                            }
                                        }
                                        for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                            $textrun = $section->createTextRun();
                                            $textrun->addText($descArray[$n], $valuesStyles);
                                        }
                                        /* $textrun->addText($label . ' ', $lablesStyles);
                                          if ((strpos($value, '<br><br>') === false)) {
                                          $value = str_replace('<pr>', '', $value);
                                          if ($value != '' && $value != null) {
                                          $textrun->addText($value, $valuesStyles);
                                          }
                                          } else {
                                          $descArray = Array();
                                          $textlines = explode("<br><br>", $value);
                                          $oldVal = '';
                                          foreach ($textlines as $line) {
                                          $part = explode("<pr>", $line);
                                          $line = $part[1];
                                          if ($oldVal != $line) {
                                          if (($line) != '') {
                                          $oldVal = $line;
                                          array_push($descArray, ($part[0] . $part[1]));
                                          }
                                          }
                                          }
                                          for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                          $textrun = $section->createTextRun();
                                          $textrun->addText($descArray[$n], $valuesStyles);
                                          }
                                          } */
                                    } else {
                                        $textrun = $section->createTextRun();
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $textrun->addText($label . ' ', $lablesStyles);
                                            if ($value != '' && $value != null) {
                                                $textrun->addText($value, $valuesStyles);
                                            }
                                        }
                                    }
                                }
                            }
                            $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('VehicleDamageCustomField', $CustFArray);
                            if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                $foundCustomFields = $this->CheckCustomFieldsScetion('vehicledamage', $impFArray);
                                if ($foundCustomFields == 1 || $foundCustomFields == '1') {
                                    $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                                    from field_value tbl1
                                                    left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                                    join field on field.FieldId= tbl1.FieldId
                                                    where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                    $stmt = $DB->prepare($query);
                                    $stmt->bindParam(":IncidentId", $IncidentId);
                                    $stmt->bindParam(":TableKeyId", $val14->VehicleDamageId);
                                    $stmt->execute();
                                    $impResults2 = $stmt->fetchAll(PDO::FETCH_OBJ);
                                    /* custom fields for impacts */
                                    $CustomFieldHeader = 'VehicleDamageCustomField';
                                    $CustomFieldHeader = $this->GetFieldLabelFromArray($CustomFieldHeader, $fArray);
                                    $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                    foreach ($impFArray as $key => $element) {
                                        if ($val14->ImpactTypeCode == 'VehicleDamage' && $element->FieldCode == 'vehicledamage') {
                                            $impFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($impFieldName, $impResults2);
                                            $label = $this->GetFieldLabelFromArray($impFieldName, $impFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false) {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '') {
                                                    $textrun->addText(strip_tags($value), $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if ($FieldName == "AssignedToId") {
                    /* Corrective actions section  */
                    $table14 = $section->addTable('myOwnTableStyle');
                    $table14->addRow(1);
                    $table14->addCell(80000)->addText('');
                    $subTabName = $this->GetSubTabLabelFromArray('actions', $fArray);
                    $section->addText($subTabName, $tabsStyles);
                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM `corrective_action` 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            $queryAction = "   SELECT  distinct
                                                hc.`IncidentId`,
                                                hc.`CorrectiveActionId`,    
                                                hc.`StatusName` as TaskStatusId,
                                                hc.`PriorityName` as PriorityId,
                                                hc.`AssignedToName` as AssignedToId,
                                                hc.`AlsoNotifyName` as EmployeeId,
                                                date_format(hc.`StartDate`,'%m/%d/%Y')as `StartDate`,
                                                date_format(hc.`TargetEndDate`,'%m/%d/%Y')as `TargetEndDate`,
                                                date_format(hc.`ActualEndDate`,'%m/%d/%Y')as `ActualEndDate`,
                                                hc.`EstimatedCost`  as TaskEstimatedCost,
                                                getActionDescription(hc.CorrectiveActionId,hc.OriginalCorrectiveActionId) as TaskDescription,
                                                getOutComeFollowUp(hc.CorrectiveActionId,hc.OriginalCorrectiveActionId)  as OutComeFollowUp,
                                                CASE hc.`DesiredResults` WHEN '0' THEN 'No' WHEN '1' THEN 'Yes' END AS  `DesiredResults`,
                                                getComments(hc.CorrectiveActionId,hc.OriginalCorrectiveActionId)  as Comments,
                                                hc.`AssignedByName`     
                                                FROM `ABCanTrackV2`.hist_corrective_action hc
                                                join corrective_action on corrective_action.correctiveactionid= hc.correctiveactionid 
                                                where corrective_action.IncidentId  =:IncidentId  group by hc.`CorrectiveActionId`;";
                            $stmt = $DB->prepare($queryAction);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->execute();
                            $ActionArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            if (count($ActionArray) > 0) {
                                $pp = 0;
                                $Labels = array('AssignedToId', 'EmployeeId', 'PriorityId', 'TaskStatusId', 'StartDate', 'TargetEndDate', 'ActualEndDate', 'TaskEstimatedCost', 'TaskDescription', 'OutComeFollowUp', 'DesiredResults', 'Comments');
                                if ($fieldItems !== '') {
                                    $arr = explode(',', $fieldItems);
                                }
                                if ($fieldItems !== '') {
                                    $Labels = $arr;
                                }
                                $query = "SELECT FieldName,  trim(FieldLabel) as FieldLabel
                                        from org_field
                                        inner join field on field.FieldId = org_field.FieldId
                                        join sub_tab on sub_tab.SubTabId= field.SubTabId
                                        join tab on tab.TabId= sub_tab.TabId
                                        where field.OrgId is not null and  tab.FieldCode='Actions'  and org_field.IsHidden =0
                                        and org_field.OrgId=:OrgId";
                                $stmt = $DB->prepare($query);
                                $stmt->bindParam(":OrgId", $OrgId);
                                $stmt->execute();
                                $actionFArray = $stmt->fetchAll(PDO::FETCH_OBJ);
                                for ($a = 0; $a < count($ActionArray); $a++) {
                                    $foundActions = false;
                                    for ($x = 0; $x < count($Labels); $x++) {
                                        $FieldName = $Labels[$x];
                                        if ((strpos($FieldName, 'calendar') === false) && (strpos($FieldName, 'textarea') === false) && (strpos($FieldName, 'textbox') === false) && (strpos($FieldName, 'checkbox') === false) && (strpos($FieldName, 'radiobutton') === false) && (strpos($FieldName, 'select') === false) && (strpos($FieldName, 'multiselect') === false)) {
                                            $value = $ActionArray[$a][$FieldName];
//                                    if ($value != '' && $value != null) {
                                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                if ($FieldName == 'AssignedToId') {
                                                    $textrun = $section->createTextRun();
                                                    $textrun->addText($label . ' ', $lablesSectionStyles);
                                                    $textrun->addText($value, $valuesSectionStyles);
                                                } else if ($FieldName == 'OutComeFollowUp' || $FieldName == 'TaskDescription' || $FieldName == 'Comments') {

                                                    $section->addText($label, $lablesStyles);
                                                    $textlines = explode("<br><br>", $value);
                                                    $descArray = Array();
                                                    $oldVal = '';
                                                    foreach ($textlines as $line) {
                                                        $part = explode("<pr>", $line);
                                                        $line = $part[1];
                                                        if ($oldVal != trim($line)) {
                                                            if (trim($line) != '') {
                                                                $oldVal = trim($line);
                                                                array_push($descArray, ($part[0] . $part[1]));
                                                            }
                                                        }
                                                    }
                                                    for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                        $textrun = $section->createTextRun();
                                                        $textrun->addText($descArray[$n], $valuesStyles);
                                                    }
                                                    /* $textrun->addText($label . ' ', $lablesStyles);
                                                      if ((strpos($value, '<br><br>') === false)) {
                                                      $value = str_replace('<pr>', '', $value);
                                                      if ($value != '' && $value != null) {
                                                      $textrun->addText($value, $valuesStyles);
                                                      }
                                                      } else {
                                                      $descArray = Array();
                                                      $textlines = explode("<br><br>", $value);
                                                      $oldVal = '';
                                                      foreach ($textlines as $line) {
                                                      $part = explode("<pr>", $line);
                                                      $line = $part[1];
                                                      if ($oldVal != trim($line)) {
                                                      if (trim($line) != '') {
                                                      $oldVal = trim($line);
                                                      array_push($descArray, ($part[0] . $part[1]));
                                                      }
                                                      }
                                                      }
                                                      for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                                      $textrun = $section->createTextRun();
                                                      $textrun->addText($descArray[$n], $valuesStyles);
                                                      }
                                                      } */
                                                } else {
                                                    $textrun = $section->createTextRun();
                                                    $textrun->addText($label . ' ', $lablesStyles);
                                                    if ($value != '' && $value != null) {
                                                        $textrun->addText($value, $valuesStyles);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    $CommonImpactCustomHidden = $this->CheckSubTabLabelIsHidden('ActionCustomField', $CustFArray);
                                    if ($CommonImpactCustomHidden == 0 || $CommonImpactCustomHidden == '0') {
                                        $query = "SELECT FieldValue , group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName,TableKeyId, FieldName, DefaultFieldLabel
                                            from field_value tbl1
                                            left join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                            join field on field.FieldId= tbl1.FieldId
                                            where tbl1.incidentid =:IncidentId and TableKeyId=:TableKeyId  group by field.FieldId ";
                                        $stmt = $DB->prepare($query);
                                        $stmt->bindParam(":IncidentId", $IncidentId);
                                        $stmt->bindParam(":TableKeyId", $ActionArray[$a]['CorrectiveActionId']);
                                        $stmt->execute();
                                        $actionResults = $stmt->fetchAll(PDO::FETCH_OBJ);
//                                            if (!$foundActions) {
                                        $CustomFieldHeader = $this->GetFieldLabelFromArray('ActionCustomField', $fArray);
                                        $section->addText($CustomFieldHeader, $lablesSectionStyles);
//                                                $foundActions = true;
//                                            }
                                        foreach ($actionFArray as $key => $element) {
                                            $actionFieldName = $element->FieldName;
                                            $value = '';
                                            $value = $this->GetImpactFieldValue($actionFieldName, $actionResults);
//                                        if ($value != '' && $value != null) {
                                            $label = $this->GetFieldLabelFromArray($actionFieldName, $actionFArray);
                                            if ($label != '' && $label != null) {
                                                if (strpos($label, ':') == false && $label != '') {
                                                    $label = $label . ':';
                                                }
                                                $textrun = $section->createTextRun();
                                                $textrun->addText($label . ' ', $lablesStyles);
                                                if ($value != '' && $value != null) {
                                                    $textrun->addText($value, $valuesStyles);
                                                }
                                            }
                                        }
                                    }
                                }
                                $objWriter->save($path);
                            }
                        }
                    }
                } else if ($FieldName == "AttachmentName") {
                    /* Upload section */
                    $query = "SELECT  HistIncidentId from hist_incident_vw  where IncidentId =:IncidentId  ";
                    $stmt = $DB->prepare($query);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $results2 = $stmt->fetchObject();
                    $HistIncidentId = $results2->HistIncidentId;
                    $queryAttachment = "SELECT  AttachmentName, AttachmentSize
                                    from attachment
                                    where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryAttachment);
                    $stmt->bindParam(":IncidentId", $HistIncidentId);
                    $stmt->execute();
                    $AttachmentArray = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    $table15 = $section->addTable('myOwnTableStyle');
                    $table15->addRow(1);
                    $table15->addCell(80000)->addText('');
                    //$subTabName = $this->GetSubTabLabelFromArray('upload', $fArray);

                    $query = "select SubTabLabel from sub_tab where SubTabName='Upload' and LanguageId=:LanguageId;  ";
                    $stmt = $DB->prepare($query);
                    $stmt->bindParam(":LanguageId", $LanguageId);
                    $stmt->execute();
                    $results3 = $stmt->fetchObject();
                    $subTabName = $results3->SubTabLabel;

                    $query = "SELECT DefaultFieldLabel from field where OrgId is null  and FieldName ='AttachmentName' and LanguageId=:LanguageId;  ";
                    $stmt = $DB->prepare($query);
                    $stmt->bindParam(":LanguageId", $LanguageId);
                    $stmt->execute();
                    $results4 = $stmt->fetchObject();
                    $AttachmentName = $results4->DefaultFieldLabel;

                    $section->addText($subTabName, $tabsStyles);
                    if (count($AttachmentArray) > 0) {
                        $tt = 0;
                        $custLabels = array('AttachmentName');
                        for ($a = 0; $a < count($AttachmentArray); $a++) {
                            $textrun = $section->createTextRun();
                            for ($x = 0; $x < count($custLabels); $x++) {
                                $FieldName = $custLabels[$x];
                                // $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                if (strpos($AttachmentName, ':') == false && $AttachmentName != '') {
                                    $AttachmentName = $AttachmentName . ':';
                                }
                                $value = $AttachmentArray[$a][$FieldName];
                                $textrun->addText($AttachmentName . ' ', $lablesStyles);
                                $textrun->addText($value, $valuesStyles);
                                $tt++;
                            }
                            $tt = 0;
                        }
                    }
//   
                    $objWriter->save($path);
                    // }
                } else if ($FieldName == 'EnergyForm' || $FieldName == 'UnderLyingCauses') {
                    $subTabName = $this->GetFieldSubTabNameFromArray($FieldName, $fArray);
                    if ($subTabName == 'Observation' && $obserFound == false) {
                        $table16 = $section->addTable('myOwnTableStyle');
                        $table16->addRow(1);
                        $table16->addCell(80000)->addText('');
                        $subTabName = $this->GetSubTabLabelFromArray('observation', $fArray);
                        $section->addText($subTabName, $tabsStyles);
                        $obserFound = true;
                        $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                        if (strpos($label, ':') == false && $label != '') {
                            $label = $label . ':';
                        }
                        $section->addText($label, $lablesSectionStyles);
                    }




                    if ($FieldName == 'UnderLyingCauses') {
                        $label = $this->GetFieldLabelFromArray('UnderLyingCausesTitle', $fArray);
                        if (strpos($label, ':') == false) {
                            $label = $label . ':';
                        }
                        $textrun = $section->createTextRun();
                        $textrun->addText($label . ' ', $lablesStyles);
                        $label = $this->GetFieldLabelFromArray('UnderLyingCauses', $fArray);
                        if (strpos($label, ':') == false && $label != '') {
                            $label = $label . ':';
                        }
                        $textrun = $section->createTextRun();
                        $textrun->addText($label . ' ', $lablesStyles);
                    }

                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM `inc_obser_ana` 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            $query = "select  ObservationAndAnalysisName,oap.ObservationAndAnalysisParamName as ParentName,  group_concat(oapp.ObservationAndAnalysisParamName separator '; ') as ParamName
                                            from observation_analysis_param oapp
                                            inner join observation_analysis_param  oap on oap.ObservationAndAnalysisParamId= oapp.ParentId
                                            join inc_obser_ana on inc_obser_ana.ObservationAndAnalysisParamId = oapp.ObservationAndAnalysisParamId
                                            join observation_analysis on observation_analysis.ObservationAndAnalysisId = oapp.ObservationAndAnalysisId
                                            where IncidentId =:IncidentId  and ObservationAndAnalysisCode=:ObservationAndAnalysisCode
                                            group by oapp.ParentId
                                             order by oap.`Order`,oap.`ObservationAndAnalysisParamName`,oapp.`Order`,oapp.`ObservationAndAnalysisParamName`";
                            $stmt = $DB->prepare($query);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->bindParam(":ObservationAndAnalysisCode", $FieldName);
                            $stmt->execute();
                            $ObservArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            if (count($ObservArray) > 0) {
                                $value = '';
                                for ($o = 0; $o < count($ObservArray); $o++) {
                                    $textrun = $section->createTextRun();
                                    $textrun->addText($ObservArray[$o]['ParentName'] . ': ', $lablesStyles);
                                    $textrun->addText($ObservArray[$o]['ParamName'], $valuesStyles);
                                }
                            }
                            $objWriter->save($path);
                        }
                    }
                } else if ($FieldName == 'RootCauseParamId') {
                    $subTabName = $this->GetFieldSubTabNameFromArray($FieldName, $fArray);
                    if ($subTabName == 'Investigation' && $invFound == false) {
                        $table17 = $section->addTable('myOwnTableStyle');
                        $table17->addRow(1);
                        $table17->addCell(80000)->addText('');
                        $subTabName = $this->GetSubTabLabelFromArray('investigation', $fArray);
                        $section->addText($subTabName, $tabsStyles);
                        $invFound = true;
                    }
                    $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                    if (strpos($label, ':') == false && $label != '') {
                        $label = $label . ':';
                    }
                    $section->addText($label, $lablesSectionStyles);
                    $queryCustomer = "SELECT count(*) as incCount
                                        FROM `inc_root_cause` 			
                                        where IncidentId =:IncidentId";
                    $stmt = $DB->prepare($queryCustomer);
                    $stmt->bindParam(":IncidentId", $IncidentId);
                    $stmt->execute();
                    $resultCount = $stmt->fetch(PDO::FETCH_ASSOC);
                    if (!empty($resultCount)) {
                        $incCount = $resultCount['incCount'];
                        if ($incCount > 0) {
                            $queryRootCauses = "SELECT  RootCauseName, 
                                        group_concat( DISTINCT (CASE WHEN  Other IS NOT NULL and  Other <> '' THEN CONCAT(RootCauseParamName,'(',Other,')') 
                                        ELSE    RootCauseParamName END) order by root_cause_param.`Order` separator '; ')  as RootCauseParamName
                                            FROM inc_root_cause 
                                            inner join root_cause_param on root_cause_param.RootCauseParamId = inc_root_cause.RootCauseParamId
                                            inner join root_cause on root_cause.RootCauseId = root_cause_param.RootCauseId					
                                            where IncidentId =:IncidentId
                                            group by root_cause.RootCauseId
                                            order by root_cause.`Order` asc , root_cause_param.`Order` asc ;";
                            $stmt = $DB->prepare($queryRootCauses);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->execute();
                            $RootCausesArray = $stmt->fetchAll(PDO::FETCH_ASSOC);
                            if (count($RootCausesArray) > 0) {
                                $value = '';
                                for ($o = 0; $o < count($RootCausesArray); $o++) {
                                    $textrun = $section->createTextRun();
                                    $textrun->addText($RootCausesArray[$o]['RootCauseName'] . ': ', $lablesStyles);
                                    $value = $RootCausesArray[$o]['RootCauseParamName'];
                                    $value = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $value);
                                    $textrun->addText($value, $valuesStyles);
                                }
                            }
                            $objWriter->save($path);
                        }
                    }
                } else {
                    if ((strpos($FieldName, 'calendar') !== false) || (strpos($FieldName, 'textarea') !== false) || (strpos($FieldName, 'textbox') !== false) || (strpos($FieldName, 'checkbox') !== false) || (strpos($FieldName, 'radiobutton') !== false) || (strpos($FieldName, 'select') !== false) || (strpos($FieldName, 'multiselect') !== false)) {
                        // custom fields
                        if ($subTabName == 'WhatHappened' && !$foundWhatHappened) {
                            $CustomFieldHeader = $this->GetFieldLabelFromArray('WhatHappenedCustomField', $fArray);
                            $section->addText($CustomFieldHeader, $lablesSectionStyles);
                            $foundWhatHappened = true;
                        }
                        if ($subTabName == 'Observation' && !$foundObservation) {
                            $CustomFieldHeader = $this->GetFieldLabelFromArray('ObservationCustomField', $fArray);
                            $section->addText($CustomFieldHeader, $lablesSectionStyles);
                            $foundObservation = true;
                        }
                        if ($subTabName == 'Investigation' && !$foundInvestigation) {
                            $CustomFieldHeader = $this->GetFieldLabelFromArray('InvestigationCustomField', $fArray);
                            $section->addText($CustomFieldHeader, $lablesSectionStyles);
                            $foundInvestigation = true;
                        }
                        if ((strpos($FieldName, 'calendar') !== false) || (strpos($FieldName, 'textarea') !== false) || (strpos($FieldName, 'textbox') !== false)) {
                            $query = "SELECT FieldValue from field_value tbl1
                                        join field on field.FieldId= tbl1.FieldId
                                        where tbl1.incidentid =:IncidentId   and field.FieldName=:FieldName";
                            $stmt = $DB->prepare($query);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->bindParam(":FieldName", $FieldName);
                            $stmt->execute();
                            $results3 = $stmt->fetch(PDO::FETCH_ASSOC);
                            $value = $results3['FieldValue'];
                        } else {
                            $query = "SELECT  group_concat(trim(tbl3.OptionName) separator ', ')  as OptionName
                                            from field_value tbl1
                                            inner join `option` tbl3 on tbl1.OptionId = tbl3.OptionId
                                            join field on field.FieldId= tbl1.FieldId
                                            where tbl1.incidentid =:IncidentId   and field.FieldName=:FieldName";
                            $stmt = $DB->prepare($query);
                            $stmt->bindParam(":IncidentId", $IncidentId);
                            $stmt->bindParam(":FieldName", $FieldName);
                            $stmt->execute();
                            $results3 = $stmt->fetch(PDO::FETCH_ASSOC);
                            $value = $results3['OptionName'];
                        }
                        // if ($value != '' && $value != null) {
                        $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                        if (strpos($label, ':') == false && $label != '') {
                            $label = $label . ':';
                        }
                        $textrun = $section->createTextRun();
                        $textrun->addText($label . ' ', $lablesStyles);
                        if ($value != '' && $value != null) {
                            $textrun->addText($value, $valuesStyles);
                        }
                        //}
                    } else {
                        // what happened, investigation and observation data which in incident table
                        $subTabName = $this->GetFieldSubTabNameFromArray($FieldName, $fArray);
                        if ($subTabName == 'Investigation' && $invFound == false) {
                            $table17 = $section->addTable('myOwnTableStyle');
                            $table17->addRow(1);
                            $table17->addCell(80000)->addText('');
                            $subTabName = $this->GetSubTabLabelFromArray('investigation', $fArray);
                            $section->addText($subTabName, $tabsStyles);
                            $invFound = true;
                        } else if ($subTabName == 'Observation' && $obserFound == false) {
                            $table16 = $section->addTable('myOwnTableStyle');
                            $table16->addRow(1);
                            $table16->addCell(80000)->addText('');
                            $subTabName = $this->GetSubTabLabelFromArray('observation', $fArray);
                            $section->addText($subTabName, $tabsStyles);
                            $obserFound = true;
                        }
                        $value = $IncidentArray[$FieldName];
                        $value = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $value);
                        if ($FieldName == 'CreatorName') {
                            $label = $this->GetFieldLabelFromArray('ReportEnteredBy', $fArray);
                        } else if ($FieldName == 'UpdatedByName') {
                            $label = $this->GetFieldLabelFromArray('ReportLastModifiedBy', $fArray);
                        } else {
                            $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                        }
                        if (strpos($label, ':') == false && $label != '') {
                            $label = $label . ':';
                        }
                        if ($FieldName == 'EventSequence' || $FieldName == 'EnvConditionNote' || $FieldName == 'EnergyFormNote' || $FieldName == 'SubStandardActionNote' || $FieldName == 'SubStandardConditionNote' || $FieldName == 'UnderLyingCauseNote' || $FieldName == 'InvSummary' || $FieldName == 'FollowUpNote' || $FieldName == 'SourceDetails' || $FieldName == 'RootCauseNote') {
                            if ($FieldName == 'EventSequence') {
                                $fieldLabel = $this->GetFieldLabelFromArray('SequenceOfEvents', $fArray);
                                $section->addText($fieldLabel, $lablesSectionStyles);
                            }
                            $section->addText($label, $lablesSectionStyles);
                            $value = $IncidentArray[$FieldName];
                            $textlines = explode("<br><br>", $value);
                            $descArray = Array();
                            $oldVal = '';
                            foreach ($textlines as $line) {
                                $part = explode("<pr>", $line);
                                $line = $part[1];
                                if ($oldVal != trim($line)) {
                                    if (trim($line) != '') {
                                        $oldVal = trim($line);
                                        array_push($descArray, ($part[0] . $part[1]));
                                    }
                                }
                            }
                            for ($n = count($descArray) - 1; $n >= 0; $n--) {
                                $textrun = $section->createTextRun();
                                $textrun->addText($descArray[$n], $valuesStyles);
                            }
                        } else {
                            $value = $IncidentArray[$FieldName];
                            $value = iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $value);
                            if ($subTabName == 'Observation') {
                                if ($label != '' && $label != null) {
                                    $textrun = $section->createTextRun();
                                    $textrun->addText($label . ' ', $lablesStyles);
                                    if ($value != '' && $value != null) {
                                        $textrun->addText($value, $valuesStyles);
                                    }
                                }
                            } else {
                                $label = $this->GetFieldLabelFromArray('Investigator', $fArray);
                                if ($FieldName == 'InvestigatorId1') {
                                    $label = $label . ' 1';
                                } else if ($FieldName == 'InvestigatorId2') {
                                    $label = $label . ' 2';
                                } else if ($FieldName == 'InvestigatorId3') {
                                    $label = $label . ' 3';
                                } else {
                                    if (($FieldName == "ResponseCost" || $FieldName == "RepairCost" || $FieldName == "InsuranceCost" || $FieldName == "WCBCost" || $FieldName == "OtherCost" || $FieldName == "TotalCost") && !$foundCost) {
                                        $CustomFieldHeader = $this->GetFieldLabelFromArray('costs', $fArray);
                                        $section->addText($CustomFieldHeader, $lablesSectionStyles);
                                        $foundCost = true;
                                    }
                                    $label = $this->GetFieldLabelFromArray($FieldName, $fArray);
                                }
                                if ($label != '' && $label != null) {
                                    $textrun = $section->createTextRun();
                                    $textrun->addText($label . ' ', $lablesStyles);
                                    if ($value != '' && $value != null) {
                                        $textrun->addText($value, $valuesStyles);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $objWriter->save($path);
        } catch (Exception $ex) {
            MyLogger::error($ex->getMessage());
            throw new Exception($ex->getMessage());
        }
        return $path;
    }
?>