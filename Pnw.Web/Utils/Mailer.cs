using System.Configuration;
using System.Threading.Tasks;
using Postal;

namespace Pnw.Web.Utils
{
    public interface IMailer
    {
        Task UserConfirmationAsync(string receipent, string token);

        Task ForgotPasswordAsync(string receipent, string token);
    }

    public class Mailer : IMailer
    {
        private readonly string _sender;
        private readonly IMailUrlResolver _urlResolver;
        private readonly IEmailService _emailService;

        public Mailer() : 
            this(
            ConfigurationManager.AppSettings["sender.email"],
            new MailUrlResolver(),
            new EmailService())
        {
        }

        public Mailer(string sender, IMailUrlResolver urlResolver, IEmailService emailService)
        {
            _sender = sender;
            _urlResolver = urlResolver;
            _emailService = emailService;
        }

        public Task UserConfirmationAsync(string receipent, string token)
        {
            dynamic email = new Email("UserConfirmation");
            email.To = receipent;
            email.From = _sender;
            email.Url = _urlResolver.UserConfirmation(token);

            return _emailService.SendAsync(email);
        }

        public Task ForgotPasswordAsync(string receipent, string token)
        {
            dynamic email = new Email("ForgotPassword");
            email.To = receipent;
            email.From = _sender;
            email.Url = _urlResolver.ForgotPassword(token);

            return _emailService.SendAsync(email);
        }
    }
}