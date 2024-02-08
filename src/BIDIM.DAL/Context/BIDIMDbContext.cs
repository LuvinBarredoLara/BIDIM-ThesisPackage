using BIDIM.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BIDIM.DAL.Context
{
    public class BIDIMDbContext : DbContext
    {
        public BIDIMDbContext()
        {

        }

        public BIDIMDbContext(DbContextOptions options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region > Seed data

            #region > User Types
            modelBuilder.Entity<UserType>().HasData(
                        new UserType()
                        {
                            Id = 1,
                            Name = "SuperAdmin",
                            IsActive = true
                        },
                        new UserType()
                        {
                            Id = 2,
                            Name = "Admin",
                            IsActive = true
                        },
                        new UserType()
                        {
                            Id = 3,
                            Name = "User",
                            IsActive = true
                        },
                        new UserType()
                        {
                            Id = 4,
                            Name = "Guest",
                            IsActive = true
                        }
                    );
            #endregion

            #region > Users
            modelBuilder.Entity<User>().HasData(
                        new User()
                        {
                            Id = Guid.NewGuid(),
                            FirstName = "System",
                            LastName = "System",
                            Username = "System",
                            PasswordHash = "$2b$10$lcxOgiMwJgAir21oS1E4N.CpCq8aeIrADP4oDT4MOJTZtRf/A/.Qi", // sys
                            UserTypeId = 1,
                            IsActive = true
                        },
                        new User()
                        {
                            Id = Guid.NewGuid(),
                            FirstName = "Test Admin",
                            LastName = "User",
                            Username = "testadmin",
                            PasswordHash = "$2b$10$hh2f6Ik0S4d71Fe57c3Bc.reN80muw/nN7BbuRPi3UKE3n2XIZS3G", // testadmin
                            UserTypeId = 2,
                            IsActive = true
                        },
                        new User()
                        {
                            Id = Guid.NewGuid(),
                            FirstName = "Test User",
                            LastName = "User",
                            Username = "testuser",
                            PasswordHash = "$2b$10$WMRMXn874oi89w08S75fuuAdhaVIdRpPi6h2bNU0j.V0FJrarEdzi", // testuser
                            UserTypeId = 3,
                            IsActive = true
                        },
                        new User()
                        {
                            Id = Guid.NewGuid(),
                            FirstName = "Test Guest",
                            LastName = "User",
                            Username = "testguest",
                            PasswordHash = "$2b$10$0pJGfVGmnGtFEBeGbNsAMOL.P2JKwi2HRf5qaaX6bCnjFxDiFzSgu", // testguest
                            UserTypeId = 4,
                            IsActive = true
                        }
                    );
            #endregion

            #region > Diseases
            modelBuilder.Entity<InfectiousDisease>().HasData(
                        new InfectiousDisease()
                        {
                            Id = 1,
                            Name = "Covid-19",
                            IsActive = true
                        },
                        new InfectiousDisease()
                        {
                            Id = 2,
                            Name = "Dengue",
                            IsActive = true
                        },
                        new InfectiousDisease()
                        {
                            Id = 3,
                            Name = "Tuberculosis",
                            IsActive = true
                        }
                    );
            #endregion

            #region > Households

            #endregion

            #region > Individuals

            #endregion

            #region > Cases

            #endregion

            #endregion

            #region > Model relation constraints
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserType)
                .WithMany(ut => ut.Users)
                .HasForeignKey(u => u.UserTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Household>()
                .HasMany(h => h.Members)
                .WithOne(m => m.Household)
                .HasForeignKey(i => i.HouseholdId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Case>()
                .HasOne(c => c.Individual)
                .WithMany(i => i.Cases)
                .HasForeignKey(c => c.IndividualId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Case>()
                .HasOne(c => c.InfectiousDisease)
                .WithMany(id => id.Cases)
                .HasForeignKey(c => c.InfectiousDiseaseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Case>()
                .HasMany(c => c.CaseMonitorings)
                .WithOne(cm => cm.Case)
                .HasForeignKey(cm => cm.CaseId)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            //base.OnModelCreating(modelBuilder);
        }

        public DbSet<UserType> UserTypes { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Household> Households { get; set; }

        public DbSet<Individual> Individuals { get; set; }

        public DbSet<Case> Cases { get; set; }

        public DbSet<InfectiousDisease> InfectiousDiseases { get; set; }

        public DbSet<CaseMonitoring> CaseMonitorings { get; set; }

        public DbSet<AuditLog> AuditLogs { get; set; }
    }
}
