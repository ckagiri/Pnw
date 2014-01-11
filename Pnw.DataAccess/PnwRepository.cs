using System.Linq;
using Breeze.WebApi;
using Newtonsoft.Json.Linq;
using Pnw.Model;

namespace Pnw.DataAccess
{
    /// <summary>
    /// Repository (a "Unit of Work") of Pnw models.
    /// </summary>
    public class PnwRepository
    {
        private readonly Breeze.WebApi.EF.EFContextProvider<PnwDbContext>
            _contextProvider = new Breeze.WebApi.EF.EFContextProvider<PnwDbContext>();

        private PnwDbContext Context { get { return _contextProvider.Context; } }

        public string Metadata
        {
            get { return _contextProvider.Metadata(); }
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

        public IQueryable<Team> Teams
        {
            get { return Context.Teams; }
        }

        public IQueryable<Fixture> Fixtures
        {
            get { return Context.Fixtures; }
        }

        public IQueryable<Fixture> Results
        {
            get { return Context.Fixtures; }
        }
    }
}