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
    public class UserTypeRepository : BaseRepository<UserType>, IUserTypeRepository
    {
        public UserTypeRepository(BIDIMDbContext context) : base(context)
        {
        }

        public async Task<List<UserType>> GetAllActive()
        {
            return await GetAll()
                .Where(ut => ut.IsActive && ut.Name.ToLower() != "superadmin")
                .ToListAsync();
        }
    }
}
