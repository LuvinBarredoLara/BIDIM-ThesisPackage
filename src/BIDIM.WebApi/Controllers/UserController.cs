using Authentication.Client;
using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using BIDIM.WebApi.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using User.Client;
using AuthorizeAttribute = BIDIM.WebApi.Security.AuthorizeAttribute;
using IAuthenticationService = Authentication.Client.IAuthenticationService;

namespace BIDIM.WebApi.Controllers
{
    [Route("User")]
    [ApiController]
    [Authorize]
    public class UserController : ApiBaseController
    {
        protected readonly IAuthenticationService _authenticationService;
        protected readonly IUserService _userService;
        protected readonly IConfiguration _configuration;

        public UserController(IAuthenticationService authenticationService,
            IUserService userService,
            IConfiguration configuration)
        {
            _authenticationService = authenticationService;
            _userService = userService;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("~/Identity/Login")]
        public async Task<ActionResult> Login([FromBody] Login login, bool rememberMe = false)
        {
            if (login == null || string.IsNullOrEmpty(login.Username) || string.IsNullOrEmpty(login.Password))
                return ErrorJsonResult("Please fill in all data", StatusCodes.Status400BadRequest, null);

            bool isAuthUser = await _authenticationService.AuthenticateUser(login);

            if (isAuthUser)
            {
                UserSession session = await _userService.CreateSessionByLogin(login);

                // Check if inactive
                bool isActive = await _userService.CheckUserIsActive(session.ID);
                if (!isActive)
                    return ErrorJsonResult("Your account is inactive - Contact Admin", StatusCodes.Status400BadRequest);

                session.Token = JwtUtils.GenerateJWTToken(session, _configuration["Security:Key"], _configuration["Security:Issuer"], rememberMe);

                //await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                //    new ClaimsPrincipal(AuthCookieUtils.CreateClaimsIdentity(session)),
                //    AuthCookieUtils.GetAuthProperties(rememberMe));

                return OkJsonResult("Logged in", session);
            }
            else
                return ErrorJsonResult("Invalid Username/Password", StatusCodes.Status401Unauthorized);
        }

        [HttpPost]
        [Route("~/Identity/Logout")]
        public async Task<ActionResult> Logout()
        {
            //await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return await Task.FromResult(OkJsonResult("Logged out"));
        }

        [HttpGet]
        [Route("~/Identity/Session")]
        public async Task<ActionResult> GetSession()
        {
            var retVal = "";

            if (!string.IsNullOrEmpty(UserPrincipalFullName))
                retVal = "Logged In";

            return await Task.FromResult(OkJsonResult(retVal));
        }

        [HttpGet]
        [Route("~/Users/")]
        public async Task<ActionResult> GetList()
        {
            List<UserList> retVal = await _userService.GetList();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("Types")]
        public async Task<ActionResult> GetUserTypesDropdown()
        {
            List<UserTypeDropdown> userTypes = await _userService.GetUserTypesDropdown();

            return OkJsonResult("", userTypes);
        }

        [HttpGet]
        [Route("{userId}")]
        public async Task<ActionResult> GetById(Guid userId)
        {
            var retVal = await _userService.GetById(userId);

            return OkJsonResult("", retVal);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert(UserViewModel data)
        {
            var usernameExists = await _userService.CheckUsernameExists(data.Username, data.UserId);

            if (usernameExists)
                return ErrorJsonResult("Username already taken", StatusCodes.Status400BadRequest);

            UserViewModel retVal = await _userService.Upsert(data);

            return OkJsonResult("", retVal);
        }
    }
}
