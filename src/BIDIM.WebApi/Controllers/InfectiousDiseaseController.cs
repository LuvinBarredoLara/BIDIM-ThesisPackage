using BIDIM.Common;
using BIDIM.WebApi.Security;
using Disease.Client;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Disease")]
    [ApiController]
    [Authorize]
    public class InfectiousDiseaseController : ApiBaseController
    {
        protected readonly IInfectiousDiseaseService _infectiousDiseaseService;

        public InfectiousDiseaseController(IInfectiousDiseaseService infectiousDiseaseService)
        {
            _infectiousDiseaseService = infectiousDiseaseService;
        }

        [HttpGet]
        [Route("~/Diseases/DropdownList")]
        public async Task<ActionResult> GetDropdownList()
        {
            var retVal = await _infectiousDiseaseService.GetAllActive();

            return OkJsonResult("", data: retVal);
        }
    }
}
