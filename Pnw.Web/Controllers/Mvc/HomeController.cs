using System;
using System.Diagnostics;
using System.Linq;
using System.Web.Mvc;
using Pnw.DataAccess;
using Pnw.Model;
using Pnw.Web.Filters;
using Pnw.Web.Models;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.Web.Controllers.Mvc
{
    [InitializeSimpleMembership]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var bootstrapVm = new BootstrapVm();

            User user = null;
            League defaultLeague = null;
            Season defaultSeason = null;
            var membership = (SimpleMembershipProvider)Membership.Provider;
            var membershipUser = membership.GetUser(User.Identity.Name, true);
            if (membershipUser == null || membershipUser.ProviderUserKey == null)
            {
                // do nothing
            }
            else
            {
                using (var ctx = new PnwDbContext())
                {
                    int userId;
                    int.TryParse(membershipUser.ProviderUserKey.ToString(), out userId);
                    user = ctx.Users.FirstOrDefault(n => n.Id == userId);
                }
            }

            try
            {
                using (var ctx = new PnwDbContext())
                {
                    defaultLeague = ctx.Leagues.FirstOrDefault(n => n.Code == "EPL");
                    defaultSeason = ctx.Seasons.FirstOrDefault(n => n.LeagueId == defaultLeague.Id);
                }
            }
            catch (Exception)
            {
                Debug.WriteLine("Error bootstrapping data");
            }

            if (user == null) { user = new User(); }
            if (defaultLeague == null) { defaultLeague = new League(); }
            if (defaultSeason == null) { defaultSeason = new Season(); }

            bootstrapVm.User = user;
            bootstrapVm.DefaultLeague = defaultLeague;
            bootstrapVm.DefaultSeason = defaultSeason;

            return View("Index", bootstrapVm);
        }

        public ActionResult About()
        {
            return View();
        }

        public ActionResult Contact()
        {
            return View();
        }
    }
}
