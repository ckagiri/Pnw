using System;

namespace Pnw.Model
{
    public class Participation
    {
        public Guid TeamId { get; set; }
        public Team Team { get; set; }
        public Guid SeasonId { get; set; }
        public Season Season { get; set; }
        public int Position { get; set; }
        public int Points { get; set; }
    }
}
