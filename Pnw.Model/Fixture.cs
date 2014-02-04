using System;
using System.ComponentModel.DataAnnotations;

namespace Pnw.Model
{
    public class Fixture : IAuditInfo
    {
        public int Id { get; set; }
        public int SeasonId { get; set; }
        public int LeagueId { get; set; }
        [DifferentFrom("AwayTeamId")]
        public int HomeTeamId { get; set; }
        public int AwayTeamId { get; set; }
        [Required]
        public DateTime KickOff { get; set; }
        public string Venue { get; set; }
        public MatchStatus MatchStatus { get; set; }
        [Range(0, 15)]
        public int HomeScore { get; set; }
        [Range(0, 15)]
        public int AwayScore { get; set; }
        public bool CanPredict { get; set; }
        public string HomeTeamImageSource { get; set; }
        public string AwayTeamImageSource { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
        public League League { get; set; }
        public Season Season { get; set; }
        public Team HomeTeam { get; set; }
        public Team AwayTeam { get; set; }
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
