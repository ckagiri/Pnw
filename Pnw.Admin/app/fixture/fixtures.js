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
            var promises = [loadLeagues(), loadSeasons(), loadTeams(), getFixtures()];
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
                $location.path('/fixture/edit/' + fixture.seasonId + '/' + fixture.id);
            } else {
                if (vm.selectedSeason) {
                    $location.path('/fixture/new/' + vm.selectedSeason.id);
                }
            }
        }

        function loadTeams() {
            return datacontext.team.getAll().then(function(data) {
                vm.teams = data;
            });
        }
        
        function loadLeagues() {
            return datacontext.league.getAll().then(function (data) {
                 vm.leagues = data;
            });
        }
        
        function loadSeasons() {
            return datacontext.season.getAll().then(function (data) {
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