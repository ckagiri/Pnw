using System;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using Pnw.DataAccess.Configuration;
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

            modelBuilder.Entity<Season>()
                .HasRequired(s => s.League)
                .WithMany(l => l.Seasons)
                .WillCascadeOnDelete(false);

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

            modelBuilder.Configurations.Add(new UserConfiguration());

            // Add ASP.NET WebPages SimpleSecurity tables
            modelBuilder.Configurations.Add(new RoleConfiguration());
            modelBuilder.Configurations.Add(new OAuthMembershipConfiguration());
            modelBuilder.Configurations.Add(new MembershipConfiguration());
        }

        public DbSet<League> Leagues { get; set; }
        public DbSet<Season> Seasons { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Fixture> Fixtures { get; set; }
        public DbSet<Participation> Participations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Prediction> Predictions { get; set; }

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

        private void ApplyRules()
        {
            // Approach via @julielerman: http://bit.ly/123661P
            foreach (var entry in this.ChangeTracker.Entries()
                        .Where(
                             e => e.Entity is IAuditInfo &&
                            (e.State == EntityState.Added) ||
                            (e.State == EntityState.Modified)))
            {
                var e = (IAuditInfo)entry.Entity;

                if (entry.State == EntityState.Added)
                {
                    e.CreatedOn = DateTime.Now;
                }

                e.ModifiedOn = DateTime.Now;
            }
        }

        public override int SaveChanges()
        {
            this.ApplyRules();

            return base.SaveChanges();
        }
    }
}