using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Pnw.Admin.Models;
using Pnw.Admin.Utils;
using WebMatrix.WebData;

namespace Pnw.Admin.Controllers.Api
{
    public class PasswordController : ApiController
    {
        private readonly Func<string, string> _forgotPassword;
        private readonly Func<string, string, string, bool> _changePassword;
        private readonly IMailer _mailer;

        public PasswordController()
            : this(
                userName =>
                {
                    try
                    {
                        return WebSecurity.GeneratePasswordResetToken(userName);
                    }
                    catch (InvalidOperationException)
                    {
                    }

                    return null;
                },
                WebSecurity.ChangePassword,
                new Mailer())
        {
        }

        public PasswordController(
            Func<string, string> forgotPassword,
            Func<string, string, string, bool> changePassword,
            IMailer mailer)
        {
            _forgotPassword = forgotPassword;
            _changePassword = changePassword;
            _mailer = mailer;
        }

        public async Task<HttpResponseMessage> Forgot(ForgotPassword model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    ModelState);
            }

            var userName = model.Email.ToLowerInvariant();
            var token = _forgotPassword(userName);

            if (!string.IsNullOrWhiteSpace(token))
            {
                await _mailer.ForgotPasswordAsync(userName, token);
            }

            return Request.CreateResponse(HttpStatusCode.NoContent);
        }

        [Authorize]
        public HttpResponseMessage Change(ChangePassword model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    ModelState);
            }

            try
            {
                if (_changePassword(
                    User.Identity.Name,
                    model.OldPassword,
                    model.NewPassword))
                {
                    return Request.CreateResponse(HttpStatusCode.NoContent);
                }

                ModelState.AddModelError(
                    "oldPassword",
                    "Old password does not match existing password.");
            }
            catch (ArgumentException)
            {
                ModelState.AddModelError(
                    "newPassword",
                    "New password does not meet password rule.");
            }

            return Request.CreateErrorResponse(
                HttpStatusCode.BadRequest,
                ModelState);
        }
    }
}