using System;

namespace Pnw.Model
{
    public class Prediction
    {
        public Guid Id { get; set; }
        public int UserId { get; set; }
        public int SeasonId { get; set; }
        public int FixtureId { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public int Points { get; set; }
        public int CorrectScorePoints { get; set; }
        public int CorrectResultPoints { get; set; }
        public int CrossProductPoints { get; set; }
        public bool IsProcessed { get; set; }
        public int FixtureYear { get; set; }
        public int FixtureMonth { get; set; }
        public bool FixturePlayed { get; set; }
        public DateTime TimeStamp { get; set; }
    }
}
