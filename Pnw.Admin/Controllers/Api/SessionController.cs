using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pnw.Admin.Models;
using WebMatrix.WebData;

namespace Pnw.Admin.Controllers.Api
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

        public HttpResponseMessage Post(CreateSession model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest, ModelState);
            }

            var success = _signIn(
                model.Email.ToLowerInvariant(),
                model.Password,
                model.RememberMe.GetValueOrDefault());

            return Request.CreateResponse(success ?
                HttpStatusCode.NoContent :
                HttpStatusCode.BadRequest);
        }

        [Authorize]
        public HttpResponseMessage Delete()
        {
            _signOut();
            return Request.CreateResponse(HttpStatusCode.NoContent);
        }
    }
}