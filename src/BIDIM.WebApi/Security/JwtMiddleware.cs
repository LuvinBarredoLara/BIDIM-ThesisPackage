using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using User.Client;

namespace BIDIM.WebApi.Security
{
    public sealed class JwtMiddleware
    {
        protected readonly RequestDelegate _next;
        protected readonly IConfiguration _config;

        public JwtMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            _config = config;
        }

        public async Task Invoke(HttpContext context, IUserService userService)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            var claims = JwtUtils.ExtractClaims(token, _config["Security:Key"], _config["Security:Issuer"]);
            if(claims.Any())
                context.Items["User"] = await userService.CreateSessionById(Guid.Parse(claims.First(c => c.Type == "UserID").Value));

            await _next(context);
        }
    }
}
