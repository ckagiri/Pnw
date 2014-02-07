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
        public IQueryable<Team> Teams()
        {
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
        public IQueryable<Participation> Participations()
        {
            return _repository.Participations;
        }

        [HttpGet]
        public IQueryable<Prediction> Predictions()
        {
            return _repository.Predictions;
        }

        [HttpGet]
        public IQueryable<Prediction> Predictions(int userId)
        {
            return _repository.Predictions.Where(p => p.UserId == userId);
        }

        [HttpGet]
        public object Lookups()
        {
            var leagues = _repository.Leagues.OrderBy(n => n.Region).ThenBy(n => n.Name);
            var seasons = _repository.Seasons.OrderByDescending(n => n.StartDate);
            return new { leagues, seasons };
        }

        [HttpGet]
        public IQueryable<object> Leaderboard(int leagueId, int seasonId)
        {
            var lb = _repository.Leaderboard(leagueId, seasonId, null, null);
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