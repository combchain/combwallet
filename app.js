var app = angular.module('neow', ['pascalprecht.translate', 'ui.bootstrap']);

app.config(['$compileProvider',
  function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob|ftp|mailto|tel|file|sms):/);
  }]);
app.controller('ModalTimeoutCtrl',
  function($scope) {
    $scope.refreshPage = function() {
      location.reload();
    };
  });
