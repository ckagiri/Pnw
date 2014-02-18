(function () {
    'use strict';
    var controllerId = 'seasonrounds';
    angular.module('app').controller(controllerId, ['$location', 'bootstrappedData', 'common', 'datacontext', seasonrounds]);

    function seasonrounds($location, bootstrappedData, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var vm = this;

        vm.title = 'Season Rounds';
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.seasonrounds = [];
        vm.gotoSeasonRound = gotoSeasonRound;
        vm.leagueChanged = onLeagueChanged;
        vm.seasonChanged = onSeasonChanged;

        activate();

        function activate() {
            common.activateController([init()], controllerId);
        }

        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(getSeasonRounds);
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

        function loadSeasons() {
            return datacontext.season.getAll().then(function (data) {
                if (defaultSeason) {
                    data.some(function (n) {
                        if (n.id === defaultSeason.id) {
                            vm.selectedSeason = n;
                            return true;
                        }
                        return false;
                    });
                }
                vm.seasons = data;
            });
        }

        function onLeagueChanged() {
            
        }

        function onSeasonChanged() {
            
        }
        
        function getSeasonRounds(forceRemote) {
            return datacontext.round.getAll().then(function (data) {
                vm.seasonrounds = data;
            });
        }

        function gotoSeasonRound(round) {
            if (round && round.id) {
                $location.path('/seasonround/' + round.id);
            }
        }
    }
})();