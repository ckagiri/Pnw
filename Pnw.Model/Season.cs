using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Pnw.Model
{
    public class Season
    {
        public Season()
        {
            ParticipationList = new Collection<Participation>();
        }
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid LeagueId { get; set; }
        public League League { get; set; }
        public ICollection<Participation> ParticipationList { get; set; }
    }
}
