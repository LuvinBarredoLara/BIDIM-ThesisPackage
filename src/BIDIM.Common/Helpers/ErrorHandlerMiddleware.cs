using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BIDIM.Common.Helpers
{
    public sealed class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;

        public ErrorHandlerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                var response = context.Response;
                response.ContentType = "application/json";
                response.StatusCode = StatusCodes.Status500InternalServerError;

                var result = new JsonResponse().Error("An error occurred while processing your request", StatusCodes.Status500InternalServerError);
                var jsonWrappedResult = JsonSerializer.Serialize(result, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = null, // Pascal casing
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull // Ignore property if null
                });

                await response.WriteAsync(jsonWrappedResult);
            }
        }
    }
}
