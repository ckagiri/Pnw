(function () {
    'use strict';
    var controllerId = 'teams';
    angular.module('app').controller(controllerId, ['common', 'datacontext', teams]);

    function teams(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Teams';
        vm.teams = [];

        activate();

        function activate() {
            common.activateController([getTeams()], controllerId)
                .then(function () { log('Activated Teams View'); });
        }
        
        function getTeams() {
            return datacontext.getTeamPartials().then(function (data) {
                return vm.teams = data;
            });
        }
    }
})();