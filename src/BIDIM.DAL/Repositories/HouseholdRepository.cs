using BIDIM.DAL.Context;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.DAL.Repositories
{
    public class HouseholdRepository : BaseRepository<Household>, IHouseholdRepository
    {
        public HouseholdRepository(BIDIMDbContext context) : base(context)
        {
        }

        public async Task<Household> CreateHousehold(Household model)
        {
            return await Insert(model);
        }

        public async Task<List<Household>> GetAllActive()
        {
            return await GetAll()
                .Where(s => s.IsActive)
                .Include(s => s.Members.Where(m => m.IsActive))
                    .ThenInclude(m => m.Cases)
                        .ThenInclude(c => c.CaseMonitorings)
                .ToListAsync();
        }

        public async Task<Household> GetByFamilyName(string familyName)
        {
            return await GetAll()
                .Where(s => s.IsActive && s.FamilyName.ToLower() == familyName.ToLower())
                .Include(s => s.Members.Where(m => m.IsActive))
                .FirstOrDefaultAsync();
        }

        public async Task<Household> GetById(int Id)
        {
            return await GetAll()
                .Where(s => s.IsActive && s.Id == Id)
                .Include(s => s.Members.Where(m => m.IsActive))
                .FirstOrDefaultAsync();
        }

        public async Task<Household> UpdateHousehold(Household model)
        {
            return await Update(model);
        }
    }
}
