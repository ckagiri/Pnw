(function () {
    'use strict';
    var controllerId = 'leagues';
    angular.module('app').controller(controllerId, ['common', 'datacontext', leagues]);

    function leagues(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Leagues';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Leagues View'); });
        }
    }
})();