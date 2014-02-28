using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Breeze.ContextProvider;
using Breeze.WebApi2;
using Newtonsoft.Json.Linq;
using Pnw.DataAccess;
using Pnw.Model;

namespace Pnw.Web.Controllers.Api
{
    [BreezeController]
    public class BreezeController : ApiController
    {
        readonly PnwRepository _repository = new PnwRepository();

        [HttpGet]
        public string Metadata()
        {
            return _repository.Metadata;
        }

        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _repository.SaveChanges(saveBundle);
        }

        [HttpGet]
        public IQueryable<Fixture> Fixtures()
        {
            return _repository.AllFixtures;
        }

        [HttpGet]
        public IQueryable<Team> Teams(int? seasonId)
        {
            if (seasonId != null)
            {
                var season = _repository.Seasons.FirstOrDefault(s => s.Id == seasonId.Value);
                if (season == null || !season.IsReady)
                {
                    var emptyList = new List<Team>();
                    return emptyList.AsQueryable();
                }
                
                return _repository.Participations
                    .Where(p => p.SeasonId == seasonId.Value)
                    .Select(p => p.Team);
            }
            return _repository.Teams;
        }

        [HttpGet]
        public IQueryable<League> Leagues()
        {
            return _repository.Leagues;
        }

        [HttpGet]
        public IQueryable<Season> Seasons()
        {
            return _repository.Seasons;
        }

        [HttpGet]
        public IQueryable<Round> Rounds()
        {
            return _repository.Rounds;
        }

        [HttpGet]
        public IQueryable<Participation> Participations()
        {
            return _repository.Participations;
        }

        [HttpGet]
        public IQueryable<Prediction> Predictions(int userId, int seasonId)
        {
            return _repository.Predictions.Where(p => p.UserId == userId && p.SeasonId == seasonId);
        }

        [HttpGet]
        public object Lookups()
        {
            var leagues = _repository.Leagues.OrderBy(n => n.Region).ThenBy(n => n.Name);
            var seasons = _repository.Seasons.OrderByDescending(n => n.StartDate);
            return new { leagues, seasons };
        }

        [HttpGet]
        public IQueryable<object> Leaderboard([FromUri]LeaderboardFilter filter)
        {
            var lb = _repository.Leaderboard(filter);
            return lb;
        }

            // Diagnostic
        [HttpGet]
        public string Ping()
        {
            return "pong";
        }
    }
}