using System;

namespace Pnw.Model
{
    public class Participation
    {
        public int TeamId { get; set; }
        public int SeasonId { get; set; }
        public int Position { get; set; }
        public int Played { get; set; }
        public int Won { get; set; }
        public int Drawn { get; set; }
        public int Lost { get; set; }
        public int Points { get; set; }
        public Team Team { get; set; }
        public Season Season { get; set; }
    }
}
