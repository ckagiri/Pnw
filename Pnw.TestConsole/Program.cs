using System.Data.Entity;
using System.Linq;
using Pnw.DataAccess;
using Pnw.DataAccess.Migrations;

namespace Pnw.TestConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<PnwDbContext, Configuration>());
            CreateDatabase();
        }

        private static void CreateDatabase()
        {
            var context = new PnwDbContext();
            context.Database.Initialize(true);
            //var season = context.Seasons.FirstOrDefault();
            //var x = season;

        }
    }
}
