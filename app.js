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
var Notifier = {
  show: false,
  class: "",
  icon: "",
  message: "",
  timer: null,
  sce: null,
  scope: null,

  open: function open() {
    this.show = true;
    if (!this.scope.$$phase) this.scope.$apply();
  },

  close: function close() {
    this.show = false;
    if (!this.scope.$$phase) this.scope.$apply();
  },

  warning: function warning(msg) {
    this.class = "alert-warning";
    this.icon = "fa fa-question-circle";
    this.showAlert(this.class, msg);
  },

  info: function info(msg) {
    this.class = "alert-info";
    this.icon = "fa fa-info-circle";
    this.showAlert(this.class, msg);
    this.setTimer();
  },

  danger: function danger(msg) {
    this.class = "alert-danger";
    this.icon = "fa fa-times-circle";
    this.showAlert(this.class, msg);
  },

  success: function success(msg) {
    this.class = "alert-success";
    this.icon = "fa fa-check-circle";
    this.showAlert(this.class, msg);
  },

  showAlert: function showAlert(_class, msg) {
    clearTimeout(this.timer);
    this.class = _class;
    this.message = this.sce.trustAsHtml(msg);
    this.open();
  },

  setTimer: function setTimer() {
    var _this = this;
    clearTimeout(_this.timer);
    _this.timer = setTimeout(function() {
        _this.show = false;
        if (!_this.scope.$$phase) _this.scope.$apply();
      },
      5000);
  }
};
var Notifier = {
  show: false,
  class: "",
  icon: "",
  message: "",
  timer: null,
  sce: null,
  scope: null,

  open: function open() {
    this.show = true;
    if (!this.scope.$$phase) this.scope.$apply();
  },

  close: function close() {
    this.show = false;
    if (!this.scope.$$phase) this.scope.$apply();
  },

  warning: function warning(msg) {
    this.class = "alert-warning";
    this.icon = "fa fa-question-circle";
    this.showAlert(this.class, msg);
  },

  info: function info(msg) {
    this.class = "alert-info";
    this.icon = "fa fa-info-circle";
    this.showAlert(this.class, msg);
    this.setTimer();
  },

  danger: function danger(msg) {
    this.class = "alert-danger";
    this.icon = "fa fa-times-circle";
    this.showAlert(this.class, msg);
  },

  success: function success(msg) {
    this.class = "alert-success";
    this.icon = "fa fa-check-circle";
    this.showAlert(this.class, msg);
  },

  showAlert: function showAlert(_class, msg) {
    clearTimeout(this.timer);
    this.class = _class;
    this.message = this.sce.trustAsHtml(msg);
    this.open();
  },

  setTimer: function setTimer() {
    var _this = this;
    clearTimeout(_this.timer);
    _this.timer = setTimeout(function() {
        _this.show = false;
        if (!_this.scope.$$phase) _this.scope.$apply();
      },
      5000);
  }
};
app.controller('ModalInstanceCtrl',
  function($scope, $modalInstance, items) {
    $scope.txModify = false;

    if ($scope.txType == '128') {
      $scope.FromAddress = Wallet.toAddress(hexstring2ab(items.fromAddress));
      $scope.ToAddress = Wallet.toAddress(items.tx.outputs[0].scripthash);

      var valueStr = ab2hexstring(reverseArray(items.tx.outputs[0].value));

      $scope.Value = WalletMath.div(WalletMath.hexToNumToStr(valueStr), 100000000);
      $scope.ValueView = WalletMath.fixView($scope.Value);
      $scope.AssetIDRev = ab2hexstring(reverseArray(items.tx.outputs[0].assetid));
      $scope.AssetID = ab2hexstring(items.tx.outputs[0].assetid);
      $scope.AssetName = "NULL";

      for (i = 0; i < $scope.coins.length; i++) {
        if ($scope.coins[i].AssetId == $scope.AssetIDRev) {
          $scope.AssetName = $scope.coins[i].AssetName;
        }
      }


      if (items.toAddress != $scope.ToAddress) {
        console.log("ToAddress verify failed.");
        $scope.txModify = true;
      }


      if (!WalletMath.eq(items.amount, $scope.Value)) {
        console.log("Amount verify failed.");
        $scope.txModify = true;
      }


      if (items.tx.outputs.length == 2) {
        if (Wallet.toAddress(items.tx.outputs[1].scripthash) != $scope.FromAddress) {
          console.log("FromAddress verify failed.");
          $scope.txModify = true;
        }
      }
    } else if ($scope.txType == '2') {
      $scope.ClaimAddress = Wallet.toAddress(hexstring2ab(items.claimAddress));

      var valueStr = ab2hexstring(reverseArray(items.tx.outputs[0].value));
      $scope.Value = parseInt(valueStr, 16);
      $scope.AssetID = ab2hexstring(reverseArray(items.tx.outputs[0].assetid));
      $scope.AssetName = "Â∞èËöÅÂ∏Å";


      if (items.amount != $scope.Value) {
        console.log("Amount verify failed.");
        $scope.txModify = true;
      }


      if (Wallet.toAddress(items.tx.outputs[0].scripthash) != $scope.ClaimAddress) {
        console.log("ClaimAddress verify failed.");
        $scope.txModify = true;
      }
    }


    $scope.ok = function() {
      if (!$scope.txModify) {
        if ($scope.walletType == 'externalsignature') {
          $scope.MakeTxAndSend(items.txData);
        } else {
          $scope.SignTxAndSend(items.txData);
        }
      }
      $modalInstance.close();
    };


    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  });

