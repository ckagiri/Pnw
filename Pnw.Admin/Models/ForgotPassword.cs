﻿using System.ComponentModel.DataAnnotations;

namespace Pnw.Admin.Models
{
    public class ForgotPassword
    {
        [Required]
        public string Email { get; set; }
    }
}