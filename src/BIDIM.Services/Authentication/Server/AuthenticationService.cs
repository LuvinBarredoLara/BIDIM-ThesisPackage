using Authentication.Client;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using BIDIM.Domain.Interfaces;
using BIDIM.Domain.Models;

namespace Authentication.Server
{
    public sealed class AuthenticationService : IAuthenticationService
    {
        protected readonly IUserRepository _userRepository;

        public AuthenticationService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> AuthenticateUser(Login login)
        {
            if (login == null || string.IsNullOrEmpty(login.Username) || string.IsNullOrEmpty(login.Password))
                return false;
            else
            {
                User user = await _userRepository.GetByUsername(login.Username);

                if (user == null)
                    return false;
                else
                    return BCryptUtils.PasswordMatches(login.Password, user.PasswordHash);
            }
        }
    }
}
