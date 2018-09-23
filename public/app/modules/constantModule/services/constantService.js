(function () {
    var factory = function ($http) {
        var message = {
            loadModule: 'Initializing module .. please wait',
            loadGrid: 'Fetching data .. Please wait',
            deleteRecord: 'Selected record is deleted successfully',
            addRecord: 'New record is added successfully',
            updateRecord: 'Selected record is updated successfully',
            number_valid: 'Please enter numbers only.',
            decimal_valid: 'Please enter decimal only upto 2 decimal',
            phone_valid: 'Invalid phone number!',
            update_product: 'Product is updated successfully',
            deleteChild_valid: 'You cannot delete parent items.',
            cannotdeleteRecord: 'You can\'t delete this record, This record has relations.',
            delete_confirm_title: 'Delete',
            delete_confirm_msg: 'Delete selected record(s)?',
            location_name_valid: 'This Location Name already exist, Please enter another one.',
            update_location: 'Location is updated successfully',
            update_location_labels: 'Locations labels is updated successfully',
            customer_name_valid: 'This customer name already exist, Please enter another one.',
            selectCustomer: 'Please add customer first.',
            checkEmail: 'Invalid email format!',
            checkEmailUser: 'This Email already exists!',
            valid_city: 'Please insert city.',
            valid_phone: 'Please insert phone.',
            valid_email: 'Please insert email.',
            the_name_valid: 'This name already exist, Please enter another one.',
            selectrow: 'Please select row first.',
            selectnode: 'Please select node first.',
            org_name_valid: 'This Company name is already exists.',
            product_valid: 'Please select at least one product.',
            add_admin: 'Company Admin has been added successfully.',
            update_admin: 'Company Admin has been updated successfully.',
            activation_valid: 'The activation link no longer valid for this account because it had either timed out or the user had reset the password from the login screen.',
            success_activation: 'Congratulations! You have successfully activated your account.',
            orgadmin_valid: 'This company doesn\'t have a System Administrator.',
            duplicate_email: 'This email already assigned for anoyher user, Please enter another one.',
            confirm_delete: 'Are you sure you want to delete this item?',
            third_party_name_exist: 'Third party is already exists',
            delete_company: 'Note: All the customer reports, lookups, locations, employees, third parties and email log will be deleted.',
            requiredField: 'Please fill required field(s) first',
            existValue: 'This value already exist, Please enter another one.',
            stat_table_name_valid: 'This Chart name is already exists.',
            enter_country_first: 'Please enter country',
            enter_province: 'Please enter province',
            enter_area: 'Please enter area',
            enter_site: 'Please enter site',
            selectLocation: 'Select location to delete',
            locNotDeleted: "Location contains sub locations so it  can't be deleted",
            locDeleted: " Location Deleted successfully",
            notification: "Notification",
            reactive_msg: "You need to reactivate these user's account before reassigning it to a different user group. Select the user's account and click on the lock icon in the toolbar to activiate it. ",
            reassign_user: " Reassign User",
            activate_account: 'We sent emails for the following users to activate their accounts: ',
            multibleRowNoSelect: 'Please select only one row',
            userEmailGroupMust : 'User account must have an email and group',
            shareSelection : 'Please select where to share this first',
            shareSuccessfull : 'Share done successfully',
            addToFavourit : 'KPI assigned to favourit successfully',
            metrics_edited_successfully : 'KPI edited successfully',
            activeRecord: 'Selected record is activated successfully',
            deactiveRecord: 'Selected record is deactivated successfully',
            grouphasusers: 'You can\'t delete this record. Please contact your administrator.',
            fileversion: "Selected row doesn't have versions",
            wrongfile: "Can't update with different file name",
            successupload: "Files uploaded successfully"
        };

        var customerForm = {
            BillingContact: 'Billing Contact',
            BillingCycle: 'Billing Cycle',
            Cancel: 'Cancel',
            CityId_ast: 'Please select a City.',
            CityName: 'City',
            CompanyLogo: 'Company Logo',
            CompanyName: 'Company Name',
            CompanyStreetAddress: 'Street Address',
            CountryId: 'Country',
            CountryId_ast: 'Please select a Country.',
            CurrentBillingAmount: 'Current Billing Amount',
            EditCompanyLogoNote: 'To change the logo, browse to select a new logo and then click on Upload new logo. Your logo file must be a bmp, gif, jpg or png and for best result, it should measure exactly 350 pixels long by 180 pixels high.',
            Email: 'Email Address',
            FirstBillingDate: 'First Billing Date',
            LastBillingDate: 'Last Billing Date',
            MailingAddress: 'Mailing Address',
            MyModules: 'My Modules',
            ABCanTrackTitle: 'ABCan-Track Modules',
            HSETitle: 'HSE Program and Tools',
            NoOfActiveUsers: 'No. of Active Users',
            OrgName_ast: 'Please enter the Company Name.',
            PostalCodeLBL: 'Postal/Zip Code',
            Products_ast: 'Please select a Product.',
            ProvinceId_ast: 'Please select Province/State.',
            ProvinceStateId: 'Province/State',
            Save: 'Save',
            ShowCustomerInIncForm: 'Show Customers in Incident Form',
            Status: 'Status',
            SystemAdminName: 'System Administrator',
            SystemAdminName_ast: 'Please select the System Administrator\'s Name.',
            Update: 'Update',
            UploadLogo: 'Choose Logo.',
            UploadNewLogo: 'Upload new logo',
            BillingAddress: 'Billing Address',
            ManageCompanyTitle: 'Add new company',
            CompanyInfoTitle: 'Company Information',
            EditCompanyInfoTitle: 'Edit Company Information',
            Add: 'Add',
            SelectLanguageLbl: 'Select Language',
            validatelogofile: 'Oops! That file type doesn\'t work.Please choose a logo file that is a gif, jpg or png. And for best result, make sure the image measures no more than 350px wide by 180px high.'
        };

        var thirdPartyForm = {
            ThirdPartyName: 'Third Party Name',
            ThirdPartyType: 'Third Party Type',
            ContactName: 'Contact Name',
            PrimaryPhone: 'Primary Phone',
            Country: 'Country',
            Province: 'Province/State',
            City: 'City',
            Adress: 'Address',
            PostalZipCode: 'Postal/Zip Code',
            Status: 'Status',
            Sponser: 'Current contract sponser',
            Submit: 'Submit',
            Cancel: 'Cancel',
            Update: 'Update',
            thirdpartiesgridinst1: 'On your report forms, you have the option of identifying third parties involved in the events being reported. There are two types of third parties you can add here:',
            thirdpartiesgridinst2: 'Customers (the companies you provide services to)',
            thirdpartiesgridinst3: 'Contractors (any supplier, vendor or contracted service company that could be present at one of your worksites)',
            thirdpartiesgridinst4: 'By adding these third parties here. you allow users to choose them by the correct spelling of their name, rather than entering their best guess. That makes it much easier to run accurate reports on the third parties involved in events on your worksites.',
            thirdpartiesgridinst5: 'You can add, edit and delete third parties using the tools in the top and bottom rows of the table. Not sure which tool to use? Place your cursor over each one for more info.',
            thirdpartiesgridinst6: 'You can also search for a third party using the search fields in the table.',
            havenocustomers: "We don't have customers"
        };

        var allLocationsForm = {
            addCountry: '1. Choose or add a Country',
            addProvince: '2. Choose or add a  Province/State',
            addArea: '3. Choose or add a Area',
            addSite: '4. Choose or add a Site',
            Add: 'Add',
            Edit: 'Edit',
            Delete: 'Delete',
            Cancel: 'Cancel',
        };

        var allManagePeople = {
            empgridinst: '<p>There are four main reasons to manage people in the table below:</p> <ol> <li>So they can be set up as users.</li> <li>So their information comes up automatically when they are referenced in a report, or if they no longer work for your company, to stop their information from appearing.</li> <li>So they can be assigned corrective actions related to reports filed in the database.</li>',
            firstName: 'First Name',
            lastName: 'Last Name',
            crew: 'Crew assignment',
            position: 'Position',
            classification: 'Classification',
            company: 'Company',
            department: 'Department',
            phone: 'Phone',
            alternate_phone: 'Alternate Phone',
            location: 'Location details',
            country: 'Country',
            province_state: 'Province/State',
            city: 'City',
            address: 'Address',
            postal_code: 'Postal/Zip Code',
            email: 'Email',
            supervisor: 'Supervisor',
            area_of_resp: 'Role',
            work_location: 'Work Location',
            status: 'Status',
            check_ques: 'Do you want to setup a user account for this person?',
            yes: 'yes',
            no: 'no',
            user_name: 'User Name',
            user_group: 'User Group',
            access_code: 'Access Code',
            subscribed_mod: 'Subscribed Modules',
            hse_tracking: 'HSE Tracking',
            hse_prog: 'HSE Program',
            submit: 'Submit',
            cancel: 'Cancel',
            addCountry: '1. Choose or add a Country',
            addProvince: '2. Choose or add a  Province/State',
            addArea: '3. Choose or add a Area',
            addSite: '4. Choose or add a Site',
            Add: 'Add',
            Edit: 'Edit',
            Delete: 'Delete',
            Cancel: 'Cancel',
            Update :'Update',
            password :'Password',
            emp_id :'Employee ID',
            security_question :'Security Question',
            security_answer :'Security Answer'

        };
        var trainingProviderForm = {
            trainingProviderName: 'Training Provider Name',
            Phone: 'Phone',
            Website: "Website",
            Submit: 'Submit',
            Cancel: 'Cancel',
            Update: 'Update',
        };

        var trainingTypeForm = {
            trainingTypeName: 'Training Type Name',
            trainingDuration: 'Training Duration',
            evidenceOfCompletion: "Evidence Of Completion",
            recertificationFrequency: "Recertification Frequency",
            Submit: 'Submit',
            Cancel: 'Cancel',
            Update: 'Update',
        };

        var equipmentLabels = {
            equipmentType: 'Equipment Type',
            equipmentName: 'Equipment Name',
            equipmentCategory: "Equipment Category",
            equipmentNumber: "Equipment number",
            Submit: 'Submit',
            Cancel: 'Cancel',
            Update: 'Update',
        };

        return {
            getMessage: function (code) {
                return message[code];
            },
            getCustomerFormLabels: function () {
                return customerForm;
            },
            getThirdPartyFormLabels: function () {
                return thirdPartyForm;
            },
            getLocationsFormLabels: function () {
                return allLocationsForm;
            },
            getManagePeopleFormLabels: function () {
                return allManagePeople;
            },
            getTrainingProviderLabels: function () {
                return trainingProviderForm;
            },
            getTrainingTypeLabels: function () {
                return trainingTypeForm;
            },
            getEquipmentLabels: function () {
                return equipmentLabels;
            }

        };
    };
    factory.$inject = ['$http']
    angular.module('constantModule')
            .factory('constantService', factory)
}())
