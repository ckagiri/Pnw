namespace Pnw.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Fixture",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        SeasonId = c.Int(nullable: false),
                        LeagueId = c.Int(nullable: false),
                        HomeTeamId = c.Int(nullable: false),
                        AwayTeamId = c.Int(nullable: false),
                        KickOff = c.DateTime(nullable: false),
                        Venue = c.String(),
                        MatchStatus = c.Int(nullable: false),
                        HomeScore = c.Int(nullable: false),
                        AwayScore = c.Int(nullable: false),
                        CanPredict = c.Boolean(nullable: false),
                        HomeTeamImageSource = c.String(),
                        AwayTeamImageSource = c.String(),
                        CreatedOn = c.DateTime(nullable: false),
                        ModifiedOn = c.DateTime(nullable: false),
                        Team_Id = c.Int(),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Team", t => t.Team_Id)
                .ForeignKey("dbo.Team", t => t.AwayTeamId)
                .ForeignKey("dbo.Team", t => t.HomeTeamId)
                .ForeignKey("dbo.League", t => t.LeagueId, cascadeDelete: true)
                .ForeignKey("dbo.Season", t => t.SeasonId, cascadeDelete: true)
                .Index(t => t.Team_Id)
                .Index(t => t.AwayTeamId)
                .Index(t => t.HomeTeamId)
                .Index(t => t.LeagueId)
                .Index(t => t.SeasonId);
            
            CreateTable(
                "dbo.Team",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        Code = c.String(nullable: false, maxLength: 4),
                        HomeGround = c.String(),
                        Tags = c.String(),
                        ImageSource = c.String(),
                        Type = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Participation",
                c => new
                    {
                        SeasonId = c.Int(nullable: false),
                        TeamId = c.Int(nullable: false),
                        Position = c.Int(nullable: false),
                        Played = c.Int(nullable: false),
                        Won = c.Int(nullable: false),
                        Drawn = c.Int(nullable: false),
                        Lost = c.Int(nullable: false),
                        Points = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.SeasonId, t.TeamId })
                .ForeignKey("dbo.Season", t => t.SeasonId)
                .ForeignKey("dbo.Team", t => t.TeamId)
                .Index(t => t.SeasonId)
                .Index(t => t.TeamId);
            
            CreateTable(
                "dbo.Season",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false),
                        StartDate = c.DateTime(nullable: false),
                        EndDate = c.DateTime(nullable: false),
                        LeagueId = c.Int(nullable: false),
                        IsReady = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.League", t => t.LeagueId)
                .Index(t => t.LeagueId);
            
            CreateTable(
                "dbo.League",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Code = c.String(),
                        Name = c.String(),
                        IsTournament = c.Boolean(nullable: false),
                        Region = c.Int(nullable: false),
                        ParticipantType = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.LeaderBoard",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        UserId = c.Int(nullable: false),
                        UserName = c.String(),
                        LeagueId = c.Int(nullable: false),
                        SeasonId = c.Int(nullable: false),
                        Points = c.Int(nullable: false),
                        CorrectScorePoints = c.Int(nullable: false),
                        CorrectResultPoints = c.Int(nullable: false),
                        CrossProductPoints = c.Int(nullable: false),
                        SpreadDifference = c.Int(nullable: false),
                        AccuracyDifference = c.Int(nullable: false),
                        LastBetTimestamp = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.MatchWeek",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        SeasonId = c.Int(nullable: false),
                        LeagueId = c.Int(nullable: false),
                        Name = c.String(),
                        StartDate = c.DateTime(nullable: false),
                        EndDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.Prediction",
                c => new
                    {
                        Id = c.Guid(nullable: false),
                        UserId = c.Int(nullable: false),
                        LeagueId = c.Int(nullable: false),
                        SeasonId = c.Int(nullable: false),
                        FixtureId = c.Int(nullable: false),
                        HomeGoals = c.Int(nullable: false),
                        AwayGoals = c.Int(nullable: false),
                        Points = c.Int(nullable: false),
                        SpreadDifference = c.Int(nullable: false),
                        AccuracyDifference = c.Int(nullable: false),
                        CorrectScorePoints = c.Int(nullable: false),
                        CorrectResultPoints = c.Int(nullable: false),
                        CrossProductPoints = c.Int(nullable: false),
                        IsProcessed = c.Boolean(nullable: false),
                        FixtureDate = c.DateTime(nullable: false),
                        CreatedOn = c.DateTime(nullable: false),
                        ModifiedOn = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Fixture", t => t.FixtureId, cascadeDelete: true)
                .Index(t => t.FixtureId);
            
            CreateTable(
                "dbo.webpages_Roles",
                c => new
                    {
                        RoleId = c.Int(nullable: false, identity: true),
                        RoleName = c.String(nullable: false, maxLength: 256),
                    })
                .PrimaryKey(t => t.RoleId);
            
            CreateTable(
                "dbo.User",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FirstName = c.String(maxLength: 100),
                        LastName = c.String(maxLength: 100),
                        Username = c.String(nullable: false, maxLength: 200),
                        Email = c.String(maxLength: 100),
                    })
                .PrimaryKey(t => t.Id);
            
            CreateTable(
                "dbo.webpages_OAuthMembership",
                c => new
                    {
                        Provider = c.String(nullable: false, maxLength: 30),
                        ProviderUserId = c.String(nullable: false, maxLength: 100),
                        UserId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.Provider, t.ProviderUserId });
            
            CreateTable(
                "dbo.webpages_Membership",
                c => new
                    {
                        UserId = c.Int(nullable: false),
                        CreateDate = c.DateTime(),
                        ConfirmationToken = c.String(maxLength: 128),
                        IsConfirmed = c.Boolean(),
                        LastPasswordFailureDate = c.DateTime(),
                        PasswordFailuresSinceLastSuccess = c.Int(nullable: false),
                        Password = c.String(nullable: false, maxLength: 128),
                        PasswordChangedDate = c.DateTime(),
                        PasswordSalt = c.String(nullable: false, maxLength: 128),
                        PasswordVerificationToken = c.String(maxLength: 128),
                        PasswordVerificationTokenExpirationDate = c.DateTime(),
                    })
                .PrimaryKey(t => t.UserId);
            
            CreateTable(
                "dbo.webpages_UsersInRoles",
                c => new
                    {
                        UserId = c.Int(nullable: false),
                        RoleId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => new { t.UserId, t.RoleId })
                .ForeignKey("dbo.User", t => t.UserId, cascadeDelete: true)
                .ForeignKey("dbo.webpages_Roles", t => t.RoleId, cascadeDelete: true)
                .Index(t => t.UserId)
                .Index(t => t.RoleId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.webpages_UsersInRoles", "RoleId", "dbo.webpages_Roles");
            DropForeignKey("dbo.webpages_UsersInRoles", "UserId", "dbo.User");
            DropForeignKey("dbo.Prediction", "FixtureId", "dbo.Fixture");
            DropForeignKey("dbo.Fixture", "SeasonId", "dbo.Season");
            DropForeignKey("dbo.Fixture", "LeagueId", "dbo.League");
            DropForeignKey("dbo.Fixture", "HomeTeamId", "dbo.Team");
            DropForeignKey("dbo.Fixture", "AwayTeamId", "dbo.Team");
            DropForeignKey("dbo.Participation", "TeamId", "dbo.Team");
            DropForeignKey("dbo.Participation", "SeasonId", "dbo.Season");
            DropForeignKey("dbo.Season", "LeagueId", "dbo.League");
            DropForeignKey("dbo.Fixture", "Team_Id", "dbo.Team");
            DropIndex("dbo.webpages_UsersInRoles", new[] { "RoleId" });
            DropIndex("dbo.webpages_UsersInRoles", new[] { "UserId" });
            DropIndex("dbo.Prediction", new[] { "FixtureId" });
            DropIndex("dbo.Fixture", new[] { "SeasonId" });
            DropIndex("dbo.Fixture", new[] { "LeagueId" });
            DropIndex("dbo.Fixture", new[] { "HomeTeamId" });
            DropIndex("dbo.Fixture", new[] { "AwayTeamId" });
            DropIndex("dbo.Participation", new[] { "TeamId" });
            DropIndex("dbo.Participation", new[] { "SeasonId" });
            DropIndex("dbo.Season", new[] { "LeagueId" });
            DropIndex("dbo.Fixture", new[] { "Team_Id" });
            DropTable("dbo.webpages_UsersInRoles");
            DropTable("dbo.webpages_Membership");
            DropTable("dbo.webpages_OAuthMembership");
            DropTable("dbo.User");
            DropTable("dbo.webpages_Roles");
            DropTable("dbo.Prediction");
            DropTable("dbo.MatchWeek");
            DropTable("dbo.LeaderBoard");
            DropTable("dbo.League");
            DropTable("dbo.Season");
            DropTable("dbo.Participation");
            DropTable("dbo.Team");
            DropTable("dbo.Fixture");
        }
    }
}
