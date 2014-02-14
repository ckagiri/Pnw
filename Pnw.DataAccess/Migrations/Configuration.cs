using System.Web.Security;
using Pnw.Model;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.DataAccess.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    public sealed class Configuration : DbMigrationsConfiguration<Pnw.DataAccess.PnwDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
            AutomaticMigrationDataLossAllowed = true;
        }

        protected override void Seed(PnwDbContext context)
        {
            var leagues = AddLeagues(context);
            var seasons = AddSeasons(context, leagues);
            var teams = AddTeams(context);


            AddTeamsToSeason(context, leagues, seasons, teams);
            SeedMembership(context);
        }

        private League[] AddLeagues(PnwDbContext context)
        {
            var leagues = new[]
                              {
                                  new League
                                      {
                                          Id = 1,
                                          Name = "World Cup",
                                          Code = "WC",
                                          Region = Region.World,
                                          IsTournament = true,
                                          ParticipantType = ParticipantType.Country
                                      },
                                  new League
                                      {
                                          Id = 2,
                                          Name = "English Premier League",
                                          Code = "EPL",
                                          Region = Region.Europe
                                      },
                                  new League
                                      {
                                          Id = 3,
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
                                             Id = 1,
                                             LeagueId = leagues.First(l => l.Code == "EPL").Id,
                                             StartDate = new DateTime(2013, 8, 17),
                                             EndDate = new DateTime(2014, 5, 11),
                                             Name = "2013 - 2014",
                                             IsReady = true
                                         },
                                     new Season
                                         {
                                             Id = 2,
                                             LeagueId = leagues.First(l => l.Code == "EPL").Id,
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
                                             Id = 3,
                                             LeagueId = leagues.First(l => l.Code == "KPL").Id,
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
                                                 Id = 4,
                                                 LeagueId =leagues.First(l => l.Code == "WC").Id,
                                                 StartDate = new DateTime(2014, 6, 12),
                                                 EndDate = new DateTime(2014, 7, 13),
                                                 Name = "2014",
                                                 IsReady = true
                                             }
                                     };

            var seasons = eplSeasons.Concat(kplSeasons).Concat(worldcupSeason).ToArray();
            context.Seasons.AddOrUpdate(p => new { p.LeagueId, p.Name }, seasons);
            return seasons;
        }

        private Team[] AddTeams(PnwDbContext context)
        {
            #region world-cup
            var wcTeams = new[] 
            { 
                // afc
                new Team
                {
                    Id = 1,
                    Name = "Australia",
                    Code = "AUS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 2,
                    Name = "Iran",
                    Code = "IRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 3,
                    Name = "Japan",
                    Code = "JAP",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 4,
                    Name = "South Korea",
                    Code = "SKO",
                    Type = ClubOrCountry.Country
                },
                //concacaf
                new Team
                {
                    Id = 5,
                    Name = "Costa Rica",
                    Code = "COS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 6,
                    Name = "Honduras",
                    Code = "HON",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 7,
                    Name = "Mexico",
                    Code = "MEX",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 8,
                    Name = "United States",
                    Code = "USA",
                    Type = ClubOrCountry.Country
                },
                //caf
                new Team
                {
                    Id = 9,
                    Name = "Algeria",
                    Code = "ALG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 10,
                    Name = "Cameroon",
                    Code = "CAM",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 11,
                    Name = "Ghana",
                    Code = "GHA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 12,
                    Name = "Ivory Coast",
                    Code = "IVO",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 13,
                    Name = "Nigeria",
                    Code = "NIG",
                    Type = ClubOrCountry.Country
                },
                //conmebol
                new Team
                {
                    Id = 14,
                    Name = "Argentina",
                    Code = "ARG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 15,
                    Name = "Brazil",
                    Code = "BRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 16,
                    Name = "Chile",
                    Code = "CHL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 17,
                    Name = "Colombia",
                    Code = "COL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 18,
                    Name = "Ecuador",
                    Code = "ECU",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 19,
                    Name = "Uruguay",
                    Code = "URU",
                    Type = ClubOrCountry.Country
                },
                //uefa
                new Team
                {
                    Id = 20,
                    Name = "Belgium",
                    Code = "BEL",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 21,
                    Name = "Bosnia and Herzegovina",
                    Code = "BOS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 22,
                    Name = "Croatia",
                    Code = "CRO",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 23,
                    Name = "England",
                    Code = "ENG",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 24,
                    Name = "France",
                    Code = "FRA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 25,
                    Name = "Germany",
                    Code = "GER",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 26,
                    Name = "Greece",
                    Code = "GRE",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 27,
                    Name = "Italy",
                    Code = "ITA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 28,
                    Name = "Netherlands",
                    Code = "NET",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 29,
                    Name = "Portugal",
                    Code = "POR",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 30,
                    Name = "Russia",
                    Code = "RUS",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 31,
                    Name = "Spain",
                    Code = "SPA",
                    Type = ClubOrCountry.Country
                },
                new Team
                {
                    Id = 32,
                    Name = "Switzerland",
                    Code = "SWI",
                    Type = ClubOrCountry.Country
                },
            };
            #endregion

            # region kpl
            var kplTeams = new[]
                               {
                                   new Team
                                       {
                                           Id = 33,
                                           Name = "Gor Mahia",
                                           Code = "GOR",
                                           HomeGround = "Gor Mahia",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Id = 34,
                                           Name = "AFC Leopards",
                                           Code = "AFC",
                                           HomeGround = "AFC Leopards",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Id = 35,
                                           Name = "Tusker",
                                           Code = "TUS",
                                           HomeGround = "Tusker",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Id = 36,
                                           Name = "Sofapaka",
                                           Code = "SOF",
                                           HomeGround = "Sofapaka",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                   new Team
                                       {
                                           Id = 37,
                                           Name = "Ulinzi Stars",
                                           Code = "ULI",
                                           HomeGround = "Ulinzi Stars",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 38,
                                           Name = "Western Stima",
                                           Code = "WES",
                                           HomeGround = "Western Stima",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 39,
                                           Name = "Mathare United",
                                           Code = "MAT",
                                           HomeGround = "Mathare United",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 40,
                                           Name = "Muhoroni Youth",
                                           Code = "MUH",
                                           HomeGround = "Muhoroni Youth",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 41,
                                           Name = "Sony Sugar",
                                           Code = "SON",
                                           HomeGround = "Sony Sugar",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 42,
                                           Name = "Top Fry Nakuru",
                                           Code = "TOP",
                                           HomeGround = "Top Fry Nakuru",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 43,
                                           Name = "Thika United",
                                           Code = "THI",
                                           HomeGround = "Thika United",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 44,
                                           Name = "Chemelil Sugar",
                                           Code = "CHE",
                                           HomeGround = "Chemelil Sugar",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 45,
                                           Name = "Bandari",
                                           Code = "BAN",
                                           HomeGround = "Bandari",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 46,
                                           Name = "KRA",
                                           Code = "KRA",
                                           HomeGround = "KRA",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 47,
                                           Name = "KCB",
                                           Code = "KCB",
                                           HomeGround = "KCB",
                                           Tags = "KPL|Tusker Premier League|Kenya|East Africa",
                                           ImageSource = "kenya_premier_league.png"
                                       },
                                       new Team
                                       {
                                           Id = 48,
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
                                           Id = 49,
                                           Name = "Manchester United",
                                           Code = "MANU",
                                           HomeGround = "Old Trafford",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "manchester_united.png"
                                       },
                                   new Team
                                       {
                                           Id = 50,
                                           Name = "Manchester City",
                                           Code = "MANC",
                                           HomeGround = "Etihad",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "manchester_city.png"

                                       },
                                   new Team
                                       {
                                           Id = 51,
                                           Name = "Chelsea",
                                           Code = "CHE",
                                           HomeGround = "Stamford Bridge",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "chelsea.png"
                                       },
                                   new Team
                                       {
                                           Id = 52,
                                           Name = "Arsenal",
                                           Code = "ARS",
                                           HomeGround = "Emirates",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "arsenal.png"
                                       },
                                   new Team
                                       {
                                           Id = 53,
                                           Name = "Tottenham Hotspur",
                                           Code = "TOTT",
                                           HomeGround = "White Hart Lane",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "tottenham.png"
                                       },
                                   new Team
                                       {
                                           Id = 54,
                                           Name = "Everton",
                                           Code = "EVE",
                                           HomeGround = "Goodison Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "everton.png"
                                       },
                                   new Team
                                       {
                                           Id = 55,
                                           Name = "Liverpool",
                                           Code = "LIV",
                                           HomeGround = "Anfield",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "liverpool.png"
                                       },
                                   new Team
                                       {
                                           Id = 56,
                                           Name = "West Bromwich Albion",
                                           Code = "WBA",
                                           HomeGround = "The Hawthorns",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "west_brom.png"
                                       },
                                   new Team
                                       {
                                           Id = 57,
                                           Name = "Swansea City",
                                           Code = "SWA",
                                           HomeGround = "Liberty Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "swansea_city.png"
                                       },
                                   new Team
                                       {
                                           Id = 58,
                                           Name = "West Ham United",
                                           Code = "WHU",
                                           HomeGround = "Boleyn Ground",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "west_ham_united.png"
                                       },
                                   new Team
                                       {
                                           Id = 59,
                                           Name = "Norwich City",
                                           Code = "NOR",
                                           HomeGround = "Carrow Road",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "norwich_city.png"
                                       },
                                   new Team
                                       {
                                           Id = 60,
                                           Name = "Fulham",
                                           Code = "FUL",
                                           HomeGround = "Craven Cottage",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "fulham.png"
                                       },
                                   new Team
                                       {
                                           Id = 61,
                                           Name = "Stoke City",
                                           Code = "STO",
                                           HomeGround = "Britannia Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "stoke_city.png"
                                       },
                                   new Team
                                       {
                                           Id = 62,
                                           Name = "Southampton",
                                           Code = "SOU",
                                           HomeGround = "St. Marys",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "southampton.png"
                                       },
                                   new Team
                                       {
                                           Id = 63,
                                           Name = "Aston Villa",
                                           Code = "AVIL",
                                           HomeGround = "Villa Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "aston_villa.png"
                                       },
                                   new Team
                                       {
                                           Id = 64,
                                           Name = "Newcastle United",
                                           Code = "NUTD",
                                           HomeGround = "St. James' park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "newcastle_united.png"
                                       },
                                   new Team
                                       {
                                           Id = 65,
                                           Name = "Sunderland",
                                           Code = "SUN",
                                           HomeGround = "Stadium Of Light",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "sunderland.png"
                                       },
                                   new Team
                                       {
                                           Id = 66,
                                           Name = "Hull City",
                                           Code = "HUC",
                                           HomeGround = "KC Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "hull_city.png"
                                       },
                                   new Team
                                       {
                                           Id = 67,
                                           Name = "Cardiff City",
                                           Code = "CAC",
                                           HomeGround = "Cardiff City Stadium",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "cardiff_city.png"
                                       },
                                   new Team
                                       {
                                           Id = 68,
                                           Name = "Crystal Palace",
                                           Code = "CRP",
                                           HomeGround = "Selhurst Park",
                                           Tags = "EPL|England|UK",
                                           ImageSource = "crystal_palace.png"
                                       }
                               };
            # endregion


            var teams = kplTeams.Concat(eplTeams).Concat(wcTeams).ToArray();
            context.Teams.AddOrUpdate(p => p.Name, teams);

            return teams;
        }

        private void AddTeamsToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var epl = leagues.First(l => l.Code == "EPL");
            var kpl = leagues.First(l => l.Code == "KPL");
            var wc = leagues.First(l => l.Code == "WC");
            var eplSeason = seasons.First(s => s.LeagueId == epl.Id && s.Name == "2013 - 2014");
            var kplSeason = seasons.First(s => s.LeagueId == kpl.Id && s.Name == "2013 - 2014");
            var wcSeason = seasons.First(s => s.LeagueId == wc.Id && s.Name == "2014");

            var teamsKpl = teams.Take(16).ToList();
            var teamsEpl = teams.Skip(16).Take(20).ToList();
            var teamsWc = teams.Skip(36).ToList();

            teamsKpl.ForEach(t => kplSeason.ParticipationList.Add(
                new Participation { SeasonId = kplSeason.Id, TeamId = t.Id }));
            teamsEpl.ForEach(t => eplSeason.ParticipationList.Add(
                new Participation { SeasonId = eplSeason.Id, TeamId = t.Id }));
            teamsWc.ForEach(t => wcSeason.ParticipationList.Add(
                new Participation { SeasonId = wcSeason.Id, TeamId = t.Id }));

            var participations = eplSeason.ParticipationList
                .Concat(kplSeason.ParticipationList)
                .Concat(wcSeason.ParticipationList).ToArray();

            context.Participations.AddOrUpdate(p => new { p.SeasonId, p.TeamId }, participations);
        }

        private void SeedMembership(PnwDbContext context)
        {
            if (!WebSecurity.Initialized)
            {
                WebSecurity.InitializeDatabaseConnection(
                    "PnwDEMO",
                    "User",
                    "Id",
                    "Username",
                    autoCreateTables: true);
            }

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
