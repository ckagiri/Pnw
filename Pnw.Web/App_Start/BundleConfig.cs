using System.Web.Optimization;

namespace Pnw.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            // Force optimization to be on or off, regardless of web.config setting
            BundleTable.EnableOptimizations = true;
            //bundles.UseCdn = true;

            // .debug.js, -vsdoc.js and .intellisense.js files 
            // are in BundleTable.Bundles.IgnoreList by default.
            // Clear out the list and add back the ones we want to ignore.
            // Don't add back .debug.js.
            bundles.IgnoreList.Clear();
            bundles.IgnoreList.Ignore("*-vsdoc.js");
            bundles.IgnoreList.Ignore("*intellisense.js");

            bundles.Add(new ScriptBundle("~/bundles/jsextlibs")
                            .Include(
                                "~/Scripts/angular-animate.min.js",
                                "~/Scripts/angular-route.min.js",
                                "~/Scripts/angular-sanitize.min.js",
                                "~/Scripts/angular-resource.min.js",
                                "~/Scripts/bootstrap.min.js",
                                "~/Scripts/toastr.min.js",
                                "~/Scripts/moment.min.js",
                                "~/Scripts/ui-bootstrap-tpls-0.7.0.min.js",
                                "~/Scripts/spin.min.js",
                                "~/Scripts/q.min.js",
                                "~/Scripts/breeze.min.js",
                                "~/scripts/breeze.directives.validation.js",
                                "~/scripts/breeze.to$q.js",
                                "~/scripts/breeze.saveErrorExtensions.js",
                                "~/Scripts/ui.validate.js",
                                "~/Scripts/ui.bootstrap.alert.js",
                                "~/Scripts/ui.bootstrap.dialog.js"
                            ));

            bundles.Add(new ScriptBundle("~/bundles/jsapplibs")
                            .Include(
                                // bootstrapping
                                "~/app/app.js",
                                "~/app/config.js",
                                "~/app/config.exceptionHandler.js",
                                "~/app/config.route.js",

                                // common modules
                                "~/app/common/common.js",
                                "~/app/common/logger.js",
                                "~/app/common/spinner.js",

                                // common.bootstrap modules
                                "~/app/common/bootstrap/bootstrap.dialog.js",

                                // auth
                                //"~/app/account/events.js",
                                //"~/app/account/auth.js",
                                //"~/app/account/identity.js",
                                //"~/app/account/forgotpassword.js",
                                //"~/app/account/changepassword.js",
                                //"~/app/account/user.js",
                                //"~/app/account/signin.js",
                                //"~/app/account/signup.js",
                                //"~/app/account/validation.js",
                                //"~/app/account/profile.js",
                                //"~/app/account/flashmessage.js",

                                // app
                                "~/app/layout/navigation.js",
                                "~/app/layout/shell.js",
                                "~/app/layout/sidebar.js",

                                // app services
                                "~/app/services/datacontext.js",
                                "~/app/services/directives.js",
                                "~/app/services/entityManagerFactory.js",
                                "~/app/services/model.js",
                                "~/app/services/model.validation.js",
                                "~/app/services/routemediator.js",
                                "~/app/services/repositories.js",
                                "~/app/services/repository.abstract.js",
                                "~/app/services/cache.js",
                                "~/app/services/helper.js",
                                "~/app/services/repository.league.js",
                                "~/app/services/repository.season.js",
                                "~/app/services/repository.team.js",
                                "~/app/services/repository.fixture.js",
                                "~/app/services/repository.prediction.js",
                                "~/app/services/repository.leaderboard.js",
                                "~/app/services/repository.round.js",

                                // app viewmodels
                                "~/app/fixture/fixtures.js",
                                "~/app/predict/predictions.js",
                                "~/app/leaderboard/leaderboard.js",
                                "~/app/general/howtoplay.js"
                            ));

            // 3rd Party CSS files
            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/content/ie10mobile.css",
                "~/content/bootstrap.min.css",
                "~/content/font-awesome.min.css",
                "~/content/toastr.css",
                "~/content/breeze.directives.css",
                "~/content/customtheme.css",
                "~/content/styles.css",
                "~/content/bootstrap-responsive.min.css"
                ));

            // Custom LESS files
            //bundles.Add(new Bundle("~/Content/Less", new LessTransform(), new CssMinify())
            //    .Include("~/Content/styles.less"));
        }
    }
}