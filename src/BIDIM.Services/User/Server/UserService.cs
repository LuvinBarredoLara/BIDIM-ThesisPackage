using BIDIM.Common.Models;
using BIDIM.Common.Security;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;
using User.Client;

namespace User.Server
{
    public class UserService : IUserService
    {
        protected readonly IUserRepository _userRepository;
        protected readonly IUserTypeRepository _userTypeRepository;

        public UserService(IUserRepository userRepository, IUserTypeRepository userTypeRepository)
        {
            _userRepository = userRepository;
            _userTypeRepository = userTypeRepository;
        }

        public async Task<UserSession> CreateSessionByLogin(Login login)
        {
            BIDIM.Domain.Models.User authUser = await _userRepository.GetByUsername(login.Username);

            UserSession session = authUser.ToUserSession();

            return session;
        }

        public async Task<UserSession> CreateSessionById(Guid Id)
        {
            BIDIM.Domain.Models.User authUser = await _userRepository.GetById(Id);

            UserSession session = authUser.ToUserSession();

            return session;
        }

        public async Task<List<UserList>> GetList()
        {
            var userList = new List<UserList>();

            var users = await _userRepository.GetAllIncludeInactive();

            if(users.Any())
                users.ForEach(u => userList.Add(u.ToUserList()));

            return userList.OrderBy(ul => ul.FirstName)
                .OrderBy(ul => ul.Username)
                .ToList();
        }

        public async Task<List<UserTypeDropdown>> GetUserTypesDropdown()
        {
            List<UserTypeDropdown> retVal = new List<UserTypeDropdown>();

            List<UserType> userTypes = await _userTypeRepository.GetAllActive();

            if(userTypes.Any())
            {
                userTypes.ForEach(ut => retVal.Add(new UserTypeDropdown()
                {
                    Id = ut.Id,
                    Name = ut.Name
                }));
            }

            return retVal;
        }

        public async Task<UserViewModel> GetById(Guid userId)
        {
            BIDIM.Domain.Models.User user = await _userRepository.GetById(userId);

            if (user is null)
                throw new NullReferenceException("User not found");

            return new UserViewModel()
            {
                UserId = user.Id,
                Username = user.Username,
                Password = user.PasswordHash,
                ConfirmPassword = user.PasswordHash,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserTypeId = user.UserTypeId,
                IsActive = user.IsActive,
                PasswordUpdated = false
            };
        }

        public async Task<bool> CheckUsernameExists(string username, Guid userId)
        {
            var user = await _userRepository.GetByUsername(username);

            if (user is null)
                return false;
            else
            {
                return user.Id != userId;
            }
        }

        public async Task<UserViewModel> Upsert(UserViewModel view)
        {
            BIDIM.Domain.Models.User user = view.UserId == Guid.Empty ?
                view.ToNewDomainModel() :
                view.ToUpdatedDomainModel(await _userRepository.GetById(view.UserId));

            BIDIM.Domain.Models.User upserted;

            if (view.UserId == Guid.Empty)
                upserted = await _userRepository.CreateUser(user);
            else
                upserted = await _userRepository.UpdateUser(user);

            return new UserViewModel()
            {
                UserId = upserted.Id,
                Username = upserted.Username,
                Password = upserted.PasswordHash,
                ConfirmPassword = upserted.PasswordHash,
                FirstName = upserted.FirstName,
                LastName = upserted.LastName,
                UserTypeId = upserted.UserTypeId,
                IsActive = upserted.IsActive,
                PasswordUpdated = false
            };
        }

        public async Task<bool> CheckUserIsActive(Guid userId)
        {
            if (userId == Guid.Empty)
                return await Task.FromResult(false);
            else
            {
                var user = await _userRepository.GetById(userId);

                if (user is null)
                    return false;
                else
                    return user.IsActive;
            }
        }
    }

    internal static class UserSessionExtension
    {
        internal static UserSession ToUserSession(this BIDIM.Domain.Models.User user)
        {
            if (user is null)
                throw new NullReferenceException($"{nameof(user)} cannot be null");

            return new UserSession()
            {
                ID = user.Id,
                Username = user.Username,
                Firstname = user.FirstName,
                Lastname = user.LastName,
                Type = user.UserType.Name,
                Token = "", // Generate on controller
            };
        }

        internal static UserList ToUserList(this BIDIM.Domain.Models.User user)
        {
            if (user is null)
                throw new NullReferenceException($"{nameof(user)} cannot be null");

            return new UserList()
            {
                UserId = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserType = user.UserType.Name == "SuperAdmin" ? "Super Admin" : user.UserType.Name,
                IsActive = user.IsActive ? "Yes" : "No"
            };
        }
    }

    internal static class UserExtension
    {
        internal static BIDIM.Domain.Models.User ToNewDomainModel(this UserViewModel view)
        {
            return new BIDIM.Domain.Models.User()
            {
                Id = view.UserId,
                Username = view.Username,
                PasswordHash = BCryptUtils.HashPassword(view.Password),
                FirstName = view.FirstName,
                LastName= view.LastName,
                UserTypeId = view.UserTypeId,
                IsActive = view.IsActive
            };
        }

        internal static BIDIM.Domain.Models.User ToUpdatedDomainModel(this UserViewModel view, BIDIM.Domain.Models.User data)
        {
            data.Username = view.Username;

            if (view.PasswordUpdated)
                data.PasswordHash = BCryptUtils.HashPassword(view.Password);

            data.FirstName = view.FirstName;
            data.LastName = view.LastName;
            data.UserTypeId = view.UserTypeId;
            data.IsActive = view.IsActive;

            return data;
        }
    }
}
