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

        [JsonIgnore] 
        [IgnoreDataMember] 
        public ICollection<Season> Seasons { get; set; }
    }
}
