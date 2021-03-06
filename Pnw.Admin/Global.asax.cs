﻿using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.Threading;
using System.Transactions;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Pnw.Admin.Models;
using Pnw.DataAccess;
using System.Linq;
using Pnw.Model;
using WebMatrix.WebData;

namespace Pnw.Admin
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        private static SimpleMembershipInitializer _initializer;
        private static object _initializerLock = new object();
        private static bool _isInitialized;

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();
            GlobalConfig.CustomizeConfig(GlobalConfiguration.Configuration);

            LazyInitializer.EnsureInitialized(ref _initializer, ref _isInitialized, ref _initializerLock);

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
                            var results = context.Fixtures.Where(f => f.MatchStatus != MatchStatus.Scheduled 
                                && f.MatchStatus != MatchStatus.InProgress && f.CanPredict).ToArray();
                            if (!results.Any()) 
                                return;
                            using (var scope = new TransactionScope(
                                TransactionScopeOption.Required,
                                new TransactionOptions {IsolationLevel = IsolationLevel.Serializable}))
                            {
                                foreach (var result in results)
                                {
                                    var fixture = result;
                                    var predictions = context.Predictions.Where(p => p.FixtureId == fixture.Id).ToArray();
                                    foreach (var prediction in predictions)
                                    {
                                        var correctScoreHome = prediction.HomeGoals == fixture.HomeScore;
                                        var correctScoreAway = prediction.AwayGoals == fixture.AwayScore;

                                        var correctResultHomeWin = (fixture.HomeScore > fixture.AwayScore)
                                                                   && (prediction.HomeGoals > prediction.AwayGoals);
                                        var correctResultAwayWin = (fixture.AwayScore > fixture.HomeScore)
                                                                   && (prediction.AwayGoals > prediction.HomeGoals);
                                        var correctResultDraw = (fixture.HomeScore == fixture.AwayScore)
                                                                && (prediction.HomeGoals == prediction.AwayGoals);
                                        var correctResult =
                                            correctResultHomeWin || correctResultAwayWin || correctResultDraw;

                                        var spreadDiffPrediction = prediction.HomeGoals - prediction.AwayGoals;
                                        var spreadDiffFixture = fixture.HomeScore - fixture.AwayScore;
                                        var spreadDiff = -(Math.Abs(spreadDiffPrediction - spreadDiffFixture));

                                        var accuracyDiffHome = Math.Abs(fixture.HomeScore - prediction.HomeGoals);
                                        var accuracyDiffAway = Math.Abs(fixture.AwayScore - prediction.AwayGoals);
                                        var accuracyDiff = -(accuracyDiffHome + accuracyDiffAway);

                                        if (correctScoreHome)
                                        {
                                            prediction.CorrectScorePoints += 1;
                                        }
                                        if (correctScoreAway)
                                        {
                                            prediction.CorrectScorePoints += 1;
                                        }
                                        if (correctScoreHome && correctScoreAway)
                                        {
                                            prediction.CorrectScorePoints += 1;
                                        }
                                        if (correctResult)
                                        {
                                            prediction.CorrectResultPoints = 3;
                                        }

                                        prediction.Points = 
                                            prediction.CorrectScorePoints + prediction.CorrectResultPoints;
                                        prediction.SpreadDifference = spreadDiff;
                                        prediction.AccuracyDifference = accuracyDiff;
                                        prediction.CrossProductPoints =
                                            prediction.CorrectScorePoints * prediction.CorrectResultPoints;

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

        public class SimpleMembershipInitializer
        {
            public SimpleMembershipInitializer()
            {
                Database.SetInitializer<UsersContext>(null);

                try
                {
                    using (var context = new UsersContext())
                    {
                        if (!context.Database.Exists())
                        {
                            // Create the SimpleMembership database without Entity Framework migration schema
                            ((IObjectContextAdapter)context).ObjectContext.CreateDatabase();
                        }
                    }

                    WebSecurity.InitializeDatabaseConnection(
                        Config.ConnectionStringName,
                        Config.UsersTableName,
                        Config.UsersPrimaryKeyColumnName,
                        Config.UsersUserNameColumnName,
                        autoCreateTables: true);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("The ASP.NET Simple Membership database could not be initialized. For more information, please see http://go.microsoft.com/fwlink/?LinkId=256588", ex);
                }
            }
        }
    }
}