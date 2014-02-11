(function () {
    'use strict';
    var controllerId = 'seasons';
    angular.module('app').controller(controllerId, ['$location','$scope', 'bootstrappedData', 'cache', 'common', 'datacontext', seasons]);

    function seasons($location, $scope, bootstrappedData, cache, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var stateKey = { filter: 'admin.seasons.filter' };
        var vm = this;
        
        vm.title = 'Seasons';
        vm.seasons = [];
        vm.gotoSeason = gotoSeason;
        vm.getSeasons = getSeasons;
        vm.refresh = refresh;

        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId);
        }

        function init() {
            return loadLeagues().then(restoreFilter).then(getSeasons);
        }
        
        function onDestroy() {
            $scope.$on('$destroy', function() {
                var seasonFilter = { selectedLeague: vm.selectedLeague};
                cache.put(stateKey.filter, seasonFilter);
            });
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

        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
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