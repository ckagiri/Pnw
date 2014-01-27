(function () {
    'use strict';
    var controllerId = 'leagues';
    angular.module('app').controller(controllerId, ['$location', 'common', 'datacontext', leagues]);

    function leagues($location, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Leagues';
        vm.leagues = [];
        vm.gotoLeague = gotoLeague;

        activate();

        function activate() {
            var promises = [datacontext.team.getAll(), getLeagues()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Leagues View'); });
        }

        function getLeagues() {
            return datacontext.league.getAll().then(function (data) {
                return vm.leagues = data;
            });
        }

        function gotoLeague(league) {
            if (league && league.id) {
                $location.path('/league/edit/' + league.id);
            }
        }
    }
})();