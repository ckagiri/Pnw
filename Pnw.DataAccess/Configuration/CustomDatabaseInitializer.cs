using System.Data.Entity;
using System.Web.Security;
using WebMatrix.WebData;
using System.Linq;

namespace Pnw.DataAccess.Configuration
{
    public class CustomDatabaseInitializer 
    {
        private void SeedMembership()
        {
            WebSecurity.InitializeDatabaseConnection(
                                    "EpicTentsDEMO",
                                    "Users",
                                    "Id",
                                    "Username",
                                    autoCreateTables: true);

            var roles = (SimpleRoleProvider)Roles.Provider;
            var membership = (SimpleMembershipProvider)Membership.Provider;

            if (!roles.RoleExists("Admin")) { roles.CreateRole("Admin"); }

            if (!roles.RoleExists("Manager")) { roles.CreateRole("Manager"); }

            if (!roles.RoleExists("User")) { roles.CreateRole("User"); }

            if (membership.GetUser("test1", false) == null)
            {
                membership.CreateUserAndAccount("test1", "123456");
            }
            if (!roles.GetRolesForUser("test1").Contains("Admin"))
            {
                roles.AddUsersToRoles(new[] { "test1" }, new[] { "Admin" });
            }

            if (membership.GetUser("test2", false) == null)
            {
                membership.CreateUserAndAccount("test2", "123456");
            }
            if (!roles.GetRolesForUser("test2").Contains("Manager"))
            {
                roles.AddUsersToRoles(new[] { "test2" }, new[] { "Manager" });
            } 

            if (membership.GetUser("test3", false) == null)
            {
                membership.CreateUserAndAccount("test3", "123456");
            }
            if (!roles.GetRolesForUser("test3").Contains("User"))
            {
                roles.AddUsersToRoles(new[] { "test3" }, new[] { "User" });
            }
        }
    }
}
