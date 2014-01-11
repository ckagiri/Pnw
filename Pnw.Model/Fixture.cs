using System;
using System.ComponentModel.DataAnnotations;

namespace Pnw.Model
{
    public class Fixture
    {
        public Guid Id { get; set; }
        public Guid SeasonId { get; set; }
        public Guid HomeTeamId { get; set; }
        public Guid AwayTeamId { get; set; }
        public DateTime KickOff { get; set; }
        public string Venue { get; set; }
        public MatchStatus MatchStatus { get; set; }
        [Range(0, 15)]
        public int HomeScore { get; set; }
        [Range(0, 15)]
        public int AwayScore { get; set; }
        public bool CanPredict { get; set; }
        public virtual Team HomeTeam { get; set; }
        public virtual Team AwayTeam { get; set; }
    }

    public enum MatchStatus
    {
        Scheduled,
        InProgress,
        Played,
        Cancelled,
        Abandoned,
        PostPoned
    }
}
