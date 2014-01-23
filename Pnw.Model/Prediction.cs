using System;

namespace Pnw.Model
{
    public class Prediction : IAuditInfo
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public int SeasonId { get; set; }
        public int FixtureId { get; set; }
        public int HomeGoals { get; set; }
        public int AwayGoals { get; set; }
        public int Points { get; set; }
        public int SpreadDifference { get; set; }
        public int AccuracyDifference { get; set; }
        public int CorrectScorePoints { get; set; }
        public int CorrectResultPoints { get; set; }
        public int CrossProductPoints { get; set; }
        public bool IsProcessed { get; set; }
        public DateTime FixtureDate { get; set; }
        public bool IsFixturePlayed { get; set; }
        public Fixture Fixture { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime ModifiedOn { get; set; }
    }
}
