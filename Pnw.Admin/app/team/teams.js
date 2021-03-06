﻿(function () {
    'use strict';
    var controllerId = 'teams';
    angular.module('app').controller(controllerId, ['$location', 'common', 'config', 'datacontext', teams]);

    function teams($location, common, config, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var keyCodes = config.keyCodes;

        vm.teams = [];
        vm.teamCount = 0;
        vm.teamFilteredCount = 0;
        vm.teamSearch = '';
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 3
        };
        vm.pageChanged = pageChanged;
        vm.refresh = refresh;
        vm.search = search;
        vm.title = 'Teams';
        vm.gotoTeam = gotoTeam;
        
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                var val = vm.teamFilteredCount / vm.paging.pageSize;
                var pageCount = Math.floor(val);
                if (!common.isNumber(val)) {
                    pageCount += 1;
                }
                return pageCount;
            }
        });

        activate();

        function activate() {
            common.activateController([getTeams()], controllerId);
        }
        
        function gotoTeam(team) {
            if (team && team.id) {
                $location.path('/team/' + team.id);
            }
        }
        
        function getTeamCount() {
            return datacontext.team.getCount().then(function (data) {
                return vm.teamCount = data;
            });
        }

        function getTeamFilteredCount() {
            vm.teamFilteredCount = datacontext.team.getFilteredCount(vm.teamSearch);
        }
        
        function getTeams(forceRefresh) {
            return datacontext.team.getAll(forceRefresh, vm.paging.currentPage, vm.paging.pageSize, vm.teamSearch)
                .then(function (data) {
                    vm.teams = data;
                    if (!vm.teamCount || forceRefresh) {
                        // Only grab the full count once or on refresh
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

        function refresh() { getTeams(true); }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.teamSearch = '';
            }
            getTeams();
        }
    }
})();