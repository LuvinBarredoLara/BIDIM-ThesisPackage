using BIDIM.Common.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;

namespace BIDIM.Common.Security
{
    public static class AuthCookieUtils
    {
        public static ClaimsIdentity CreateClaimsIdentity(UserSession session)
        {
            var claims = new List<Claim>
            {
                new Claim("Username", session.Username),
                new Claim("FullName", $"{session.Firstname} {session.Lastname}"),
                new Claim("UserID", session.ID.ToString())
            };

            return new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        }

        public static AuthenticationProperties GetAuthProperties(bool rememberMe = false)
        {
            return new AuthenticationProperties()
            {
                // Persists the cookie across browser sessions
                // Be sure to get explicit user consent when you enable this property
                IsPersistent = true,

                // sets an absolute expiration, be sure to enable `IsPersistent` and set it to true
                ExpiresUtc = rememberMe ? DateTime.UtcNow.AddDays(7) : DateTime.UtcNow.AddMinutes(60)
            };
        }

        //static string GenerateAccessToken(Guid Id)
        //{
        //    var identity = new ClaimsIdentity(new List<Claim>
        //    {
        //        new Claim(JwtRegisteredClaimNames.Sub, Id.ToString())
        //    });

        //    var bytes = Encoding.UTF8.GetBytes(Id.ToString());
        //    var key = new SymmetricSecurityKey(bytes);
        //    var signingCredentials = new SigningCredentials(key,
        //        SecurityAlgorithms.HmacSha256);

        //    var now = DateTime.UtcNow;
        //    var handler = new JwtSecurityTokenHandler();

        //    var token = handler.CreateJwtSecurityToken(Config.Default.JWTIssuer,
        //        Config.Default.JWTIssuer,
        //        identity,
        //        now,
        //        now.Add(TimeSpan.FromHours(1)),
        //        now,
        //        signingCredentials);

        //    return handler.WriteToken(token);
        //}
    }
}
