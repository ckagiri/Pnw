(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['$scope', 'bootstrappedData','cache', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var logSuccess = getLogFn(controllerId, 'success');
        var $q = common.$q;
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate || new Date();
        var user = bootstrappedData.user;
        var stateKey = { filter: 'public.fixtures.filter' };
        var vm = this;

        vm.leagues = [];
        vm.seasons = [];
        vm.teams = [];
        vm.fixtures = [];
        vm.filteredFixtures = [];
        vm.predictions = [];
        vm.months = [];
        vm.title = 'Home';
        vm.isSubmitting = false;
        vm.goalRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        vm.goals = null;
        vm.submitPredictions = submit;
        vm.predictionsToSubmit = [];
        vm.cancel = cancel;
        vm.leagueChanged = onLeagueChanged;
        vm.homePredictionChanged = predictionChanged;
        vm.awayPredictionChanged = predictionChanged;
        vm.refresh = refresh;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.selectedRound = undefined;
        vm.rounds = [];
        vm.summary = {
            totalPoints: 0,
            correctScore: 0,
            correctResult: 0
        };
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 10
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
                var val = vm.fixtureCount / vm.paging.pageSize;
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
            initLookups()
                .then(getDefaults)
                .then(restoreFilter)
                .then(loadRounds)
                .then(initRoundPager)
                .then(loadTeams)
                .then(getFixtures)
                .then(getStartingPage)
                .then(getFilteredFixtures)
                .then(getPredictions)
                .then(calculateTotalPoints)
                .then(addPredictionToFixture);
        }
       
        function initRoundPager() {
            var yCurrentDate = parseInt(moment(currentDate).format('YYYY'), 10),
               mCurrentDate = parseInt(moment(currentDate).format('M'), 10),
               dCurrentDate = parseInt(moment(currentDate).format('D'), 10);

            vm.rounds.some(function(r) {
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
            getFixtures()
                .then(getFilteredFixtures)
                .then(calculateTotalPoints)
                .then(addPredictionToFixture)
                .then(vm.isBusy = false);
        }

        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
        }

        function onLeagueChanged() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.selectedSeason = vm.selectedLeague.seasons[0];
                $q.when(loadRounds())
                    .then(initRoundPager)
                    .then(loadTeams)
                    .then(getFixtures)
                    .then(getStartingPage)
                    .then(getFilteredFixtures)
                    .then(getPredictions)
                    .then(calculateTotalPoints)
                    .then(addPredictionToFixture)
                    .then(vm.isBusy = false);
            }
        }
        
        function getDefaults() {
            vm.leagues.some(function(n) {
                if (n.id === defaultLeague.id) {
                    vm.selectedLeague = n;
                    return true;
                }
                return false;
            });
            vm.seasons.some(function(n) {
                if (n.id === defaultSeason.id) {
                    vm.selectedSeason = n;
                    return true;
                }
                return false;
            });
            vm.selectedMonth = moment.utc(currentDate).format('MMMM');
            if (!vm.selectedLeague) { vm.selectedLeague = vm.leagues[0]; }
        }

        function refresh() {
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
            }
            $q.all([loadTeams(), getFixtures(true), getPredictions(true)])
            .then(getFilteredFixtures)
                .then(calculateTotalPoints)
                .then(addPredictionToFixture)
                .then(logSuccess("Refresh Successful", null, true));
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getFixtures().then(getFilteredFixtures).then(addPredictionToFixture);
        }

        function calculateTotalPoints() {
            vm.predictions.filter(function (p) {
                return moment(p.fixtureDate).format('MMMM') === vm.selectedMonth;
            }).reduce(function (accum, prediction) {
                accum.totalPoints += prediction.points;
                accum.correctScore += prediction.correctScorePoints;
                accum.correctResult += prediction.correctResultPoints;
                return accum;
            }, vm.summary);
        }

        function predictionChanged(f) {
            var homePrediction = f.prediction.homeGoals;
            var awayPrediction = f.prediction.awayGoals;
            var match = null;
            var validPrediction = common.isNumber(homePrediction) && common.isNumber(awayPrediction);
            vm.predictions.some(function (p) {
                if (p.fixtureId === f.id) {
                    match = p;
                    return true;
                }
                return false;
            });
            if (validPrediction && match) {
                // a hack to force evaluation
                match.homeGoals = f.prediction.homeGoals + 1;
                match.homeGoals -= 1;
                match.awayGoals = f.prediction.awayGoals + 1; 
                match.awayGoals -= 1;
                
                var origHomeGoals = match.entityAspect.originalValues.homeGoals,
                    origAwayGoals = match.entityAspect.originalValues.awayGoals,
                    setToUnchanged = false;
                
                if (origHomeGoals === f.prediction.homeGoals &&
                    origAwayGoals === f.prediction.awayGoals) {
                    setToUnchanged = true;
                }
                
                if (setToUnchanged) {
                    match.entityAspect.entityState = breeze.EntityState.Unchanged;
                } else {
                    if (!match.entityAspect.entityState.isAdded()) {
                        match.entityAspect.entityState = breeze.EntityState.Modified;
                    }
                }
            }
            if (validPrediction && !match) {
                var newOne = datacontext.prediction.create(user.id, f);
                vm.predictions.push(newOne);
            }
            if (!validPrediction && match) {
                if (match.entityAspect.entityState.isAdded()) {
                    match.entityAspect.setDeleted();
                } else {
                    if (match.entityAspect.entityState.isModified()) {
                        match.homeGoals = match.entityAspect.originalValues.homeGoals;
                        match.awayGoals = match.entityAspect.originalValues.awayGoals;
                    }
                    match.entityAspect.entityState = breeze.EntityState.Unchanged;
                }
            }
            vm.predictionsToSubmit = vm.predictions.filter(function(p) {
                return p.entityAspect.entityState.isAdded() || p.entityAspect.entityState.isModified();
            });
            return false;
        }

        function loadRounds(forceRemote) {
            return datacontext.round.getAll(forceRemote, vm.selectedSeason.id).then(function(data) {
                vm.rounds = data;
            });
        }
        
        function cancel() {
            datacontext.cancel();
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
                getPredictions().then(addPredictionToFixture);
            }
        }

        function addPredictionToFixture() {
            vm.filteredFixtures.forEach(function (f) {
                var match = vm.predictions.filter(function (p) {
                    return p.fixtureId === f.id;
                });
                var prediction = match && match[0];
                f.prediction = {};
                if (prediction) {
                    f.prediction.homeGoals = prediction.homeGoals == 0 ? 0 : prediction.homeGoals;
                    f.prediction.awayGoals = prediction.awayGoals == 0 ? 0 : prediction.awayGoals;
                    f.prediction.points = prediction.points === 0 ? 0 : prediction.points;
                    f.prediction.isProcessed = prediction.isProcessed;
                }
                else {
                    f.prediction.homeGoals = null;
                    f.prediction.awayGoals = null;
                    f.prediction.points = null;
                    f.prediction.isProcessed = null;
                }
            });
        }
        
        function initLookups() {
            return $q.when(function() {
                vm.leagues = datacontext.league.getAllLocal();
                vm.seasons = datacontext.season.getAllLocal();
            }());
        }
        
        function canSubmit() { return !vm.isSubmitting && vm.predictionsToSubmit.length; };
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                var fixtureFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, fixtureFilter);
                datacontext.cancel();
            });
        }
        
        function getFixtures(forceRemote) {
            var offset = moment().zone();
            var kickOff, startOfWeek, endOfWeek;
            if (!vm.selectedSeason.isPartial) {
                return datacontext.fixture.getAll(forceRemote, vm.selectedSeason.id)
                    .then(function(data) {
                        vm.fixtures = data.filter(function (fixture) {
                            kickOff = moment(fixture.kickOff).toDate();
                            startOfWeek = moment(vm.selectedRound.startDate).add('minutes', offset).toDate();
                            endOfWeek = moment(vm.selectedRound.endDate).add('days', 1).add('minutes', offset).toDate();
                            return startOfWeek <= kickOff && kickOff <= endOfWeek;
                        });
                        vm.fixtureCount = vm.fixtures.length;
                    });
            }
            vm.fixtures = [];
            vm.fixtureCount = 0;
            return $q.when(false);
        }

        function getStartingPage() {
            var yCurrentDate = parseInt(moment(currentDate).format('YYYY'), 10), 
                mCurrentDate = parseInt(moment(currentDate).format('M'), 10), 
                dCurrentDate = parseInt(moment(currentDate).format('D'), 10);

            var reqFixture = undefined;
            vm.fixtures.some(function(f) {
                var yKickOff = parseInt(moment(f.kickOff).format('YYYY'), 10),
                    mKickOff = parseInt(moment(f.kickOff).format('M'), 10),
                    dKickOff = parseInt(moment(f.kickOff).format('D'), 10);
                if (yKickOff >= yCurrentDate && mKickOff >= mCurrentDate && dKickOff >= dCurrentDate) {
                    reqFixture = f;
                    return true;
                }
                return false;
            });
            if (reqFixture) {
                var ix = vm.fixtures.indexOf(reqFixture);
                vm.paging.currentPage = Math.ceil((ix + 1)/ vm.paging.pageSize);
            }
        }

        function getFilteredFixtures() {
            var xs = vm.fixtures;

            var currentPage = vm.paging.currentPage,
                pageSize = vm.paging.pageSize;
            var start = (currentPage - 1) * pageSize;
            
            vm.filteredFixtures = xs.slice(start, start + pageSize);
            vm.fixtureFilteredCount = vm.filteredFixtures.length;
        }
        
        function getPredictions(forceRemote) {
            if (user.isAuthenticated) {
                if (!vm.selectedSeason.isPartial) {
                    return datacontext.prediction.getAll(!!forceRemote, user.id, vm.selectedSeason.id).then(function(data) {
                        return vm.predictions = data;
                    });
                }
            }
            vm.predictions = [];
            return $q.when(false);
        }

        function loadTeams() {
            if (vm.selectedSeason.isReady && vm.selectedSeason.isPartial) {
                return datacontext.team.getBySeason(vm.selectedSeason);
            }
            return $q.when(false);
        }

        function submit() {
            if(!user.isAuthenticated) {
                logError("You must be logged in to submit predictions");
                return $q.when(null);
            }
            if (!canSubmit()) { return $q.when(null); } 

            vm.isSubmitting = true;
            return datacontext.save().then(function (saveResult) {
                getPredictions().then(function() {
                    addPredictionToFixture();
                    vm.predictionsToSubmit = [];
                    vm.isSubmitting = false;
                });
            }, function (error) {
                cancel();
                vm.isSubmitting = false;
            });
        }
    }
})();