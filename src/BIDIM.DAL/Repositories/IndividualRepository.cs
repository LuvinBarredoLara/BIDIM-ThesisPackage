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
    public class IndividualRepository : BaseRepository<Individual>, IIndividualRepository
    {
        public IndividualRepository(BIDIMDbContext context) : base(context)
        {
        }

        public async Task<Individual> CreateIndividual(Individual model)
        {
            return await Insert(model);
        }

        public async Task<List<Individual>> GetAllActive()
        {
            return await GetAll()
                .Where(i => i.IsActive)
                .Include(i => i.Household)
                .Include(i => i.Cases.Where(c => c.IsActive).OrderBy(c => c.CreatedDate))
                    .ThenInclude(c => c.CaseMonitorings.Where(cm => cm.IsActive).OrderBy(cm => cm.CreatedDate))
                .ToListAsync();
        }

        public async Task<List<Individual>> GetAllIncludeInactive()
        {
            return await GetAll()
                .Include(i => i.Household)
                .Include(i => i.Cases.Where(c => c.IsActive).OrderBy(c => c.CreatedDate))
                    .ThenInclude(c => c.CaseMonitorings.Where(cm => cm.IsActive).OrderBy(cm => cm.CreatedDate))
                .ToListAsync();
        }

        public async Task<Individual> GetById(Guid Id)
        {
            return await GetAll()
                .Where(i => i.Id == Id)
                .Include(i => i.Household)
                .Include(i => i.Cases.Where(c => c.IsActive))
                    .ThenInclude(c => c.CaseMonitorings.Where(cm => cm.IsActive))
                .FirstOrDefaultAsync();
        }

        public async Task<Individual> UpdateIndividual(Individual model)
        {
            return await Update(model);
        }
    }
}
