using System;

namespace Pnw.DataAccess
{
    public class LeaderboardFilter
    {
        public int? LeagueId { get; set; }
        public int? SeasonId { get; set; }
        public int? Month { get; set; }
        public int? RoundId { get; set; }
    }
}