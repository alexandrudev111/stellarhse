angular.module('myDatepicker', [])
    .directive("myDatepicker", function ($parse) {
    return function (scope, element, attrs, controller) {
        var ngModel = $parse(attrs.ngModel);
        $(function(){
            element.datepicker({
//                showOn:"both",
                changeYear:true,
                changeMonth:true,
                dateFormat:'mm/dd/yy',
                onSelect:function (dateText, inst) {
                    scope.$apply(function(scope){
                        // Change binded variable
                        ngModel.assign(scope, dateText);
                    });
                }
            });
        });
    }
});