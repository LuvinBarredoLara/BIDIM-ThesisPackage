using BIDIM.Common;
using BIDIM.Common.Models;
using BIDIM.Common.Security;
using Main.Client;
using Microsoft.AspNetCore.Mvc;

namespace BIDIM.WebApi.Controllers
{
    [Route("Case")]
    [Authorize]
    [ApiController]
    public class CaseController : ApiBaseController
    {
        protected readonly IMainService _mainService;

        public CaseController(IMainService mainService)
        {
            _mainService = mainService;
        }

        [HttpGet]
        [Route("~/Cases")]
        public async Task<ActionResult> GetList()
        {
            var retVal = await _mainService.GetCaseList();

            return OkJsonResult("", retVal);
        }

        [HttpGet]
        [Route("{Guid}")]
        public async Task<ActionResult> GetCase(Guid Guid)
        {
            var retVal = await _mainService.GetCaseByGuid(Guid);

            return OkJsonResult("", retVal);
        }

        [HttpPost]
        public async Task<ActionResult> Upsert([FromBody] CaseViewModel view)
        {
            // Verify Individual is not deceased
            IndividualViewModel ind = await _mainService.GetIndividualById(view.IndividualId);
            if (ind == null)
                return ErrorJsonResult("Individual not found", StatusCodes.Status400BadRequest);
            if (!ind.IsActive || ind.IsDeceasedByDisease)
                return ErrorJsonResult("Individual is deceased", StatusCodes.Status400BadRequest);
            
            var retVal = await _mainService.UpsertCase(view);

            return OkJsonResult("", retVal);
        }
    }
}
