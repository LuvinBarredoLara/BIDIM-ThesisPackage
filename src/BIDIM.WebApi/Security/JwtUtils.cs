using BIDIM.Common.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BIDIM.WebApi.Security
{
    public class JwtUtils
    {
        public static string GenerateJWTToken(UserSession session, string key, string issuer, bool rememberMe)
        {
            var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(symmetricSecurityKey, SecurityAlgorithms.HmacSha256Signature);

            var claims = new List<Claim>
            {
                new Claim("Username", session.Username),
                new Claim("FullName", $"{session.Firstname} {session.Lastname}"),
                new Claim("UserID", session.ID.ToString())
            };

            var securityToken =
                new JwtSecurityToken(
                    issuer: issuer,
                    audience: issuer,
                    claims,
                    notBefore: DateTime.Now,
                    expires: DateTime.Now.AddDays(rememberMe ? 7 : 1),
                    signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(securityToken);
        }

        public static Guid ValidateToken(string token, string key, string issuer)
        {
            if (string.IsNullOrEmpty(token))
                return Guid.Empty;

            return ValidateJWTToken(token, key, issuer);
        }

        public static IEnumerable<Claim> ExtractClaims(string token, string key, string issuer)
        {
            try
            {
                new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = issuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                }, out SecurityToken validatedToken);

                return ((JwtSecurityToken)validatedToken).Claims;
            }
            catch (Exception)
            {
                // Return empty if validation fails
                return new Claim[] { };
            }
        }

        private static Guid ValidateJWTToken(string token, string key, string issuer)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            //var signingKey = Encoding.ASCII.GetBytes(key);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = issuer,
                    ValidAudience = issuer,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var retVal = Guid.Parse(jwtToken.Claims.First(x => x.Type == "UserID").Value);

                return retVal;
            }
            catch (Exception)
            {
                return Guid.Empty;
            }
        }
    }
}
