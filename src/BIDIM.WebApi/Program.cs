using BIDIM.Common.Helpers;
using BIDIM.Common.RepositoryDI;
using BIDIM.DAL.Context;
using BIDIM.WebApi.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors();

builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
    options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    options.SerializerSettings.Converters = new JsonConverter[] { new IsoDateTimeConverter() };
    options.SerializerSettings.StringEscapeHandling = StringEscapeHandling.Default;
});

#region > DB Context
builder.Services.AddDbContext<BIDIMDbContext>(option => option.UseSqlServer(
    builder.Configuration.GetConnectionString("Default")));
#endregion

#region > Cookie Authentication
/*builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        // Flag that says the cookie is only available to servers.
        // The browser only sends the cookie but cannot access it through JavaScript.
        options.Cookie.HttpOnly = true;

        // This limits the cookie to HTTPS. I recommend setting this to Always in prod.
        // Leave it to None in local.
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ?
            CookieSecurePolicy.None : CookieSecurePolicy.Always;

        // Indicates whether the browser can use the cookie with cross-site requests.
        // For OAuth authentication, set this to Lax. I am setting this to Strict because
        // the auth cookie is only for a single site. Setting this to None does not set a cookie header value.
        options.Cookie.SameSite = SameSiteMode.Lax;

        options.Cookie.Name = "BIDIM.CooKey";

        options.Cookie.IsEssential = true;

        // Uncomment to implement app reacting to backend changes
        //options.EventsType = typeof(AuthCookieAuthenticationEvents);

        // For MVC
        //options.LoginPath = "Identity/Login";
        //options.LogoutPath = "Identity/Logout";
    });*/

//-- Override configuration above
//builder.Services.Configure<CookiePolicyOptions>(options =>
//{
//    options.MinimumSameSitePolicy = SameSiteMode.Strict;
//    options.HttpOnly = HttpOnlyPolicy.None;
//    options.Secure = builder.Environment.IsDevelopment() ?
//        CookieSecurePolicy.None : CookieSecurePolicy.Always;
//});
#endregion

#region > JWT Authentication (not used)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Security:Issuer"],
            ValidAudience = builder.Configuration["Security:Issuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Security:Key"]))
        };
    });
#endregion

// Register other services via IoC principle
DependencyContainer.RegisterServices(builder.Services);

var app = builder.Build();

// Configure the HTTP request pipeline.

//app.UseHttpsRedirection();

app.UseCors(options => options.WithOrigins(new[]
{
    "http://localhost:4200",
    "http://localhost:5259",
})
.AllowAnyHeader()
.AllowAnyMethod()
.AllowCredentials());

app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();

// API error handler with 400 status
// This does not include model parsing errors (e.g. empty datetime)
/*app.UseExceptionHandler(a => a.Run(async context =>
{
    var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
    var ex = exceptionHandlerPathFeature.Error;

    var result = new JsonResponse().Error("An error occurred while processing your request", StatusCodes.Status400BadRequest);
    context.Response.ContentType = "application/json";
    context.Response.StatusCode = StatusCodes.Status400BadRequest;
    await context.Response.WriteAsJsonAsync<JsonResponse>(result, new JsonSerializerOptions()
    {
        PropertyNamingPolicy = null, // Pascal casing
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull // Ignore property if null
    });
}));*/

app.UseMiddleware<JwtMiddleware>();
app.UseMiddleware<ErrorHandlerMiddleware>();

app.MapControllers();

app.Run();
