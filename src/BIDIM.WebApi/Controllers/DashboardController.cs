using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Dashboard")]
    [Authorize]
    [ApiController]
    public class DashboardController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public DashboardController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet]
        [Route("Data")]
        public async Task<ActionResult> GetData(int diseaseId)
        {
            DashboardData retVal = await _mainService.GetDashboardData(diseaseId, 2022);

            return OkJsonResult("", retVal);
        }
    }
}
