(function () {
    'use strict';
    var controllerId = 'predictions';
    angular.module('app').controller(controllerId, ['common', 'datacontext', predictions]);

    function predictions(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Predictions';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Predictions View'); });
        }
    }
})();