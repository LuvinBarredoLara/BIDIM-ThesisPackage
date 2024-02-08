using BIDIM.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace BIDIM.Common.Security
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext filterContext)
        {
            // Skip authorization if method or class is decorated with
            // [AllowAnonymous] attribute
            if (filterContext.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any())
                return;

            // Authorize by checking claims
            //if (!filterContext.HttpContext.User.HasClaim(c => c.Type == "UserID"))
            //    filterContext.Result = new JsonResult(new JsonResponse()
            //        .Error("Unauthorized", (int)HttpStatusCode.Unauthorized));

            var userSession = (UserSession)filterContext.HttpContext.Items["User"];
            if(userSession is null)
                filterContext.Result = new JsonResult(new JsonResponse()
                    .Error("Unauthorized", (int)HttpStatusCode.Unauthorized));
        }
    }
}
