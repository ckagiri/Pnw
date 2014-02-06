using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Pnw.Model
{
    public class Season
    {
        public Season()
        {
            ParticipationList = new Collection<Participation>();
        }
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int LeagueId { get; set; }

        [JsonIgnore]
        [IgnoreDataMember] 
        public League League { get; set; }

        [JsonIgnore]
        [IgnoreDataMember] 
        public ICollection<Participation> ParticipationList { get; set; }
    }
}
