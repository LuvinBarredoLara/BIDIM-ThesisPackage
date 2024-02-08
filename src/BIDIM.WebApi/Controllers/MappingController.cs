using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Mapping")]
    [Authorize]
    [ApiController]
    public class MappingController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public MappingController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpPost]
        [Route("Infected")]
        public async Task<ActionResult> Infected([FromBody] InfectedFilter data)
        {
            List<List<double>> retVal = await _mainService.GetMappingData(data);

            return OkJsonResult("", retVal);
        }
    }
}
