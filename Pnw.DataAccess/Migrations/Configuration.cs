using System.Web.Security;
using Pnw.Model;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    using System.Linq;

    public sealed class Configuration : DbMigrationsConfiguration<PnwDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = true;
        }

        protected override void Seed(PnwDbContext context)
        {
            var leagues = AddLeagues(context);
            var seasons = AddSeasons(context, leagues);
            var teams = AddTeams(context);


            AddTeamsToSeason(context, leagues, seasons, teams);
            AddFixturesToSeason(context, leagues, seasons, teams);
            SeedMembership(context);
        }

        private League[] AddLeagues(PnwDbContext context)
        {
            var leagues = new[]
                              {
                                  new League
                                      {
                                          Name = "English Premier League",
                                          Code = "EPL"
                                      },
                                  new League
                                      {
                                          Name = "Tusker Premier League",
                                          Code = "KPL"
                                      }
                              };

            context.Leagues.AddOrUpdate(p => p.Code, leagues);

            return leagues;
        }

        private Season[] AddSeasons(PnwDbContext context, League[] leagues)
        {
            var now = DateTime.Now;
            var eplSeasons = new[]
                                 {
                                     new Season
                                         {
                                             League = leagues.First(l => l.Code == "EPL"),
                                             StartDate = now.AddDays(-14),
                                             EndDate = now.AddDays(91),
                                             Name = "2013 - 2014",
                                         },
                                     new Season
                                         {
                                             League = leagues.First(l => l.Code == "EPL"),
                                             StartDate = now.AddMonths(-24),
                                             EndDate = now.AddDays(-12),
                                             Name = "2012 - 2013",
                                         }
                                 };
            var kplSeasons = new[]
                                 {
                                     new Season
                                         {
                                             League = leagues.First(l => l.Code == "KPL"),
                                             StartDate = now.AddDays(-14),
                                             EndDate = now.AddDays(21),
                                             Name = "2013 - 2014",
                                         }
                                 };

            var seasons = eplSeasons.Concat(kplSeasons).ToArray();
            context.Seasons.AddOrUpdate(p => new {p.LeagueId, p.Name}, seasons);

            return seasons;
        }

        private Team[] AddTeams(PnwDbContext context)
        {
            var kplTeams = new[]
                               {
                                   new Team
                                       {
                                           Name = "Gor Mahia",
                                           Code = "GOR",
                                           HomeGround = "City Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "AFC Leopards",
                                           Code = "AFC",
                                           HomeGround = "Chui Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Tusker",
                                           Code = "TUSK",
                                           HomeGround = "The Breweries",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Sofapaka",
                                           Code = "SOFP",
                                           HomeGround = "Sofapaka Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Ulinzi Stars",
                                           Code = "ULNZ",
                                           HomeGround = "Ulinzi Grounds",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       }
                               };

            var eplTeams = new[]
                               {
                                   new Team
                                       {
                                           Name = "Manchester United",
                                           Code = "MANU",
                                           HomeGround = "Old Trafford",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "manchester_united.png"
                                       },
                                   new Team
                                       {
                                           Name = "Manchester City",
                                           Code = "MANC",
                                           HomeGround = "Etihad",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "manchester_city.png"

                                       },
                                   new Team
                                       {
                                           Name = "Chelsea",
                                           Code = "CHE",
                                           HomeGround = "Stamford Bridge",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "chelsea.png"
                                       },
                                   new Team
                                       {
                                           Name = "Arsenal",
                                           Code = "ARS",
                                           HomeGround = "Emirates",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "arsenal.png"
                                       },
                                   new Team
                                       {
                                           Name = "Tottenham Hotspur",
                                           Code = "TOTT",
                                           HomeGround = "White Hart Lane",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "tottenham.png"
                                       },
                                   new Team
                                       {
                                           Name = "Everton",
                                           Code = "EVE",
                                           HomeGround = "Goodison Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "everton.png"
                                       },
                                   new Team
                                       {
                                           Name = "Liverpool",
                                           Code = "LIV",
                                           HomeGround = "Anfield",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "liverpool.png"
                                       },
                                   new Team
                                       {
                                           Name = "West Bromwich Albion",
                                           Code = "WBA",
                                           HomeGround = "The Hawthorns",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "west_brom.png"
                                       },
                                   new Team
                                       {
                                           Name = "Swansea",
                                           Code = "SWA",
                                           HomeGround = "Liberty Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "swansea.png"
                                       },
                                   new Team
                                       {

                                           Name = "West Ham United",
                                           Code = "WHU",
                                           HomeGround = "Boleyn Ground",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "west_ham_united.png"
                                       },
                                   new Team
                                       {
                                           Name = "Norwich City",
                                           Code = "NOR",
                                           HomeGround = "Carrow Road",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "english_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Fulham",
                                           Code = "FUL",
                                           HomeGround = "Craven Cottage",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "fulham.png"
                                       },
                                   new Team
                                       {
                                           Name = "Stoke City",
                                           Code = "STO",
                                           HomeGround = "Britannia Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "stoke_city.png"
                                       },
                                   new Team
                                       {
                                           Name = "Southampton",
                                           Code = "SOU",
                                           HomeGround = "St. Marys",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "english_premier_league.png"
                                       },
                                   new Team
                                       {

                                           Name = "Aston Villa",
                                           Code = "AVIL",
                                           HomeGround = "Villa Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "aston_villa.png"
                                       },
                                   new Team
                                       {

                                           Name = "Newcastle United",
                                           Code = "NUTD",
                                           HomeGround = "St. James' park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "newcastle_united.png"
                                       },
                                   new Team
                                       {

                                           Name = "Sunderland",
                                           Code = "SUN",
                                           HomeGround = "Stadium Of Light",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "sunderland.png"
                                       },
                                   new Team
                                       {

                                           Name = "Hull City",
                                           Code = "HUC",
                                           HomeGround = "KC Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "english_premier_league.png"
                                       },
                                   new Team
                                       {

                                           Name = "Cardiff City",
                                           Code = "CAC",
                                           HomeGround = "Cardiff City Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "english_premier_league.png"
                                       },
                                   new Team
                                       {

                                           Name = "Crystal Palace",
                                           Code = "CRP",
                                           HomeGround = "Selhurst Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "english_premier_league.png"
                                       }
                               };

            var teams = kplTeams.Concat(eplTeams).ToArray();
            context.Teams.AddOrUpdate(p => p.Code, teams);

            return teams;
        }

        private void AddTeamsToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var eplSeason = seasons.First(s => s.League.Code == "EPL" && s.Name == "2013 - 2014");
            var kplSeason = seasons.First(s => s.League.Code == "KPL" && s.Name == "2013 - 2014");

            var teamsKpl = teams.Take(5).ToList();
            var teamsEpl = teams.Skip(5).ToList();

            teamsKpl.ForEach(t => kplSeason.ParticipationList.Add(
                new Participation {Season = kplSeason, Team = t}));

            teamsEpl.ForEach(t => eplSeason.ParticipationList.Add(
                new Participation {Season = eplSeason, Team = t}));

            var participations = eplSeason.ParticipationList.Concat(kplSeason.ParticipationList).ToArray();

            context.Participations.AddOrUpdate(p => new {p.SeasonId, p.TeamId}, participations);
        }

        private void AddFixturesToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var eplSeason = seasons.First(s => s.League.Code == "EPL" && s.Name == "2013 - 2014");

            var manunited = teams.First(t => t.Code == "MANU");
            var mancity = teams.First(t => t.Code == "MANC");
            var arsenal = teams.First(t => t.Code == "ARS");
            var liverpool = teams.First(t => t.Code == "LIV");
            var spurs = teams.First(t => t.Code == "TOTT");
            var everton = teams.First(t => t.Code == "EVE");
            var newcastle = teams.First(t => t.Code == "NUTD");
            var chelsea = teams.First(t => t.Code == "CHE");

            var now = DateTime.Now;
            var day1 = now.AddDays(-4).AddHours(-3);
            var day2 = now.AddDays(-4);
            var day3 = now.AddHours(10);
            var day4 = now.AddHours(15);
            var day5 = now.AddDays(7);
            var day6 = now.AddDays(7).AddHours(3);
            var eplFixtures = new[]
                                  {
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = manunited,
                                              AwayTeam = chelsea,
                                              Venue = manunited.HomeGround,
                                              KickOff = day1,
                                              HomeScore = 2,
                                              AwayScore = 2,
                                              MatchStatus = MatchStatus.Played,
                                              HomeTeamImageSource = "manu1.png",
                                              AwayTeamImageSource = "chelsea2.png",
                                              CanPredict = false
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = mancity,
                                              AwayTeam = arsenal,
                                              Venue = mancity.HomeGround,
                                              KickOff = day2,
                                              HomeScore = 2,
                                              AwayScore = 3,
                                              MatchStatus = MatchStatus.Played,
                                              HomeTeamImageSource = "mancity1.png",
                                              AwayTeamImageSource = "arsenal2.png",
                                              CanPredict = false
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = everton,
                                              AwayTeam = liverpool,
                                              Venue = everton.HomeGround,
                                              KickOff = day3,
                                              HomeTeamImageSource = "everton1.png",
                                              AwayTeamImageSource = "liverpool2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {

                                              Season = eplSeason,
                                              HomeTeam = spurs,
                                              AwayTeam = newcastle,
                                              Venue = spurs.HomeGround,
                                              KickOff = day4,
                                              HomeTeamImageSource = "tottenham1.png",
                                              AwayTeamImageSource = "newcastle2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = chelsea,
                                              AwayTeam = spurs,
                                              Venue = chelsea.HomeGround,
                                              KickOff = day5,
                                              HomeTeamImageSource = "chelsea1.png",
                                              AwayTeamImageSource = "tottenham2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = arsenal,
                                              AwayTeam = manunited,
                                              Venue = arsenal.HomeGround,
                                              KickOff = day6.AddHours(3),
                                              HomeTeamImageSource = "arsenal1.png",
                                              AwayTeamImageSource = "manu2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = liverpool,
                                              AwayTeam = mancity,
                                              Venue = liverpool.HomeGround,
                                              KickOff = day6.AddHours(6),
                                              HomeTeamImageSource = "liverpool1.png",
                                              AwayTeamImageSource = "mancity2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              HomeTeam = newcastle,
                                              AwayTeam = everton,
                                              Venue = newcastle.HomeGround,
                                              KickOff = day6.AddHours(6),
                                              HomeTeamImageSource = "newcastle1.png",
                                              AwayTeamImageSource = "everton2.png",
                                              CanPredict = true
                                          }
                                  };
            context.Fixtures.AddOrUpdate(p => new {p.SeasonId, p.HomeTeamId, p.AwayTeamId}, eplFixtures);
        }

        private void SeedMembership(PnwDbContext context)
        {
            WebSecurity.InitializeDatabaseConnection(
                                    "PnwDEMO",
                                    "User",
                                    "Id",
                                    "Username",
                                    autoCreateTables: true);

            var roles = (SimpleRoleProvider)Roles.Provider;
            var membership = (SimpleMembershipProvider)Membership.Provider;

            if (!roles.RoleExists("Admin")) { roles.CreateRole("Admin"); }

            if (!roles.RoleExists("User")) { roles.CreateRole("User"); }

            //context.SaveChanges();


            if (membership.GetUser("test1", false) == null)
            {
                membership.CreateUserAndAccount("test1", "123456");
            }

            if (!roles.GetRolesForUser("test1").Contains("Admin"))
            {
                roles.AddUsersToRoles(new[] { "test1" }, new[] { "Admin" });
            }

            if (membership.GetUser("test2", false) == null)
            {
                membership.CreateUserAndAccount("test2", "123456");
            }
            if (!roles.GetRolesForUser("test2").Contains("User"))
            {
                roles.AddUsersToRoles(new[] { "test2" }, new[] { "User" });
            }

            if (membership.GetUser("test3", false) == null)
            {
                membership.CreateUserAndAccount("test3", "123456");
            }
            if (!roles.GetRolesForUser("test3").Contains("User"))
            {
                roles.AddUsersToRoles(new[] { "test3" }, new[] { "User" });
            }

            if (membership.GetUser("test4", false) == null)
            {
                membership.CreateUserAndAccount("test4", "123456");
            }
            if (!roles.GetRolesForUser("test4").Contains("User"))
            {
                roles.AddUsersToRoles(new[] { "test4" }, new[] { "User" });
            }
        }
    }
}
    

