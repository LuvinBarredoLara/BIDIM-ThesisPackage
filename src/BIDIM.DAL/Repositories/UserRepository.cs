using BIDIM.DAL.Context;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BIDIM.DAL.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(BIDIMDbContext context) : base(context)
        {

        }

        public async Task<User> CreateUser(User user)
        {
            return await Insert(user);
        }

        public async Task<List<User>> GetAllActive()
        {
            return await GetAll()
                .Include(u => u.UserType)
                .Where(u => u.IsActive && u.UserType.Name.ToLower() != "superadmin")
                .ToListAsync();
        }

        public async Task<User> GetById(Guid Id)
        {
            return await GetAll()
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(u => u.Id == Id);
        }

        public async Task<User> GetByUsername(string username)
        {
            return await GetAll()
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<User> UpdateUser(User user)
        {
            return await Update(user);
        }

        public async Task<List<User>> GetAllIncludeInactive()
        {
            return await GetAll()
                .Include(u => u.UserType)
                .Where(u => u.UserType.Name.ToLower() != "superadmin")
                .ToListAsync();
        }
    }
}
