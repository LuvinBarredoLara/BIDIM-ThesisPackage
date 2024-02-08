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
    public class InfectiousDiseaseRepository : BaseRepository<InfectiousDisease>, IInfectiousDiseaseRepository
    {
        public InfectiousDiseaseRepository(BIDIMDbContext context) : base(context)
        {
        }

        public async Task<List<InfectiousDisease>> GetAllActive()
        {
            return await GetAll()
                .Where(x => x.IsActive)
                .ToListAsync();
        }

        public async Task<InfectiousDisease> GetById(int Id)
        {
            return await GetAll()
                .FirstOrDefaultAsync(d => d.IsActive && d.Id == Id);
        }

        public async Task<InfectiousDisease> GetByName(string name)
        {
            return await GetAll()
                .FirstOrDefaultAsync(d => d.Name.ToLower().Trim() == name.ToLower().Trim());
        }
    }
}
