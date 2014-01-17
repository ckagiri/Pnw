using System.Collections.Generic;

namespace Pnw.Model
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }

        public ICollection<Role> Roles { get; set; }

        public User() {
            Roles = new List<Role>();
        }
    }
}
