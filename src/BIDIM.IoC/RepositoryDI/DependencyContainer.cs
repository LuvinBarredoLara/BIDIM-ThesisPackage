using Authentication.Client;
using Authentication.Server;
using BIDIM.DAL.Repositories;
using BIDIM.Domain.Interfaces;
using Disease.Client;
using Disease.Server;
using Main.Client;
using Main.Server;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using User.Client;
using User.Server;

namespace BIDIM.Common.RepositoryDI
{
    public class DependencyContainer
    {
        public static void RegisterServices(IServiceCollection services)
        {
            #region > Microservices
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IInfectiousDiseaseService, InfectiousDiseaseService>();
            services.AddScoped<IMainService, MainService>();
            #endregion

            #region > Repositories
            services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IInfectiousDiseaseRepository, InfectiousDiseaseRepository>();
            services.AddScoped<IHouseholdRepository, HouseholdRepository>();
            services.AddScoped<IIndividualRepository, IndividualRepository>();
            services.AddScoped<IUserTypeRepository, UserTypeRepository>();
            services.AddScoped<ICaseRepository, CaseRepository>();
            #endregion
        }
    }
}
