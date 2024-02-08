using BIDIM.Common;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Statistics")]
    [Authorize]
    [ApiController]
    public class StatisticsController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public StatisticsController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet]
        [Route("SIRData/{diseaseId}")]
        public async Task<ActionResult> GetSIRData(int diseaseId)
        {
            var retVal = await _mainService.GetSIRData(diseaseId);

            return OkJsonResult("", retVal);
        }
    }
}
