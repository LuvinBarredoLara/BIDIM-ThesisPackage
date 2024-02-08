using BIDIM.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace BIDIM.Common
{
    public class ApiBaseController : Controller
    {
        /// <summary>
        /// Returns an OK-JsonResult w/ JsonResponse-wrapped message & object
        /// </summary>
        /// <param name="message"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        public static JsonResult OkJsonResult(string message, object? data = null)
        {
            return new JsonResult(new JsonResponse().Success(message, data));
        }

        /// <summary>
        /// Returns an Error-JsonResult w/ JsonResponse-wrapped message & object
        /// </summary>
        /// <param name="errMessage"></param>
        /// <param name="status"></param>
        /// <returns></returns>
        public static JsonResult ErrorJsonResult(string errMessage, int status, object? data = null)
        {
            return new JsonResult(new JsonResponse().Error(errMessage, status, data));
        }

        protected string UserPrincipalUsername
        {
            get 
            {
                var us = HttpContext.Items["User"] as UserSession;

                return us == null ? "" : us.Username;
            }
        }
        
        protected string UserPrincipalFullName
        {
            get
            {
                var us = HttpContext.Items["User"] as UserSession;

                return us == null ? "" : $"{us.Firstname} {us.Lastname}";
            }
        }

        protected Guid UserPrincipalID
        {
            get
            {
                var us = HttpContext.Items["User"] as UserSession;

                return us == null ? Guid.Empty : us.ID;
            }
        }
    }
}
