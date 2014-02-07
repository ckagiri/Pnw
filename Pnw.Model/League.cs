using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Pnw.Model
{
    public class League
    {
        public League()
        {
            Seasons = new Collection<Season>();
        }
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsTournament { get; set; }
        public Region Region { get; set; }
        public ParticipantType ParticipantType { get; set; }

        [JsonIgnore] 
        [IgnoreDataMember] 
        public ICollection<Season> Seasons { get; set; }
    }

    public enum Region
    {
        None,
        World,
        Europe,
        Africa,
        SouthAmerica,
        Asia,
        Australia,
    }

    public enum ParticipantType
    {
        Club,
        Country,
        ClubOrCountry
    }
}
