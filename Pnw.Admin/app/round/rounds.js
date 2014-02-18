(function () {
    'use strict';
    var controllerId = 'seasonrounds';
    angular.module('app').controller(controllerId, ['$location', '$scope', 'bootstrappedData', 'cache', 'common', 'datacontext', seasonrounds]);

    function seasonrounds($location, $scope, bootstrappedData, cache, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var stateKey = { filter: 'admin.rounds.filter' };
        var vm = this;

        vm.title = 'Season Rounds';
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.seasonrounds = [];
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 3
        };
        vm.pageChanged = pageChanged;
        vm.gotoSeasonRound = gotoSeasonRound;
        vm.leagueChanged = onLeagueChanged;
        vm.refresh = refresh;
        vm.getSeasonRounds = getSeasonRounds;
        
        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId);
        }

        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(restoreFilter)
                .then(getSeasonRounds);
        }
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                var filter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, filter);
            });
        }
        
        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
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
            vm.selectedSeason = vm.selectedLeague.seasons[0];
            vm.seasonrounds = [];
            vm.seasons = vm.selectedLeague.seasons;
            getSeasonRounds();
        }

        function refresh() {
            getSeasonRounds(true);
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getSeasonRounds();
        }
        
        function getSeasonRounds(forceRemote) {
            return datacontext.round.getAll(forceRemote, vm.paging.currentPage, vm.paging.pageSize, vm.selectedSeason.id)
                .then(function (data) {
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