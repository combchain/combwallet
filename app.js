var app = angular.module('neow', ['pascalprecht.translate', 'ui.bootstrap']);

app.config(['$compileProvider',
  function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob|ftp|mailto|tel|file|sms):/);
  }]);
app.config(['$translateProvider',
  function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'static/i18n/',
      suffix: '.json'
    });

    $translateProvider.useSanitizeValueStrategy('escapeParameters');
  }]);
app.directive('onReadFile',
  function($parse) {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
        var fn = $parse(attrs.onReadFile);

        element.on('change',
          function(onChangeEvent) {
            var file = (onChangeEvent.srcElement || onChangeEvent.target).files[0];
            var reader = new FileReader();

            reader.onload = function(onLoadEvent) {
              var Uints = new Uint8Array(reader.result);
              var db = new window.SQL.Database(Uints);

              var res = db.exec("SELECT * FROM Key");
              var passwordHash = new ArrayBuffer();
              var iv = new ArrayBuffer();
              var masterKey = new ArrayBuffer();
              for (i = 0; i < res[0].values.length; i++) {
                if (res[0].values[i][0] == 'PasswordHash') {
                  passwordHash = res[0].values[i][1];
                } else if (res[0].values[i][0] == 'IV') {
                  iv = res[0].values[i][1];
                } else if (res[0].values[i][0] == 'MasterKey') {
                  masterKey = res[0].values[i][1];
                }
              }

              res = db.exec("SELECT * FROM Account");
              var publicKeyHash = [];
              var privateKeyEncrypted = [];
              for (i = 0; i < res[0].values.length; i++) {
                for (j = 0; j < res[0].values[i].length; j++) {
                  if (j == 0) {
                    publicKeyHash[i] = res[0].values[i][j];
                  }
                  if (j == 1) {
                    privateKeyEncrypted[i] = res[0].values[i][j];
                  }
                }
              }

              var wallet = new Wallet(passwordHash, iv, masterKey, publicKeyHash, privateKeyEncrypted);

              scope.$apply(function() {
                fn(scope, {
                  $wallet: wallet
                });
              });

            };

            reader.readAsArrayBuffer(file);
          });
      }
    };
  });

