using System.ComponentModel.DataAnnotations;

namespace Pnw.Admin.Models
{
    public class CreateSession
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool? RememberMe { get; set; }
    }
}