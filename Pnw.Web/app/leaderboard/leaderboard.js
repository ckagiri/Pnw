(function () {
    'use strict';
    var controllerId = 'leaderboard';
    angular.module('app').controller(controllerId, ['$location', 'bootstrappedData', 'common', 'datacontext', leaderboard]);

    function leaderboard($location, bootstrappedData, common, datacontext) {
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
        vm.gotoPredictions = gotoPredictions;
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
                vm.leagues = datacontext.league.getAllLocal();
                vm.seasons = datacontext.season.getAllLocal();
            }());
        }

        function gotoPredictions(lb) {
            if (lb && lb.userId && lb.leagueId && lb.seasonId) {
                $location.path('/predictions?userId=' + lb.userId + '&leagueId=' + lb.leagueId + '&seasonId=' + lb.seasonId);
            }
        }

        function refresh() {
            getLeaderBoard(true);
        }
    }
})();