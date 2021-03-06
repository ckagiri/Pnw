﻿using System;
using System.Collections.Generic;
using System.Linq;
using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Newtonsoft.Json.Linq;
using Pnw.Model;

namespace Pnw.DataAccess
{
    /// <summary>
    /// Repository (a "Unit of Work") of Pnw models.
    /// </summary>
    public class PnwRepository
    {
        private readonly EFContextProvider<PnwDbContext>
            _contextProvider = new EFContextProvider<PnwDbContext>();

        private PnwDbContext Context { get { return _contextProvider.Context; } }
        
        public PnwRepository()
        {
            _contextProvider.BeforeSaveEntitiesDelegate = BeforeSaveEntities;
        }

        public string Metadata
        {
            get { return _contextProvider.Metadata(); }
        }

        private Dictionary<Type, List<EntityInfo>> BeforeSaveEntities(Dictionary<Type, List<EntityInfo>> saveMap)
        {
            // Validate entities
            foreach (var type in saveMap.Keys)
            {
                if (type == typeof(Prediction))
                {
                    foreach (var predictionEntityInfo in saveMap[type])
                    {
                        var prediction = ((Prediction)predictionEntityInfo.Entity);
                        var fixture = _contextProvider.Context.Fixtures.FirstOrDefault(f => f.Id == prediction.FixtureId);
                        if(fixture != null)
                        {
                            if(fixture.MatchStatus != MatchStatus.Scheduled)
                            {
                                var error = new EFEntityError(predictionEntityInfo, "Invalid", "Match is not in scheduled mode",
                                                              "HomeGoals");
                                throw new EntityErrorsException(new[] {error});
                            }
                        }
                    }
                }
            }
            return saveMap;
        }


        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        public IQueryable<League> Leagues
        {
            get { return Context.Leagues; }
        }

        public IQueryable<Season> Seasons
        {
            get { return Context.Seasons; }
        }

        public IQueryable<Participation> Participations
        {
            get { return Context.Participations; }
        }

        public IQueryable<Round> Rounds
        {
            get { return Context.Rounds; }
        }

        public IQueryable<Team> Teams
        {
            get { return Context.Teams; }
        }

        public IQueryable<Fixture> Fixtures
        {
            get { return Context.Fixtures.Where(f => f.MatchStatus == MatchStatus.Scheduled); }
        }

        public IQueryable<Fixture> Results
        {
            get { return Context.Fixtures.Where(f => f.MatchStatus != MatchStatus.Scheduled); }
        }

        public IQueryable<Prediction> Predictions
        {
            get { return Context.Predictions; }
        }

        public IQueryable<Fixture> AllFixtures
        {
            get { return Context.Fixtures; }
        }

        public IQueryable<object> Leaderboard(LeaderboardFilter filter)
        {
            DateTime? startDate = null; 
            DateTime? endDate = null;
            int? month = null;
            var leagueId = filter.LeagueId.GetValueOrDefault();
            var seasonId = filter.SeasonId.GetValueOrDefault();
            var roundId = filter.RoundId.GetValueOrDefault();
            if(roundId > 0)
            {
                var round = Context.Rounds.FirstOrDefault(r => r.Id == roundId);
                if(round != null)
                {
                    startDate = round.StartDate;
                    endDate = round.EndDate.AddDays(1);
                }
            }
            else
            {
                month = filter.Month.GetValueOrDefault();
            }
            var query = (from p in Context.Predictions 
                         where p.LeagueId == leagueId && p.SeasonId == seasonId
                         && (p.FixtureDate >=  startDate || startDate == null)
                         && (p.FixtureDate <= endDate || endDate == null)
                         && (month == null || p.FixtureDate.Month == month)
                         group p by p.UserId
                         into g
                         let @group = g.FirstOrDefault()
                         where @group != null
                         join u in Context.Users on @group.UserId equals u.Id
                         let lastPrediction = g.OrderByDescending(n => n.FixtureDate).FirstOrDefault()
                         select new
                                    {
                                        @group.UserId, 
                                        @group.LeagueId, 
                                        @group.SeasonId,
                                        UserName = u.Username,
                                        Points = g.Sum(p => p.Points),
                                        CorrectScorePoints = g.Sum(p => p.CorrectScorePoints),
                                        CorrectResultPoints = g.Sum(p => p.CorrectResultPoints),
                                        CrossProductPoints = g.Sum(p => p.CrossProductPoints),
                                        SpreadDifference = g.Sum(p => p.SpreadDifference),
                                        AccuracyDifference = g.Sum(p => p.AccuracyDifference),
                                        LastBetTimestamp =
                             lastPrediction != null ? lastPrediction.CreatedOn : DateTime.Now
                                    }) 
                .AsEnumerable()
                .Select((v, i) => new
                                      {
                                          Id = i + 1,
                                          RoundId = roundId,
                                          v.UserId, 
                                          v.LeagueId, 
                                          v.SeasonId,
                                          v.UserName,
                                          v.Points,
                                          v.CorrectScorePoints,
                                          v.CorrectResultPoints,
                                          v.CrossProductPoints,
                                          v.SpreadDifference,
                                          v.AccuracyDifference,
                                          v.LastBetTimestamp
                                      })
                .OrderByDescending(n => n.Points)
                .ThenByDescending(n => n.CorrectScorePoints)
                .ThenByDescending(n => n.CorrectResultPoints)
                .ThenByDescending(n => n.CrossProductPoints)
                .ThenByDescending(n => n.SpreadDifference)
                .ThenByDescending(n => n.AccuracyDifference)
                .ThenBy(n => n.LastBetTimestamp)
                .Take(50)
                .AsQueryable();

            return query;
        }
    }
}