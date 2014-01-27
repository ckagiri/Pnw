(function () {
    'use strict';
    var controllerId = 'seasonteams';
    angular.module('app').controller(controllerId, ['$location', 'common', 'datacontext', seasonteams]);

    function seasonteams($location, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'SeasonTeams';
        vm.seasonteams = [];
        vm.gotoSeasonTeams = gotoSeasonTeams;

        activate();

        function activate() {
            var promises = [datacontext.team.getAll(), getSeasonTeams()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated SeasonTeams View'); });
        }

        function getSeasonTeams() {
            return datacontext.seasonteam.getAll().then(function (data) {
                return vm.seasonteams = data;
            });
        }

        function gotoSeasonTeams(seasonteam) {
            if (seasonteam && seasonteam.id) {
                $location.path('/seasonteam/edit/' + seasonteam.id);
            }
        }
    }
})();