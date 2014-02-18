namespace Pnw.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ChangedMatchWeekToRound : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Round",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        SeasonId = c.Int(nullable: false),
                        LeagueId = c.Int(nullable: false),
                        Name = c.String(nullable: false),
                        StartDate = c.DateTime(nullable: false),
                        EndDate = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Season", t => t.SeasonId, cascadeDelete: true)
                .Index(t => t.SeasonId);
            
            DropTable("dbo.MatchWeek");
        }
        
        public override void Down()
        {
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
            
            DropForeignKey("dbo.Round", "SeasonId", "dbo.Season");
            DropIndex("dbo.Round", new[] { "SeasonId" });
            DropTable("dbo.Round");
        }
    }
}
