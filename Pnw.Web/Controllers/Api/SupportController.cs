using System;
using System.Web.Mvc;
using Pnw.Web.Models;
using Pnw.Web.Utils;
using WebMatrix.WebData;

namespace Pnw.Admin.Controllers.Api
{
    public class SupportController : Controller
    {
        private readonly Func<string, bool> _confirmUser;
        private readonly Func<string, string, bool> _resetPassword;

        private FlashMessages _flash;

        public SupportController() :
            this(WebSecurity.ConfirmAccount, WebSecurity.ResetPassword)
        {
        }

        public SupportController(
            Func<string, bool> confirmUser,
            Func<string, string, bool> resetPassword)
        {
            _confirmUser = confirmUser;
            _resetPassword = resetPassword;
        }

        public virtual FlashMessages Flash
        {
            get { return _flash ?? (_flash = new FlashMessages(TempData)); }

            set { _flash = value; }
        }

        [HttpGet]
        public ActionResult ConfirmUser(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return RedirectToHome();
            }

            if (_confirmUser(token))
            {
                Flash[FlashMessageType.Success] = "Your account is now " +
                    "successfully verified.";
            }
            else
            {
                Flash[FlashMessageType.Error] = "Invalid confirmation " +
                    "token, you may have miss typed the token or the " +
                    "token has expired.";
            }

            return RedirectToHome();
        }

        [HttpGet]
        public ActionResult ResetPassword(string token)
        {
            return View(new ResetPassword { Token = token });
        }

        [HttpPost, ValidateAntiForgeryToken]
        public ActionResult ResetPassword(ResetPassword model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            if (_resetPassword(model.Token, model.Password))
            {
                Flash[FlashMessageType.Success] = "Your password is " +
                    "successfully changed.";
            }
            else
            {
                Flash[FlashMessageType.Error] = "Invalid reset token, " +
                    "you may have miss typed the token or the token has " +
                    "expired.";
            }

            return RedirectToHome();
        }

        private ActionResult RedirectToHome()
        {
            return RedirectToAction("index", "home");
        }
    }
}