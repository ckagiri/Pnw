(function () {
    'use strict';
    var controllerId = 'seasons';
    angular.module('app').controller(controllerId, ['common', 'datacontext', seasons]);

    function seasons(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Seasons';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Seasons View'); });
        }
    }
})();