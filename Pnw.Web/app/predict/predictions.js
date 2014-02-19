(function () {
    'use strict';
    var controllerId = 'predictions';
    angular.module('app').controller(controllerId, ['$route', '$routeParams', '$scope', 'bootstrappedData', 'cache', 'common', 'config', 'datacontext', predictions]);

    function predictions($route, $routeParams, $scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var logSuccess = getLogFn(controllerId, 'success');
        var $q = common.$q;
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate;
        var user = bootstrappedData.user;
        var stateKey = { filter: 'public.predictions.filter' };
        var vm = this;

        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.predictions = [];
        vm.filteredPredictions = [];
        vm.predictionFilteredCount = 0;
        vm.months = [];
        vm.leagueChanged = onLeagueChanged;
        vm.refresh = refresh;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.selectedRound = undefined;
        vm.rounds = [];
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 5
        };
        vm.pageChanged = pageChanged;
        vm.roundPager = {
            index: 0,
            maxIndex: 1,
            prev: prev,
            next: next
        };
        vm.isBusy = false;

        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                var val = vm.predictionCount / vm.paging.pageSize;
                var pageCount = Math.floor(val);
                if (!common.isNumber(val)) {
                    pageCount += 1;
                }
                return pageCount;
            }
        });
        vm.summary = undefined;
        vm.title = 'Predictions';
        vm.refresh = refresh;

        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId);
        }
        
        function init() {
            initLookups()
                .then(getDefaults)
                .then(restoreFilter)
                .then(loadRounds)
                .then(initRoundPager)
                .then(loadTeams)
                .then(getFixtures)
                .then(getPredictions)
                .then(summarize);
        }
        
        function restoreFilter(restore) {
            if (restore) {
                var cached = cache.get(stateKey.filter);
                if (!cached) {
                    return;
                }
                vm.selectedLeague = cached.selectedLeague;
                vm.selectedSeason = cached.selectedSeason;
            }
        }

        function summarize() {
            var summary = {
                points: 0,
                correctScorePoints: 0,
                correctResultPoints: 0,
                crossProductPoints: 0,
                accuracyDifference: 0,
                spreadDifference: 0
            };
            vm.summary = vm.predictions.reduce(function(accum, prediction) {
                accum.points += prediction.points;
                accum.correctScorePoints += prediction.correctScorePoints;
                accum.correctResultPoints += prediction.correctResultPoints;
                accum.crossProductPoints += prediction.crossProductPoints;
                accum.accuracyDifference += prediction.accuracyDifference;
                accum.spreadDifference += prediction.spreadDifference;
                return accum;
            }, summary);
        }
        
        function onLeagueChanged() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.selectedSeason = vm.selectedLeague.seasons[0];
                $q.when(loadRounds())
                    .then(initRoundPager)
                    .then(loadTeams)
                    .then(getFixtures)
                    .then(getPredictions)
                    .then(summarize);
                vm.isBusy = false;
            }
        }
        
        function getDefaults() {
            var userId = parseInt($route.current.params.userId, 10);
            var leagueId = parseInt($route.current.params.leagueId, 10);
            var seasonId = parseInt($route.current.params.seasonId, 10);

            if (userId && leagueId && seasonId) {
                vm.selectedLeague = getSelectedLeague(leagueId);
                vm.selectedSeason = getSelectedSeason(seasonId);
                user = { isAuthenticated: true, id: userId }; // todo: find elegant alternative 
                return false;
            } else {
                vm.selectedLeague = getSelectedLeague(defaultLeague.id);
                vm.selectedSeason = getSelectedSeason(defaultSeason.id);
            }

            if (!vm.selectedLeague) { vm.selectedLeague = vm.leagues[0]; }
            return true;

            function getSelectedLeague(id) {
                vm.leagues.some(function (n) {
                    if (n.id === id) {
                        vm.selectedLeague = n;
                        return true;
                    }
                    return false;
                });
                return vm.selectedLeague;
            }

            function getSelectedSeason(id) {
                vm.seasons.some(function (n) {
                    if (n.id === id) {
                        vm.selectedSeason = n;
                        return true;
                    }
                    return false;
                });
                return vm.selectedSeason;
            }
        }
        
        function prev() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.roundPager.index -= 1;
                gotoRoundIndex();
            }
        }

        function next() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.roundPager.index += 1;
                gotoRoundIndex();
            }
        }

        function gotoRoundIndex() {
            var i = vm.roundPager.index;
            vm.selectedRound = vm.rounds[i];
            getPredictions(false)
                .then(summarize)
                .then(vm.isBusy = false);
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getPredictions(false);
        }
       
        function initRoundPager() {
            var yCurrentDate = parseInt(moment(currentDate).format('YYYY'), 10),
               mCurrentDate = parseInt(moment(currentDate).format('M'), 10),
               dCurrentDate = parseInt(moment(currentDate).format('D'), 10);

            vm.rounds.some(function (r) {
                var yEndDate = parseInt(moment(r.endDate).format('YYYY'), 10),
                    mEndDate = parseInt(moment(r.endDate).format('M'), 10),
                    dEndDate = parseInt(moment(r.endDate).format('D'), 10);
                if (yEndDate >= yCurrentDate && mEndDate >= mCurrentDate && dEndDate >= dCurrentDate) {
                    vm.selectedRound = r;
                    return true;
                }
                return false;
            });
            var index = vm.rounds.indexOf(vm.selectedRound);
            if (index < 0) {
                vm.selectedRound = vm.rounds[vm.rounds.length - 1];
                index = vm.months.indexOf(vm.selectedMonth);
            }
            vm.roundPager.index = index;
            vm.roundPager.maxIndex = vm.rounds.length - 1;
        }

        function refresh() {
            return $q.all([getFixtures(true), getPredictions(true)])
                .then(summarize).then(logSuccess("Refresh Successful", null, true));
        }

        function initLookups() {
            return $q.when(function () {
                vm.leagues = datacontext.league.getAllLocal();
                vm.seasons = datacontext.season.getAllLocal();
            }());
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                var predictionFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, predictionFilter);
            });
        }
        
        function loadRounds(forceRemote) {
            return datacontext.round.getAll(forceRemote, vm.selectedSeason.id).then(function (data) {
                vm.rounds = data;
            });
        }
        
        function loadTeams() {
            if (vm.selectedSeason.isPartial) {
                return datacontext.team.getBySeason(vm.selectedSeason);
            }
            return $q.when(false);
        }

        function getFixtures(forceRemote) {
            if (!vm.selectedSeason.isPartial) {
                return datacontext.fixture.getAll(forceRemote, vm.selectedSeason.id).then(function(data) {
                    vm.fixtures = data;
                });
            }
            vm.fixtures = [];
            return $q.when(false);
        }

        function getPredictions(forceRemote) {
            var offset = moment().zone();
            var fixtureDate, startOfWeek, endOfWeek;
            if (user.isAuthenticated) {
                if (!vm.selectedSeason.isPartial && vm.selectedRound) {
                    return datacontext.prediction.getAll(!!forceRemote, user.id, vm.selectedSeason.id).then(function(data) {
                        vm.predictions = data.filter(function (p) {
                            fixtureDate = moment(p.fixtureDate).toDate();
                            startOfWeek = moment(vm.selectedRound.startDate).add('minutes', offset).toDate();
                            endOfWeek = moment(vm.selectedRound.endDate).add('days', 1).add('minutes', offset).toDate();
                            return startOfWeek <= fixtureDate && fixtureDate <= endOfWeek;
                        });
                        vm.predictionCount = vm.predictions.length;
                        getFilteredPredictions();
                    });
                }
            }
            vm.predictions = [];
            vm.predictionCount = 0;
            return $q.when(false);
        }

        function getFilteredPredictions() {
            var xs = vm.predictions;
            var currentPage = vm.paging.currentPage,
                pageSize = vm.paging.pageSize;
            var start = (currentPage - 1) * pageSize;

            vm.filteredPredictions = xs.slice(start, start + pageSize);
            vm.predictionFilteredCount = vm.filteredPredictions.length;
        }
    }
})();