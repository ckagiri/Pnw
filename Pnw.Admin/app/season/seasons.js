(function () {
    'use strict';
    var controllerId = 'seasons';
    angular.module('app').controller(controllerId, ['$location','bootstrappedData', 'common', 'datacontext', seasons]);

    function seasons($location,bootstrappedData, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var vm = this;
        
        vm.title = 'Seasons';
        vm.seasons = [];
        vm.gotoSeason = gotoSeason;
        vm.getSeasons = getSeasons;
        vm.refresh = refresh;

        activate();

        function activate() {
            common.activateController([init()], controllerId)
                .then(function () { log('Activated Seasons View'); });
        }

        function init() {
            return loadLeagues().then(getSeasons);
        }
        
        function loadLeagues() {
            return datacontext.league.getAll().then(function (data) {
                if (defaultSeason) {
                    data.some(function (n) {
                        if (n.id === defaultSeason.leagueId) {
                            vm.selectedLeague = n;
                            return true;
                        }
                        return false;
                    });
                }
                vm.leagues = data;
            });
        }
        
        function getSeasons(forceRemote) {
            return datacontext.season.getAll(forceRemote).then(function (data) {
                return vm.seasons = vm.selectedLeague && vm.selectedLeague.seasons;
            });
        }

        function gotoSeason(season) {
            if (season && season.id) {
                $location.path('/season/' + season.id);
            }
        }

        function refresh() {
            getSeasons(true);
        }
    }
})();