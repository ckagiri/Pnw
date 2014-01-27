(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId,
        ['$location', '$routeParams', 'bootstrappedData', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($location, $routeParams, bootstrappedData, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var $q = common.$q;
        var keyCodes = config.keyCodes;
        var vm = this;
        vm.title = 'Fixtures';
        vm.fixtures = [];
        vm.gotoFixture = gotoFixture;
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.getSeasons = getSeasons;
        vm.getFixtures = getFixtures;
        vm.fixtureCount = 0;
        vm.fixtureFilteredCount = 0;
        vm.nameSearch = '';
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        vm.pageChanged = pageChanged;
        vm.refresh = function () { };
        vm.search = search;
        
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
            var promises = [datacontext.team.getAll(), loadFixtures()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Fixtures View'); });
        }

        function getFixtures(forceRemote) {
            var seasonId = vm.selectedSeason ? vm.selectedSeason.id : 0;
            return datacontext.fixture.getAll(forceRemote, seasonId, vm.paging.currentPage, vm.paging.pageSize, vm.nameSearch)
                .then(function (data) {
                    vm.fixtures = data;
                    getFixtureCount();
                    getFixtureFilteredCount();
                    return data;
            });
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

        function getSeasons() {
            vm.selectedSeason = null;
            vm.fixtures = [];
            vm.fixtureCount = 0;
            vm.fixtureFilteredCount = 0;
            vm.seasons = vm.selectedLeague.seasons;
        }
        
        function gotoFixture(fixture) {
            if (fixture && fixture.id) {
                $location.path('/fixture/edit/' + fixture.id);
            }
        }

        function loadFixtures() {
            getLeaguesAndSeasons()
                //.then(getDefaultLeagueAndSeason)
                .then(getFixtures);
        }
        
        function getLeaguesAndSeasons() {
            return $q.when(
                (function() {
                    var lookups = datacontext.lookup.lookupCachedData;
                    vm.leagues = lookups.leagues;
                    vm.seasons = lookups.seasons;
                })());
        }
        
        function getDefaultLeagueAndSeason() {
            return $q.when(
                (function () {
                    var defaultSeason = bootstrappedData.defaultSeason;
                    var defaultLeagueId = defaultSeason.leagueId;
                    var defaultSeasonId = defaultSeason.id;
                    vm.leagues.some(function(l) {
                        if (l.id === defaultLeagueId) {
                            vm.selectedLeague = l;
                            return true;
                        }
                        return false;
                    });
                    vm.seasons.some(function(s) {
                        if (s.id === defaultSeasonId) {
                            vm.selectedSeason = s;
                            return true;
                        }
                        return false;
                    });
                    return vm.selectedSeason && vm.selectedSeason.id;
                })());
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