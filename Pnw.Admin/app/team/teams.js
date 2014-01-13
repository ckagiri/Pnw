(function () {
    'use strict';
    var controllerId = 'teams';
    angular.module('app').controller(controllerId, ['common', 'config', 'datacontext', teams]);

    function teams(common, config, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
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
        
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.teamFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        activate();

        function activate() {
            common.activateController([getTeams()], controllerId)
                .then(function () { log('Activated Teams View'); });
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
            return datacontext.team.getPartials(forceRefresh, vm.paging.currentPage, vm.paging.pageSize, vm.teamSearch)
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