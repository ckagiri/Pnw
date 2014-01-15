using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Pnw.Model
{
    public class Team
    {
        public Team()
        {
            Fixtures = new Collection<Fixture>();
            ParticipationList = new Collection<Participation>();
        }
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required, MaxLength(4)]
        public string Code { get; set; }
        public string HomeGround { get; set; }
        public string Tags { get; set; }
        public ICollection<Fixture> Fixtures { get; set; }
        public ICollection<Participation> ParticipationList { get; set; }
        public string ImageSource { get; set; }
    }
}
