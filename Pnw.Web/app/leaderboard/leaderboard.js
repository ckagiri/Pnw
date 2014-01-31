(function () {
    'use strict';
    var controllerId = 'leaderboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', leaderboard]);

    function leaderboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Leaderboard';

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Leaderboard View'); });
        }
    }
})();