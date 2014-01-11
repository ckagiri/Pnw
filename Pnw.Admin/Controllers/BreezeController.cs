using System.Linq;
using System.Web.Http;
using Breeze.ContextProvider;
using Breeze.WebApi2;
using Newtonsoft.Json.Linq;
using Pnw.DataAccess;
using Pnw.Model;

namespace Pnw.Admin.Controllers
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