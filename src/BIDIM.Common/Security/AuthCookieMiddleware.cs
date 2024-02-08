using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BIDIM.Common.Security
{
    public sealed class AuthCookieMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthCookieMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.User is not null)
                if (context.User.HasClaim(c => c.Type == "UserID"))
                    context.Items["User"] = context.User;

            await _next(context);
        }
    }
}
