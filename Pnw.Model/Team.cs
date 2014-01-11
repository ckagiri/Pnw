using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Pnw.Model
{
    public class Team
    {
        public Team()
        {
            Fixtures = new Collection<Fixture>();
        }
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string HomeGround { get; set; }
        public string Tags { get; set; }
        public virtual ICollection<Fixture> Fixtures { get; set; }
    }
}
