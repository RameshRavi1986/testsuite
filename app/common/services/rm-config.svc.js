'use strict';

/* App wide config service*/
(function () {

  var RmConfigSvc = function () {
    var panelModeEnabled = false;

    this.enablePanelMode = function() {
      panelModeEnabled = true;
    };

    this.$get = function() {
      return {
        panelModeEnabled: panelModeEnabled
      };
    };
  };

  angular.
    module('rm').
    provider('RmConfigSvc', RmConfigSvc);
})();