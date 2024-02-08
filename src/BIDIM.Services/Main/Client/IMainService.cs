using BIDIM.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Main.Client
{
    public interface IMainService
    {
        // Dashboard
        /// <summary>
        /// All data returned is filtered by year
        /// except population
        /// </summary>
        /// <param name="diseaseId"></param>
        /// <param name="year"></param>
        /// <returns></returns>
        Task<DashboardData> GetDashboardData(int diseaseId, int year);

        // Misc
        Task<List<InfectiousDiseaseDropdown>> GetAllActiveInfectiousDiseasesDropdown();

        Task<List<string>> GetAllStatusDropdown();

        // Household
        Task<List<HouseholdDropdown>> GetAllActiveHouseholdsDropdown();

        Task<List<HouseholdList>> GetHouseholdList();

        Task<HouseholdViewModel> GetHouseholdById(int Id);

        Task<bool> CheckHouseholdFamilyNameExists(int Id, string hhFamilyName);

        Task<HouseholdViewModel> UpsertHousehold(HouseholdViewModel view);

        // Individual
        Task<List<IndividualList>> GetIndividualList();

        Task<List<IndividualDropdownList>> GetIndividualDropdownList();

        Task<IndividualViewModel> GetIndividualById(Guid Id);

        Task<IndividualViewModel> UpsertIndividual(IndividualViewModel view);

        // Case
        Task<List<CaseList>> GetCaseList();

        Task<CaseViewModel> GetCaseByGuid(Guid Guid);

        Task<CaseViewModel> UpsertCase(CaseViewModel view);

        // Statistics
        Task<StatisticsViewModel> GetSIRData(int diseaseId);

        // Mapping
        Task<List<List<double>>> GetMappingData(InfectedFilter filter);
    }
}
