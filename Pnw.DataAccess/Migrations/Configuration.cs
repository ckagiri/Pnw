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
            //AddFixturesToSeason(context, leagues, seasons, teams);
            SeedMembership(context);
        }

        private League[] AddLeagues(PnwDbContext context)
        {
            var leagues = new[]
                              {
                                  new League
                                      {
                                          Name = "World Cup",
                                          Code = "WC",
                                          Region = Region.World,
                                          IsTournament = true,
                                          ParticipantType = ParticipantType.Country
                                      },
                                  new League
                                      {
                                          Name = "English Premier League",
                                          Code = "EPL",
                                          Region = Region.Europe
                                      },
                                  new League
                                      {
                                          Name = "Kenya Premier League",
                                          Code = "KPL",
                                          Region = Region.Africa
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
                                             StartDate = new DateTime(2013, 8, 17),
                                             EndDate = new DateTime(2014, 5, 11),
                                             Name = "2013 - 2014",
                                             IsReady = true
                                         },
                                     new Season
                                         {
                                             League = leagues.First(l => l.Code == "EPL"),
                                             StartDate = new DateTime(2012, 8, 18),
                                             EndDate = new DateTime(2013, 5, 19),
                                             Name = "2012 - 2013",
                                             IsReady = true
                                         }
                                 };
            var kplSeasons = new[]
                                 {
                                     new Season
                                         {
                                             League = leagues.First(l => l.Code == "KPL"),
                                             StartDate = new DateTime(2014, 2, 15),
                                             EndDate = new DateTime(2014, 11, 30),
                                             Name = "2013 - 2014",
                                             IsReady = true
                                         }
                                 };
            var worldcupSeason = new[]
                                     {
                                         new Season
                                             {
                                                 League =leagues.First(l => l.Code == "WC"),
                                                 StartDate = new DateTime(2014, 6, 12),
                                                 EndDate = new DateTime(2014, 7, 13),
                                                 Name = "2014",
                                                 IsReady = true
                                             }
                                     };

            var seasons = eplSeasons.Concat(kplSeasons).Concat(worldcupSeason).ToArray();
            context.Seasons.AddOrUpdate(p => new {p.LeagueId, p.Name}, seasons);

            return seasons;
        }

        private Team[] AddTeams(PnwDbContext context)
        {
            # region kpl
            var kplTeams = new[]
                               {
                                   new Team
                                       {
                                           Name = "Gor Mahia",
                                           Code = "GOR",
                                           HomeGround = "Gor Mahia",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "AFC Leopards",
                                           Code = "AFC",
                                           HomeGround = "AFC Leopards",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Tusker",
                                           Code = "TUS",
                                           HomeGround = "Tusker",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Sofapaka",
                                           Code = "SOF",
                                           HomeGround = "Sofapaka",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Name = "Ulinzi Stars",
                                           Code = "ULI",
                                           HomeGround = "Ulinzi Stars",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Western Stima",
                                           Code = "WES",
                                           HomeGround = "Western Stima",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Mathare United",
                                           Code = "MAT",
                                           HomeGround = "Mathare United",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Muhoroni Youth",
                                           Code = "MUH",
                                           HomeGround = "Muhoroni Youth",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Sony Sugar",
                                           Code = "SON",
                                           HomeGround = "Sony Sugar",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Top Fry Nakuru",
                                           Code = "TOP",
                                           HomeGround = "Top Fry Nakuru",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Thika United",
                                           Code = "THI",
                                           HomeGround = "Thika United",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Chemelil Sugar",
                                           Code = "CHE",
                                           HomeGround = "Chemelil Sugar",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "Bandari",
                                           Code = "BAN",
                                           HomeGround = "Bandari",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "KRA",
                                           Code = "KRA",
                                           HomeGround = "KRA",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "KCB",
                                           Code = "KCB",
                                           HomeGround = "KCB",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Name = "City Stars",
                                           Code = "CIT",
                                           HomeGround = "City Stars",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       }
                               };
            #endregion

            #region epl
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
                                           Name = "Swansea City",
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
            # endregion

            #region world-cup
            var wcTeams = new[] 
            { 
                // afc
                new Team
                {
                    Name = "Australia",
                    Code = "AUS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Iran",
                    Code = "IRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Japan",
                    Code = "JAP",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "South Korea",
                    Code = "SKO",
                    Type = ClubOrCountry.Country
                },
                //concacaf
                new Team
                {
                    Name = "Costa Rica",
                    Code = "COS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Honduras",
                    Code = "HON",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Mexico",
                    Code = "MEX",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "United States",
                    Code = "USA",
                    Type = ClubOrCountry.Country
                },
                //caf
                new Team
                {
                    Name = "Algeria",
                    Code = "ALG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Cameroon",
                    Code = "CAM",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Ghana",
                    Code = "GHA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Ivory Coast",
                    Code = "IVO",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Nigeria",
                    Code = "NIG",
                    Type = ClubOrCountry.Country
                },
                //conmebol
                new Team
                {
                    Name = "Argentina",
                    Code = "ARG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Brazil",
                    Code = "BRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Chile",
                    Code = "CHL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Colombia",
                    Code = "COL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Ecuador",
                    Code = "ECU",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Uruguay",
                    Code = "URU",
                    Type = ClubOrCountry.Country
                },
                //uefa
                new Team
                {
                    Name = "Belgium",
                    Code = "BEL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Bosnia and Herzegovina",
                    Code = "BOS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Croatia",
                    Code = "CRO",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "England",
                    Code = "ENG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "France",
                    Code = "FRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Germany",
                    Code = "GER",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Greece",
                    Code = "GRE",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Italy",
                    Code = "ITA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Netherlands",
                    Code = "NET",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Portugal",
                    Code = "POR",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Russia",
                    Code = "RUS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Spain",
                    Code = "SPA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Name = "Switzerland",
                    Code = "SWI",
                    Type = ClubOrCountry.Country
                },
            };
            #endregion

            var teams = kplTeams.Concat(eplTeams).Concat(wcTeams).ToArray();
            context.Teams.AddOrUpdate(p => p.Name, teams);

            return teams;
        }

        private void AddTeamsToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var eplSeason = seasons.First(s => s.League.Code == "EPL" && s.Name == "2013 - 2014");
            var kplSeason = seasons.First(s => s.League.Code == "KPL" && s.Name == "2013 - 2014");
            var wcSeason = seasons.First(s => s.League.Code == "WC" && s.Name == "2014");

            var teamsKpl = teams.Take(16).ToList();
            var teamsEpl = teams.Skip(16).Take(20).ToList();
            var teamsWc = teams.Skip(36).ToList();

            teamsKpl.ForEach(t => kplSeason.ParticipationList.Add(
                new Participation {Season = kplSeason, Team = t}));
            teamsEpl.ForEach(t => eplSeason.ParticipationList.Add(
                new Participation {Season = eplSeason, Team = t}));
            teamsWc.ForEach(t => wcSeason.ParticipationList.Add(
                new Participation { Season = wcSeason, Team = t}));

            var participations = eplSeason.ParticipationList
                .Concat(kplSeason.ParticipationList)
                .Concat(wcSeason.ParticipationList).ToArray();

            context.Participations.AddOrUpdate(p => new {p.SeasonId, p.TeamId}, participations);
        }

        #region fixtures
        private void AddFixturesToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var eplSeason = seasons.First(s => s.League.Code == "EPL" && s.Name == "2013 - 2014");
            var eplLeague = leagues.First(l => l.Code == "EPL");
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
                                              League = eplLeague,
                                              HomeTeamId = manunited.Id,
                                              AwayTeamId = chelsea.Id,
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
                                              League = eplLeague,
                                              HomeTeamId = mancity.Id,
                                              AwayTeamId = arsenal.Id,
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
                                              League = eplLeague,
                                              HomeTeamId = everton.Id,
                                              AwayTeamId = liverpool.Id,
                                              Venue = everton.HomeGround,
                                              KickOff = day3,
                                              HomeTeamImageSource = "everton1.png",
                                              AwayTeamImageSource = "liverpool2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              League = eplLeague,
                                              HomeTeamId = spurs.Id,
                                              AwayTeamId = newcastle.Id,
                                              Venue = spurs.HomeGround,
                                              KickOff = day4,
                                              HomeTeamImageSource = "tottenham1.png",
                                              AwayTeamImageSource = "newcastle2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              League = eplLeague,
                                              HomeTeamId = chelsea.Id,
                                              AwayTeamId = spurs.Id,
                                              Venue = chelsea.HomeGround,
                                              KickOff = day5,
                                              HomeTeamImageSource = "chelsea1.png",
                                              AwayTeamImageSource = "tottenham2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              League = eplLeague,
                                              HomeTeamId = arsenal.Id,
                                              AwayTeamId = manunited.Id,
                                              Venue = arsenal.HomeGround,
                                              KickOff = day6.AddHours(3),
                                              HomeTeamImageSource = "arsenal1.png",
                                              AwayTeamImageSource = "manu2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              League = eplLeague,
                                              HomeTeamId = liverpool.Id,
                                              AwayTeamId = mancity.Id,
                                              Venue = liverpool.HomeGround,
                                              KickOff = day6.AddHours(6),
                                              HomeTeamImageSource = "liverpool1.png",
                                              AwayTeamImageSource = "mancity2.png",
                                              CanPredict = true
                                          },
                                      new Fixture
                                          {
                                              Season = eplSeason,
                                              League = eplLeague,
                                              HomeTeamId = newcastle.Id,
                                              AwayTeamId = everton.Id,
                                              Venue = newcastle.HomeGround,
                                              KickOff = day6.AddHours(6),
                                              HomeTeamImageSource = "newcastle1.png",
                                              AwayTeamImageSource = "everton2.png",
                                              CanPredict = true
                                          }
                                  };
            context.Fixtures.AddOrUpdate(p => new {p.SeasonId, p.HomeTeamId, p.AwayTeamId}, eplFixtures);
        }
        #endregion

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

            if (membership.GetUser("test5", false) == null)
            {
                membership.CreateUserAndAccount("test5", "123456");
            }

            if (!roles.GetRolesForUser("test5").Contains("Admin"))
            {
                roles.AddUsersToRoles(new[] { "test5" }, new[] { "Admin" });
            }
        }
    }
}
    

