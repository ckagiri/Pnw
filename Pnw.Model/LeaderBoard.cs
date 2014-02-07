namespace Pnw.Model
{
    public class LeaderBoard
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int LeagueId { get; set; }
        public int SeasonId { get; set; }
        public int Points { get; set; }
        public int CorrectScorePoints { get; set; }
        public int CorrectResultPoints { get; set; }
        public int CrossProductPoints { get; set; }
        public int SpreadDifference { get; set; }
        public int AccuracyDifference { get; set; }
        // lastpred
        public int LastBetTimestamp { get; set; }
    }
}
