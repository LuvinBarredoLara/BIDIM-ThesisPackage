using BIDIM.Common.Models;

namespace Authentication.Client
{
    public interface IAuthenticationService
    {
        Task<bool> AuthenticateUser(Login login);


    }
}
