(function () {
    'use strict';
    var controllerId = 'addteams';
    angular.module('app').controller(controllerId, ['$location', '$window', 'bootstrappedData', 'common', 'config', 'datacontext', addteams]);

    function addteams($location,$window, bootstrappedData, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var keyCodes = config.keyCodes;
        var vm = this;
        
        vm.title = 'Teams';
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.seasonteams = [];
        vm.selectedTeams = [];
        vm.addSeasonTeams = addSeasonTeams;
        vm.teams = [];
        vm.teamFilteredCount = [];
        vm.teamCount = 0;
        vm.teamSearch = '';
        vm.search = search;
        vm.goBack = goBack;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 10
        };
        vm.pageChanged = pageChanged;
        
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.teamFilteredCount / vm.paging.pageSize) + 1;
            }
        });
        
        activate();

        function activate() {
            common.activateController([init()], controllerId)
                .then(function () { log('Activated Seasons View'); });
        }
        
        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(getTeams)
                .then(getSeasonTeams);
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
        
        function goBack() { $window.history.back(); }

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
        
        function getTeams(forceRefresh) {
            return datacontext.team.getAll(forceRefresh, vm.paging.currentPage, vm.paging.pageSize, vm.teamSearch)
                .then(function (data) {
                    vm.teams = data;
                    if (!vm.teamCount || forceRefresh) {
                        getTeamCount();
                    }
                    getTeamFilteredCount();
                    return data;
                }
            );
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getTeams();
        }
       
        function getTeamCount() {
            return datacontext.team.getCount().then(function (data) {
                return vm.teamCount = data;
            });
        }
        
        function getTeamFilteredCount() {
            vm.teamFilteredCount = datacontext.team.getFilteredCount(vm.teamSearch);
        }


        function getSeasonTeams(forceRemote) {
            return datacontext.participation.getAll().then(function() {
                vm.selectedSeason.participationList.forEach(function(p) {
                    vm.seasonteams.push(p.team);
                });
            });
        }

        function addSeasonTeams() {
            var seasonId = vm.selectedSeason.id;
            $location.path('/seasonteams/add/' + seasonId);
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.teamSearch = '';
            }
            getTeams();
        }
    }
})();