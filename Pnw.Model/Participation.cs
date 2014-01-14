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
        public int Played { get; set; }
        public int Won { get; set; }
        public int Drawn { get; set; }
        public int Lost { get; set; }
        public int Points { get; set; }
    }
}
