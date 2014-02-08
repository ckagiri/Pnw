(function () {
    'use strict';
    var controllerId = 'leaderboard';
    angular.module('app').controller(controllerId, ['bootstrappedData', 'common', 'datacontext', leaderboard]);

    function leaderboard(bootstrappedData, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate;
        var $q = common.$q;

        var vm = this;
        vm.title = 'Leaderboard';
        vm.leagues = [];
        vm.seasons = [];
        vm.leaderboard = [];
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.leagueChanged = onLeagueChanged;
        vm.getLeaderboard = function () { };
        vm.refresh = refresh;
        
        activate();

        function activate() {
            initLookups();
            getDefaults();
            common.activateController([getLeaderBoard()], controllerId)
                .then(function () { log('Activated Leaderboard View'); });
        }
        
        function getDefaults() {
            vm.leagues.some(function (n) {
                if (n.id === defaultLeague.id) {
                    vm.selectedLeague = n;
                    return true;
                }
                return false;
            });
            vm.seasons.some(function (n) {
                if (n.id === defaultSeason.id) {
                    vm.selectedSeason = n;
                    return true;
                }
                return false;
            });
            vm.selectedMonth = moment.utc(currentDate).format('MMMM');
        }

        function getLeaderBoard(forceRemote) {
            var leagueId = vm.selectedLeague.id;
            var seasonId = (vm.selectedSeason && vm.selectedSeason.id) || 0;
            return datacontext.leaderboard.get(forceRemote, leagueId, seasonId).then(function(data) {
                vm.leaderboard = data;
            });
        }

        function onLeagueChanged() {
            vm.selectedSeason = vm.selectedLeague.seasons[0];
            getLeaderBoard();
        }
        
        function initLookups() {
            return $q.when(function () {
                var lookups = datacontext.lookup.lookupCachedData;
                vm.leagues = lookups.leagues;
                vm.seasons = lookups.seasons;
            }());
        }

        function refresh() {
            getLeaderBoard(true);
        }
    }
})();