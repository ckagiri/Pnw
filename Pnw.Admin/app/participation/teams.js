(function () {
    'use strict';
    var controllerId = 'seasonteams';
    angular.module('app').controller(controllerId, ['$location', 'bootstrappedData', 'common', 'datacontext', seasonteams]);

    function seasonteams($location, bootstrappedData, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var defaultSeason = bootstrappedData.defaultSeason;
        var vm = this;
        
        vm.title = 'Season Teams';
        vm.leagues = [];
        vm.seasons = [];
        vm.selectedLeague = null;
        vm.selectedSeason = null;
        vm.seasonteams = [];
        vm.addSeasonTeams = addSeasonTeams;

        activate();

        function activate() {
            common.activateController([init()], controllerId);
        }
        
        function init() {
            return loadLeagues()
                .then(loadSeasons)
                .then(loadTeams)
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
        
        function loadTeams() {
            return datacontext.team.getAll().then(function (data) {
                // vm.teams = data;
            });
        }


        function getSeasonTeams(forceRemote) {
            return datacontext.participation.getAll().then(function() {
                vm.selectedSeason.participationList.forEach(function(p) {
                    vm.seasonteams.push(p.team);
                });
            });
        }

        function addSeasonTeams(seasonteam) {
            var seasonId = vm.selectedSeason.id;
            $location.path('/seasonteams/add/' + seasonId);
        }
    }
})();