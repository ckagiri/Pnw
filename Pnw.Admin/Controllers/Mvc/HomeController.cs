﻿using System;
using System.Linq;
using System.Web.Mvc;
using System.Web.Security;
using Pnw.Admin.Filters;
using Pnw.Admin.Models;
using Pnw.DataAccess;
using Pnw.Model;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.Admin.Controllers.Mvc
{
    public class HomeController : Controller
    {
        private readonly Func<int> _getUserId;
        private bool? _authenticated;

        public HomeController() : this(() => WebSecurity.CurrentUserId)
        { }

        public HomeController(Func<int> getUserId)
        {
            _getUserId = getUserId;
        }

        public bool IsAuthenticated
        {
            get
            {
                if (_authenticated == null)
                {
                    _authenticated = Request.IsAuthenticated;
                }

                return _authenticated.GetValueOrDefault();
            }

            set
            {
                _authenticated = value;
            }
        }

        public ActionResult Index()
        {
            var bootstrapVm = new BootstrapVm();

            User user = null;
            League defaultLeague = null;
            Season defaultSeason = null;
            var membership = (SimpleMembershipProvider)Membership.Provider;
            var membershipUser = membership.GetUser(User.Identity.Name, true);
            if(membershipUser == null || membershipUser.ProviderUserKey == null)
            {
                // do nothin
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

            if (defaultLeague == null) { defaultLeague = new League(); }
            if (defaultSeason == null) { defaultSeason = new Season(); }

            bootstrapVm.DefaultLeague = defaultLeague;
            bootstrapVm.DefaultSeason = defaultSeason;
            bootstrapVm.CurrentDate = DateTime.Now;
            bootstrapVm.User = user;
            
            return View("Index", bootstrapVm);
        }
    }
}
