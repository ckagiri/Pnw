(function () {
    'use strict';
    var controllerId = 'seasons';
    angular.module('app').controller(controllerId, ['$location', 'common', 'datacontext', seasons]);

    function seasons($location, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Seasons';
        vm.seasons = [];
        vm.gotoSeason = gotoSeason;

        activate();

        function activate() {
            var promises = [datacontext.team.getAll(), getSeasons()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Seasons View'); });
        }

        function getSeasons() {
            return datacontext.season.getAll().then(function (data) {
                return vm.seasons = data;
            });
        }

        function gotoSeason(season) {
            if (season && season.id) {
                $location.path('/season/edit/' + season.id);
            }
        }
    }
})();