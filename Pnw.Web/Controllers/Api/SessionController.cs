using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pnw.DataAccess;
using Pnw.Model;
using Pnw.Web.Models;
using WebMatrix.WebData;

namespace Pnw.Web.Controllers.Api
{
    public class SessionController : ApiController
    {
        private readonly Func<string, string, bool, bool> _signIn;
        private readonly Action _signOut;

        public SessionController() :
            this(WebSecurity.Login, WebSecurity.Logout)
        {
        }

        public SessionController(
            Func<string, string, bool, bool> signIn,
            Action signOut)
        {
            _signIn = signIn;
            _signOut = signOut;
        }

        public HttpResponseMessage Login(CreateSession model)
        {
            HttpResponseMessage response;
            User user;

            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest, ModelState);
            }

            var userName = model.Username.ToLowerInvariant();
            var success = _signIn(
                userName,
                model.Password,
                model.RememberMe.GetValueOrDefault());

            if (!success)
            {
                response = Request.CreateResponse(HttpStatusCode.Created, new {success = false});
                return response;
            }

            using (var ctx = new PnwDbContext())
            {
                user = ctx.Users.FirstOrDefault(n => n.Username == userName);
                if(user != null)
                {
                    user.Roles = ctx.Users.Where(n => n.Id == user.Id).SelectMany(n => n.Roles).ToArray();
                }
            }
            response = Request.CreateResponse(HttpStatusCode.Created, new {user = user, success = true});
            return response;
        }

        [Authorize]
        public HttpResponseMessage Logout()
        {
            _signOut();
            return Request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}