using System;
using System.ComponentModel.DataAnnotations;

namespace Pnw.Model
{
    public class Round
    {
        public int Id { get; set; }
        public int SeasonId { get; set; }
        public int LeagueId { get; set; }
        [Required]
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }   
    }
}
