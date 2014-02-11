(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId,
        ['$location', '$scope', 'bootstrappedData', 'cache', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($location, $scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var $q = common.$q;
        var keyCodes = config.keyCodes;
        var stateKey = { filter: 'admin.fixtures.filter' };
        var defaultSeason = undefined;
        var vm = this;
        
        vm.title = 'Fixtures';
        vm.fixtures = [];
        vm.gotoFixture = gotoFixture;
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.leagueChanged = onLeagueChanged;
        vm.getFixtures = getFixtures;
        vm.fixtureCount = 0;
        vm.fixtureFilteredCount = 0;
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
                var val = vm.fixtureFilteredCount / vm.paging.pageSize;
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
            common.activateController([init()], controllerId);
        }

        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(restoreFilter)
                .then(loadTeams)
                .then(getFixtures);
        }
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                var fixtureFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, fixtureFilter);
            });
        }
        
        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
        }

        function getFixtures(forceRemote) {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.fixture.getAll(forceRemote, seasonId, vm.paging.currentPage, vm.paging.pageSize, vm.nameSearch)
                .then(function(data) {
                    vm.fixtures = data;
                    getFixtureCount();
                    getFixtureFilteredCount();
                    return data;
                });
        }

        function refresh() {
            getFixtures(true);
        }
        
        function getFixtureFilteredCount() {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.fixture.getCount(seasonId, vm.nameSearch).then(function (data) {
                return vm.fixtureFilteredCount = data;
            });
        }
        
        function getFixtureCount() {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.fixture.getCount(seasonId).then(function (data) {
                return vm.fixtureCount = data;
            });
        }

        function onLeagueChanged() {
            vm.selectedSeason = vm.selectedLeague.seasons[0];
            vm.fixtures = [];
            vm.fixtureCount = 0;
            vm.fixtureFilteredCount = 0;
            vm.seasons = vm.selectedLeague.seasons;
            getFixtures();
        }
        
        function gotoFixture(fixture) {
            if (fixture && fixture.id) {
                $location.path('/fixture/edit/' + fixture.seasonId + '/' + fixture.id);
            } else {
                if (vm.selectedSeason) {
                    $location.path('/fixture/new/' + vm.selectedSeason.id);
                }
            }
        }

        function loadTeams () {
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
                    data.some(function(n) {
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
            getFixtures();
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.nameSearch = '';
            }
            getFixtures();
        }
    }
})();