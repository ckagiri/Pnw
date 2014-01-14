using Pnw.Model;

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
        }

        private League[] AddLeagues(PnwDbContext context)
        {
            var leagues = new[]
                              {
                                  new League
                                      {
                                          Id = Guid.NewGuid(),
                                          Name = "English Premier League",
                                          Code = "EPL"
                                      },
                                  new League
                                      {
                                          Id = Guid.NewGuid(),
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
                                             Id = Guid.NewGuid(),
                                             LeagueId = leagues.First(l => l.Code == "EPL").Id,
                                             StartDate = now.AddDays(-14),
                                             EndDate = now.AddDays(91),
                                             Name = "2013 - 2014",
                                         },
                                     new Season
                                         {
                                             Id = Guid.NewGuid(),
                                             LeagueId = leagues.First(l => l.Code == "EPL").Id,
                                             StartDate = now.AddMonths(-24),
                                             EndDate = now.AddDays(-12),
                                             Name = "2012 - 2013",
                                         }
                                 };
            var kplSeasons = new[]
                                 {
                                     new Season
                                         {
                                             Id = Guid.NewGuid(),
                                             LeagueId = leagues.First(l => l.Code == "KPL").Id,
                                             StartDate = now.AddDays(-14),
                                             EndDate = now.AddDays(21),
                                             Name = "2013 - 2014",
                                         }
                                 };

            var seasons = eplSeasons.Concat(kplSeasons).ToArray();
            context.Seasons.AddOrUpdate(p => new { p.LeagueId, p.Name }, seasons);

            return seasons;
        }

        private Team[] AddTeams(PnwDbContext context)
        {
            var kplTeams = new[]
                               {
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Gor Mahia",
                                           Code = "GOR",
                                           HomeGround = "City Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "AFC Leopards",
                                           Code = "AFC",
                                           HomeGround = "Chui Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Tusker",
                                           Code = "TUSK",
                                           HomeGround = "The Breweries",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Sofapaka",
                                           Code = "SOFP",
                                           HomeGround = "Sofapaka Stadium",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Ulinzi Stars",
                                           Code = "ULNZ",
                                           HomeGround = "Ulinzi Grounds",
                                           Tags = "TPL|Tusker Premier League|Kenya|East Africa"
                                       }
                               };

            var eplTeams = new[]
                               {
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Manchester United",
                                           Code = "MANU",
                                           HomeGround = "Old Trafford",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Manchester City",
                                           Code = "MANC",
                                           HomeGround = "Etihad",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Chelsea",
                                           Code = "CHE",
                                           HomeGround = "Stamford Bridge",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Arsenal",
                                           Code = "ASNL",
                                           HomeGround = "Emirates",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Tottenham Hotspur",
                                           Code = "TOTT",
                                           HomeGround = "White Hart Lane",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Everton",
                                           Code = "EVE",
                                           HomeGround = "Goodison Park",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Liverpool",
                                           Code = "LIV",
                                           HomeGround = "Anfield",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "West Bromwich Albion",
                                           Code = "WBA",
                                           HomeGround = "The Hawthorns",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Swansea",
                                           Code = "SWA",
                                           HomeGround = "Liberty Stadium",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "West Ham United",
                                           Code = "WHU",
                                           HomeGround = "Boleyn Ground",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Norwich City",
                                           Code = "NOR",
                                           HomeGround = "Carrow Road",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Fulham",
                                           Code = "FUL",
                                           HomeGround = "Craven Cottage",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Stoke City",
                                           Code = "STO",
                                           HomeGround = "Britannia Stadium",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Southampton",
                                           Code = "SOU",
                                           HomeGround = "St. Marys",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Aston Villa",
                                           Code = "AVIL",
                                           HomeGround = "Villa Park",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Newcastle United",
                                           Code = "NUTD",
                                           HomeGround = "St. James' park",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Sunderland",
                                           Code = "SUN",
                                           HomeGround = "Stadium Of Light",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Hull City",
                                           Code = "HUC",
                                           HomeGround = "KC Stadium",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Cardiff City",
                                           Code = "CAC",
                                           HomeGround = "Cardiff City Stadium",
                                           Tags = "EPL|England|UK"
                                       },
                                   new Team
                                       {
                                           Id = Guid.NewGuid(),
                                           Name = "Crystal Palace",
                                           Code = "CRP",
                                           HomeGround = "Selhurst Park",
                                           Tags = "EPL|England|UK"
                                       },
                               };

            var teams = kplTeams.Concat(eplTeams).ToArray();
            context.Teams.AddOrUpdate(p => p.Code, teams);

            return teams;
        }

        private void AddTeamsToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var epl = leagues.First(l => l.Code == "EPL").Id;
            var kpl = leagues.First(l => l.Code == "KPL").Id;
            var eplSeason = seasons.First(s => s.LeagueId == epl && s.Name == "2013 - 2014");
            var kplSeason = seasons.First(s => s.LeagueId == kpl && s.Name == "2013 - 2014");

            var teamsKpl = teams.Take(5).ToList();
            var teamsEpl = teams.Skip(5).ToList();

            teamsEpl.ForEach(t => eplSeason.ParticipationList.Add(
                new Participation { SeasonId = eplSeason.Id, TeamId = t.Id }));
            teamsEpl.ForEach(t => kplSeason.ParticipationList.Add(
                new Participation { SeasonId = kplSeason.Id, TeamId = t.Id }));

            var participations = eplSeason.ParticipationList.Concat(kplSeason.ParticipationList).ToArray();

            context.Participations.AddOrUpdate(p =>new { p.SeasonId, p.TeamId },  participations);
        }

        private void AddFixturesToSeason(PnwDbContext context, League[] leagues, Season[] seasons, Team[] teams)
        {
            var now = DateTime.Now;
            var epl = leagues.First(l => l.Code == "EPL").Id;
            var eplSeason = seasons.First(s => s.LeagueId == epl && s.Name == "2013 - 2014");
            var eplTeams = teams.Skip(5).ToList();
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
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[0].Id,
                                              AwayTeamId = eplTeams[11].Id,
                                              Venue = eplTeams[0].HomeGround,
                                              KickOff = day1,
                                              HomeScore = 2,
                                              AwayScore = 2,
                                              MatchStatus = MatchStatus.Played,
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[4].Id,
                                              AwayTeamId = eplTeams[16].Id,
                                              Venue = eplTeams[4].HomeGround,
                                              KickOff = day2,
                                              HomeScore = 2,
                                              AwayScore = 3,
                                              MatchStatus = MatchStatus.Played,
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[3].Id,
                                              AwayTeamId = eplTeams[10].Id,
                                              Venue = eplTeams[3].HomeGround,
                                              KickOff = day3,
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[2].Id,
                                              AwayTeamId = eplTeams[14].Id,
                                              Venue = eplTeams[2].HomeGround,
                                              KickOff = day4,
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[4].Id,
                                              AwayTeamId = eplTeams[1].Id,
                                              Venue = eplTeams[4].HomeGround,
                                              KickOff = day5,
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[2].Id,
                                              AwayTeamId = eplTeams[9].Id,
                                              Venue = eplTeams[2].HomeGround,
                                              KickOff = day6.AddHours(3),
                                          },
                                      new Fixture
                                          {
                                              Id = Guid.NewGuid(),
                                              SeasonId = eplSeason.Id,
                                              HomeTeamId = eplTeams[1].Id,
                                              AwayTeamId = eplTeams[13].Id,
                                              Venue = eplTeams[1].HomeGround,
                                              KickOff = day6.AddHours(6),
                                          }
                                  };
            context.Fixtures.AddOrUpdate(p => new { p.SeasonId, p.HomeTeamId, p.AwayTeamId }, eplFixtures);
        }
    }
}
