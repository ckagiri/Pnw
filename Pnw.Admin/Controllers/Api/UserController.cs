using Pnw.Admin.Models;
using Pnw.Admin.Utils;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Security;
using WebMatrix.WebData;

namespace Pnw.Admin.Controllers.Api
{
    public class UserController : ApiController
    {
        private readonly Func<string, string, bool, string> _signup;
        private readonly IMailer _mailer;

        private bool? _debuggingEnabled;

        public UserController()
            : this(
                (userName, password, requireConfirmation) =>
                    WebSecurity.CreateUserAndAccount(
                    userName,
                    password,
                    requireConfirmationToken: requireConfirmation),
                new Mailer())
        {
        }

        public UserController(
            Func<string, string, bool, string> signup,
            IMailer mailer)
        {
            this._signup = signup;
            this._mailer = mailer;
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

        public async Task<HttpResponseMessage> Post(CreateUser model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest, ModelState);
            }

            var statusCode = MembershipCreateStatus.Success;
            var userName = model.Email.ToLowerInvariant();
            var token = string.Empty;

            var requireConfirmation = !IsDebuggingEnabled;

            try
            {
                token = _signup(userName, model.Password, requireConfirmation);
            }
            catch (MembershipCreateUserException e)
            {
                statusCode = e.StatusCode;
            }

            if (statusCode == MembershipCreateStatus.Success)
            {
                if (requireConfirmation)
                {
                    await _mailer.UserConfirmationAsync(userName, token);
                }

                return Request.CreateResponse(HttpStatusCode.NoContent);
            }

            switch (statusCode)
            {
                case MembershipCreateStatus.DuplicateUserName:
                case MembershipCreateStatus.DuplicateEmail:
                case MembershipCreateStatus.DuplicateProviderUserKey:
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