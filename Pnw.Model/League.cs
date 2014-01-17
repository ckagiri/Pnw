using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

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
        public ICollection<Season> Seasons { get; set; }
    }
}
