using BIDIM.DAL.Context;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BIDIM.DAL.Repositories
{
    public class CaseRepository : BaseRepository<Case>, ICaseRepository
    {
        public CaseRepository(BIDIMDbContext context) : base(context)
        {
        }

        public async Task<Case> CreateCase(Case data)
        {
            return await Insert(data);
        }

        public async Task<List<Case>> GetAllActive()
        {
            return await GetAll()
                .Where(c => c.IsActive)
                .Include(c => c.CaseMonitorings.Where(cm => cm.IsActive).OrderBy(cm => cm.CreatedDate))
                .Include(c => c.Individual)
                    .ThenInclude(i => i.Household)
                .Include(c => c.InfectiousDisease)
                .OrderByDescending(c => c.CaseMonitorings.OrderBy(cm => cm.CreatedDate).Last().CreatedDate)
                .ToListAsync();
        }

        public async Task<Case> GetByGuid(Guid caseId)
        {
            return await GetAll()
                .Where(c => c.Guid == caseId)
                .Include(c => c.Individual)
                .Include(c => c.CaseMonitorings.Where(cm => cm.IsActive))
                .Include(c => c.InfectiousDisease)
                .FirstOrDefaultAsync();

        }

        public async Task<Case> GetById(string Id)
        {
            return await GetAll()
                .Where(c => c.Id == Id)
                .Include(c => c.Individual)
                .Include(c => c.CaseMonitorings.Where(cm => cm.IsActive))
                .Include(c => c.InfectiousDisease)
                .FirstOrDefaultAsync();
        }

        public async Task<Case> UpdateCase(Case data)
        {
            return await Update(data);
        }
    }
}
