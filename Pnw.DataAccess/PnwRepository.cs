using System;
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

        public IQueryable<object> Leaderboard(int leagueId, int? seasonId, int? year, int? monthId)
        {
            var query = (from p in Context.Predictions
                         where p.LeagueId == leagueId && p.SeasonId == seasonId
                         group p by p.UserId
                         into g
                         let @group = g.FirstOrDefault()
                         where @group != null
                         join u in Context.Users on @group.UserId equals u.Id
                         let lastPrediction = g.OrderByDescending(n => n.FixtureDate).FirstOrDefault()
                         select new
                                    {
                                        UserName = u.Username,
                                        UserId = @group.UserId,
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
                                          v.UserName,
                                          v.UserId,
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
                .Take(20)
                .AsQueryable();

            return query;
        }
    }
}