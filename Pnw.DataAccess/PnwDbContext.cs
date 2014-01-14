using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using Pnw.Model;

namespace Pnw.DataAccess
{
    public class PnwDbContext : DbContext 
    {
        public PnwDbContext() : base(nameOrConnectionString: ConnectionStringName)
        { }

        public PnwDbContext(string nameOrConnectionString) : base(nameOrConnectionString)
        { }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Use singular table names
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // Disable proxy creation and lazy loading; not wanted in this service context.
            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;

            modelBuilder.Entity<Fixture>()
                .HasRequired(f => f.HomeTeam)
                .WithMany()
                .HasForeignKey(f => f.HomeTeamId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Fixture>()
                .HasRequired(f => f.AwayTeam)
                .WithMany()
                .HasForeignKey(f => f.AwayTeamId)
                .WillCascadeOnDelete(false);

            // modelBuilder.Entity<Season>().HasMany(s => s.Teams).WithMany();

            modelBuilder.Entity<Participation>()
                .HasKey(p => new { p.SeasonId, p.TeamId })
                .HasRequired(p => p.Team)
                .WithMany(t => t.ParticipationList)
                .HasForeignKey(p => p.TeamId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Participation>()
                .HasRequired(p => p.Season)
                .WithMany(s => s.ParticipationList)
                .HasForeignKey(p => p.SeasonId)
                .WillCascadeOnDelete(false);
        }

        public DbSet<League> Leagues { get; set; }
        public DbSet<Season> Seasons { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Fixture> Fixtures { get; set; }
        public DbSet<Participation> Participations { get; set; }

        public static string ConnectionStringName
        {
            get
            {
                if (ConfigurationManager.AppSettings["ConnectionStringName"]
                    != null)
                {
                    return ConfigurationManager.
                        AppSettings["ConnectionStringName"];
                }

                return "PnwDemo";
            }
        }
    }
}