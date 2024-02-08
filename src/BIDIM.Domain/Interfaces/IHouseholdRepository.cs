using BIDIM.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Domain.Interfaces
{
    public interface IHouseholdRepository
    {
        Task<List<Household>> GetAllActive();

        Task<Household> GetById(int Id);

        Task<Household> GetByFamilyName(string familyName);

        Task<Household> CreateHousehold(Household model);

        Task<Household> UpdateHousehold(Household model);
    }
}
