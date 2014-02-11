(function () {
    'use strict';
    var controllerId = 'results';
    angular.module('app').controller(controllerId, ['$location', '$scope', 'bootstrappedData', 'cache', 'common', 'config', 'datacontext', results]);

    function results($location, $scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var $q = common.$q;
        var keyCodes = config.keyCodes;
        var stateKey = { filter: 'admin.results.filter' };
        var defaultSeason = undefined;
        var vm = this;
        
        vm.title = 'Results';
        vm.results = [];
        vm.gotoFixture = gotoFixture;
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.leagueChanged = onLeagueChanged;
        vm.getResults = getResults;
        vm.resultCount = 0;
        vm.resultFilteredCount = 0;
        vm.nameSearch = '';
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 10
        };
        vm.pageChanged = pageChanged;
        vm.refresh = refresh;
        vm.search = search;
        defaultSeason = bootstrappedData.defaultSeason;
        
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                var val = vm.resultFilteredCount / vm.paging.pageSize;
                var pageCount = Math.floor(val);
                if (!common.isNumber(val)) {
                    pageCount += 1;
                }
                return pageCount;
            }
        });

        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId)
                .then(function () { log('Activated Results View'); });
        }

        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(restoreFilter)
                .then(loadTeams)
                .then(getResults);
        }
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                var resultFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, resultFilter);
            });
        }
        
        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
        }
        
        function onLeagueChanged() {
            vm.selectedSeason = vm.selectedLeague.seasons[0];
            vm.results = [];
            vm.resultCount = 0;
            vm.resultFilteredCount = 0;
            vm.seasons = vm.selectedLeague.seasons;
            getResults();
        }
        
        function getResults(forceRemote) {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.result.getAll(forceRemote, seasonId, vm.paging.currentPage, vm.paging.pageSize, vm.nameSearch)
                .then(function (data) {
                    vm.results = data;
                    getResultCount();
                    getResultFilteredCount();
                    return data;
                });
        }

        function refresh() {
            getResults(true);
        }

        function getResultFilteredCount() {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.result.getCount(seasonId, vm.nameSearch).then(function (data) {
                return vm.resultFilteredCount = data;
            });
        }

        function getResultCount() {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.result.getCount(seasonId).then(function (data) {
                return vm.resultCount = data;
            });
        }

        function loadTeams() {
            return datacontext.team.getAll().then(function (data) {
                vm.teams = data;
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

        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getResults();
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.nameSearch = '';
            }
            getResults();
        }
        
        function gotoFixture(result) {
            if (result && result.id) {
                $location.path('/result/edit/' + result.id);
            }
        }
    }
})();