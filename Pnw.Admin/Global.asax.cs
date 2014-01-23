using System;
using System.Diagnostics;
using System.Threading;
using System.Transactions;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Pnw.DataAccess;
using System.Linq;
using Pnw.Model;

namespace Pnw.Admin
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();

            PollAndProcess();
        }

        private void PollAndProcess()
        {
            var waitHandle = new AutoResetEvent(false);
            ThreadPool.RegisterWaitForSingleObject(
                waitHandle,
                (state, timeout) =>
                {
                    try
                    {
                        using (var context = new PnwDbContext())
                        {
                            var results = context.Fixtures.Where
                                (f => f.MatchStatus != MatchStatus.Scheduled && f.CanPredict);
                            if (!results.Any()) 
                                return;
                            using (var scope = new TransactionScope(
                                TransactionScopeOption.Required,
                                new TransactionOptions {IsolationLevel = IsolationLevel.Serializable}))
                            {
                                foreach (var result in results)
                                {
                                    var fixture = result;
                                    var predictions = context.Predictions.Where(p => p.FixtureId == fixture.Id);
                                    foreach (var prediction in predictions)
                                    {
                                        var correctScoreHome = prediction.HomeGoals == fixture.HomeScore;
                                        var correctScoreAway = prediction.AwayGoals == fixture.AwayScore;

                                        var correctResultHomeWin = (fixture.HomeScore > fixture.AwayScore)
                                                                   && (prediction.HomeGoals > prediction.AwayGoals);
                                        var correctResultAwayWin = (fixture.HomeScore > fixture.AwayScore)
                                                                   && (prediction.HomeGoals > prediction.AwayGoals);
                                        var correctResultDraw = (fixture.HomeScore == fixture.AwayScore)
                                                                && (prediction.HomeGoals == prediction.AwayGoals);
                                        var correctResult =
                                            correctResultHomeWin || correctResultAwayWin || correctResultDraw;

                                        var spreadDiffPrediction = prediction.HomeGoals - prediction.AwayGoals;
                                        var spreadDiffFixture = fixture.HomeScore - fixture.AwayScore;
                                        var spreadDiff = spreadDiffPrediction - spreadDiffFixture;

                                        var accuracyDiffHome = Math.Abs(fixture.HomeScore - prediction.AwayGoals);
                                        var accuracyDiffAway = Math.Abs(fixture.AwayScore - prediction.AwayGoals);
                                        var accuracyDiff = -(accuracyDiffHome + accuracyDiffAway);

                                        if (correctScoreHome)
                                        {
                                            prediction.Points += 1;
                                            prediction.CorrectScorePoints += 1;
                                        }
                                        if (correctScoreAway)
                                        {
                                            prediction.Points += 1;
                                            prediction.CorrectScorePoints += 1;
                                        }
                                        if (correctScoreHome && correctScoreAway)
                                        {
                                            prediction.Points += 1;
                                        }
                                        if (correctResult)
                                        {
                                            prediction.Points += 3;
                                            prediction.CorrectResultPoints = 1;
                                        }

                                        prediction.SpreadDifference = spreadDiff;
                                        prediction.AccuracyDifference = accuracyDiff;
                                        prediction.CrossProductPoints =
                                            prediction.CorrectScorePoints*prediction.CorrectResultPoints;

                                        prediction.IsProcessed = true;
                                    }
                                    result.CanPredict = false;
                                }
                                context.SaveChanges();
                                scope.Complete();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine("Failed to execute timer delegate", ex);
                    }
                },
                null,
                TimeSpan.FromSeconds(60),
                false
            );
        }
    }
}