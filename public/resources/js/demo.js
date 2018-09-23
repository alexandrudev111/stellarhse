(function() {
  angular.module('custom.hazard', ['builder', 'builder.components', 'validator.rules']).run([
    '$builder', function($builder) {
      $builder.registerComponent('sampleInput', {
        group: 'Default',
        label: 'Sample',
        description: 'From html template',
        placeholder: 'placeholder',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        templateUrl: 'app/modules/adminToolsModule/views/template.html',
        popoverTemplateUrl: 'app/modules/adminToolsModule/views/popoverTemplate.html'
      });
      
    }
  ]).controller('DemoController', [
    '$scope', '$builder', '$validator', function($scope, $builder, $validator) {
      var checkbox, textbox;
      alert("news");
      textbox = $builder.addFormObject('default', {
        id: 'textbox',
        component: 'textInput',
        label: 'Name',
        description: 'Your name',
        placeholder: 'Your name',
        required: true
      });
      checkbox = $builder.addFormObject('default', {
        id: 'checkbox',
        component: 'checkbox',
        label: 'Pets',
        description: 'Do you have any pets?',
        options: ['Dog', 'Cat']
      });
      $builder.addFormObject('default', {
        component: 'sampleInput'
      });
      $scope.form = $builder.forms['default'];
      $scope.input = [];
      $scope.defaultValue = {};
      $scope.defaultValue[textbox.id] = 'default value';
      $scope.defaultValue[checkbox.id] = [true, true];
        $scope.formsubmit = function () {
            console.log($builder.forms['default']);
        };
      return $scope.submit = function() {
        return $validator.validate($scope, 'default').success(function() {
          return console.log('success');
        }).error(function() {
          return console.log('error');
        });
      };
    }
  ]).controller('testController', [
    '$scope', '$builder', '$validator', function($scope, $builder) {
      $scope.form2 = $builder.forms['default2'];
        $scope.formsubmit2 = function () {
            console.log($builder.forms['default2']);
            console.log($builder.forms['default']);
        };
    }
  ]);

}).call(this);
