using System.ComponentModel.DataAnnotations;

namespace Pnw.Web.Models
{
    public class ForgotPassword
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }
    }
}