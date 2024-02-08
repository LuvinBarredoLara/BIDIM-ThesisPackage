using BIDIM.Domain.Models;

namespace BIDIM.Domain.Interfaces
{
    public interface IUserRepository
    {
        public Task<User> GetById(Guid Id);

        public Task<User> CreateUser(User user);

        public Task<User> GetByUsername(string username);

        public Task<User> UpdateUser(User user);

        public Task<List<User>> GetAllActive();

        public Task<List<User>> GetAllIncludeInactive();
    }
}
