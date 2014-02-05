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
        vm.addSeasonTeams = addSeasonTeams;
        vm.pageChanged = pageChanged;
        vm.allSelected = false;
        vm.selectedTeams = [];
        vm.getSelectedTeams = getSelectedTeams;
        vm.toggleAllSelected = toggleAllSelected;
        vm.toggleSelected = toggleSelected;
        vm.deselectAll = deselectAll;
        
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
                    data.forEach(function(n) {
                        var found =false;
                        if(!found) {
                            var match;
                            vm.selectedTeams.some(function(t) {
                                if (t.id === n.id) {
                                    match = t;
                                    return true;
                                }
                                return false;
                            });
                            found = !!match;
                        }
                        if (!found) {
                             n.selected = false;
                        } 
                        else {
                            n.selected = true;
                        }
                    });
                }
            );
        }
       
        function pageChanged(page) {
            if (!page) { return; }
            vm.allSelected = false;
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
       
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.teamSearch = '';
            }
            getTeams();
        }

        function addSeasonTeams() {
            
        }
        
        function getSelectedTeams() {
            return vm.selectedTeams;
        }

        function toggleAllSelected() {
            
            var reqTeams = vm.teams.filter(function (t) {
                return !t.selected === vm.allSelected;
            });
            
            vm.teams.forEach(function (n) {
                n.selected = vm.allSelected;
            });

            reqTeams.forEach(function (n) {
                selectOrDeselectTeam(n);
            });
        }
        
        function toggleSelected(t) {
            selectOrDeselectTeam(t);
        }

        function selectOrDeselectTeam(n) {
            var found = !!vm.selectedTeams.length;

            if (found) {
                var match;
                vm.selectedTeams.some(function (t) {
                    if (t.id === n.id) { 
                        match = t;
                        return true;
                    }
                    return false;
                });
                found = !!match;
            }

            if (!found) {
                vm.selectedTeams.push(n);
            } else {
                var index = vm.selectedTeams.indexOf(n);
                if (index > -1) {
                    vm.selectedTeams.splice(index, 1);
                }
            }
        }

        function deselectAll() {
            vm.teams.forEach(function (n) {
                n.selected = false;
            });
        }
    }
})();