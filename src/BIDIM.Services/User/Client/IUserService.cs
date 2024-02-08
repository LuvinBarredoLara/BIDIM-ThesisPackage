using BIDIM.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace User.Client
{
    public interface IUserService
    {
        Task<UserViewModel> GetById(Guid userId);

        Task<UserSession> CreateSessionByLogin(Login login);

        Task<UserSession> CreateSessionById(Guid Id);

        Task<List<UserList>> GetList();

        Task<List<UserTypeDropdown>> GetUserTypesDropdown();

        Task<bool> CheckUsernameExists(string username, Guid userId);

        Task<UserViewModel> Upsert(UserViewModel data);

        Task<bool> CheckUserIsActive(Guid userId);
    }
}
