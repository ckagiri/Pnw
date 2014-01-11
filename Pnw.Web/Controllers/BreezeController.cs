using System.Linq;
using System.Web.Http;
using Newtonsoft.Json.Linq;
using Breeze.WebApi;
using Pnw.DataAccess;
using Pnw.Model;


namespace Pnw.Web.Controllers
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
            return _repository.Fixtures;
        }

        [HttpGet]
        public IQueryable<Fixture> Results()
        {
            return _repository.Fixtures;
        }

        [HttpGet]
        public IQueryable<Team> Teams()
        {
            return _repository.Teams;
        }

        [HttpGet]
        public object Lookups()
        {
            var leagues = _repository.Leagues;
            var seasons = _repository.Seasons;
            return new { leagues, seasons };
        }

        // Diagnostic
        [HttpGet]
        public string Ping()
        {
            return "pong";
        }
    }
}