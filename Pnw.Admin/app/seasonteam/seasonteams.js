(function () {
    'use strict';
    var controllerId = 'seasonteams';
    angular.module('app').controller(controllerId, ['common', 'datacontext', seasonteams]);

    function seasonteams(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Season-Teams';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Season-Teams View'); });
        }
    }
})();