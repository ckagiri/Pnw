using System.Diagnostics;
using System.Linq;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Security;
using Pnw.DataAccess;
using Pnw.Model;
using Pnw.Web.Models;
using Pnw.Web.Utils;
using WebMatrix.WebData;
using Membership = System.Web.Security.Membership;

namespace Pnw.Web.Controllers.Api
{
    public class UserController : ApiController
    {
        private readonly Func<string, string, string, bool, string> _signup;
        private readonly Func<string, string, bool, bool> _signIn;
        private readonly IMailer _mailer;
        private readonly Func<int> _getUserId;

        private bool? _debuggingEnabled;

        public UserController()
            : this(
                (userName, password, email, requireConfirmation) =>
                    WebSecurity.CreateUserAndAccount(
                    userName,
                    password,
                    new { Email = email },
                    requireConfirmation),
            WebSecurity.Login,
            new Mailer(), 
            () => WebSecurity.CurrentUserId)
        {
        }

        public UserController(
            Func<string, string, string, bool, string> signup,
            Func<string, string, bool, bool> signIn,
            IMailer mailer, 
            Func<int> getUserId)
        {
            _signup = signup;
            _signIn = signIn;
            _mailer = mailer;
            _getUserId = getUserId;
        }

        public bool IsDebuggingEnabled
        {
            get
            {
                if (_debuggingEnabled == null)
                {
                    object context;

                    if (Request.Properties.TryGetValue("MS_HttpContext", out context))
                    {
                        var httpContext = context as HttpContextBase;

                        _debuggingEnabled = (httpContext != null) && httpContext.IsDebuggingEnabled;
                    }
                    else
                    {
                        _debuggingEnabled = false;
                    }
                }

                return _debuggingEnabled.GetValueOrDefault();
            }

            set
            {
                _debuggingEnabled = value;
            }
        }

        public HttpResponseMessage Put(int id, [FromBody]User model)
        {
            HttpResponseMessage response;
            var userUpdates = model;
            if (_getUserId() != id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            try
            {
                using (var context = new PnwDbContext())
                {
                    var user = context.Users.FirstOrDefault(n => n.Id == id);
                    if (user != null)
                    {
                        user.FirstName = userUpdates.FirstName;
                        user.LastName = userUpdates.LastName;
                    }
                    context.SaveChanges();
                    response = Request.CreateResponse(HttpStatusCode.OK, new { user });
                }
            }
            catch (Exception ex)
            {
                var msg = ex.InnerException.Message;
                Debug.WriteLine(msg);
                ModelState.AddModelError(string.Empty, msg);
                response = Request.CreateResponse(HttpStatusCode.BadRequest, ModelState);
            }
            return response;
        }

        public async Task<HttpResponseMessage> Post(CreateUser model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest, ModelState);
            }

            var statusCode = MembershipCreateStatus.Success;
            var userName = model.Username.ToLowerInvariant();
            var email = model.Email.ToLowerInvariant();
            var token = string.Empty;

            var requireConfirmation = false; //!IsDebuggingEnabled;

            try
            {
                using (var context = new PnwDbContext())
                {
                    if (context.Users.Any(n => n.Email == email))
                    {
                        var ex = new MembershipCreateUserException(MembershipCreateStatus.DuplicateEmail);
                        throw ex;
                    }
                }
                token = _signup(userName, model.Password, email, false);
                _signIn(userName, model.Password, false);
            }
            catch (MembershipCreateUserException e)
            {
                statusCode = e.StatusCode;
            }
            
            if (statusCode == MembershipCreateStatus.Success)
            {
                User user;
                using (var context = new PnwDbContext())
                {
                    user = context.Users.FirstOrDefault(n => n.Username == userName);
                }
                return Request.CreateResponse(HttpStatusCode.OK, user);
            }

            switch (statusCode)
            {
                case MembershipCreateStatus.DuplicateUserName:
                case MembershipCreateStatus.DuplicateProviderUserKey:
                    ModelState.AddModelError(
                        "userName",
                        "User with same user-name already exits.");
                    break;
                case MembershipCreateStatus.DuplicateEmail:
                    ModelState.AddModelError(
                        "email",
                        "User with same email already exits.");
                    break;
                case MembershipCreateStatus.InvalidUserName:
                case MembershipCreateStatus.InvalidEmail:
                    ModelState.AddModelError(
                        "email",
                        "Invalid email address.");
                    break;
                case MembershipCreateStatus.InvalidPassword:
                    ModelState.AddModelError("password", "Invalid password.");
                    break;
                default:
                    ModelState.AddModelError(
                        string.Empty,
                        "Unexpected error.");
                    break;
            }

            return Request.CreateErrorResponse(
                HttpStatusCode.BadRequest, ModelState);
        }
    }
}