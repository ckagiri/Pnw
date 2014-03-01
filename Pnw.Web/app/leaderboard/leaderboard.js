(function () {
    'use strict';
    var controllerId = 'leaderboard';
    angular.module('app').controller(controllerId, ['$location', 'bootstrappedData', 'common', 'datacontext', leaderboard]);

    function leaderboard($location, bootstrappedData, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var logSuccess = getLogFn(controllerId, 'success');
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate;
        var $q = common.$q;

        var vm = this;
        vm.title = 'Leaderboard';
        vm.leagues = [];
        vm.seasons = [];
        vm.leaderboard = [];
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.selectedRound = undefined;
        vm.months = [];
        vm.rounds = [];
        vm.filteredRounds = [];
        vm.leagueChanged = onLeagueChanged;
        vm.getLeaderboard = getLeaderboard;
        vm.gotoPredictions = gotoPredictions;
        vm.queryObj = {};
        vm.version = {
            val: "summary",
            show: function() {
                return (this.val === "full");
            },
            hide: function() {
                return (this.val == "summary");
            }
        };
        
        activate();
       
        function activate() {
            common.activateController([init()], controllerId);
        }

        function init() {
            initLookups()
                .then(getDefaults)
                .then(loadMonths)
                .then(loadRounds)
                .then(setDefaults)
                .then(getLeaderboard);
        }
        
        function getDefaults() {
            vm.leagues.some(function (n) {
                if (n.id === defaultLeague.id) {
                    vm.selectedLeague = n;
                    return true;
                }
                return false;
            });
            vm.seasons.some(function (n) {
                if (n.id === defaultSeason.id) {
                    vm.selectedSeason = n;
                    return true;
                }
                return false;
            });
        }

        function loadMonths() {
            var sd = moment.utc(vm.selectedSeason.startDate),
                ed = moment.utc(vm.selectedSeason.endDate);

            var from = sd.clone().startOf('month'),
                end = ed.startOf('month').add('M', 1);

            var counter = 0;
            vm.months = [];
            while (from.isBefore(end) && counter < 12) {
                vm.months.push(from.format('MMMM'));
                from.add('M', 1);
                counter += 1;
            }
        }

        function loadRounds(forceRemote) {
            return datacontext.round.getAll(forceRemote, vm.selectedSeason.id).then(function (data) {
                vm.rounds = data;
            });
        }

        function setDefaults() {
            var yCurrentDate = parseInt(moment(currentDate).format('YYYY'), 10),
               mCurrentDate = parseInt(moment(currentDate).format('M'), 10),
               dCurrentDate = parseInt(moment(currentDate).format('D'), 10);
            var cDate = new Date(yCurrentDate, mCurrentDate - 1, dCurrentDate);
            vm.rounds.some(function (r) {
                var yEndDate = parseInt(moment(r.endDate).format('YYYY'), 10),
                    mEndDate = parseInt(moment(r.endDate).format('M'), 10),
                    dEndDate = parseInt(moment(r.endDate).format('D'), 10);
                var rEndDate = new Date(yEndDate, mEndDate - 1, dEndDate);
                if (rEndDate >= cDate) {
                    vm.selectedRound = r;
                    return true;
                }
                return false;
            });
            var index = vm.rounds.indexOf(vm.selectedRound);
            if (index < 0) {
                vm.selectedRound = vm.rounds[vm.rounds.length - 1];
            }
            vm.selectedMonth = moment.utc(vm.selectedRound.startDate).format('MMMM');
            vm.filteredRounds = vm.rounds.filter(function (round) {
                return true;
            });
        }

        function getLeaderboard() {
            setQueryObj();
            return datacontext.leaderboard.get(vm.queryObj).then(function(data) {
                vm.leaderboard = data;
            });
        }

        function onLeagueChanged() {
            vm.seasons = vm.selectedLeague.seasons;
            vm.selectedSeason = vm.selectedLeague.seasons[0];
            setDefaults();
            getLeaderboard();
        }
        
        function initLookups() {
            return $q.when(function () {
                vm.leagues = datacontext.league.getAllLocal();
                vm.seasons = datacontext.season.getAllLocal();
            }());
        }

        function gotoPredictions(lb) {
            if (lb && lb.userId && lb.leagueId && lb.seasonId) {
                $location.path('/predictions?userId=' + lb.userId + '&leagueId=' + lb.leagueId + '&seasonId=' + lb.seasonId);
            }
        }

        function setQueryObj() {
            vm.queryObj = {
                leagueId: vm.selectedLeague && vm.selectedLeague.id,
                seasonId: vm.selectedSeason && vm.selectedSeason.id,
                month: getMonthFromString(vm.selectedMonth),
                roundId: vm.selectedRound && vm.selectedRound.id
            };
            
            function getMonthFromString(monthStr) {
                var d = Date.parse(monthStr + "1, 2000");
                if (!isNaN(d)) {
                    return new Date(d).getMonth() + 1;
                }
                return -1;
            }
        }
    }
})();