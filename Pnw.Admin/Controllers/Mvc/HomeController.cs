using System;
using System.Linq;
using System.Web.Mvc;
using Pnw.Admin.Filters;
using Pnw.Admin.Models;
using Pnw.DataAccess;
using Pnw.Model;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.Admin.Controllers.Mvc
{
    [InitializeSimpleMembership]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var bootstrapVm = new BootstrapVm();

            User user;
            League defaultLeague;
            Season defaultSeason;
            var membership = (SimpleMembershipProvider)Membership.Provider;
            var membershipUser = membership.GetUser(User.Identity.Name, true);
            if(membershipUser == null || membershipUser.ProviderUserKey == null)
            {
                user = null;
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
                defaultLeague = null;
                defaultSeason = null;
            }
            
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
